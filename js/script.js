// Inisialisasi peta 
const map = L.map('map').setView([-6.903, 107.6510], 13);

// Basemap OSM
const basemapOSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// Basemap lainnya
const baseMapGoogle = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  attribution: 'Map by <a href="https://maps.google.com/">Google</a>',
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

const baseMapSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  attribution: 'Satellite by <a href="https://maps.google.com/">Google</a>',
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

const baseMapEsri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye',
  maxZoom: 20
});

const baseMapCartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

basemapOSM.addTo(map);

// Tombol fullscreen
map.addControl(new L.Control.Fullscreen());

// Tombol Home
const home = { lat: -6.903, lng: 107.6510, zoom: 13 };
const homeControl = L.control({ position: 'topleft' });
homeControl.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  div.innerHTML = '<i class="fas fa-home"></i>';
  div.style.backgroundColor = 'white';
  div.style.width = '30px';
  div.style.height = '30px';
  div.style.lineHeight = '30px';
  div.style.textAlign = 'center';
  div.style.cursor = 'pointer';
  div.title = 'Return to Home';
  div.onclick = function () {
    map.setView([home.lat, home.lng], home.zoom);
  };
  return div;
};
homeControl.addTo(map);

// Tombol Lokasi
L.control.locate({
  position: 'topleft',
  flyTo: true,
  strings: {
    title: "Find my Location"
  },
  locateOptions: {
    enableHighAccuracy: true
  }
}).addTo(map);

// LayerGroup untuk tutupan lahan
const landcover = new L.LayerGroup();

// Fungsi styling berdasarkan atribut
function getLandcoverStyle(feature) {
  switch (feature.properties.REMARK) {
    case 'Danau/Situ':
    case 'Empang':
    case 'Sungai':
      return { fillColor: "#97DBF2", fillOpacity: 0.8, weight: 0.5, color: "#4065EB" };
    case 'Hutan Rimba':
      return { fillColor: "#194A00", fillOpacity: 0.8, color: "#194A00" };
    case 'Perkebunan/Kebun':
      return { fillColor: "#38A800", fillOpacity: 0.8, color: "#38A800" };
    case 'Permukiman dan Tempat Kegiatan':
      return { fillColor: "#FFBEBE", fillOpacity: 0.8, weight: 0.5, color: "#FB0101" };
    case 'Sawah':
      return { fillColor: "#01FBBB", fillOpacity: 0.8, weight: 0.5, color: "#4065EB" };
    case 'Semak Belukar':
      return { fillColor: "#79BE3F", fillOpacity: 0.8, weight: 0.5, color: "#00A52F" };
    case 'Tanah Kosong/Gundul':
      return { fillColor: "#FDFDFD", fillOpacity: 0.8, weight: 0.5, color: "#000000" };
    case 'Tegalan/Ladang':
      return { fillColor: "#EDFF85", fillOpacity: 0.8, color: "#EDFF85" };
    case 'Vegetasi Non Budidaya Lainnya':
      return { fillColor: "#000000", fillOpacity: 0.8, weight: 0.5, color: "#000000" };
    default:
      return { fillColor: "#CCCCCC", fillOpacity: 0.5, color: "#999999" };
  }
}

// Memuat GeoJSON dan menambahkan interaktivitas
let landcoverGeojson;
$.getJSON("asset/data-spasial/landcover_ar.geojson", function (data) {
  landcoverGeojson = L.geoJSON(data, {
    style: getLandcoverStyle,
    onEachFeature: function (feature, layer) {
      layer.on({
        mouseover: function (e) {
          const layer = e.target;
          layer.setStyle({
            weight: 3,
            color: '#FFFF00',
            dashArray: '',
            fillOpacity: 0.9
          });

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }

          // Buat popup manual di posisi kursor
          const popup = L.popup({
            offset: L.point(0, -10), // sedikit di atas kursor
            closeButton: false,
            autoPan: false,
            className: 'custom-popup' // styling opsional
          })
          .setLatLng(e.latlng)
          .setContent('<b>Tutupan Lahan: </b>' + feature.properties.REMARK)
          .openOn(map);
        },

        mouseout: function (e) {
          landcoverGeojson.resetStyle(e.target);
          map.closePopup(); // tutup popup dari peta, bukan dari layer
        }
      });
    }
  }).addTo(landcover);
});

landcover.addTo(map);


// Layer Jembatan
const symbologyPoint = {
  radius: 5,
  fillColor: "#B22222",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};
