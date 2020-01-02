
var myMap = null;
var MARKERS = [];
var bounds = [];
var SELECTED_MARKER;
var CurrentLocationMarker = null;

var addMode = false;
var changeLocationMode = false;
var allowSetMarkerNull = true;

var tmp_marker = null;

var markerGroups = [];
var markerGroup = [];
var type = "";

var mcgLayerSupportGroup = null;
var layerSupportGroups = [];
var listmarker_sync = [];

var isCheckedShowLabelMarker = true;

var lat = "", lon = "";

var flg = 0;
var flg_overview = true;
var flg_layer_hidden = false;

var shikuFocusZoomNum = 14; // 市区町村だけ選択した場合の倍率
var azaFocusZoomNum = 16; // 字まで選択した場合の倍率

var editable_options = {};
var editable_marker = {};
var edit_callbacktimeout = null;
function init(options) {
    myMap = null;
    editable_options = options;
    myMap = L.map('map', {
        minZoom: CACHE_ZOOM_MIN,
        maxZoom: CACHE_ZOOM_MAX,
        //renderer: L.canvas(),
        editable: editable_options.editable
    });
    myMap.on('load', function () {

        if (flg_getlatlon == true) {
            if (editable_options.type == "TENKEN" || editable_options.type == "HOSHU" || editable_options.type == "NICHIJOU") {
                createMarkerEditable(editable_options.ido, editable_options.keido);
                myMap.on('click', function (e) {
                    createMarkerEditable(e.latlng.lat, e.latlng.lng)
                    editable_options.drawCallback(e)
                });
            } else {
                var shisetsu_shubetsu = shisetsu_shubetsu_master.filter(function (m) { return m.CODE_SHISETSU_SHUBETSU == editable_options.type })[0];

                if (shisetsu_shubetsu.FIGURE_TYPE == 1) {
                    createMarkerEditable(editable_options.ido, editable_options.keido);
                    myMap.on('click', function (e) {
                        createMarkerEditable(e.latlng.lat, e.latlng.lng)
                        editable_options.drawCallback(e)
                    });
                } else {
                    switch (shisetsu_shubetsu.FIGURE_TYPE) {
                        case 2:
                            createPolylineEditable();
                            break;
                        case 3:
                            createPolygonEditable();
                            break;
                    }
                    myMap.on('editable:editing', function (e) {
                        clearTimeout(edit_callbacktimeout);
                        edit_callbacktimeout = setTimeout(
                            function () {
                                editable_options.drawCallback(e);
                            }, 500);
                    });
                }
            }
        }

        function createMarkerEditable(ido, keido) {
            if (editable_marker) {
                myMap.removeLayer(editable_marker);
            }

            if (ido && keido && isFinite(ido) && Math.abs(ido) <= 90 && isFinite(keido) && Math.abs(keido) <= 180) {
                editable_marker = L.marker([ido, keido]).addTo(myMap);
                myMap.setView([ido, keido], ZOOM);
            }
        }

        function createPolylineEditable() {
            if (editable_options.coordinates) {
                let coordinates = [];
                let str_coordinates = editable_options.coordinates.split("_");
                for (let i = 0; i < str_coordinates.length; i++) {
                    let str_coordinate = str_coordinates[i].split(',');
                    coordinates.push([str_coordinate[1], str_coordinate[0]]);
                }

                editable_marker = L.polyline(coordinates).addTo(myMap);
                myMap.fitBounds(editable_marker.getBounds());
                setTimeout(function () {
                    editable_marker.enableEdit();
                }, 500);
            } else {
                myMap.editTools.startPolyline();
            }
        }

        function createPolygonEditable() {
            if (editable_options.coordinates) {
                let coordinates = [];
                let str_coordinates = editable_options.coordinates.split("_");
                for (let i = 0; i < str_coordinates.length; i++) {
                    let str_coordinate = str_coordinates[i].split(',');
                    coordinates.push([str_coordinate[1], str_coordinate[0]]);
                }

                editable_marker = L.polygon([coordinates]).addTo(myMap);
                myMap.fitBounds(editable_marker.getBounds());
                setTimeout(function () {
                    editable_marker.enableEdit();
                }, 500);
            } else {
                myMap.editTools.startPolygon();
            }
        }

        mapLoadEvent();
    });


    myMap.zoomControl.setPosition("bottomright");

    //if (flg_getlatlon == false) {
        //        createShowLabelMarker(function (isChecked) {
        //            if (!isChecked) {
        //                hideLabelAllMarker();
        //            }
        //            else {
        //                showLabelAllMarker();
        //            }
        //        });

        createWindowColorMarker(function () {
            $("#tbminimizeChousa").addClass("hide");
            $("#tbmaximizeChousa").removeClass("hide");
        }, function () {
            $("#tbminimizeChousa").removeClass("hide");
            $("#tbmaximizeChousa").addClass("hide");
        }, function () {
            var chk = $(this);
            var type = chk.data('type');
            var tenken_type = chk.data('tenken-type');
            var code = chk.data('code');
            if (chk.prop('checked')) {
                showLayerGroup(true, type, tenken_type, code);
            } else {
                showLayerGroup(false, type, tenken_type, code);
            }
        });
    //}

    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        //'http://tile.openstreetmap.jp/{z}/{x}/{y}.png',
        //'http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
        {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright/">OpenStreetMap contributors</a>',
            maxZoom: MAX_ZOOM
        }
    ).addTo(myMap);

    //myMap.setView([LAT, LNG], ZOOM);

    getAllData(str_joken, type, function (rs) {

        try {
            var obj = $.parseJSON(rs);
            addLayers(obj, function (e) {
                ShowLayerByCheckbox();
                loaderHide();
            });

        } catch (e) {
            //alert("データの取得に失敗しました。1");
            myMap.setView([LAT, LNG], ZOOM);

            loaderHide();
        }

    }, function (e) {
        alert("データの取得に失敗しました。");
        myMap.setView([LAT, LNG], ZOOM);

        loaderHide();
    });
}

