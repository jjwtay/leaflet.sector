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













var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

L.Sector = L.Polygon.extend({
    options: {
        weight: 5,
        color: '#ffff00',
        stroke: true
    },

    initialize: function initialize(_ref) {
        var _ref$center = _ref.center,
            center = _ref$center === undefined ? [0, 0] : _ref$center,
            _ref$innerRadius = _ref.innerRadius,
            innerRadius = _ref$innerRadius === undefined ? 100 : _ref$innerRadius,
            _ref$outerRadius = _ref.outerRadius,
            outerRadius = _ref$outerRadius === undefined ? 100 : _ref$outerRadius,
            _ref$startBearing = _ref.startBearing,
            startBearing = _ref$startBearing === undefined ? 0 : _ref$startBearing,
            _ref$endBearing = _ref.endBearing,
            endBearing = _ref$endBearing === undefined ? 90 : _ref$endBearing,
            _ref$numberOfPoints = _ref.numberOfPoints,
            numberOfPoints = _ref$numberOfPoints === undefined ? 32 : _ref$numberOfPoints,
            options = objectWithoutProperties(_ref, ['center', 'innerRadius', 'outerRadius', 'startBearing', 'endBearing', 'numberOfPoints']);

        this.setOptions(options).setCenter(center).setInnerRadius(innerRadius).setOuterRadius(outerRadius).setStartBearing(startBearing).setEndBearing(endBearing).setNumberOfPoints(numberOfPoints);

        this._setLatLngs(this.getLatLngs());
    },

    getCenter: function getCenter() {
        return this._center;
    },

    setCenter: function setCenter(center) {
        this._center = L.latLng(center);
        return this.redraw();
    },

    getInnerRadius: function getInnerRadius() {
        return this._innerRadius;
    },

    setInnerRadius: function setInnerRadius() {
        var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;

        this._innerRadius = Math.abs(radius);
        return this.redraw();
    },

    getOuterRadius: function getOuterRadius() {
        return this._outerRadius;
    },

    setOuterRadius: function setOuterRadius() {
        var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;

        this._outerRadius = Math.abs(radius);
        return this.redraw();
    },

    getStartBearing: function getStartBearing() {
        return this._startBearing;
    },

    setStartBearing: function setStartBearing() {
        var startBearing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

        /**
         * Not sure how much of these checks are neccessary
         * just using all as a temp fix for rotation problems.
         */
        var endBearing = this.getEndBearing() || 360;

        while (startBearing < 0) {
            startBearing += 360;
        }
        while (startBearing > 360) {
            startBearing -= 360;
        }

        if (endBearing < startBearing) {
            while (endBearing <= startBearing) {
                startBearing = startBearing - 360;
            }
        }

        this._startBearing = startBearing;
        return this.redraw();
    },

    getEndBearing: function getEndBearing() {
        return this._endBearing;
    },

    setEndBearing: function setEndBearing() {
        var endBearing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 90;

        /**
         * Not sure how much of these checks are neccessary
         * just using all as a temp fix for rotation problems.
         */
        var startBearing = this.getStartBearing() || 0;

        while (endBearing < 0) {
            endBearing += 360;
        }
        while (endBearing > 360) {
            endBearing -= 360;
        }

        if (startBearing > endBearing) {
            while (startBearing >= endBearing) {
                endBearing += 360;
            }
        }

        while (endBearing - startBearing > 360) {
            endBearing -= 360;
        }this._endBearing = endBearing;
        return this.redraw();
    },

    getNumberOfPoints: function getNumberOfPoints() {
        return this._numberOfPoints;
    },

    setNumberOfPoints: function setNumberOfPoints() {
        var numberOfPoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;

        this._numberOfPoints = Math.max(10, numberOfPoints);
        return this.redraw();
    },

    getOptions: function getOptions() {
        return this.options;
    },

    setOptions: function setOptions() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        L.setOptions(this, options);
        return this.redraw();
    },

    getLatLngs: function getLatLngs() {
        var angle = this.getEndBearing() - this.getStartBearing();
        var ptCount = angle * this.getNumberOfPoints() / 360;
        var latlngs = [];
        var deltaAngle = angle / ptCount;
        //latlngs.push(this.getCenter())

        for (var i = 0; i < ptCount; i++) {
            var useAngle = this.getStartBearing() + deltaAngle * i;
            latlngs.push(this.computeDestinationPoint(this.getCenter(), this.getOuterRadius(), useAngle));
        }
        latlngs.push(this.computeDestinationPoint(this.getCenter(), this.getOuterRadius(), this.getEndBearing()));
        for (var i = 0; i < ptCount; i++) {
            var _useAngle = this.getEndBearing() - deltaAngle * i;
            latlngs.push(this.computeDestinationPoint(this.getCenter(), this.getInnerRadius(), _useAngle));
        }
        latlngs.push(this.computeDestinationPoint(this.getCenter(), this.getInnerRadius(), this.getStartBearing()));
        return latlngs;
    },


    setLatLngs: function setLatLngs(latLngs) {
        this._setLatLngs(this.getLatLngs());
        return this.redraw();
    },

    setStyle: L.Path.prototype.setStyle,

    computeDestinationPoint: function computeDestinationPoint() {
        var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { lat: 0, lng: 0 };
        var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var bearing = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var radius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 6378137;


        var bng = bearing * Math.PI / 180;

        var lat1 = start.lat * Math.PI / 180;
        var lon1 = start.lng * Math.PI / 180;

        var lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / radius) + Math.cos(lat1) * Math.sin(distance / radius) * Math.cos(bng));

        var lon2 = lon1 + Math.atan2(Math.sin(bng) * Math.sin(distance / radius) * Math.cos(lat1), Math.cos(distance / radius) - Math.sin(lat1) * Math.sin(lat2));

        lat2 = lat2 * 180 / Math.PI;
        lon2 = lon2 * 180 / Math.PI;

        return {
            lat: lat2,
            lng: lon2
        };
    }
});

L.sector = function (_ref2) {
    var _ref2$center = _ref2.center,
        center = _ref2$center === undefined ? [0, 0] : _ref2$center,
        _ref2$innerRadius = _ref2.innerRadius,
        innerRadius = _ref2$innerRadius === undefined ? 100 : _ref2$innerRadius,
        _ref2$outerRadius = _ref2.outerRadius,
        outerRadius = _ref2$outerRadius === undefined ? 200 : _ref2$outerRadius,
        _ref2$startBearing = _ref2.startBearing,
        startBearing = _ref2$startBearing === undefined ? 0 : _ref2$startBearing,
        _ref2$endBearing = _ref2.endBearing,
        endBearing = _ref2$endBearing === undefined ? 90 : _ref2$endBearing,
        _ref2$numberOfPoints = _ref2.numberOfPoints,
        numberOfPoints = _ref2$numberOfPoints === undefined ? 32 : _ref2$numberOfPoints,
        options = objectWithoutProperties(_ref2, ['center', 'innerRadius', 'outerRadius', 'startBearing', 'endBearing', 'numberOfPoints']);
    return new L.Sector(_extends({ center: center, innerRadius: innerRadius, outerRadius: outerRadius, startBearing: startBearing, numberOfPoints: numberOfPoints, endBearing: endBearing }, options));
};
