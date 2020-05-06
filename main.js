/* ============= Mapbox setup ============== */
mapboxgl.accessToken = 'pk.eyJ1Ijoibmp4aW5yYW4iLCJhIjoiY2s4dWxxaHR6MGNobDNtcDZzY2l2OXlyaCJ9.9rS7yysTlpkr_ZeB4vX4Ng';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/light-v10',
center: [-75.165222, 39.952583],
zoom: 10
});



map.on('load', function() {
map.addSource('my', {
          type: 'geojson',
          data: "https://raw.githubusercontent.com/liziqun/MUSA_800/master/priority_score.geojson"
        });

map.addLayer({
          "id":"uniqueID",
          "type":"fill",
          'source': 'my',
          // 'source-layer':'fishJan-bhb97l',
          'layout': {
            'visibility': 'visible'},
          'paint':{
            'fill-color':'yellow',
            'fill-opacity': 0.3,
            'fill-outline-color':'red',
          }
          });

});
