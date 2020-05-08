/* ============= Helper Functions ============== */
// Compile inputs from sidebar into a dictionary.
// When the checkbox for an option is selected, that layer will be shown on the map.
var addOption = function(checkedTrue, layerName) {
  if(checkedTrue) {
    map.setLayoutProperty(layerName, 'visibility', "visible");
  }
};


var appState = {
  "fireScore": undefined,
  "socialScore": undefined,
  "industrialScore": undefined,
  "hydrantScore": undefined,
  "scoreFilter": undefined,
  "filter_on": undefined,
  "eng_filter_on": undefined,
  "engineFilter": undefined
}; // note: appState values are only updated when the 'Update Map' button is Clicked!

/* ============= For reading and updating colour of map ============== */

// read input function to read the new input when button is clicked
var readInput = function(){
  appState.fireScore = $('#cbox-input1')[0].checked;
  console.log("Include Fire Risk?", appState.fireScore);
  appState.industrialScore= $('#cbox-input2')[0].checked;
  console.log("Include Percent Industrial", appState.industrialScore);
  appState.socialScore = $('#cbox-input3')[0].checked;
  console.log("Include Social Impact?", appState.socialScore);
  appState.hydrantScore = $('#cbox-input4')[0].checked;
  console.log("Include Hydrant Age?", appState.hydrantScore);
  appState.filter_on = $('#cbox-input5')[0].checked;
  console.log("filter scores on: ", appState.filter_on);
  appState.scoreFilter = slider.value;
  console.log("filter scores by: ", appState.scoreFilter);
  appState.eng_filter_on = $('#cbox-input6')[0].checked;
  console.log("engine scores on: ", appState.eng_filter_on);
  appState.engineFilter = $('#text-input1').val();
  console.log("Filter to this engine number", appState.engineFilter);
};

var inputToNum = function(input){
  if(input){
    return 1;
  }else{
    return 0;
  }
}

var inputToCombi = function(){
  var fir = inputToNum(appState.fireScore);
  var soc = inputToNum(appState.socialScore);
  var ind = inputToNum(appState.industrialScore);
  var age = inputToNum(appState.hydrantScore);
  console.log("Combination to get from file:" +fir+ind+soc+age)
  return ""+fir+ind+soc+age
}

/* ============= Filters  ============== */
var filterByScores = function(c,s){
  // if combination is "0000", don't filter
  if(c!="0000"){
    map.setFilter('hydrants', ['==', ['get', c], s]);
  }
}

var filterByEngine = function(eng){
   map.setFilter('hydrants', ['==', ['get', 'ENGINE_NUM'], eng]);
}

var filterByBoth = function(c,s, eng){
  if (c!="0000"){
    map.setFilter('hydrants', ["all",
      ['==', ['get', c], s],
      ['==', ['get', 'ENGINE_NUM'], eng]
   ]);
  }else{ // if combi is 0000, don't filter by scores
    filterByEngine(eng);
  }
}

var filterMap = function(c, includeScore, includeEngine){
  var s = Number(appState.scoreFilter);
  var eng = Number(appState.engineFilter)
  if(includeScore){
    if (includeEngine){
      filterByBoth(c,s,eng)
    }else{
      filterByScores(c,s)
    }
  }else if(includeEngine){
    filterByEngine(eng)
  }
}
/* ============= Update map ============== */

var updateMap = function(combination){
  // if the hydrants are plotted, remove theme
  if (combination=="0000"){
    resetColours();
  }else{
    if (map.getLayer('hydrants')){ map.removeLayer('hydrants')};
    // add new layer
    map.addLayer({
                "id":"hydrants",
                "type":"circle",
                'source': 'hydrants',
                // 'source-layer':'fishJan-bhb97l',
                'layout': {
                  'visibility': 'visible'},
                paint: {
                 // color circles by year_built_copy, using a match expression
                 "circle-color": [
                    'match',
                    ['get', combination],
                    1,
                    '#ffffcc',
                    2,
                    '#ffeda0',
                    3,
                    '#fed976',
                    4,
                    '#feb24c',
                    5,
                    '#fd8d3c',
                    6,
                    '#fc4e2a',
                    7,
                    '#e31a1c',
                    8,
                    '#bd0026',
                    9,
                    '#800026',
                    10,
                    '#420D09',
                    '#ccc' //for other that may not be specified
                  ],
                 "circle-radius": 2,
                 "circle-stroke-width": 0.6,
                 "circle-stroke-color": "#fff",
                 "circle-opacity":0.3
                }
    });
  }
}

/* ============= Reset Map ============== */
var resetColours = function(){
  // if the hydrants are plotted, remove them
  if (map.getLayer('hydrants')){ map.removeLayer('hydrants')};
  map.addLayer({
              "id":"hydrants",
              "type":"circle",
              'source': 'hydrants',
              // 'source-layer':'fishJan-bhb97l',
              'layout': {
                'visibility': 'visible'},
              paint: {
               // color circles by year_built_copy, using a match expression
               "circle-color":"#756bb1",
               "circle-radius": 3,
               "circle-stroke-width": 0.5,
               "circle-stroke-color": "#fff",
               "circle-opacity":1
              }
  });

}

var resetValues = function(){
  $("#cbox-input1").prop("checked", false);
  $("#cbox-input2").prop("checked", false);
  $("#cbox-input3").prop("checked", false);
  $("#cbox-input4").prop("checked", false);
  $('#cbox-input5').prop("checked", false);
  $('#cbox-input6').prop("checked", false);
  $('#text-input1').val('');

  // Push Slider back to 1
  slider.value=1;
  output.innerText = 1;
  map.flyTo({
    center: [ -75.135791, 40.008376],
    zoom: 10.3,
    essential: true // this animation is considered essential with respect to prefers-reduced-motion
  });
}


/* ============= Button Clicks ============== */

// everytime a button is clicked, the inputs of the side bar are read
// appstate is updated
// the filter is run
var buttonClick = function(){
  $('#plotbutton').click(function(e) {
    readInput(); //updates appstate
    var c =inputToCombi();
    updateMap(c);
    filterMap(c, appState.filter_on, appState.eng_filter_on);
  });

  $('#resetbutton').click(function(e) {
    // clear colours on map
    resetColours();
    // reset the toggles
    resetValues();
  });
}

/* ============= Executing these functions ============== */
$(document).ready(function() {
  buttonClick();
});
