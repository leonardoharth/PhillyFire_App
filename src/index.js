// $('document').ready(function(){
  var map = L.map('map');
  map.createPane('labels');
  map.getPane('labels').style.zIndex = 650;
  map.getPane('labels').style.pointerEvents = 'none';

  var mapBase = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    attribution: '©OpenStreetMap, ©CartoDB'
  }).addTo(map);

  var mapLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
    attribution: '©OpenStreetMap, ©CartoDB',
    pane: 'labels'
  }).addTo(map);

  var state = {current:""};
  var data = {};
  var table = {};

  $.ajax({
    url:"https://raw.githubusercontent.com/liziqun/MUSA800_App/master/data/engine.geojson",
    dataType: "json",
    success: function () {},
  }).done(function(engines) {

    addThings("engines",engines,11)

/*
    $('#thres-slider').on('change click',function() {
      thres(engines,data.parcels);
    });*/

    $('.title').click(function() {
      addThings("engines",engines,11);
    });
  })

  var addThings = (statename,geojson,zoom) => {

    state.parcels = [];
    data.parcels = [];

    state.current = statename;
    data[statename] = geojson;

    map.eachLayer(function(layer) {
      if (layer != mapBase && layer != mapLabels) {
        map.removeLayer(layer);
      }
    });
    state[statename] = L.geoJSON(geojson, {
      //style: style,
      onEachFeature: function(feature,layer) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature
        });
      }
    }).addTo(map);
    map.setMinZoom(zoom);
    map.setMaxBounds(state[statename].getBounds().pad(.25));
    map.fitBounds(state[statename].getBounds().pad(.25));

    thres(data.engines,data.parcels);

    $('.catchments,.parcels,.individual').addClass('d-none');
    $(`.${statename}`).removeClass('d-none');

    if (statename == "engines") {
      $('.musa').removeClass('d-none');
      $('.back').addClass('d-none');
    } else {
      $('.musa').addClass('d-none');
      $('.back').removeClass('d-none');
    }
  }

  var thres = (engines,parcels) => {
    let t = $('#thres-slider').val();

    $(`#parcels, #catchments`).DataTable().destroy();
        $('#catchments tbody, #parcels tbody').html('');
    //let total = 0;
    //table & interaction
    engines.features.forEach(function(eng) {
      eng = eng.properties;
      //count = eval(eng.risk_level).filter(function(val) {return val > t}).length;
      //total += count;
      // jquery append table for each catchment
      $('#catchments tbody').append(`
        <tr class="text-nowrap text-center" id="c${eng.ENGINE_NUM}">
          <td style="padding:0 1rem 0 4rem !important;"><h4 class="m-1">${eng.ENGINE_NUM}</h4></td>
          <td style="padding:0 1rem 0 4rem !important;">${eng.risk_level}</td>
          <td style="padding:0 1rem 0 4rem !important;">${Math.round(eng.risk_level)}</td>
        </tr>
      `);

      $(`#c${eng.ENGINE_NUM}`).on({
        mouseenter: function() {highlightFeature(match("ENGINE_NUM",eng.ENGINE_NUM,state.engines))},
        mouseleave: function() {resetHighlight(match("ENGINE_NUM",eng.ENGINE_NUM,state.engines))},
        click: function() {zoomToFeature(match("ENGINE_NUM",eng.ENGINE_NUM,state.engines))}
      });

    });
    //popup
    state.engines.eachLayer(function (layer) {
      eng = layer.feature.properties;
      layer.bindPopup(`
        <h4 style="text-align:center;border:3px solid ${getColor(eng.risk_level)}">Engine ${eng.ENGINE_NUM}</h4>
        <div class="d-flex flex-col justify-content-between">
          <span class="d-flex">Average Risk Level &nbsp;</span>
          <span class="d-flex">${eng.risk_level}</span>
        </div>
        <div class="d-flex flex-col justify-content-between">
          <span class="d-flex">Total Area &nbsp;</span>
          <span class="d-flex">${Math.round(eng.Shape_Area)}</span>
        </div>
      `);
      layer.on('mouseover', function(e){
        layer.openPopup();
      });
    })

    if (state.current == "parcels") {
      state.parcels.eachLayer(function (layer) {
        layer.setStyle(style);
        state.parcels.resetStyle(layer);

        pcl = layer.feature.properties;
        layer.bindPopup(`
          <p>
            <strong>${pcl.risk_level}</strong><br>
            SBL No. ${pcl.priority_level}
          </p>
          <p>${pcl.risk_level}<br>${pcl.risk_level} ${pcl.risk_level}</p>
          <p>
            Past Health/Safety Violations: ${pcl.risk_level}<br>
            Past Total Violations: ${pcl.risk_level}
          </p>
          <p>
            Risk of Health Violation: ${Math.round(pcl.risk_level)}<br>
            Risk of Safety Violation: ${Math.round(pcl.risk_level)}
          </p>

        `);
        layer.on('mouseover', function(e){
          layer.openPopup();
        });
      });

      let props = 0;
      parcels.features.forEach(function(pcl) {
        pcl = pcl.properties;
        // jquery append table for each parcel
        $('#parcels tbody').append(`
          <tr class="text-nowrap" id="p${pcl.HYDRANTNUM}">
            <td>${pcl.priority_all}</td>
            <td class="text-right">${pcl.priority_all}</td>
          </tr>
        `);

        $(`#p${pcl.priority_all}`).on({
          mouseenter: function() {highlightFeature(match("priority_all",pcl.priority_all,state.parcels))},
          mouseleave: function() {resetHighlight(match("priority_all",pcl.priority_all,state.parcels))},
          click: function() {zoomToFeature(match("priority_all",pcl.priority_all,state.parcels))}
        });

      });

      $('.thres-count').text(props);
    }

    $(`#${state.current}`).DataTable({
      "paging"   : false,
      "info"     : false,
      "searching": false
    });

    $('.thres-total').text(total);
    $('.thres-risk').text(t);

    state.threshold = t;

  }

  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend leaflet-bar'),
          grades = [0, 10, 20, 30, 40, 50],
          labels = [];

      div.innerHTML = `
      <h6>Health/Safety <br>Violation Risk</h6>
      `

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(map);

  function match(key,value,stateObj) {
    var out = {};
    stateObj.eachLayer(function(layer) {
      layerKey = layer.feature.properties;
      if (layerKey[key] == value) {
        out.target = layer;
      }
    })

    return out;
  }

  function getColor(d) {
    return state.current == "parcels" && d >= state.threshold ? '#ff0000' :
           d > 45 ? '#4d004b' :
           d > 40 ? '#810f7c' :
           d > 35 ? '#88419d' :
           d > 30 ? '#8c6bb1' :
           d > 25 ? '#8c96c6' :
           d > 20 ? '#9ebcda' :
           d > 15 ? '#bfd3e6' :
           d > 10 ? '#e0ecf4' :
           d > 5  ? '#f7fcfd' :
           d > 0  ? '#ffffff' :
                    '#aaaaaa';
  }

  function style(feature) {
    return {
        fillColor: getColor(feature.properties.avg_HS|feature.properties.prb_HS),
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 0.7
    };
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        color: '#aaa',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    let cid = e.target.feature.properties.ENGINE_NUM;
    $(`#c${cid}`).addClass('hover');

  }

  function resetHighlight(e) {
    state[state.current].resetStyle(e.target);

    let cid = e.target.feature.properties.ENGINE_NUM;
    $(`#c${cid}`).removeClass('hover');
  }

  function zoomToFeature(e) {
    let cid = e.target.feature.properties.ENGINE_NUM;

    if (state.current == "engines") {
      $.ajax({
        url:`https://raw.githubusercontent.com/liziqun/MUSA800_App/master/data/engine_hy${cid}.geojson`,
        dataType: "json",
        success: function () {},
        error: function (xhr) {console.log(xhr.statusText);}
      }).done(function(pcl) {
        pcl.features.forEach(function(hy) {
        hy = hy.properties;
        });
        addThings('parcels',parcels,15);
        $('.parcels .cid').text(`${cid}`);
      });
    }

    if (state.current == "parcels") {
      map.fitBounds(e.target.getBounds());
    }

  }


// });
