/* ============= Mapbox setup ============== */
mapboxgl.accessToken = 'pk.eyJ1Ijoibmp4aW5yYW4iLCJhIjoiY2s4dWxxaHR6MGNobDNtcDZzY2l2OXlyaCJ9.9rS7yysTlpkr_ZeB4vX4Ng';
map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  // center: [ -75.135791, 40.008376],
  center:[-75.150312,40.000836],
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
var layers = ['Top Priority (1)', '2', '3', '4', '5', '6', '7', '8', '9', 'Lowest Priority (10)'];
var colors = ['#ffffcc','#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026',  '#420D09'];

/* ============= MAPS============== */
var hoveredStateId = null;

// opacity slider function (must be created outside map.on)
var engineOpac_slider = document.getElementById('slider_map');
var engineOpc_text = document.getElementById('slider-value_map');
var hydrantOpac_slider = document.getElementById('slider_map2');
var hydrantOpac_text = document.getElementById('slider-value_map2');


//Map overall
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

  //Add source: hydrant (points）
  map.addSource('hydrants', {
            type: 'geojson',
            data: hydrants
  });

  // Add source: engines data (polygon)
  map.addSource('engines', {
                    type: 'geojson',
                    data: engines
  });

  // Add engine layer (polygon)
  map.addLayer({
                "id":"engines",
                "type":"fill",
                'source': 'engines',
                //'layout': {
                  //'visibility': 'visible'},
                paint: {
                   'fill-color': '#fcfbfd',
                   'fill-outline-color': '#9e9ac8'
                  }
               //,'filter': ['==', '$type', 'Polygon']
  });

  // Add engine border layer (line)
  map.addLayer({
    'id': 'engines-borders',
    'type': 'line',
    'source': 'engines',
    'layout': {},
    'paint': {
      'line-color': '#636363',
      'line-width': 1
    }
  });

  // Add hydrant layer (points)
  map.addLayer({
            "id":"hydrants",
            "type":"circle",
            'source': 'hydrants',
            //'layout': {
              //'visibility': 'visible'},
            paint: {
             "circle-color": "#756bb1",
             "circle-radius": 3,
             "circle-stroke-width": 0.1,
             "circle-stroke-color": "black"
             //"circle-opacity":0.25
            }
  });

  //Add engine opacity function
  engineOpac_slider.addEventListener('input', function(e) {
      map.setPaintProperty(
      'engines',
      'fill-opacity',
      parseInt(e.target.value, 10) / 100
    );

    map.setPaintProperty(
      'engines-borders',
      'line-opacity',
      parseInt(e.target.value, 10) / 100
    );

    // Value indicator
    engineOpc_text.textContent = e.target.value + '%';
  });


  //Add engine opacity function
  hydrantOpac_slider.addEventListener('input', function(e) {
    map.setPaintProperty(
      'hydrants',
      'circle-opacity',
      parseInt(e.target.value, 10) / 100
    );

    map.setPaintProperty(
      'hydrants',
      'circle-stroke-opacity',
      parseInt(e.target.value, 10) / 100
    );
    // Value indicator
    hydrantOpac_text.textContent = e.target.value + '%';
  });


}); // close the map on load 


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

/* ============= Show and hide layers ============== */
var toggleableLayerIds = ['engines', 'engines-borders','hydrants'];

// set up the corresponding toggle button for each layer
for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.createElement('a');
  link.href = '#';
  link.className = 'active';
  link.textContent = id;

  link.onclick = function(e) {
  var clickedLayer = this.textContent;
  e.preventDefault();
  e.stopPropagation();

  var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

  // toggle layer visibility by changing the layout object's visibility property
  if (visibility === 'visible') {
  map.setLayoutProperty(clickedLayer, 'visibility', 'none');
  this.className = '';
  } else {
  this.className = 'active';
  map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
  }
  };

  var layers_2 = document.getElementById('menu');
  layers_2.appendChild(link);
}

/* ============= Show the filter by scores slier ============== */
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value;
slider.oninput = function() {
  output.innerHTML = this.value;
};

/* ============= Add navigation control bar============== */
map.addControl(new mapboxgl.NavigationControl());
