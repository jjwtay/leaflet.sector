# leaflet.sector
Leaflet Sector support. Inspired by [leaflet.ellipse](https://github.com/jdfergason/Leaflet.Ellipse).

## API

*Factory method*

    L.Sector({
              <LatLng> center,
              <Number> innerRadius,
              <Number> outerRadius,
              <Number> startBearing,
              <Number> endBearing
              <...Leaflet Polyline Options>
    })

    * center - Leaflet latlng (optional - [0,0])
    * innerRadius - in meters (optional - 100)
    * outerRadius - in meters (optional -200)
    * startBearing - bearing in degrees (optional - 0)
    * endBearing - bearing in degrees (optional - 90)
    * any leaflet polygon options 

## Also checkout

[leaflet.box](https://github.com/jjwtay/leaflet.box) - Leaflet support for Box drawings (rotatable rectangle)
[leaflet.arc](https://github.com/jjwtay/leaflet.arc) - Leaflet support for Arc drawings (Semi circles)


## License

This code is provided under the Apache 2.0 license.