$(document).ready(function () {

    if ($("#map").length > 0 && $('#map').is(':visible')) {
        loaderShow();
        setTimeout(function () { init("TopMap") }, 1000);
    }

    $("#open_dialog_SearchAddress").click(function () {
        $("#SearchAddress_dialog").dialog("open");
        $("#lean_overlay").css({ display: "block", opacity: "0.5" });
    });

    $('#comboboxCity').change(filterVillage);

    // Open popup SearchAddress_dialog (Find Address button)
    $("#SearchAddress_dialog").dialog({
        autoOpen: false,
        width: 570,
        resizable: false,
        show: {
            effect: "rain",
            duration: 300
        },
        hide: {
            effect: "rain",
            duration: 300
        }
    });

    $("#SearchAddress_dialog").on("dialogclose", function () {
        $("#lean_overlay").hide();
    });

    //Init the event on click confirmSearchAddress button
    $('#confirmSearchAddress').on("click", function () {
        var selectedValue = $('#comboboxTown').find('option:selected').attr("value").split(',');
        var to_zoom = myMap.getZoom();
        if (selectedValue[0].length > 0) {
            to_zoom = azaFocusZoomNum;

        } else {
            to_zoom = shikuFocusZoomNum;
        }

        var lon = selectedValue[1];
        var lat = selectedValue[2];
        //Method focused to location on Map

        focusLocation([lat, lon], to_zoom);
        $("#SearchAddress_dialog").dialog("close");
        $("#lean_overlay").css({ display: "none", opacity: "0.5" });
    });

    filterVillage();

    $('#combShubetsu').on('change', function () {
        loaderShow();
        setTimeout(function () {
            changeViewMapByShubetsuValue();
        }, 0);

        setTimeout(function () {
            loaderHide();
        }, 1000);
    });

    $('#markersSearch').on('click', function () {
        markerSearchedFilter();
    });
});

function filterVillage() {
    if ($("#comboboxCity").find('option:selected').length == 0) {
        return;
    }
    var selectedValue = $("#comboboxCity").find('option:selected').attr("value").split("-");
    var code_todohuken = selectedValue[0];
    var code_shikuchouson = selectedValue[1];

    if (code_todohuken != "" && code_shikuchouson != "")//City name is exists
    {
        var dataToSend = {
            code_todohuken: code_todohuken,
            code_shikuchouson: code_shikuchouson
        };
        //Call filter village function by city name on server side
        $.ajax({
            type: "POST",
            url: filterVillageURL,
            dataType: 'json',
            contentType: 'application/json; charset=shift_jis',
            data: JSON.stringify(dataToSend),
            success: function (result) {
                //Remove old values and append new values
                $('#comboboxTown').children().remove();
                $('#comboboxTown').append(result.HtmlString);
            }
        });
    }
    $('#comboboxTown').val("");
}

//function changeViewMapByShubetsuValue(){
//    if ($("#combShubetsu").prop("disabled") == false) {
//        var cmb_val = $("#combShubetsu").val();
//        for (var i = 0; i < 3; i++) {
//            for(var j = 1; j < markerGroups[i].length; j++){
//                var chk = $("#chkLayerGroup" + j);
//                if(cmb_val == i){
//                    mcgLayerSupportGroup = layerSupportGroups[cmb_val];
//                    if(flg_getlatlon == true){
//                        layerSupportGroups[i]['addLayer'](markerGroups[i][j]);
//                    }else if(chk.prop('checked') == true){
//                        layerSupportGroups[i]['addLayer'](markerGroups[i][j]);
//                    }else{
//                        layerSupportGroups[i]['removeLayer'](markerGroups[i][j]);
//                    }
//                }else{
//                    layerSupportGroups[i]['removeLayer'](markerGroups[i][j]);
//                }
//            }
//        }
//    }
//}

function openLayerSwitchingDiv() {

    // レイヤー切り替えウィンドウの表示
    $("div#layerSwitching").dialog({
        position: {
            my: "right top",
            at: "right top",
            of: "#map"
        },
        height: 500,
        minHeight: 300,
        maxHeight: 700
    });

}

function showLoading() {
    $('#loadingImg').show();
}
function hideLoading() {
    $('#loadingImg').hide();
}

function onClickMap(evt) {

}

//PrintMap(image)
function printMap() {
}

//Export PDF
function printMapPDF() {
}

//Method focused to location on Map
function focusLocation(latlon, zoom) {
    if (tmp_marker != null) {
        tmp_marker.remove();
        tmp_marker = null;
    }

    // Display result on map
    var Icon = L.icon({
        iconUrl: "marker-icon.png",
        iconRetinaUrl: "marker-icon-2x.png",
        shadowUrl: "marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize: [41, 41]
    });

    //check  longitude or latitude null
    var latitudePrevious = latlon[0];
    var longitudePrevious = latlon[1];

    tmp_marker = new L.marker([latitudePrevious, longitudePrevious], {}).addTo(myMap);

    myMap.setView([latitudePrevious, longitudePrevious], zoom);

}

var shisetsu_shubetsu_master;
var taiou_joukyou_master;
var shindan_master;
var tile_layer_master;
//var SELECTED_MARKER = null;
var geoBounds = [];
var geoLayerOption = {
    style: function (feature) {
        switch (feature.properties.FIGURE_TYPE) {
            case 2: return { color: feature.properties.COLOR };
            case 3: return {
                fillColor: feature.properties.COLOR,
                weight: 2,
                opacity: 1,
                color: feature.properties.COLOR,
                fillOpacity: 0.4,
            };
        }
    },
    pointToLayer: function (feature, latlng) {
        if (feature.properties.DATA_TYPE == 'TENKEN') {
            let label = '';

            let iconHtml = '';
            let className = '';
            if (feature.properties.DATA_TENKEN_TYPE == 'SHINDAN') {
                iconHtml = '<div><div></div></div>' + label;
                className = 'leaflet-div-icon ' + "tenken_shindan_" + feature.properties.CODE_SHINDAN;
            } else {
                iconHtml = '<div><div></div></div>' + label;
                className = 'leaflet-div-icon-triangle ' + "tenken_taioujoukyou_" + feature.properties.CODE_TAIOU_JOUKYOU;
            }

            return L.marker(latlng, {
                icon: L.divIcon({
                    iconSize: [25, 25],
                    html: iconHtml,
                    className: className
                })
            });
        } else if (feature.properties.DATA_TYPE == 'HOSHU') {
            let label = '';

            let iconHtml = '<div><div></div>済</div>' + label;
            let className = 'leaflet-div-icon text-icon';

            return L.marker(latlng, {
                icon: L.divIcon({
                    iconSize: [25, 25],
                    html: iconHtml,
                    className: className
                })
            });
        } else if (feature.properties.DATA_TYPE == 'NICHIJOU') {
            let label = '';

            let iconHtml = '<div><div></div></div>' + label;
            let className = 'leaflet-div-icon rectangle ' + "nichijou_taioujoukyou_" + feature.properties.CODE_TAIOU_JOUKYOU;

            return L.marker(latlng, {
                icon: L.divIcon({
                    iconSize: [25, 25],
                    html: iconHtml,
                    className: className
                })
            });
        } else if (feature.properties.FIGURE_TYPE == 1) {
            //let code_shisetsu = (feature.properties.CODE_SHISETSU);
            //let eda_shisetsu = ('00' + feature.properties.EDA_SHISETSU);
            //eda_shisetsu = eda_shisetsu.substr(eda_shisetsu.length - 2);

            //let label = '<div style="white-space: nowrap; width: 50px; margin-left:-15px; text-align:center">' + code_shisetsu + '-' + eda_shisetsu + '</div>';
            let iconHtml = '<div class="diamond-custom-color" style="background-color:' + feature.properties.COLOR + '"><div class="diamond-inner"></div></div>';

            return L.marker(latlng, {
                icon: L.divIcon({
                    iconSize: [25, 25],
                    html: iconHtml,
                    className: ' '
                })
            });
        }
        //} else {
        //    let label = feature.properties.SHOKEN;
        //    switch (feature.code_type) {
        //        case 'tenken': return L.marker(latlng, {
        //            icon: L.divIcon({
        //                iconSize: [25, 25],
        //                html: '<div><div></div></div>' + label,
        //                className: ' leaflet-div-icon orange'
        //            })
        //        });
        //    }
        //}
    },
    onEachFeature: function (feature, layer) {
        if (flg_getlatlon) {
            return;
        }
        if (feature.properties) {
            layer.on({
                click: function (e) {
                    SELECTED_MARKER = e.target;
                }
            });
            if (feature.properties.DATA_TYPE == 'SHISETSU') {
                layer.bindPopup(createShisetsuPopup(feature), { maxWidth: 615 });
            } else if (feature.properties.DATA_TYPE == 'TENKEN') {
                layer.bindPopup(createTenkenPopup(feature), { maxWidth: 615 });
            } else if (feature.properties.DATA_TYPE == 'HOSHU') {
                layer.bindPopup(createHoshuPopup(feature), { maxWidth: 615 });
            } else if (feature.properties.DATA_TYPE == 'NICHIJOU') {
                layer.bindPopup(createNichijouPopup(feature), { maxWidth: 615 });
            }
        }
    }
};

