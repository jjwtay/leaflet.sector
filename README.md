# leaflet.sector
Leaflet Sector support. Inspired by [leaflet.ellipse](https://github.com/jdfergason/Leaflet.Ellipse). Checkout the [Demo](https://jjwtay.github.io/leaflet.sector/)

## How to

*Traditional*

    Include leaflet.sector.js in your html

    <script src='/path/to/leaflet.sector'></script>

*Webpack as non es6 module*

    import './path/to/leaflet.sector'

    * If using es6 with object spread you can opt to use the uncompiled src/leaflet.sector.js

*ES6 module*

    TODO

## API

*Factory method*

    L.sector({
              <LatLng> center,
              <Number> innerRadius,
              <Number> outerRadius,
              <Number> startBearing,
              <Number> endBearing,
              <Boolean> rhumb,
              <...Leaflet Polyline Options>
    })

    * center - Leaflet latlng (optional - [0,0])
    * innerRadius - in meters (optional - 100)
    * outerRadius - in meters (optional -200)
    * startBearing - bearing in degrees (optional - 0)
    * endBearing - bearing in degrees (optional - 90)
    * rhumb - whether to use rhumb or greater circle (optional = false)
    * any leaflet polygon options 

## Also checkout

[leaflet.draw-sector](https://github.com/jjwtay/leaflet.draw-sector) - Leaflet Draw support for leaflet.sector.

[leaflet.arc](https://github.com/jjwtay/leaflet.arc) - Leaflet Arc drawing.

[leaflet.draw-arc](https://github.com/jjwtay/leaflet.draw-arc) - Leaflet Draw support for leaflet.arc.

[leaflet.box](https://github.com/jjwtay/leaflet.box) - Leaflet Box drawing.

[leaflet.draw-box](https://github.com/jjwtay/leaflet.draw-box) - Leaflet Draw support for leaflet.box.


## License

This code is provided under the Apache 2.0 license.
