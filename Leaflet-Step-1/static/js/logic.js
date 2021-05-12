var quakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Initialize & Create Two Separate LayerGroups: earthquakes & tectonicPlates
var earthquakes = new L.LayerGroup();
var faultlines = new L.LayerGroup();

// Define Variables for Tile Layers
const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors," +
        "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>," +
        " Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});

const outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors," +
        "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>," +
        " Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

const grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{tileSize}/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors," +
        "<a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>," +
        " Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

// Define baseMaps Object to Hold Base Layers
const baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
};

// Create Overlay Object to Hold Overlay Layers
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultlines
};

// Create Map, Passing In satellite & earthquakes as Default Layers to Display on Load
const myMap = L.map("map", {
    center: [37.77, -122.42],
    zoom: 4,
    layers: [satellite, earthquakes]
});

// Create a Layer Control + Pass in baseMaps and overlayMaps + Add the Layer Control to the Map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Retrieve quakesURL (USGS Earthquakes GeoJSON Data) with D3
d3.json(quakesURL, function(earthquakeData) {
    // Function to Determine Size of Marker Based on the Magnitude of the Earthquake
    function markerSize(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 3;
    }
    // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
    function style(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "black",
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 1
        };
    }
    // Function to Determine Color of Marker Based on the Magnitude of the Earthquake
    function getColor(magnitude) {
        switch (true) {
            case magnitude > 6:
                return "purple";
            case magnitude > 5:
                return "maroon";
            case magnitude > 4:
                return "red";
            case magnitude > 3:
                return "darkorange";
            case magnitude > 2:
                return "yellow";
            case magnitude > 1:
                return "lime";
            default:
                return "green";
        }
    }
    // Create a GeoJSON Layer Containing the Features Array on the earthquakeData Object
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: style,
        // Function to Run Once For Each feature in the features Array
        // Give Each feature a Popup Describing the Place & Time of the Earthquake
        onEachFeature: function(feature, layer) {
                layer.bindPopup("<h3 align='center'>" + feature.properties.place +
                    "</h3><hr><p><u>Occurrence:</u>" + new Date(feature.properties.time) + "</p>" +
                    "</h3><hr><p><u>Magnitude:</u>" + feature.properties.mag) + "</p>";
            }
            // Add earthquakeData to earthquakes LayerGroups 
    }).addTo(earthquakes);
    // Add earthquakes Layer to the Map
    earthquakes.addTo(myMap);

    // Retrieve faultURL (Tectonic Plates GeoJSON Data) with D3
    d3.json(faultURL, function(plateData) {
        // Create a GeoJSON Layer the plateData
        L.geoJson(plateData, {
            color: "blue",
            weight: 2
                // Add plateData to faultlines LayerGroups 
        }).addTo(faultlines);
        // Add faultlines Layer to the Map
        faultlines.addTo(myMap);
    });

    // Set Up Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6],
            labels = [];

        div.innerHTML += 'Magnitude<br><hr>'

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
});