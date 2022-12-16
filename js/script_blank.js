// Add the map
var map = L.map('map', {
    center: [55.73,-3.40],
    zoom:6,
    minZoom:6,
    maxZoom:9,
    zoomControl: false
});

// add basemap
var osm = L.tileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'Map data ©OpenStreetMap contributors, CC-BY-SA, Imagery ©CloudMade'
});
osm.addTo(map);

// Function to style the feature but crucially calls the getColour function passing the
// AveragePrice property of the geojson
var colourArray = ['#800026','#BD0026','#E31A1C','#FC4E2A','#FD8D3C','FFEDA0'];
var colourArray2 = ['#ffffcc','#d9f0a3','#addd8e','#78c679','#31a354','#006837'];
var colourArray3 = ['#a50f15','#de2d26','#fb6a4a','#fc9272','#fcbba1','#fee5d9']
var colourArray4 = ['#253494','#2c7fb8','#41b6c4','#7fcdbb','#c7e9b4','#ffffcc']

function averagePriceStyle(feature) {
    function getColour(price) {
        if (price > 500000) {
            return colourArray[0];
        } else if (price > 400000) {
            return colourArray[1];
        } else if (price > 300000) {
            return colourArray[2];
        } else if (price > 200000) {
            return colourArray[3];
        } else if (price > 100000) {
            return colourArray[4];
        } else {
            return colourArray[5];
        };
    };
    return {
        fillColor: getColour(feature.properties.AveragePrice),
        weight: 2,
        opacity: 1,
        color: 'grey',
        dashArray: '',
        fillOpacity: 0.8
    };
};

// This section adds some event listeners for building interactivity
// Function to highlight polygon on mouseover event
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 3,
        color: 'white',
        dashArray: '2',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties);
}

// Function to zoom to polygon on click
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Function to report a property value
function reportProperty(e) {
    var layer = e.target;
    console.log(layer.feature.properties.AveragePrice);
}

var min = 0;
var max = 0;
var minRegion;
var maxRegion;

// Create default slider
var slider = document.getElementById('slider');
noUiSlider.create(slider, {
    start: [300000, 800000],
    tooltips: true,
    connect: true,
    step: 5000,
    range: {
        'min': 50000,
        'max': 1000000
    }
}).on('slide', function(e) {
    currentLayer.eachLayer(function(layer) {
        if(layer.feature.properties.AveragePrice>=parseFloat(e[0])&&layer.feature.properties.AveragePrice<=parseFloat(e[1])) {
            layer.addTo(map);
        } else {
            map.removeLayer(layer);
        }
    });
});

// onEachFeature function assigns event listeners and the previously defined functions
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: (function resetHighlight() {
            currentLayer.resetStyle(this);
            info.update();
        }),
        click: zoomToFeature,
        dblclick: reportProperty
    });

    if(feature.properties.AveragePrice !== null) {
        if(feature.properties.AveragePrice < min || min ===0) {
            min = feature.properties.AveragePrice | 0;
            min = Math.round(min/100000)*100000
            //console.log('min = ' + min);
            minRegion = feature.properties.RegionName
        }
        if(feature.properties.AveragePrice>max) {
            max = feature.properties.AveragePrice | 0;
            max = Math.round(max/100000)*100000
            //console.log('max = ' + max);
            maxRegion = feature.properties.RegionName
        }
    }
}


// MAIN LAYER CREATION FUNCTION  ------------------------------------------------------------------------------------------

// Function called by buttons to add data depending on the button pressed
// style calls the style function to style the feature
// onEachFeature calls the onEachFeature function to assign event listeners to the feature
// removes current layer and replaces with new (previously a toggle but now a switch)
let dataArray = [HPI_2022_JAN, HPI_2022_FEB, HPI_2022_MAR, HPI_2022_APR, HPI_2022_MAY, HPI_2022_JUN, HPI_2022_JUL, HPI_2022_AUG, HPI_2022_SEP]

var currentLayer = new L.geoJson();

function addLayer(dataSource, month) {
    //if(map.hasLayer(currentLayer)) {
        map.removeLayer(currentLayer);
    //} else {
        document.getElementById('dataLabel').innerHTML = month;
        currentLayer = new L.geoJson(dataSource, {
            style:averagePriceStyle,
            onEachFeature:onEachFeature
        }).addTo(map);

        map.fitBounds(currentLayer.getBounds(),{
            padding: [20,20]
        });

        // Updating the slider with new min and max values based on new data
        slider.noUiSlider.updateOptions({
            tooltips: true,
            start:[min+1, max-1],
            range: {
                'min': min,
                'max': max
            }
        });

        //alert('Cheapest region: ' + minRegion)
        //alert('Most expensive region: ' + maxRegion)
    //};
};


