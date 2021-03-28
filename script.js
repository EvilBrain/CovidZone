(function() {
    initSearchBox();
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('lat') && urlParams.has('lng')) {
        let x = urlParams.get('lat'),
            y = urlParams.get('lng');
        let map = initMap(x, y);
        initZone(x, y, map);
    } else {
        navigator.geolocation.getCurrentPosition(function(position) {
            let map = initMap(position.coords.latitude, position.coords.longitude);
            initZone(position.coords.latitude, position.coords.longitude, map);
        }, function() {
            $.get('https://api.ipify.org/?format=json', function(data) {
                $.get(`http://ip-api.com/json/${data.ip}`, function(resp) {
                    let map = initMap(resp.lat, resp.lon);
                    initZone(resp.lat, resp.lon, map);  
                });
            });
        });
    }

})();

function initSearchBox() {
    $("#searchbox").autocomplete({
        source: function(req, res) {
            $.ajax({
                url: `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent($("#searchbox").val())}`,
                data: { q: req.term },
                dataType: "json",
                success: function(data) {
                    let cities = [];
                    res($.map(data.features, function(item) {
                        if($.inArray(item.properties.postcode, cities) == -1) {
                            cities.push(item.properties.postcode);
                            console.log(item)
                            return {
                                label: item.properties.label,
                                score: item.properties.score,
                                lng: item.geometry.coordinates[0],
                                lat: item.geometry.coordinates[1]
                            }
                        }
                    }));
                }
            });
        },
        autoFocus:true,
        select: function(event, ui) {
            window.location.href = `?lat=${ui.item.lat}&lng=${ui.item.lng}`;
        }
    });
}

function initMap(x, y) {
    let mymap = L.map('mapid', {
        center: [x, y],
        zoom: 12
    });
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Outil créé par <a href="https://genoweb.xyz/">GenoWeb</a> | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZXZpbGJyYWluMTMzNyIsImEiOiJja210NjVya2Ywb2dnMm5vNjdiZnk1dXpsIn0.S4iG2io8jMwgh8Yri36TMA'
    }).addTo(mymap);
    return mymap;
}

function initZone(x, y, map) {
    let marker = L.marker([x, y]).addTo(map);
    marker.bindPopup("Ma position").openPopup();
    let circle = L.circle([x, y], {
        radius: 10000
    }).addTo(map);
    map.on('click', placeMarker);
    function placeMarker(e) {
        marker.setLatLng(e.latlng);
        window.location.href = `?lat=${e.latlng.lat}&lng=${e.latlng.lng}`;
    }
}

