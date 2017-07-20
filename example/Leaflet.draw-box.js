var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

L.Draw.Box = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'box'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true,
		metric: true // Whether to use the metric measurement system or imperial
	},

	initialize: function initialize(map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Box.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.box.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function _drawShape(latlng) {
		if (!this._shape) {

			var width = Math.max(this._startLatLng.distanceTo(latlng), 10);
			var length = width;
			this._shape = L.box(_extends({
				center: this._startLatLng,
				width: width,
				length: length,
				bearing: 0
			}, this.options.shapeOptions));
			this._map.addLayer(this._shape);
		} else {
			var bounds = new L.LatLngBounds(this._startLatLng, latlng);
			var _width = 2 * bounds.getNorthWest().distanceTo(bounds.getNorthEast());
			var height = _width;
			this._shape.setWidth(_width);
			this._shape.setLength(height);
			this._shape.setLatLngs(this._shape.getLatLngs());
		}
	},

	_fireCreatedEvent: function _fireCreatedEvent() {
		var box = L.box(_extends({}, this.options.shapeOptions, {
			center: this._startLatLng,
			width: this._shape.getWidth(),
			length: this._shape.getLength(),
			bearing: this._shape.getBearing()

		}));

		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, box);
	},

	_onMouseMove: function _onMouseMove(e) {
		var latlng = e.latlng,
		    showRadius = this.options.showRadius,
		    useMetric = this.options.metric,
		    radius;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);

			radius = this._shape.getWidth();

			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: showRadius ? L.drawLocal.draw.handlers.box.radius + ': ' + radius : ''
			});
		}
	}
});

L.Edit = L.Edit || {};

L.Edit.Box = L.Edit.SimpleShape.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		}),
		rotateIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
		})
	},

	_initMarkers: function _initMarkers() {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}

		// Create center marker
		this._createMoveMarker();

		// Create edge marker
		this._createResizeMarker();

		// Create rotate Marker();
		this._createRotateMarker();
	},

	_createMoveMarker: function _createMoveMarker() {
		//var center = this._shape.getLatLng();
		var center = this._shape.getCenter();
		//this._moveMarker = this._createMarker(center, this.options.moveIcon);
		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createResizeMarker: function _createResizeMarker() {
		var _this = this;

		var center = this._shape.getCenter();

		this._resizeMarkers = this._shape.getLatLngs()[0].map(function (latLng) {
			return _this._createMarker(latLng, _this.options.resizeIcon);
		}).map(function (marker, index) {

			switch (index) {

				case 0:
					return Object.assign(marker, { position: 'top-left' });
				case 1:
					return Object.assign(marker, { position: 'top-right' });
				case 2:
					return Object.assign(marker, { position: 'bottom-right' });
				case 3:
					return Object.assign(marker, { position: 'bottom-left' });
				default:
					return marker;
			}
		});
	},

	_createRotateMarker: function _createRotateMarker() {
		var center = this._shape.getCenter();

		var rotatemarkerPoint = this._getRotateMarkerPoint(center);

		this._rotateMarker = this._createMarker(rotatemarkerPoint, this.options.rotateIcon);
	},

	_getRotateMarkerPoint: function _getRotateMarkerPoint(latlng) {
		var moveLatLng = this._moveMarker.getLatLng();
		var br = this._shape.computeDestinationPoint(moveLatLng, this._shape.getLength() * 1.5 / 2, this._shape.getBearing());
		return br;
	},

	_onMarkerDragStart: function _onMarkerDragStart(e) {
		L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this, e);
		this._currentMarker = e.target;
	},

	_onMarkerDrag: function _onMarkerDrag(e) {
		var marker = e.target,
		    latlng = marker.getLatLng();

		if (marker === this._moveMarker) {
			this._move(latlng);
		} else if (marker === this._rotateMarker) {
			this._rotate(latlng);
		} else {
			this._resize(latlng);
		}

		this._shape.redraw();
	},

	_move: function _move(latlng) {
		this._shape.setCenter(latlng);
		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionResizeMarkers();

		// Move the rotate marker
		this._repositionRotateMarker();
	},

	_rotate: function _rotate(latlng) {

		var moveLatLng = this._moveMarker.getLatLng();
		var pc = this._map.project(moveLatLng);
		var ph = this._map.project(latlng);
		var v = [ph.x - pc.x, ph.y - pc.y];

		var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI;

		this._shape.setBearing(newB);
		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionResizeMarkers();

		// Move the rotate marker
		this._repositionRotateMarker();
	},

	_resize: function _resize(latlng) {
		var moveLatLng = this._moveMarker.getLatLng();
		var radius = moveLatLng.distanceTo(latlng);

		var center = this._map.project(moveLatLng);
		var corner = this._map.project(latlng);
		var bearing = this._map.project(this._rotateMarker._latlng);

		var bearingVector = [bearing.x - center.x, bearing.y - center.y];
		var cornerVector = [corner.x - center.x, corner.y - center.y];

		var vradius = Math.sqrt(Math.pow(cornerVector[0], 2) + Math.pow(cornerVector[1], 2));
		var bearingRadius = Math.sqrt(Math.pow(bearingVector[0], 2) + Math.pow(bearingVector[1], 2));
		var dp = bearingVector[0] * cornerVector[0] + bearingVector[1] * cornerVector[1];

		var newPointVector = [dp * bearingVector[0] / Math.pow(bearingRadius, 2), dp * bearingVector[1] / Math.pow(bearingRadius, 2)];

		var newPoint = new L.Point(center.x + newPointVector[0], center.y + newPointVector[1]);

		var newlatlng = this._map.unproject(newPoint);

		var length = 2 * moveLatLng.distanceTo(newlatlng);
		var width = 2 * latlng.distanceTo(newlatlng);

		this._shape.setWidth(width);
		this._shape.setLength(length);
		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionResizeMarkers();
		// Move the rotate marker
		this._repositionRotateMarker();
	},

	_repositionResizeMarkers: function _repositionResizeMarkers() {
		var _this2 = this;

		this._shape.getLatLngs()[0].forEach(function (latlng, index) {
			_this2._resizeMarkers[index].setLatLng(latlng);
		});
	},

	_repositionRotateMarker: function _repositionRotateMarker() {
		var latlng = this._moveMarker.getLatLng();
		var rotatemarkerPoint = this._getRotateMarkerPoint(latlng);

		this._rotateMarker.setLatLng(rotatemarkerPoint);
	}
});

L.Box.addInitHook(function () {
	if (L.Edit.Box) {
		this.editing = new L.Edit.Box(this);

		if (this.options.editable) {
			this.editing.enable();
		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled()) {
			this.editing.removeHooks();
		}
	});
});

L.drawLocal.draw.toolbar.buttons.box = 'Draw an Box';

L.drawLocal.draw.handlers.box = {
	tooltip: {
		start: 'Click and drag to draw box.'
	},
	radius: 'Width (meters): '
};