const jembatanPT = new L.LayerGroup();

$.getJSON("asset/data-spasial/jembatan_pt copy.geojson", function (data) {
  L.geoJSON(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, symbologyPoint);
    }
  }).addTo(jembatanPT);
  jembatanPT.addTo(map);
});

// Layer Batas Administrasi
const adminKelurahanAR = new L.LayerGroup();
$.getJSON("./asset/data-spasial/admin_kelurahan_ln.geojson", function (data) {
  L.geoJSON(data, {
    style: {
      color: "black",
      weight: 2,
      opacity: 1,
      dashArray: '3,3,20,3,20,3,20,3,20,3,20',
      lineJoin: 'round'
    }
  }).addTo(adminKelurahanAR);
});
adminKelurahanAR.addTo(map);

// Layer control
const baseMaps = {
  "OpenStreetMap": basemapOSM,
  "Google Maps": baseMapGoogle,
  "Google Satellite": baseMapSatellite,
  "Esri World Imagery": baseMapEsri,
  "Carto Dark": baseMapCartoDark
};

const overlayMaps = {
  "Jembatan": jembatanPT,
  "Batas Administrasi": adminKelurahanAR,
  "Tutupan Lahan": landcover
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

// Legend
let legend = L.control({ position: "topright" });
legend.onAdd = function () {
  let div = L.DomUtil.create("div", "legend");
  div.innerHTML =
    '<p style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">LEGENDA</p>' +
    '<p style="font-size: 12px; font-weight: bold;">Infrastruktur</p>' +
    '<div><svg style="display:block;margin:auto;stroke-width:1;stroke:rgb(0,0,0);"><circle cx="15" cy="8" r="5" fill="#B22222" /></svg></div>Jembatan<br>' +
    '<p style="font-size: 12px; font-weight: bold;">Batas Administrasi</p>' +
    '<div><svg><line x1="0" y1="11" x2="23" y2="11" style="stroke-width:2;stroke:rgb(0,0,0);stroke-dasharray:10 1 1 1 1 1 1 1 1 1"/></svg></div>Batas Desa/Kelurahan<br>' +
    '<p style="font-size: 12px; font-weight: bold;">Tutupan Lahan</p>' +
    '<div style="background-color: #97DBF2; height: 10px;"></div>Danau/Situ/Empang/Sungai<br>' +
    '<div style="background-color: #194A00; height: 10px;"></div>Hutan Rimba<br>' +
    '<div style="background-color: #38A800; height: 10px;"></div>Perkebunan/Kebun<br>' +
    '<div style="background-color: #FFBEBE; height: 10px;"></div>Permukiman<br>' +
    '<div style="background-color: #01FBBB; height: 10px;"></div>Sawah<br>' +
    '<div style="background-color: #79BE3F; height: 10px;"></div>Semak Belukar<br>' +
    '<div style="background-color: #FDFDFD; height: 10px;"></div>Tanah Kosong<br>' +
    '<div style="background-color: #EDFF85; height: 10px;"></div>Tegalan/Ladang<br>' +
    '<div style="background-color: #000000; height: 10px;"></div>Vegetasi Non Budidaya<br>';
  return div;
};
legend.addTo(map);

// Tombol Show/Hide Legend
const toggleLegendControl = L.control({ position: 'topright' });

toggleLegendControl.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
  div.innerHTML = '<i class="fas fa-list"></i>';
  div.style.backgroundColor = 'white';
  div.style.width = '30px';
  div.style.height = '30px';
  div.style.lineHeight = '30px';
  div.style.textAlign = 'center';
  div.style.cursor = 'pointer';
  div.title = 'Show/Hide Legend';

  div.onclick = function () {
    const legend = document.querySelector('.legend');
    if (legend) {
      if (legend.style.display === 'none') {
        legend.style.display = 'block';
      } else {
        legend.style.display = 'none';
      }
    }
  };
  return div;
};

toggleLegendControl.addTo(map);

//Open Weather Map
const apiKey = "75ebb353a829462ee521193ff2588e95";
const city = "Bandung";

async function getWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=id`;
  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("suhu").textContent = Math.round(data.main.temp) + "°C";
  document.getElementById("kelembapan").textContent = data.main.humidity + "%";
  document.getElementById("angin").textContent = data.wind.speed + " m/s";

  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + "." + now.getMinutes().toString().padStart(2, '0');
  document.getElementById("update").textContent = time + " WIB";
}

getWeather();