// BUTTONS WITH ATTACHED FUNCTIONS  ------------------------------------------------------------------------------------------
// Event listeners to toggle data by month (should refactor this to simplify, may not be time)
//$(document).on('click', '#toggleJan', function() { // uses jQuery (want to avoid)
document.getElementById('toggleJan').onclick=function() {
    addLayer(HPI_2022_JAN, 'Jan')
};
document.getElementById('toggleFeb').onclick=function() {
    addLayer(HPI_2022_FEB, 'Feb')
};
document.getElementById('toggleMar').onclick=function() {
    addLayer(HPI_2022_MAR, 'Mar')
};
document.getElementById('toggleApr').onclick=function() {
    addLayer(HPI_2022_APR, 'Apr')
};
document.getElementById('toggleMay').onclick=function() {
    addLayer(HPI_2022_MAY, 'May')
};
document.getElementById('toggleJun').onclick=function() {
    addLayer(HPI_2022_JUN, 'Jun')
};
document.getElementById('toggleJul').onclick=function() {
    addLayer(HPI_2022_JUL, 'Jul')
};
document.getElementById('toggleAug').onclick=function() {
    addLayer(HPI_2022_AUG, 'Aug')
};
document.getElementById('toggleSep').onclick=function() {
    addLayer(HPI_2022_SEP, 'Sep')
};


// Animation of layers
// Repetition of code here. Need to refactor and consolidate.
document.getElementById('animate').onclick=function() {
    setTimeout(function() {
        map.removeLayer(currentLayer)
    });
    setTimeout(function() {
        addLayer(HPI_2022_JAN, 'Jan');
    }, 1000);
    setTimeout(function() {
        addLayer(HPI_2022_FEB, 'Feb')
    }, 2000);
    setTimeout(function() {
        addLayer(HPI_2022_MAR, 'Mar')
    }, 3000);
    setTimeout(function() {
        addLayer(HPI_2022_APR, 'Apr')
    }, 4000);
    setTimeout(function() {
        addLayer(HPI_2022_MAY, 'May')
    }, 5000);
    setTimeout(function() {
        addLayer(HPI_2022_JUN, 'Jun')
    }, 6000);
    setTimeout(function() {
        addLayer(HPI_2022_JUL, 'Jul')
    }, 7000);
    setTimeout(function() {
        addLayer(HPI_2022_AUG, 'Aug')
    }, 8000);
    setTimeout(function() {
        addLayer(HPI_2022_SEP, 'Sep')
    }, 9000);
};


// OVERLAYS AND DISPLAY ------------------------------------------------------------------------------------------

// Slide-in menu
var menu = document.getElementById('menu')
menu.onclick=function() {
    var slidein = document.getElementById('slide-in')
    if (slidein.classList.contains('in')) {
        slidein.classList.remove('in')
    } else {
        slidein.classList.add('in')
    }
};


// DISPLAY MORE DATA (CHARTS??)

// Custom info control
var info = L.control({position:'bottomright'});
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
// Function to update the info control with specific feature properties
info.update = function (properties) {
    this._div.innerHTML = (properties ?
        '<b>' + properties.RegionName + '</b>' + 
        '<br /> Date: ' + properties.Date + 
        '<br /> Average price: ' + properties.AveragePrice + 
        '<br /> Average detached price: ' + properties.DetachedPrice +
        '<br /> Average semi-detached price: ' + properties.SemiDetachedPrice +
        '<br /> Average terraced price: ' + properties.TerracedPrice +
        '<br /> Average flat price: ' + properties.FlatPrice +
        '<br /> Average first-time buyer\'s price: ' + properties.FTBPrice
        : 'Hover over a region');
};
// add info window to map
info.addTo(map);


// Legend
// Need to make this dynamic, allow user to choose grades etc
var legend = L.control({position: 'topright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [500000, 400000, 300000, 200000, 100000],
        labels = [];

    // loop through intervals, generate coloured square for each
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<br><i style="background:' + colourArray[i] + '"></i> ' +
            '£' + grades[i] + '+' + '<br>';
    }
    return div;
};
// add legend to map
legend.addTo(map);