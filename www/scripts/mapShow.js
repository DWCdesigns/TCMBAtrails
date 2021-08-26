function show() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var Icon;

    today = mm + '/' + dd + '/' + yyyy;

    var centerpoint = [32.46279, -90.19553];
    var mapbottom = [32.46046, -90.1954];

    var overlayMaps;
    var d = new Date();
    var marker;
    var markerLayers = new L.layerGroup();
    var trackPrefix = '    {' +
        '"type": "FeatureCollection", ' +
        '"name": "{name}", ' +
        '"createdate": "' + today + '", ' +
        '"crs": {' +
        '"type": "name", ' +
        '"properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } ' +
        '},' +
        '"features": [' +
        '{' +
        '"type": "Feature",' +
        '"properties": {' +
        '"name": "Track"' +
        '}, ' +
        '"geometry": {' +
        '"type": "MultiLineString",' +
        '"coordinates": [' +
        '[';
    var trackSuffix = ']' +
        ']' +
        '} ' +
        '}' +
        ']' +
        '}';
    var trackData = new Array;




    var map = L.map('map', { zoomControl: false }).fitWorld();

    var tile = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 20,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(map);

    var trailLayers = new L.GeoJSON(trails, {
        onEachFeature: function (feature, layer) {
            //feature.properties.name = 'The Whole Enchilada';
            if (layer instanceof L.Polyline) {
                layer.bindTooltip(layer.feature.properties.Name);
                layer.on({
                    mouseover: function (layer) {
                        layer.target.setStyle({
                            'color': layer.target.feature.properties.color
                            , 'weight': 5
                            , 'opacity': .7
                        });
                    },
                    mouseout: function (layer) {
                        layer.target.setStyle({
                            'color': layer.target.feature.properties.color
                            , 'weight': 2
                            , 'opacity': .7
                        });
                    },
                    click: zoomToFeature
                });
                layer.setStyle({
                    'color': feature.properties.color
                    , 'weight': 2
                    , 'opacity': .7
                });
            }
        }
    });

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
        $('#ddlSearchTrails').val(e.target.feature.properties.id).selectmenu('refresh');
    }

    trailLayers.addTo(map);

    trailLayers.eachLayer(function (layer) {
        $('#ddlSearchTrails').append($('<option>', {
            value: layer.feature.properties.id,
            text: layer.feature.properties.Name
        }));

    });
    $('#ddlSearchTrails').append('<option disabled>--Loops from parking lot.</option>');
    loopLayers.eachLayer(function (layer) {
        if (layer.feature.properties.id.indexOf("01") >= 0) {
            $('#ddlSearchTrails').append($('<option>', {
                value: layer.feature.properties.id,
                text: layer.feature.properties.Name
            }));

            if (layer.feature.properties.id === "SW01") { if (!map.hasLayer(layer)) { map.addLayer(layer); } }
            else { if (map.hasLayer(layer)) { map.removeLayer(layer); } }
        }
    });
    //Add a legend
    L.Control.Marker = L.Control.extend({  //download-button
        onAdd: function (map) {
            var img = L.DomUtil.create('div');
            img.innerHTML = '<span class="info"><i id="btnFindMe" class="fas fa-map-marker-alt" style="color:darkorange"></i></span>'
                + '<span class="info"><i id="btnRefresh" class="fa fa-refresh" style="color:darkorange"></i></span>';
            //L.DomEvent.on(img, 'click', findMe, this);
            L.DomEvent.disableClickPropagation(img);
            return img;
        }
        //,
        //_download: function (ev) {  //console.log(this._map._layers)  //must be named mytrack!
        //    if ('msSaveOrOpenBlob' in navigator) navigator.msSaveOrOpenBlob(new Blob([JSON.stringify(mytrack.gpx)]), "mytrack.json");  //L.mytrack???
        //    else ev.target.href = "data:application/geo+json," + JSON.stringify(mytrack.gpx)
        //}
        //, onRemove: function(map) { }   // Nothing to do here
    });
    L.control.marker = function (opts) {
        return new L.Control.Marker(opts);
    };
    L.control.marker({ position: 'bottomright' }).addTo(map);

    L.Control.Home = L.Control.extend({  //download-button
        onAdd: function (map) {
            var img = L.DomUtil.create('div');
            img.innerHTML = '<span class="info"><i id="btnHome" class="fas fa-biking" style="color:darkorange"></i></span>';
            L.DomEvent.on(img, 'click', showTrails, this);
            L.DomEvent.disableClickPropagation(img);
            return img;
        }
        //,
        //_download: function (ev) {  //console.log(this._map._layers)  //must be named mytrack!
        //    if ('msSaveOrOpenBlob' in navigator) navigator.msSaveOrOpenBlob(new Blob([JSON.stringify(mytrack.gpx)]), "mytrack.json");  //L.mytrack???
        //    else ev.target.href = "data:application/geo+json," + JSON.stringify(mytrack.gpx)
        //}
        //, onRemove: function(map) { }   // Nothing to do here
    });
    L.control.home = function (opts) {
        return new L.Control.Home(opts);
    };
    L.control.home({ position: 'topright' }).addTo(map);

    geojsonLayerTopo.addTo(map);
    geojsonLayerConnectors.addTo(map);

    var geojsonLayerPoints = new L.GeoJSON(icons, {
        onEachFeature: function (feature, layer) {
            layer.addTo(clusters);
        }
        , pointToLayer: function (feature, latlng) {
            var pop = "<table style='width:100%'><tr><td>" + feature.properties.Name + "</td></tr>";
            var iconurl = 'images/MTB.svg';
            if (feature.properties.iconurl !== undefined) {
                iconurl = feature.properties.iconurl;
            }
               Icon = L.icon({
                   iconUrl: iconurl ,
                iconSize: [30, 30], // size of the icon
                iconAnchor: [30, 30], // point of the icon which will correspond to marker's location
                popupAnchor: [-15, -30] // point from which the popup should open relative to the iconAnchor
            });
            if (feature.properties.gx_media_links !== null) {
                var pic = feature.properties.gx_media_links.split(" ");
                pop += "<tr><td><img style='width: 200px;  max-height: 500px;' src='" + pic[0] + "'></img></td ></tr >" +
                    "<tr><td><a href='#' onclick='window.open(\"" + pic[0] + "\", \"_system\"); return false;' >Full Screen</a></td ></tr > ";
                //pop += feature.properties.description + "</td ></tr>";
            }

            pop += "</table>";
            var t = L.marker(
                latlng
                , { icon: Icon }
            )
                .bindPopup(pop, { draggable: true, autoPan: true});
            return t;
        }
    });
    map.addLayer(clusters);


    function clearTracks() {
        if (trackData.length > 0) {
            trackData = new Array;
        }
        map.stopLocate();
        //map.locate({ setView: true, maxZoom: 16 });
        $('#btnMakeTrack').val('true');
        $('#lblMakeTrack').text('Start');
        $('#iStartTrack').show();
        $('#iStopTrack').hide();
        $('#btnSaveTrack').prop('disabled', true);
        $('#btnClearTrack').prop('disabled', true);

    }
    function makeTrack(event) {
        if (event.target.value === 'true') {
            map.locate({ setView: true, watch: true, enableHighAccuracy: true, maxZoom: 16 });
            $('#btnMakeTrack').val('false');
            $('#iStartTrack').hide();
            $('#iStopTrack').show();
            $('#lblMakeTrack').text('Stop');
            $('#btnSaveTrack').prop('disabled', false);
            $('#btnClearTrack').prop('disabled', false);
        } else {
            map.stopLocate();
            map.locate({ setView: true, maxZoom: 16 });
            $('#btnMakeTrack').val('true');
            $('#lblMakeTrack').text('Start');
            $('#iStartTrack').show();
            $('#iStopTrack').hide();
        }

    }
    function saveTracks() {
        saveJSON(trackData);
    }
    function saveJSON(trackData) {
        //var fileDownload = require('js-file-download');
        let filePath = cordova.file.externalRootDirectory + 'download/' + 'my_file.json';
        let fileTransfer = new window.FileTransfer();
        var data = trackPrefix;
        for (var i = 0; i < trackData.length - 2; i++) {
            data += '[' + trackData[i].lng + ',' + trackData[i].lat + '],';
        }
        data += '[' + trackData[i + 1].lng + ',' + trackData[i + 1].lat + ']';
        data += trackSuffix;
        var newDirectory;
        //Let user pick directory to save file in.
        window.OurCodeWorld.Filebrowser.folderPicker.single({
            success: function (dir) {
                if (!dir.length) {
                    // No folder selected
                    return;
                }
                //Create a temporary file and have the user pick a file name.
                window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
                    //Pick a name
                    newFileName = 'MyTrack_' + Date.now().toString();
                    newFileName = window.prompt("Save file as ", newFileName);
                    newFileName += '.json';
                    data = data.replace("{name}", newFileName);
                    //Create the temporary file
                    fs.root.getFile(newFileName, { create: true, exclusive: true }, function (fileEntry) {
                        //Write the data to the file
                        fileEntry.createWriter(function (fileWriter) {
                            fileWriter.onwriteend = function (e) {
                                //Move the file to the selected directory.
                                window.resolveLocalFileSystemURL(dir[0],
                                    function (dirEntry) {
                                        fileEntry.moveTo(dirEntry
                                            , newFileName
                                            , function () {
                                                alert('File saved.');
                                            }
                                            , function (e) {
                                                alert('Error saving file: ' + e);
                                            });
                                    },
                                    function (err) {
                                        console.log(err);
                                    });

                            };

                            fileWriter.onerror = function (e) {
                                console.log('Write failed: ' + e.toString());
                            };

                            var blob = new Blob([data], { type: 'text/plain' });
                            fileWriter.write(blob);
                        }, function (err) {
                            console.log(err);
                        });

                    }, function (err) {
                        console.log(err);
                    });


                }, function (err) {
                    console.log(err);
                });
            },
            error: function (err) {
                console.log(err);
            }
        });

    }
    function showDragArea() {
        if ($(window).width() < 600) {
            $('#dragArea').hide();
        } else {
            $('#dragArea').show();
        }
    }

    function showTrails(e) {
        var trail;
        var isTrail = false;
        if (e === 'all') {
            trailLayers.eachLayer(
                function (layer) {
                    if (!map.hasLayer(layer)) { map.addLayer(layer); }
                }
            );
            isTrail = true;
            map.setView(centerpoint, 16);
        };
        if (e.target !== undefined) {

            var weight = 2;
            trail = 'all';

            if (e.target.options !== undefined) {
                trail = e.target.options[e.target.options.selectedIndex].text;
                if (trail === 'Individual Trails') {
                    trail = 'all';
                    weight = 2;

                }
            }
            trailLayers.eachLayer(
                function (layer) {
                    if (layer.feature.properties.Name === trail) {
                        isTrail = true;
                        map.fitBounds(layer.getBounds());
                        weight = 5;
                    }
                    else if (trail !== 'all') {
                        weight = 2;
                    }
                    layer.setStyle({
                        'color': layer.feature.properties.color
                        , 'weight': weight
                        , 'opacity': .7
                    });
                }
            );
            if (trail === 'all') {
                map.setView(centerpoint, 16);
                isTrail = true;
            }

            loopLayers.eachLayer(
                function (layer) {
                    if (layer.feature.properties.Name === 'Speedway Trail' && isTrail)
                    { if (!map.hasLayer(layer)) { map.addLayer(layer); } }
                    else if (layer.feature.properties.Name === trail) {
                        map.setView(centerpoint, 16);
                        if (!map.hasLayer(layer)) { map.addLayer(layer); }
                    } else {
                        if (map.hasLayer(layer)) { map.removeLayer(layer); }
                    }
                }
            );

        }

    }
    function findMe(e) {
        map.locate({ setView: true, enableHighAccuracy: true, maxZoom: 16 });
    }
    var markers = new Array;
    function removeMarkers() {
        markers.forEach(function (marker) {
            if (map.hasLayer(marker)) { map.removeLayer(marker); }
        });
    }
    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        Icon = L.icon({
            iconUrl: 'images/MTB.svg',
            iconSize: [30, 30], // size of the icon
            iconAnchor: [30, 30], // point of the icon which will correspond to marker's location
            popupAnchor: [-15, -30] // point from which the popup should open relative to the iconAnchor
        });
        marker = L.marker(e.latlng, { icon: Icon })
            .addTo(map).bindPopup("You are within " + radius.toFixed(2) + " meters from this point<br>" + d.getTime() + '-' + e.latlng)
            .openPopup();
        markers.push(marker);
        //$('#lastUpdate').text(d.getTime() + '-' + e.latlng);
        if ($('#lblMakeTrack').text() === 'Stop') {
            markerLayers.addLayer(marker);
            trackData.push(e.latlng);
            map.addLayer(markerLayers);
        }
    }
    function onLocationError(e) {
        alert(e.message);
    }
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    //map.locate({ setView: true, maxZoom: 16 });

    $(document).ready(function () {

        $('.leaflet-control-layers-selector').attr("checked", true);
        $('.leaflet-control-layers-overlays label div span').addClass("inputSpan");
        $('#btnFindMe').on('click', findMe);
        $('#btnRefresh').on('click', removeMarkers);
        $('#btnMakeTrack').on('click', makeTrack);
        //$('#btnShowTrails').on('click', showTrails);
        $('#ddlSearchTrails').on('change', showTrails);
        //$('#btnSaveTrack').on('click', saveTracks);
        //$('#btnClearTrack').on('click', clearTracks);
        showTrails('all');
        //$('#btnSaveTrack').prop('disabled', true);
        //$('#btnClearTrack').prop('disabled', true);
        window.onresize = showDragArea;
        //$('.leaflet-marker-icon').on('change', iconClick);
    });
}