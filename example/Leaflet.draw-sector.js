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

//L.Draw.Arc = L.Draw.SimpleShape.extend({
L.Draw.Sector = L.Draw.Feature.extend({
	statics: {
		TYPE: 'sector'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#ffff00',
			weight: 5,
			opacity: 0.5,
			//fill: true,
			//fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true,
		metric: true, // Whether to use the metric measurement system or imperial
		lineOptions: {
			color: '#ffff00',
			weight: 5,
			dashArray: '5, 10'
		}
	},

	initialize: function initialize(map, options) {
		if (options && options.shapeOptions) {
			options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
		}
		if (options && options.lineOptions) {
			options.lineOptions = L.Util.extend({}, this.options.lineOptions, options.lineOptions);
		}

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Sector.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.sector.tooltip.start;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	_drawShape: function _drawShape(latlng) {
		//if (this._map.hasLayer(this._line)) this._map.removeLayer(this._line)
		var radius = Math.max(this._startLatLng.distanceTo(latlng), 10);

		if (!this._shape) {

			var pc = this._map.project(this._startLatLng);
			var ph = this._map.project(latlng);
			var v = [ph.x - pc.x, ph.y - pc.y];

			var startBearing = Math.atan2(v[0], -v[1]) * 180 / Math.PI % 360;

			this._shape = L.sector(_extends({
				center: this._startLatLng,
				innerRadius: this._innerRadius,
				outerRadius: radius,
				startBearing: startBearing,
				endBearing: startBearing + 1
			}, this.options.shapeOptions));
			this._map.addLayer(this._shape);
		} else {
			var _pc = this._map.project(this._startLatLng);
			var _ph = this._map.project(latlng);
			var _v = [_ph.x - _pc.x, _ph.y - _pc.y];

			var endBearing = Math.atan2(_v[0], -_v[1]) * 180 / Math.PI % 360;
			this._shape.setOuterRadius(radius);
			this._shape.setEndBearing(endBearing);
			this._shape.setLatLngs(this._shape.getLatLngs());
		}
	},

	_drawLine: function _drawLine(latlng) {
		if (!this._line) {
			this._line = L.polyline([this._startLatLng, latlng], this.options.lineOptions);
			this._map.addLayer(this._line);
		} else {
			this._line.setLatLngs([this._startLatLng, latlng]);
		}
	},

	_fireCreatedEvent: function _fireCreatedEvent() {
		var sector = L.sector(_extends({}, this.options.shapeOptions, {
			center: this._startLatLng,
			innerRadius: this._shape.getInnerRadius(),
			outerRadius: this._shape.getOuterRadius(),
			startBearing: this._shape.getStartBearing(),
			endBearing: this._shape.getEndBearing()
		}));

		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, sector);
	},

	_onMouseMove: function _onMouseMove(e) {
		var latlng = e.latlng,
		    showRadius = this.options.showRadius,
		    useMetric = this.options.metric,
		    radius;

		this._tooltip.updatePosition(latlng);

		if (this._isDrawing) {
			if (this._innerRadius) {
				this._drawShape(latlng);

				var pc = this._map.project(this._startLatLng);
				var ph = this._map.project(latlng);
				var v = [ph.x - pc.x, ph.y - pc.y];

				var bearing = Math.atan2(v[0], -v[1]) * 180 / Math.PI % 360;

				this._tooltip.updateContent({
					text: L.drawLocal.draw.handlers.sector.tooltip.end,
					subtext: 'Bearing(degrees): ' + bearing
				});
			} else {
				var _radius = this._startLatLng.distanceTo(latlng);
				var _pc2 = this._map.project(this._startLatLng);
				var _ph2 = this._map.project(latlng);
				var _v2 = [_ph2.x - _pc2.x, _ph2.y - _pc2.y];

				var _bearing = Math.atan2(_v2[0], -_v2[1]) * 180 / Math.PI % 360;

				this._drawLine(latlng);
				this._tooltip.updateContent({
					text: L.drawLocal.draw.handlers.sector.tooltip.line,
					subtext: 'Radius(meters): ' + _radius + ', Bearing(degrees): ' + _bearing
				});
			}
		}
	},

	_onMouseDown: function _onMouseDown(e) {
		var latlng = e.latlng;
		this._isDrawing = true;

		if (!this._startLatLng) {

			this._startLatLng = latlng;
			/*L.DomEvent
   	.on(document, 'mouseup', this._onMouseUp, this)
   	.on(document, 'touchend', this._onMouseUp, this)
   	.preventDefault(e.originalEvent);*/
		} else if (!this._innerRadius) {
			var pc = this._map.project(this._startLatLng);
			var ph = this._map.project(latlng);
			var v = [ph.x - pc.x, ph.y - pc.y];

			var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI % 360;
			this._startBearing = newB;
			this._innerRadius = this._startLatLng.distanceTo(latlng);
		} else {
			var _pc3 = this._map.project(this._startLatLng);
			var _ph3 = this._map.project(latlng);
			var _v3 = [_ph3.x - _pc3.x, _ph3.y - _pc3.y];

			var _newB = Math.atan2(_v3[0], -_v3[1]) * 180 / Math.PI % 360;
			this._endBearing = _newB;
		}
	},

	_onMouseUp: function _onMouseUp(e) {
		if (this._endBearing) {
			this._fireCreatedEvent();

			this.disable();

			if (this.options.repeatMode) {
				this.enable();
			}
		}
	},
	// @method addHooks(): void
	// Add listener hooks to this handler.
	addHooks: function addHooks() {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
			this._mapDraggable = this._map.dragging.enabled();

			if (this._mapDraggable) {
				this._map.dragging.disable();
			}

			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

			this._map.on('mousedown', this._onMouseDown, this).on('mousemove', this._onMouseMove, this).on('mouseup', this._onMouseUp, this);
			//.on('touchstart', this._onMouseDown, this)
			//.on('touchmove', this._onMouseMove, this);
		}
	},
	// @method removeHooks(): void
	// Remove listener hooks from this handler.
	removeHooks: function removeHooks() {
		//L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			if (this._mapDraggable) {
				this._map.dragging.enable();
			}

			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map.off('mousedown', this._onMouseDown, this).off('mousemove', this._onMouseMove, this).off('mouseup', this._onMouseUp, this);
			//.off('touchstart', this._onMouseDown, this)
			//.off('touchmove', this._onMouseMove, this);

			L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
			//L.DomEvent.off(document, 'touchend', this._onMouseUp, this);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
			if (this._line) {
				this._map.removeLayer(this._line);
				delete this._line;
			}
		}
		this._isDrawing = false;
	}
});