function clearLayers(layers) {
    if (layers == null || layers == undefined) {
        return;
    }
    if (layers.clearLayers) {
        layers.clearLayers();
    } else {
        if (layers.length) {
            for (var i = 0; i < layers.length; i++) {
                clearLayers(layers[i]);
            }
        }
    }
}

function addLayers(results, callback) {
    tile_layer_master = results.tile_layer_master;
    for (let i = 0; i < tile_layer_master.length; i++) {
        tile_layer_master[i].tileLayer = L.tileLayer(
            tile_layer_master[i].URL,
            {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright/">OpenStreetMap contributors</a>',
                maxZoom: MAX_ZOOM
            }
        );
    }

    clearLayers(layerSupportGroups);
    geoBounds = [];
    layerSupportGroups = [];

    //SHISETSU---------------------------------------------------------------------------------------------
    shisetsu_shubetsu_master = results.shisetsu_shubetsu_master;

    layerSupportGroups[1] = [];
    var geoLayers = [];
    for (let i = 0; i < shisetsu_shubetsu_master.length; i++) {
        let shisetsu_shubetsu = shisetsu_shubetsu_master[i];
        let CODE_SHISETSU_SHUBETSU = shisetsu_shubetsu.CODE_SHISETSU_SHUBETSU;

        let layerSupportGroup = L.layerGroup();
        layerSupportGroups[1][CODE_SHISETSU_SHUBETSU] = layerSupportGroup;

        geoLayers[CODE_SHISETSU_SHUBETSU] = [];
        //myMap.addLayer(layerSupportGroup);
    }

    for (let i = 0; i < results.shisetsuData.length; i++) {
        let shisetsu = results.shisetsuData[i];
        if (shisetsu.properties.SHISETSU_ID == editable_options.shisetsu_id) {
            continue;
        }

        shisetsu.properties.DATA_TYPE = 'SHISETSU';
        if (!shisetsu.properties.CODE_SHISETSU_SHUBETSU) {
            shisetsu.properties.CODE_SHISETSU_SHUBETSU = 1;
        }
        geoLayers[shisetsu.properties.CODE_SHISETSU_SHUBETSU].push(shisetsu);
    }

    for (let i = 0; i < geoLayers.length; i++) {
        if (!geoLayers[i].length) {
            continue;
        }
        geoLayers[i] = L.geoJSON(geoLayers[i], geoLayerOption);
        layerSupportGroups[1][i].addLayer(geoLayers[i]);
        geoBounds.push(geoLayers[i].getBounds());
    }
    //SHISETSU---------------------------------------------------------------------------------------------

    //TENKEN-----------------------------------------------------------------------------------------------
    shindan_master = results.shindan_master;
    taiou_joukyou_master = results.taiou_joukyou_master;

    layerSupportGroups[2] = [];
    geoLayers = [];

    //診断
    layerSupportGroups[2][1] = [];
    geoLayers[1] = [];
    for (let i = 0; i < shindan_master.length; i++) {
        let shindan = shindan_master[i];
        let CODE_SHINDAN = shindan.CODE_SHINDAN;

        let layerSupportGroup = L.layerGroup();
        layerSupportGroups[2][1][CODE_SHINDAN] = layerSupportGroup;

        geoLayers[1][CODE_SHINDAN] = [];
        //myMap.addLayer(layerSupportGroup);
    }

    //対応状況
    layerSupportGroups[2][2] = [];
    geoLayers[2] = [];
    for (let i = 0; i < taiou_joukyou_master.length; i++) {
        let taiou_joukyou = taiou_joukyou_master[i];
        let CODE_TAIOU_JOUKYOU = taiou_joukyou.CODE_TAIOU_JOUKYOU;

        let layerSupportGroup = L.layerGroup();
        layerSupportGroups[2][2][CODE_TAIOU_JOUKYOU] = layerSupportGroup;

        geoLayers[2][CODE_TAIOU_JOUKYOU] = [];
        //myMap.addLayer(layerSupportGroup);
    }

    //補修データ
    for (let i = 0; i < results.tenkenData.length; i++) {
        let tenken = results.tenkenData[i];
        if (tenken.properties.ID == editable_options.id && editable_options.type == "TENKEN") {
            continue;
        }

        tenken.id = tenken.properties.ID;

        tenken.properties.DATA_TENKEN_TYPE = 'SHINDAN';
        if (!tenken.properties.CODE_SHINDAN) {
            tenken.properties.CODE_SHINDAN = 2;
        }
        if (!tenken.properties.CODE_TAIOU_JOUKYOU) {
            tenken.properties.CODE_TAIOU_JOUKYOU = 3;
        }
        
        tenken.properties.DATA_TYPE = 'TENKEN';
        geoLayers[1][tenken.properties.CODE_SHINDAN].push(tenken);

        const tenken2 = JSON.parse(JSON.stringify(tenken));
        tenken2.properties.DATA_TENKEN_TYPE = 'TAIOU_JOUKYOU';
        geoLayers[2][tenken2.properties.CODE_TAIOU_JOUKYOU].push(tenken2);
    }

    for (let i = 1; i < geoLayers.length; i++) {
        for (let j = 0; j < geoLayers[i].length; j++) {
            if (!geoLayers[i][j].length) {
                continue;
            }
            geoLayers[i][j] = L.geoJSON(geoLayers[i][j], geoLayerOption);
            layerSupportGroups[2][i][j].addLayer(geoLayers[i][j]);
            geoBounds.push(geoLayers[i][j].getBounds());
        }
    }
    //TENKEN-----------------------------------------------------------------------------------------------

    //HOSHU-----------------------------------------------------------------------------------------------
    layerSupportGroups[3] = [];
    geoLayers = [];
    layerSupportGroups[3][1] = L.layerGroup();
    geoLayers[1] = [];
    myMap.addLayer(layerSupportGroups[3][1]);
    for (let i = 0; i < results.hoshuData.length; i++) {
        let hoshu = results.hoshuData[i];
        if (hoshu.properties.ID == editable_options.id && editable_options.type == "HOSHU") {
            continue;
        }

        hoshu.properties.DATA_TYPE = 'HOSHU';
        geoLayers[1].push(hoshu);
    }
    geoLayers[1] = L.geoJSON(geoLayers[1], geoLayerOption);
    layerSupportGroups[3][1].addLayer(geoLayers[1]);
    geoBounds.push(geoLayers[1].getBounds());
    //HOSHU-----------------------------------------------------------------------------------------------

    //NICHIJOU-----------------------------------------------------------------------------------------------
    taiou_joukyou_master = results.taiou_joukyou_master;

    layerSupportGroups[4] = [];
    geoLayers = [];

    //対応状況
    layerSupportGroups[4] = [];
    geoLayers = [];
    for (let i = 0; i < taiou_joukyou_master.length; i++) {
        let taiou_joukyou = taiou_joukyou_master[i];
        let CODE_TAIOU_JOUKYOU = taiou_joukyou.CODE_TAIOU_JOUKYOU;

        let layerSupportGroup = L.layerGroup();
        layerSupportGroups[4][CODE_TAIOU_JOUKYOU] = layerSupportGroup;

        geoLayers[CODE_TAIOU_JOUKYOU] = [];
        //myMap.addLayer(layerSupportGroup);
    }

    //日常データ
    for (let i = 0; i < results.nichijouData.length; i++) {
        let nichijou = results.nichijouData[i];
        if (nichijou.properties.ID == editable_options.id && editable_options.type == "NICHIJOU") {
            continue;
        }

        nichijou.properties.DATA_TYPE = 'NICHIJOU';
        if (!nichijou.properties.CODE_TAIOU_JOUKYOU) {
            nichijou.properties.CODE_TAIOU_JOUKYOU = 3;
        }
        geoLayers[nichijou.properties.CODE_TAIOU_JOUKYOU].push(nichijou);
    }

    for (let i = 1; i < geoLayers.length; i++) {
        if (!geoLayers[i].length) {
            continue;
        }
        geoLayers[i] = L.geoJSON(geoLayers[i], geoLayerOption);
        layerSupportGroups[4][i].addLayer(geoLayers[i]);
        geoBounds.push(geoLayers[i].getBounds());
    }
    //TENKEN-----------------------------------------------------------------------------------------------

    geoLayers = [];

    myMap.fitBounds(geoBounds);

    callback();
}

