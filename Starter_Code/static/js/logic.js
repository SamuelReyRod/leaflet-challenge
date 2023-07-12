var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url)
  .then(function(data) {
    console.log(data);
    createFeatures(data.features);
  })
  .catch(function(error) {
    console.log("Error:", error);
  });

function colorOption(colortype) {
  if (colortype < 10) return "lightgreen";         // Green
  else if (colortype < 30) return "greenyellow";   // Green-Yellow
  else if (colortype < 50) return "yellow";        // Yellow
  else if (colortype < 70) return "orange";        // Orange
  else if (colortype < 90) return "orangered";     // Orange-Red
  else return "red";                               // Red
}

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(
        feature.properties.time
      )}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${
        feature.geometry.coordinates[2]
      }</p>`
    );
  }

  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    pointToLayer: function(feature, latlng) {
      var markers = {
        radius: feature.properties.mag * 20000,   // Adjust marker radius based on magnitude
        fillColor: colorOption(feature.geometry.coordinates[2]),  // Determine fill color based on depth
        fillOpacity: 0.7,
        color: "black",
        weight: 0.5
      };
      return L.circle(latlng, markers);            // Create a circle marker for each point
    }
  });
  createMap(earthquakes);
}

function createMap(earthquakes) {
  var grayscale = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}",
    {
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
      style: "mapbox/light-v11",
      access_token: api_key    // Provide your Mapbox access token here
    }
  );

  var baseMaps = {
    Grayscale: grayscale
  };

  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [grayscale, earthquakes]   // Add grayscale and earthquakes layers to the map
  });

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend"),
      depth = [-10, 10, 30, 50, 70, 90];
    div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        colorOption(depth[i] + 1) +
        '"></i> ' +
        depth[i] +
        (depth[i + 1] ? "&ndash;" + depth[i + 1] + "<br>" : "+");
    }
    return div;
  };
  legend.addTo(myMap);
}