L.Edit = L.Edit || {};

L.Edit.Sector = L.Edit.SimpleShape.extend({
	options: {
		moveIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
		}),
		resizeIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
		}),
		startIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
		}),
		endIcon: new L.DivIcon({
			iconSize: new L.Point(8, 8),
			className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-rotate'
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
		this._resizeMarkers = [];

		// Create center marker
		this._createMoveMarker();

		// Create edge marker
		this._createInnerRadiusMarker();
		this._createOuterRadiusMarker();

		// Create start Marker();
		this._createStartMarker();

		// Create end Marker
		this._createEndMarker();

		//Create rotate Marker
		this._createRotateMarker();
	},

	_createMoveMarker: function _createMoveMarker() {
		//var center = this._shape.getLatLng();
		var center = this._shape.getCenter();
		//this._moveMarker = this._createMarker(center, this.options.moveIcon);
		this._moveMarker = this._createMarker(center, this.options.moveIcon);
	},

	_createInnerRadiusMarker: function _createInnerRadiusMarker() {
		var center = this._shape.getCenter();

		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;

		var point = this._shape.computeDestinationPoint(center, this._shape.getInnerRadius(), bearing);

		this._innerRadiusMarker = this._createMarker(point, this.options.resizeIcon);
	},

	_createOuterRadiusMarker: function _createOuterRadiusMarker() {
		var center = this._shape.getCenter();

		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;

		var point = this._shape.computeDestinationPoint(center, this._shape.getOuterRadius(), bearing);

		this._outerRadiusMarker = this._createMarker(point, this.options.resizeIcon);
	},

	_createStartMarker: function _createStartMarker() {
		var center = this._shape.getCenter();

		var point = this._shape.computeDestinationPoint(center, (this._shape.getInnerRadius() + this._shape.getOuterRadius()) / 2, this._shape.getStartBearing());

		this._startMarker = this._createMarker(point, this.options.startIcon);
	},

	_createEndMarker: function _createEndMarker() {
		var center = this._shape.getCenter();

		var point = this._shape.computeDestinationPoint(center, (this._shape.getInnerRadius() + this._shape.getOuterRadius()) / 2, this._shape.getEndBearing());

		this._endMarker = this._createMarker(point, this.options.endIcon);
	},

	_createRotateMarker: function _createRotateMarker() {
		var center = this._shape.getCenter();

		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;

		var point = this._shape.computeDestinationPoint(center, this._shape.getOuterRadius() * 1.3, bearing);

		this._rotateMarker = this._createMarker(point, this.options.rotateIcon);
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
		} else if (marker === this._innerRadiusMarker) {
			this._resizeInnerRadius(latlng);
		} else if (marker === this._outerRadiusMarker) {
			this._resizeOuterRadius(latlng);
		} else if (marker === this._startMarker) {
			this._restart(latlng);
		} else if (marker === this._endMarker) {
			this._end(latlng);
		} else {
			this._rotate(latlng);
		}

		this._shape.redraw();
	},

	_move: function _move(latlng) {
		this._shape.setCenter(latlng);
		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionInnerRadiusMarker();
		this._repositionOuterRadiusMarker();
		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
	},
	_resizeInnerRadius: function _resizeInnerRadius(latlng) {
		var innerRadius = this._shape.getCenter().distanceTo(latlng);
		this._shape.setInnerRadius(innerRadius);
		this._shape.setLatLngs(this._shape.getLatLngs());

		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
		this._repositionInnerRadiusMarker();
		this._repositionOuterRadiusMarker();
	},

	_resizeOuterRadius: function _resizeOuterRadius(latlng) {
		var outerRadius = this._shape.getCenter().distanceTo(latlng);
		this._shape.setOuterRadius(outerRadius);
		this._shape.setLatLngs(this._shape.getLatLngs());

		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
		this._repositionInnerRadiusMarker();
		this._repositionOuterRadiusMarker();
	},

	_restart: function _restart(latlng) {
		var moveLatLng = this._shape.getCenter();

		var pc = this._map.project(moveLatLng);
		var ph = this._map.project(latlng);
		var v = [ph.x - pc.x, ph.y - pc.y];

		var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI;

		this._shape.setStartBearing(newB);

		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		//this._repositionResizeMarker()
		this._repositionInnerRadiusMarker();
		this._repositionOuterRadiusMarker();
		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
	},

	_end: function _end(latlng) {
		var moveLatLng = this._shape.getCenter();

		var pc = this._map.project(moveLatLng);
		var ph = this._map.project(latlng);
		var v = [ph.x - pc.x, ph.y - pc.y];

		var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI;
		this._shape.setEndBearing(newB);

		this._shape.setLatLngs(this._shape.getLatLngs());

		// Move the resize marker
		this._repositionInnerRadiusMarker();
		this._repositionOuterRadiusMarker();
		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
	},

	_rotate: function _rotate(latlng) {
		var moveLatLng = this._shape.getCenter();

		var pc = this._map.project(moveLatLng);
		var ph = this._map.project(latlng);
		var v = [ph.x - pc.x, ph.y - pc.y];

		var newB = Math.atan2(v[0], -v[1]) * 180 / Math.PI % 360;
		var halfAngle = (this._shape.getEndBearing() - this._shape.getStartBearing()) / 2;

		var newStart = newB - halfAngle;
		var newEnd = newStart + 2 * halfAngle;

		this._shape.setStartBearing(newStart);
		this._shape.setEndBearing(newEnd);
		this._shape.setLatLngs(this._shape.getLatLngs());

		this._repositionInnerRadiusMarker();
		this._repositionOuterRadiusMarker();
		this._repositionStartMarker();
		this._repositionEndMarker();
		this._repositionRotateMarker();
	},

	_repositionInnerRadiusMarker: function _repositionInnerRadiusMarker() {
		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;
		var point = this._shape.computeDestinationPoint(this._shape.getCenter(), this._shape.getInnerRadius(), bearing);

		this._innerRadiusMarker.setLatLng(point);
	},

	_repositionOuterRadiusMarker: function _repositionOuterRadiusMarker() {
		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;
		var point = this._shape.computeDestinationPoint(this._shape.getCenter(), this._shape.getOuterRadius(), bearing);

		this._outerRadiusMarker.setLatLng(point);
	},

	_repositionStartMarker: function _repositionStartMarker() {
		var start = this._shape.computeDestinationPoint(this._shape.getCenter(), (this._shape.getOuterRadius() + this._shape.getInnerRadius()) / 2, this._shape.getStartBearing());
		this._startMarker.setLatLng(start);
	},

	_repositionEndMarker: function _repositionEndMarker() {
		var end = this._shape.computeDestinationPoint(this._shape.getCenter(), (this._shape.getOuterRadius() + this._shape.getInnerRadius()) / 2, this._shape.getEndBearing());
		this._endMarker.setLatLng(end);
	},

	_repositionRotateMarker: function _repositionRotateMarker() {
		var center = this._shape.getCenter();

		var bearing = (this._shape.getEndBearing() + this._shape.getStartBearing()) / 2;

		var point = this._shape.computeDestinationPoint(center, this._shape.getOuterRadius() * 1.3, bearing);

		this._rotateMarker.setLatLng(point);
	}

});

L.Sector.addInitHook(function () {
	if (L.Edit.Sector) {
		this.editing = new L.Edit.Sector(this);

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

L.drawLocal.draw.toolbar.buttons.sector = 'Draw a Sector';

L.drawLocal.draw.handlers.sector = {
	tooltip: {
		start: 'Click to set Sector center.',
		line: 'Click to set Inner Radius and Start Bearing.',
		end: 'Click to set End Bearing, Outer Radius and create Sector'
	},
	radius: 'Radius (meters): ',
	bearing: 'Bearing (degrees): '
};
