var loopLayers = new L.GeoJSON(loops, {
    onEachFeature: function (feature, layer) {
        //feature.properties.name = 'The Whole Enchilada';
        if (layer instanceof L.Polyline) {
            layer.bindTooltip(layer.feature.properties.Name);
            layer.setStyle({
                'color': feature.properties.color
                , 'weight': 4
                , 'opacity': .7
            });
        }
    }
});


var geojsonLayerTopo = new L.GeoJSON(topo, {
    onEachFeature: function (feature, layer) {
        if (layer instanceof L.Polyline) {
            layer.setStyle({
                'color': 'darkgray'
                , 'weight': 1
                , 'opacity': .7
            });
        }
    }
});
var clusters = new L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    disableClusteringAtZoom: 15
});


var geojsonLayerConnectors = new L.GeoJSON(connectors, {
    onEachFeature: function (feature, layer) {
        if (layer instanceof L.Polyline) {
            layer.setStyle({
                'color': 'black'
                , 'weight': 1
                , 'opacity': .7
            });
        }
    }
});