function createShisetsuPopup(feature) {
    let shisetsu = feature.properties;
    let eda_shisetsu = ('00' + shisetsu.EDA_SHISETSU);
    eda_shisetsu = eda_shisetsu.substr(eda_shisetsu.length - 2);

    var shisetsuCtr = '';
    switch (shisetsu.CODE_SHISETSU_SHUBETSU) {
        case 1:
            shisetsuCtr = "Enro";
            break;
        case 2:
            shisetsuCtr = "Shoumei";
            break;
        case 3:
            shisetsuCtr = "Bench";
            break;
        case 4:
            shisetsuCtr = "Shokusai";
            break;
        case 5:
            shisetsuCtr = "Jumoku";
            break;
        default:
    }
    let btnBottom = "<button class='button-submit' onclick=window.open('/" + shisetsuCtr + "/Edit/?id=" + shisetsu.SHISETSU_ID + "')>台帳</button>";
    btnBottom += "&nbsp;<button class='button-submit' onclick=window.open('/" + shisetsuCtr + "/Upload/?id=" + shisetsu.SHISETSU_ID + "')>添付</button>";

    let content =
        '<div>' +
        '<div id="container_infowindow">' +
        '<div class="content_infowindow">' +
        '<table>' +
        '<tr class="infowindow_border">' +
        '<th style="width:25%">' +
        '<div class="lbl text">' +
        '種別' +
        '</div>' +
        '</th>' +
        '<td colspan="3">' +
        '<div class="infowindow_col2 lbl">' +
        shisetsu.NAME_SHISETSU_SHUBETSU +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th style="width:25%">' +
        '<div class="lbl text">' +
        '管理番号' +
        '</div>' +
        '</th>' +
        '<td style="width:35%">' +
        '<div class="infowindow_col2 lbl">' +
        shisetsu.CODE_SHISETSU + '-' + eda_shisetsu +
        '</div>' +
        '</td>' +
        '<th style="width:15%">' +
        '<div class=" infowindow_col2  lbl text">' +
        '名称' +
        '</div>' +
        '</th>' +
        '<td style="width:25%">' +
        '<div class="infowindow_col2 lbl">' +
        (shisetsu.NAME_SHISETSU == null ? "" : shisetsu.NAME_SHISETSU) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class="lbl text">' +
        '設置年度' +
        '</div>' +
        '</th>' +
        '<td>' +
        '<div class="infowindow_col2 lbl">' +
        (shisetsu.NENDO_SECCHI == null ? "" : shisetsu.NENDO_SECCHI) +
        '</div>' +
        '</td>' +
        '<th>' +
        '<div class=" infowindow_col2  lbl text">' +
        '数量' +
        '</div>' +
        '</th>' +
        '<td>' +
        '<div class="infowindow_col2 lbl">' +
        (shisetsu.AMOUNT == null ? "" : shisetsu.AMOUNT) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '</table>' +
        '</div>' +
        '</div>' +
        btnBottom +
        '</div>';

    return content;
}


