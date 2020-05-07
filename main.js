/* ============= Mapbox setup ============== */
mapboxgl.accessToken = 'pk.eyJ1Ijoibmp4aW5yYW4iLCJhIjoiY2s4dWxxaHR6MGNobDNtcDZzY2l2OXlyaCJ9.9rS7yysTlpkr_ZeB4vX4Ng';
map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-75.155802, 39.995313],
  zoom: 10
});


/* ============= DATA SET UP ============== */
var url1= "https://raw.githubusercontent.com/liziqun/MUSA_800/master/deciles_by_ENGINE_4326.geojson";
var url2= "https://raw.githubusercontent.com/liziqun/MUSA800_App/master/data/engine.geojson";

var hydrants;
$.ajax('https://raw.githubusercontent.com/liziqun/MUSA_800/master/deciles_by_ENGINE_4326.geojson')
  .done(function(response) {
    hydrants= JSON.parse(response);
    console.log(hydrants);
  });

var engines;
  $.ajax('https://raw.githubusercontent.com/liziqun/MUSA800_App/master/data/engine.geojson')
    .done(function(response) {
      engines = JSON.parse(response);
      console.log(engines);
    });

/* ============= Legend setup ============== */
var layers = ['Top Priority', '2', '3', '4', '5', '6', '7', '8', '9', 'Lowest Priority'];
var colors = ['#ffffcc','#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026',  '#420D09'];
             
/* ============= MAPS============== */
map.on('load', function() {
  for (i = 0; i < layers.length; i++) {
    var layer = layers[i];
    var color = colors[i];
    var item = document.createElement('div');
    var key = document.createElement('span');
    key.className = 'legend-key';
    key.style.backgroundColor = color;

    var value = document.createElement('span');
    value.innerHTML = layer;
    item.appendChild(key);
    item.appendChild(value);
    legend.appendChild(item);
  }
  map.addSource('hydrants', {
            type: 'geojson',
            data: hydrants
  });

  // Add hydrant layer 
  map.addLayer({
            "id":"hydrants",
            "type":"circle",
            'source': 'hydrants',
            // 'source-layer':'fishJan-bhb97l',
            'layout': {
              'visibility': 'visible'},
            paint: {
             // initially just colour all the same (base map)
             "circle-color": "#756bb1",
             "circle-radius": 2,
             "circle-stroke-width": 0.6,
             "circle-stroke-color": "#fff",
             "circle-opacity":0.3
            }
  });

  map.addSource('engines', {
                    type: 'geojson',
                    data: engines
  });

  // map.addLayer({
  //               "id":"engines",
  //               "type":"fill",
  //               'source': 'engines',
  //               // 'source-layer':'fishJan-bhb97l',
  //               'layout': {
  //                 'visibility': 'visible'},
  //                 paint: {
  //                  // color circles by year_built_copy, using a match expression
  //                  'fill-color': '#888888',
  //                  'fill-opacity': 0.4,
  //                  'fill-outline-color': 'black'
  //              },
  //              'filter': ['==', '$type', 'Polygon']
  //  });

});

/* ============= Pop up for each hydrant  ============== */
// inspect a unit (point) on click
    // When a click event occurs on a feature in the unclustered-point layer, open a popup at the
    // location of the feature, with description HTML from its properties.
map.on('click', 'hydrants', function (e) {
  map.flyTo({ center: e.features[0].geometry.coordinates});
  var coordinates = e.features[0].geometry.coordinates.slice(); 
  var description = "<b>Hydrant ID:</b> " + e.features[0].properties.HYDRANTNUM;
  description += "<br><b>Engine number:</b> " + e.features[0].properties.ENGINE_NUM;
  description += "<br><b>Year installed:</b> " + e.features[0].properties.YEAR_INSTA;
  description += "<br><b>Date of last inspection:</b> " + e.features[0].properties.DATEOFLAST;

           //add other elements/ fix into scrollable menu

           // Ensure that if the map is zoomed out such that multiple copies of the feature are visible,
           // the popup appears over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
       coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
   }

  new mapboxgl.Popup()
     .setLngLat(coordinates)
     .setHTML(description)
     .addTo(map);
});

map.on('mouseenter', 'hydrants', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'hydrants', function () {
    map.getCanvas().style.cursor = '';
});

//var myFeatures = map.querySourceFeatures('engines');
//console.log(myFeatures);


/* ============= Show the slider scores ============== */
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
};



