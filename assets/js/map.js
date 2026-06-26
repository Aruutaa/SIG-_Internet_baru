
let map, cluster, allRows = [], filteredRows = [], selectedFacility = null, radiusLayer = null, userMarker = null, routeLayer = null, typeChart = null;
const purworejoCenter = [-7.713, 110.009];
const mapState = { basemap: null };
const basemaps = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'© OpenStreetMap'}),
  topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {maxZoom:17, attribution:'© OpenTopoMap'}),
  light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {maxZoom:19, attribution:'© CARTO'})
};

document.addEventListener('DOMContentLoaded', initMapPage);
async function initMapPage(){
  allRows = await loadFacilities();
  filteredRows = [...allRows];
  map = L.map('map', { zoomControl:false }).setView(purworejoCenter, 11);
  basemaps.osm.addTo(map); mapState.basemap = basemaps.osm;
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.control.layers({'OpenStreetMap':basemaps.osm,'Topografi':basemaps.topo,'Light':basemaps.light}).addTo(map);
  cluster = L.markerClusterGroup({showCoverageOnHover:false, maxClusterRadius:52});
  map.addLayer(cluster);
  fillFilters(); buildLegend(); bindEvents(); applyFilters();
}
function fillFilters(){
  const types = uniqueValues(allRows,'jenis');
  const districts = uniqueValues(allRows,'kecamatan');
  byId('typeFilter').innerHTML = '<option value="">Semua</option>' + types.map(t=>`<option>${t}</option>`).join('');
  byId('districtFilter').innerHTML = '<option value="">Semua</option>' + districts.map(d=>`<option>${d}</option>`).join('');
}
function buildLegend(){
  const types = uniqueValues(allRows,'jenis');
  byId('legend').innerHTML = '<b>Legenda</b>' + types.map(t => `<div class="legend-row"><span class="marker-dot" style="background:${typeColor(t)}"></span>${t}</div>`).join('');
}
function markerIcon(row){
  return L.divIcon({className:'', html:`<div class="custom-marker" style="background:${typeColor(row.jenis)}">${typeIcon(row.jenis)}</div>`, iconSize:[34,34], iconAnchor:[17,17], popupAnchor:[0,-18]});
}
function popupHtml(row){
  const tags = [row.bpjs?'BPJS':'Non-BPJS', row.igd?'IGD 24 Jam':null, row.rawat_inap?'Rawat Inap':null, row.ambulans?'Ambulans':null].filter(Boolean);
  return `<div class="facility-popup"><h3>${row.nama}</h3><p><b>${row.jenis}</b> • ${row.kecamatan}</p><p>${row.alamat}</p><p>Jam: ${row.jam || '-'}</p><p>Tenaga: ${row.tenaga || 0} • Dokter: ${row.dokter || 0} • Bed: ${row.bed || 0}</p><div class="tags">${tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="toolbar" style="margin-top:10px"><button class="btn btn-blue btn-sm route-action" type="button" data-id="${row.id}">Garis rute</button><button class="btn btn-light btn-sm radius-action" type="button" data-id="${row.id}">Radius</button></div></div>`;
}
function renderMarkers(){
  cluster.clearLayers();
  filteredRows.forEach(row => {
    const marker = L.marker([row.lat,row.lng], {icon:markerIcon(row)}).bindPopup(popupHtml(row));
    marker.on('click', () => { selectedFacility = row; });
    cluster.addLayer(marker);
  });
  if(filteredRows.length){
    const bounds = L.latLngBounds(filteredRows.map(r=>[r.lat,r.lng]));
    map.fitBounds(bounds.pad(.18));
  }
}
function applyFilters(){
  const q = (byId('searchInput').value || byId('mapSearch').value || '').toLowerCase().trim();
  const type = byId('typeFilter').value;
  const district = byId('districtFilter').value;
  const bpjs = byId('bpjsFilter').value;
  const igd = byId('igdFilter').value;
  filteredRows = allRows.filter(r => {
    const hay = [r.nama,r.jenis,r.kecamatan,r.desa,r.alamat,r.kode].join(' ').toLowerCase();
    return (!q || hay.includes(q)) && (!type || r.jenis===type) && (!district || r.kecamatan===district) && (bpjs==='' || String(Number(!!r.bpjs))===bpjs) && (igd==='' || String(Number(!!r.igd))===igd);
  });
  renderMarkers(); updateKpi(); updateChart(); updateAnalysis();
}
function updateKpi(){
  byId('kpiTotal').textContent = fmtNumber(filteredRows.length);
  byId('kpiBpjs').textContent = fmtNumber(filteredRows.filter(r=>r.bpjs).length);
  byId('kpiIgd').textContent = fmtNumber(filteredRows.filter(r=>r.igd).length);
  byId('kpiKecamatan').textContent = fmtNumber(uniqueValues(filteredRows,'kecamatan').length);
}
function updateChart(){
  const types = uniqueValues(allRows,'jenis');
  const counts = types.map(t => filteredRows.filter(r=>r.jenis===t).length);
  const colors = types.map(typeColor);
  if(typeChart) typeChart.destroy();
  const ctx = byId('typeChart');
  typeChart = new Chart(ctx, {type:'doughnut', data:{labels:types, datasets:[{data:counts, backgroundColor:colors, borderWidth:3, borderColor:'#fff'}]}, options:{plugins:{legend:{position:'bottom'}}, cutout:'62%'}});
}
function updateAnalysis(){
  const counts = {};
  filteredRows.forEach(r => counts[r.kecamatan] = (counts[r.kecamatan] || 0) + 1);
  const ranked = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const top = ranked[0] || ['-',0];
  const low = ranked[ranked.length-1] || ['-',0];
  const hospital = filteredRows.filter(r=>r.jenis==='Rumah Sakit').length;
  const puskesmas = filteredRows.filter(r=>r.jenis==='Puskesmas').length;
  byId('analysisBox').innerHTML = `<b>Ringkasan hasil filter</b><p>Kecamatan dengan fasilitas terbanyak: <b>${top[0]}</b> (${top[1]} titik). Kecamatan dengan jumlah paling sedikit dalam hasil filter: <b>${low[0]}</b> (${low[1]} titik). Rumah sakit tampil: <b>${hospital}</b>. Puskesmas tampil: <b>${puskesmas}</b>.</p>`;
}
function bindEvents(){
  ['searchInput','mapSearch','typeFilter','districtFilter','bpjsFilter','igdFilter'].forEach(id => byId(id).addEventListener('input', () => {
    if(id === 'searchInput') byId('mapSearch').value = byId('searchInput').value;
    if(id === 'mapSearch') byId('searchInput').value = byId('mapSearch').value;
    applyFilters();
  }));
  byId('btnFit').addEventListener('click', () => { if(filteredRows.length) map.fitBounds(L.latLngBounds(filteredRows.map(r=>[r.lat,r.lng])).pad(.18)); });
  byId('btnReset').addEventListener('click', () => { ['searchInput','mapSearch','typeFilter','districtFilter','bpjsFilter','igdFilter'].forEach(id=>byId(id).value=''); clearRadius(); if(routeLayer) map.removeLayer(routeLayer); applyFilters(); });
  byId('btnPrint').addEventListener('click', () => window.print());
  byId('btnExport').addEventListener('click', () => downloadText('fasilitas_kesehatan_purworejo.csv', toCsv(filteredRows)));
  byId('btnRadius').addEventListener('click', showRadius);
  byId('btnClearRadius').addEventListener('click', clearRadius);
  byId('btnNearest').addEventListener('click', findNearest);
  byId('btnLocate').addEventListener('click', locateUser);
  document.addEventListener('click', e => {
    const routeBtn = e.target.closest('.route-action');
    const radBtn = e.target.closest('.radius-action');
    if(routeBtn){ selectedFacility = allRows.find(r=>String(r.id)===routeBtn.dataset.id); drawRouteTo(selectedFacility); }
    if(radBtn){ selectedFacility = allRows.find(r=>String(r.id)===radBtn.dataset.id); showRadius(); }
  });
}
function clearRadius(){ if(radiusLayer){ map.removeLayer(radiusLayer); radiusLayer = null; } }
function showRadius(){
  if(!selectedFacility){ selectedFacility = filteredRows[0]; }
  if(!selectedFacility){ showToast('Tidak ada fasilitas pada hasil filter.'); return; }
  clearRadius();
  const radius = Number(byId('radiusSelect').value);
  radiusLayer = L.circle([selectedFacility.lat,selectedFacility.lng], {radius, color:typeColor(selectedFacility.jenis), weight:3, fillColor:typeColor(selectedFacility.jenis), fillOpacity:.14}).addTo(map);
  const inside = allRows.filter(r => distanceKm(selectedFacility.lat, selectedFacility.lng, r.lat, r.lng) <= radius/1000);
  map.fitBounds(radiusLayer.getBounds().pad(.2));
  byId('analysisBox').innerHTML = `<b>Radius ${radius/1000} km dari ${selectedFacility.nama}</b><p>Jumlah fasilitas dalam radius: <b>${inside.length}</b> titik. Komposisi: ${uniqueValues(inside,'jenis').map(t=>`${t} ${inside.filter(r=>r.jenis===t).length}`).join(', ')}.</p>`;
}
function locateUser(){
  if(!navigator.geolocation){ showToast('Geolokasi tidak tersedia.'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const latlng = [pos.coords.latitude, pos.coords.longitude];
    if(userMarker) map.removeLayer(userMarker);
    userMarker = L.marker(latlng).addTo(map).bindPopup('Lokasi pengguna').openPopup();
    map.setView(latlng, 14);
  }, () => showToast('Izin lokasi ditolak. Fasilitas terdekat memakai titik pusat Purworejo.'));
}
function findNearest(){
  const usePoint = userMarker ? userMarker.getLatLng() : L.latLng(purworejoCenter[0], purworejoCenter[1]);
  const ranked = allRows.map(r => ({...r, jarak: distanceKm(usePoint.lat, usePoint.lng, r.lat, r.lng)})).sort((a,b)=>a.jarak-b.jarak).slice(0,5);
  byId('analysisBox').innerHTML = `<b>Fasilitas terdekat</b><p>Titik acuan: ${userMarker ? 'lokasi pengguna' : 'pusat Purworejo'}. ${ranked.map((r,i)=>`${i+1}. ${r.nama} (${r.jarak.toFixed(2)} km)`).join(' • ')}</p>`;
  if(ranked[0]){ selectedFacility = ranked[0]; drawRouteTo(ranked[0], usePoint); }
}
function drawRouteTo(row, fromPoint){
  const from = fromPoint || (userMarker ? userMarker.getLatLng() : L.latLng(purworejoCenter[0], purworejoCenter[1]));
  if(routeLayer) map.removeLayer(routeLayer);
  routeLayer = L.polyline([[from.lat,from.lng],[row.lat,row.lng]], {color:typeColor(row.jenis), weight:5, dashArray:'9 8'}).addTo(map);
  map.fitBounds(routeLayer.getBounds().pad(.28));
  const km = distanceKm(from.lat, from.lng, row.lat, row.lng).toFixed(2);
  byId('analysisBox').innerHTML = `<b>Garis rute menuju ${row.nama}</b><p>Jarak lurus sekitar <b>${km} km</b>. Untuk navigasi jalan, buka lokasi melalui aplikasi peta dari popup fasilitas.</p>`;
}