function createTenkenPopup(feature) {
    let tenken = feature.properties;

    let btnBottom = "<button class='button-submit' onclick=window.open('/Tenken/Edit/?id=" + tenken.ID + "')>台帳</button>";
    btnBottom += "&nbsp;<button class='button-submit' onclick=window.open('/Tenken/Picture/?id=" + tenken.ID + "')>写真</button>";
    btnBottom += "&nbsp;<button class='button-submit' onclick=window.open('/Tenken/Upload/?id=" + tenken.ID + "')>添付</button>";
    if (flg_edit == 1) {
        btnBottom += "<button style='float:right' class='button-submit' onclick='updateTenkenNichijou(" + tenken.ID + ", \"TENKEN\")'>更新</button>";
    }

    let content =
        '<div class="tenken" id="popupTenken_' + tenken.ID + '">' +
        '<div id="container_infowindow">' +
        '<div class="content_infowindow">' +
        '<table>' +
        '<tr class="infowindow_border">' +
        '<th style="width:15%">' +
        '<div class="lbl text">' +
        '点検年月日' +
        '</div>' +
        '</th>' +
        '<td style="width:35%">' +
        '<div class="infowindow_col2 lbl">' +
        tenken.NENGAPPI_TENKEN_FORMAT +
        '</div>' +
        '</td>' +
        '<th style="width:15%">' +
        '<div class="lbl text">' +
        '点検者名' +
        '</div>' +
        '</th>' +
        '<td style="width:35%">' +
        '<div class="infowindow_col2 lbl">' +
        (tenken.NAME_TENKENSHA == null ? "" : tenken.NAME_TENKENSHA) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class=" infowindow_col2  lbl text">' +
        '診断' +
        '</div>' +
        '</th>' +
        '<td colspan=3>' +
        '<div class="infowindow_col2 lbl">' +
        (tenken.NAME_SHINDAN == null ? "" : tenken.NAME_SHINDAN) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class=" infowindow_col2  lbl text">' +
        '所見' +
        '</div>' +
        '</th>' +
        '<td colspan=3>' +
        '<div class="infowindow_col2 lbl" style="white-space: pre-line; max-height: 100px; overflow: auto">' +
        (tenken.SHOKEN == null ? "" : tenken.SHOKEN) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class="lbl text">' +
        '対応状況' +
        '</div>' +
        '</th>' +
        '<td colspan="3">' +
        '<div class="infowindow_col2 lbl">' +
        '<select id="CODE_TAIOU_JOUKYOU_' + tenken.ID + '">';
    for (let i = 0; i < taiou_joukyou_master.length; i++) {
        content += '<option value="' + taiou_joukyou_master[i].CODE_TAIOU_JOUKYOU + '"' +
            (taiou_joukyou_master[i].CODE_TAIOU_JOUKYOU == tenken.CODE_TAIOU_JOUKYOU ? "selected=selected" : "") +'>' +
            (taiou_joukyou_master[i].NAME_TAIOU_JOUKYOU == null ? "" : taiou_joukyou_master[i].NAME_TAIOU_JOUKYOU) +
            '</option>';
    }
    content += '</select>' +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class="lbl text">' +
        '対応内容' +
        '</div>' +
        '</th>' +
        '<td colspan="3">' +
        '<div class="infowindow_col2 lbl">' +
        '<textarea id="TAIOU_NAIYOU_' + tenken.ID + '">' + (tenken.TAIOU_NAIYOU == null ? "" : tenken.TAIOU_NAIYOU) + '</textarea>' +
        '</div>' +
        '</td>' +
        '</tr>' +
        '</table>' +
        '</div>' +
        '</div>' +
        btnBottom +
        '</div>';

    return content;
}


function createNichijouPopup(feature) {
    let nichijou = feature.properties;

    let btnBottom = "<button class='button-submit' onclick=window.open('/Nichijou/Edit/?id=" + nichijou.ID + "')>台帳</button>";
    //btnBottom += "&nbsp;<button class='button-submit' onclick=window.open('/Nichijou/Picture/?id=" + nichijou.ID + "')>写真</button>";
    btnBottom += "&nbsp;<button class='button-submit' onclick=window.open('/Nichijou/Upload/?id=" + nichijou.ID + "')>添付</button>";
    if (flg_edit == 1) {
        btnBottom += "<button style='float:right' class='button-submit' onclick='updateTenkenNichijou(" + nichijou.ID + ", \"NICHIJOU\")'>更新</button>";
    }
    let content =
        '<div class="kujou_youbou" id="popupNichijou_' + nichijou.ID + '">' +
        '<div id="container_infowindow">' +
        '<div class="content_infowindow">' +
        '<table>' +
        '<tr class="infowindow_border">' +
        '<th style="width:25%">' +
        '<div class="lbl text">' +
        '発生年月日' +
        '</div>' +
        '</th>' +
        '<td>' +
        '<div class="infowindow_col2 lbl">' +
        nichijou.NENGAPPI_HASSEI_FORMAT +
        '</div>' +
        '</td>' +
        '<th style="width:25%">' +
        '<div class="lbl text">' +
        '担当者名' +
        '</div>' +
        '</th>' +
        '<td>' +
        '<div class="infowindow_col2 lbl">' +
        (nichijou.NAME_TANTOUSHA == null ? "" : nichijou.NAME_TANTOUSHA) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th style="width:15%">' +
        '<div class=" infowindow_col2  lbl text">' +
        '通報内容' +
        '</div>' +
        '</th>' +
        '<td colspan=3>' +
        '<div class="infowindow_col2 lbl" style="white-space: pre-line; max-height: 100px; overflow: auto">' +
        (nichijou.TSUHOU_NAIYOU == null ? "" : nichijou.TSUHOU_NAIYOU) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class="lbl text">' +
        '対応状況' +
        '</div>' +
        '</th>' +
        '<td colspan="3">' +
        '<div class="infowindow_col2 lbl">' +
        '<select id="CODE_TAIOU_JOUKYOU_' + nichijou.ID + '">';
    for (let i = 0; i < taiou_joukyou_master.length; i++) {
        content += '<option value="' + taiou_joukyou_master[i].CODE_TAIOU_JOUKYOU + '"' +
            (taiou_joukyou_master[i].CODE_TAIOU_JOUKYOU == nichijou.CODE_TAIOU_JOUKYOU ? "selected=selected" : "") + '>' +
            (taiou_joukyou_master[i].NAME_TAIOU_JOUKYOU == null ? "" : taiou_joukyou_master[i].NAME_TAIOU_JOUKYOU) +
            '</option>';
    }
    content += '</select>' +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class="lbl text">' +
        '対応内容' +
        '</div>' +
        '</th>' +
        '<td colspan="3">' +
        '<div class="infowindow_col2 lbl">' +
        '<textarea id="TAIOU_NAIYOU_' + nichijou.ID + '">' + (nichijou.TAIOU_NAIYOU == null ? "" : nichijou.TAIOU_NAIYOU) + '</textarea>' +
        '</div>' +
        '</td>' +
        '</tr>' +
        '</table>' +
        '</div>' +
        '</div>' +
        btnBottom +
        '</div>';

    return content;
}


