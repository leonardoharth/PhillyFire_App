/* ============= Helper Functions ============== */
// Compile inputs from sidebar into a dictionary.
var readInput = function() {
  var inputs = {
    firerisk : $('#firerisk').change(function() {$(this).val($(this).is(':checked')); }).change().val()=='true',
    social : $('#social').change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
    hydrant : $('#hydrantquality').change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
    industrial : $("#industrial").change(function() { $(this).val($(this).is(':checked')); }).change().val()=='true',
    score: $("myRange").slider('option','value')
  };
  return inputs;
};

// When the checkbox for an option is selected, that layer will be shown on the map.
var addOption = function(checkedTrue, layerName) {
  if(checkedTrue) {
    map.setLayoutProperty(layerName, 'visibility', "visible");
  }
};
