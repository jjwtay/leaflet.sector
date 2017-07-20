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


[leaflet.arc](https://github.com/jjwtay/leaflet.arc) - Leaflet Arc drawing.

[leaflet.draw-arc](https://github.com/jjwtay/leaflet.draw-arc) - Leaflet Draw support for leaflet.arc.

[leaflet.box](https://github.com/jjwtay/leaflet.box) - Leaflet Box drawing.

[leaflet.box-sector](https://github.com/jjwtay/leaflet.box-sector) - Leaflet Draw support for leaflet.box.


## License

This code is provided under the Apache 2.0 license.