function createHoshuPopup(feature) {
    let hoshu = feature.properties;

    let btnBottom = "<button class='button-submit' onclick=window.open('/Hoshu/Edit/?id=" + hoshu.ID + "')>台帳</button>";
    btnBottom += "&nbsp;<button class='button-submit' onclick=window.open('/Hoshu/Picture/?id=" + hoshu.ID + "')>写真</button>";
    btnBottom += "&nbsp;<button class='button-submit' onclick=window.open('/Hoshu/Upload/?id=" + hoshu.ID + "')>添付</button>";

    let content =
        '<div class="hoshu">' +
        '<div id="container_infowindow">' +
        '<div class="content_infowindow">' +
        '<table>' +
        '<tr class="infowindow_border">' +
        '<th style="width:25%">' +
        '<div class="lbl text">' +
        '補修年月日' +
        '</div>' +
        '</th>' +
        '<td colspan="3">' +
        '<div class="infowindow_col2 lbl">' +
        hoshu.NENGAPPI_HOSHU_FORMAT +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th style="width:25%">' +
        '<div class="lbl text">' +
        '補修者名' +
        '</div>' +
        '</th>' +
        '<td style="width:35%">' +
        '<div class="infowindow_col2 lbl">' +
        (hoshu.NAME_HOSHUSHA == null ? "" : hoshu.NAME_HOSHUSHA) +
        '</div>' +
        '</td>' +
        '<th style="width:15%">' +
        '<div class=" infowindow_col2  lbl text">' +
        '費用' +
        '</div>' +
        '</th>' +
        '<td style="width:25%">' +
        '<div class="infowindow_col2 lbl">' +
        (hoshu.HIYOU_FORMAT == null ? "" : hoshu.HIYOU_FORMAT) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '<tr class="infowindow_border">' +
        '<th>' +
        '<div class="lbl text">' +
        '補修内容' +
        '</div>' +
        '</th>' +
        '<td colspan="3">' +
        '<div class="infowindow_col2 lbl" style="white-space: pre-line; max-height: 100px; overflow: auto">' +
        (hoshu.HOSHU_NAIYOU == null ? "" : hoshu.HOSHU_NAIYOU) +
        '</div>' +
        '</td>' +
        '</tr>' +
        '</table>' +
        '</div>' +
        '</div>' +
        btnBottom +
        '</div>';

    return content;
}

function updateTenkenNichijou(id, type) {
    var popupData = $("#" + (type == 'TENKEN' ? "popupTenken_" : "popupNichijou_") + id);
    var code_taiou_joukyou = popupData.find("#CODE_TAIOU_JOUKYOU_" + id).val();
    var taiou_naiyou = popupData.find("#TAIOU_NAIYOU_" + id).val();

    $.ajax({
        type: "POST", cache: false,
        url: '/Home/updateTenkenNichijou',
        data: {
            'id': id,
            'type': type,
            'code_taiou_joukyou': code_taiou_joukyou,
            'taiou_naiyou': taiou_naiyou
        },
        dataType: 'json',
        success: function (rs) {
            //SELECTED_MARKER.remove();
            rs.data.properties.DATA_TYPE = type;
            if (type == "NICHIJOU") {
                layerSupportGroups[4][SELECTED_MARKER.feature.properties.CODE_TAIOU_JOUKYOU].getLayers()[0].removeLayer(SELECTED_MARKER);
                if (!rs.data.properties.CODE_TAIOU_JOUKYOU) {
                    rs.data.properties.CODE_TAIOU_JOUKYOU = 3;
                }
                layerSupportGroups[4][rs.data.properties.CODE_TAIOU_JOUKYOU].getLayers()[0].addData(rs.data);
            } else if (type == "TENKEN") {
                layerSupportGroups[2][1][SELECTED_MARKER.feature.properties.CODE_SHINDAN].getLayers()[0].removeLayer(SELECTED_MARKER);
                layerSupportGroups[2][2][SELECTED_MARKER.feature.properties.CODE_TAIOU_JOUKYOU].getLayers()[0].removeLayer(SELECTED_MARKER);
                var tenkenMarker = findMarker(rs.data.properties.ID, "tenken");
                if (tenkenMarker) {
                    layerSupportGroups[2][1][tenkenMarker.feature.properties.CODE_SHINDAN].getLayers()[0].removeLayer(tenkenMarker);
                    layerSupportGroups[2][2][tenkenMarker.feature.properties.CODE_TAIOU_JOUKYOU].getLayers()[0].removeLayer(tenkenMarker);
                }

                if (!rs.data.properties.CODE_TAIOU_JOUKYOU) {
                    rs.data.properties.CODE_TAIOU_JOUKYOU = 3;
                }
                if (!rs.data.properties.CODE_SHINDAN) {
                    rs.data.properties.CODE_SHINDAN = 2;
                }

                const tenken2 = JSON.parse(JSON.stringify(rs.data));

                rs.data.properties.DATA_TENKEN_TYPE = 'TAIOU_JOUKYOU';
                tenken2.properties.DATA_TENKEN_TYPE = 'SHINDAN';

                layerSupportGroups[2][1][tenken2.properties.CODE_SHINDAN].getLayers()[0].addData(tenken2);
                layerSupportGroups[2][2][rs.data.properties.CODE_TAIOU_JOUKYOU].getLayers()[0].addData(rs.data);
            }

        },
        error: function (e) {
            error_callback(e);
        }
    });
}

function createWindowColorMarker(click_callback_minimize, click_callback_maximize, showlayer_callback) {

    var controlColorMarker = L.Control.extend({
        options: {
            position: 'bottomleft'
            //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.id = 'WindowColorMarker';
            var html;
            $.ajax({
                type: "GET", cache: false,
                url: mapClusterURL,
                dataType: 'html',
                async: false,
                success: function (data) {
                    html = data;
                },
                error: function (e) {
                }
            });
            container.innerHTML = html;
            container.style.backgroundColor = '#F8F8F8';
            container.style.width = '190px';
            container.style.height = 'auto';
            container.style.fontSize = "0.9em";
            container.style.cssFloat = 'left';
            container.style.paddingLeft = '5px';
            if (flg_getlatlon) {
                container.style.display = 'none';
            }
            return container;
        }
    });

    myMap.addControl(new controlColorMarker());
    if (flg_getlatlon == false) {
        function handleCommand_miniimize() {
            click_callback_minimize();
        }
        function handleCommand_maximize() {
            click_callback_maximize();
        }
        document.getElementById("minimizeChousa").addEventListener("click", handleCommand_miniimize, false);
        document.getElementById("maximizeChousa").addEventListener("click", handleCommand_maximize, false);

        document.getElementById("chkLayerAll").addEventListener("click", function () { ShowLayerAll(true); }, false);
        document.getElementById("unchkLayerAll").addEventListener("click", function () { ShowLayerAll(false); }, false);

        $(".chk_layer").change(showlayer_callback);
    }

}
function ShowLayerAll(flg) {
    //    var flg = $(this).prop('checked');
    if (flg == true) {
        $("#tbmaximizeChousa [type='checkbox']").prop('checked', true).change();
    } else {
        $("#tbmaximizeChousa [type='checkbox']").prop('checked', false).change();
    }
    //changeViewMapByShubetsuValue();
}

function ShowLayerGroupAll(group, flg) {
    if (flg == true) {
        $("#tbmaximizeChousa [id^=" + group + "]").prop('checked', true).change();
    } else {
        $("#tbmaximizeChousa [id^=" + group + "]").prop('checked', false).change();
    }
    //changeViewMapByShubetsuValue();
}

function ShowLayerByCheckbox() {
    $(".chk_layer").change();
}

function showLabelAllMarker() {
    for (var i = 0; i < MARKERS.length; i++) {
        var marker = MARKERS[i];
        var horizontal = "";
        var horizontal2 = "";
        var kome = "";
        var label = "";
        if (marker.KOUJI_NO_KANRI == null || marker.KOUJI_NO_KANRI == "") {
            kanri = marker.NO_KANRI;
        } else {
            kanri = marker.KOUJI_NO_KANRI;
        }
        if (marker.NAME_NEW_LED_YOURYOU != null && marker.NAME_NEW_LED_YOURYOU != "") {
            if (kanri != null && kanri != "" && marker.NAME_NEW_LED_YOURYOU != null && marker.NAME_NEW_LED_YOURYOU != "") {
                horizontal = "-";
            }
            if ((kanri != null && kanri != "" || marker.NAME_NEW_LED_YOURYOU != null && marker.NAME_NEW_LED_YOURYOU != "") && (marker.NAME_NEW_LED_KOUKAN != null && marker.NAME_NEW_LED_KOUKAN != "" || marker.FLG_KOUKAN_FUMEI == 1)) {
                horizontal2 = "-";
            }
            if (marker.FLG_KOUKAN_FUMEI == 1) {
                kome = "<span style='color: red; line-height:10px; vertical-align:middle; font-size: 15px;'>※</span>";
            }
            //Khoald Change 20180614 Start
            //var label = marker.NO_KANRI + horizontal + (marker.NO_DENCHU_1 == null ? "" : marker.NO_DENCHU_1);
            label = (kanri == null ? "" : kanri) + (marker.NAME_NEW_LED_YOURYOU == null ? "" : horizontal + marker.NAME_NEW_LED_YOURYOU) + horizontal2 + kome + (marker.NAME_NEW_LED_KOUKAN == null ? "" : marker.NAME_NEW_LED_KOUKAN);
        } else {
            if (marker.FREE_TXT1 != null && marker.FREE_TXT1 != "" && kanri != null && kanri != "") {
                horizontal = "-";
            }
            //Khoald Change 20180614 Start
            //var label = marker.NO_KANRI + horizontal + (marker.NO_DENCHU_1 == null ? "" : marker.NO_DENCHU_1);
            var label = (marker.FREE_TXT1 == null ? "" : marker.FREE_TXT1) + (kanri == null ? "" : horizontal + kanri);
        }
        var htmlLabel = '<p class="my-div-span" style="width: 90px !important;margin-top: 0px; color: black !important; margin-left: -32px; text-align: center;">' + label + '</p>';
        var icon = marker.options.icon.options;
        if (marker.FLG_KOUJI_SHINCHOKU == 3) {
            Icon = L.divIcon({
                iconSize: [25, 25],
                html: '<div>済</div>' + htmlLabel,
                className: 'leaflet-div-icon text-icon'
            });
        } else {
            Icon = L.divIcon({
                iconSize: [25, 25],
                html: '<div><div></div></div>' + htmlLabel,
                className: icon.className
            });
        }
        marker.setIcon(Icon);
    }
}

function hideLabelAllMarker() {
    for (var i = 0; i < MARKERS.length; i++) {
        var marker = MARKERS[i];
        var icon = marker.options.icon.options;
        if (marker.FLG_KOUJI_SHINCHOKU == 3) {
            Icon = L.divIcon({
                iconSize: [25, 25],
                html: '<div>済</div>',
                className: 'leaflet-div-icon text-icon'
            });
        } else {
            Icon = L.divIcon({
                iconSize: [25, 25],
                html: '<div><div></div></div>',
                className: icon.className
            });
        }
        marker.setIcon(Icon);
    }
}

function showLayerGroup(isShow, type, tenken_type, code) {
    var groupNo = 0;
    if (type == 'shisetsu') {
        groupNo = 1;
    } else if (type == 'tenken') {
        groupNo = 2;
    } else if (type == 'hoshu') {
        groupNo = 3;
    } else if (type == 'nichijou') {
        groupNo = 4;
    } else if (type == 'tilelayer') {
        let tileLayer = tile_layer_master.filter(function (tile) { return tile.CODE_TILE_LAYER == code })[0].tileLayer;
        if (isShow) {
            myMap.addLayer(tileLayer);
        } else {
            myMap.removeLayer(tileLayer);
        }
        return;
    }

    if (type == 'tenken') {
        var tenkenGroup = tenken_type == 'shindan' ? 1 : 2;
        if (isShow) {
            myMap.addLayer(layerSupportGroups[groupNo][tenkenGroup][code]);
        } else {
            myMap.removeLayer(layerSupportGroups[groupNo][tenkenGroup][code]);
        }
    } else {
        if (isShow) {
            myMap.addLayer(layerSupportGroups[groupNo][code]);
        } else {
            myMap.removeLayer(layerSupportGroups[groupNo][code]);
        }
    }

}

function getBounds() {

    if (bounds.length != 0) {
        return bounds;
    }
    for (var i = 0; i < MARKERS.length; i++) {
        var tenken = MARKERS[i].getLatLng();
        bounds.push([tenken.lat, tenken.lng]);
    }
    return bounds;

}
function fitBounds(_bounds, check_marker) {
    if (check_marker && MARKERS.length == 0) {
        return;
    }
    if (_bounds) {
        myMap.fitBounds(_bounds);
    }
}
function gotoPoint(id, type) {
    var clicked_position;
    var marker;

    marker = findMarker(id, type);

    if (marker) {
        try {
            marker.getPane();
            setSelectedMarker(marker);

            try {
                //mcgLayerSupportGroup.zoomToShowLayer(marker, function () {
                if (marker.feature.geometry.type == "Point") {
                    myMap.setView(marker.getLatLng());
                } else {
                    myMap.fitBounds(marker.getBounds());
                }
                marker.fire('click');
                //});
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            alert("該当するデータがありません。\n検索フィルタ、凡例のチェック等を確認してください。");
        }
    } else {
        alert("該当するデータがありません。\n検索フィルタ、凡例のチェック等を確認してください。");
    }
}

function findMarker(id, type) {
    let marker_rs;
    let layerGroupNo = 0;
    if (type == 'tenken') {
        layerGroupNo = 2;
        for (var i = 0; i < layerSupportGroups[layerGroupNo].length; i++) {
            let layerGroups = layerSupportGroups[layerGroupNo][i];
            if (layerGroups) {
                for (var j = 0; j < layerGroups.length; j++) {
                    let layerGroup = layerGroups[j].getLayers()[0];
                    if (layerGroup) {
                        layerGroup.eachLayer(function (layer) {
                            if (layer.feature && id == layer.feature.properties.ID) {
                                marker_rs = layer;
                                return false;
                            }
                        });
                    }
                }
            }
        }
    } else if (type == 'hoshu') {
        layerGroupNo = 3;
        let layerSupportGroup = layerSupportGroups[layerGroupNo][1].getLayers()[0];
        if (layerSupportGroup) {
            layerSupportGroup.eachLayer(function (layer) {
                if (layer.feature && id == layer.feature.properties.ID) {
                    marker_rs = layer;
                    return false;
                }
            });
        }
    } else if (type == 'nichijou') {
        layerGroupNo = 4;
        for (var i = 0; i < layerSupportGroups[layerGroupNo].length; i++) {
            let layerGroup = layerSupportGroups[layerGroupNo][i].getLayers()[0];
            if (layerGroup) {
                layerGroup.eachLayer(function (layer) {
                    if (layer.feature && id == layer.feature.properties.ID) {
                        marker_rs = layer;
                        return false;
                    }
                });
            }
        }
    } else {
        layerGroupNo = 1;
        let layerSupportGroup = layerSupportGroups[layerGroupNo][type];
        if (layerSupportGroup != undefined && layerSupportGroup.getLayers()[0] != undefined) {
            layerSupportGroup.getLayers()[0].eachLayer(function (layer) {
                if (layer.feature && id == layer.feature.properties.SHISETSU_ID) {
                    marker_rs = layer;
                    return false;
                }
            });
        }
    }

    return marker_rs;
}


function setSelectedMarker(marker) {
    SELECTED_MARKER = marker;
}
function getSelectedMarker() {
    return SELECTED_MARKER;
}
function clearSelectedMarker() {
    if (selected_marker) {
        selected_marker = null;
    }
}

function getAllData(str_joken, type, success_callback, error_callback) {
    $.ajax({
        type: "POST",
        url: getAllDataURL,
        data: {
            'str_joken': str_joken,
            'type': type
        },
        dataType: 'text',
        success: function (rs) {
            success_callback(rs);
        },
        error: function (e) {
            error_callback(e);
        }
    });
}

function createShowLabelMarker(click_callback) {

    var controlCkb = L.Control.extend({
        options: {
            position: 'topright'
            //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.id = 'showLabelMarker';
            container.innerHTML = '<table><tr><td><input checked type="checkbox" id="command_ckb"/></td><td><label for="command_ckb">ラベル表示</label></td></tr></table>';
            container.style.backgroundColor = '#F8F8F8';
            container.style.width = '100px';
            container.style.height = '30px';
            container.style.fontSize = "large";
            container.style.lineHeight = '30px';
            container.style.textAlign = 'center';
            container.style.cssFloat = 'left';
            return container;
        },
    });

    myMap.addControl(new controlCkb());
    function handleCommand() {
        click_callback(this.checked);
    }

    document.getElementById("command_ckb").addEventListener("click", handleCommand, false);
}

function markerSearchedFilter(type) {
    loaderShow();

    if (!window.opener || window.opener.closed) { // 親ウィンドウがない
        if (!child_window || child_window.closed) { // 子ウィンドウもない
            str_joken = "";
        } else if (child_window.$.find("input#searchedJoken").length > 0) {  // 子ウィンドウに該当のタグが存在する
            str_joken = child_window.$("input#searchedJoken").val();
        } else { // 子ウィンドウに該当のタグがない
            str_joken = "";
        }
    } else { // 親ウィンドウがある
        if (window.opener.$.find("input#searchedJoken").length > 0) { // 親ウィンドウに該当のタグが存在する
            str_joken = window.opener.$("input#searchedJoken").val();
        } else if (!child_window || child_window.closed) { // 親ウィンドウに該当のタグが存在せず子ウィンドウがない
            str_joken = "";
        } else if (child_window.$.find("input#searchedJoken").length > 0) {  // 親ウィンドウに該当のタグが存在せず子ウィンドウに存在する
            str_joken = child_window.$("input#searchedJoken").val();
        } else { // 親ウィンドウに該当のタグが存在せず子ウィンドウに該当のタグがない
            str_joken = "";
        }
    }

    if (str_joken == "") {
        alert("検索結果の取得に失敗しました。");
        loaderHide();
    } else {
        $("input").prop("checked", false);
        if (type == 'tenken') {
            $("#checkTenkenGroup,#checkTenkenGroup1,#checkTenkenGroup2").prop("checked", true);
            $(".chk_layer[data-type='tenken']").prop("checked", true);
        }
        else if (type == 'nichijou') {
            $("#checkNichijouGroup").prop("checked", true);
            $(".chk_layer[data-type='nichijou']").prop("checked", true);
        } else if (type == 'hoshu') {
            $(".chk_layer[data-type='hoshu']").prop("checked", true);
        } else {
            $(".chk_layer[data-type='shisetsu'][data-code='"+ type +"']").prop("checked", true);
        }

        getAllData(str_joken, type, function (rs) {
            try {
                var obj = $.parseJSON(rs);
                addLayers(obj, function (e) {
                    loaderHide();
                    ShowLayerByCheckbox();
                });

            } catch (e) {
                //alert("データの取得に失敗しました。1");
                myMap.setView([LAT, LNG], ZOOM);

                loaderHide();
            }

        }, function (e) {
            alert("データの取得に失敗しました。");
            myMap.setView([LAT, LNG], ZOOM);

            loaderHide();
        });
    }
}

function mapLoadEvent() { };