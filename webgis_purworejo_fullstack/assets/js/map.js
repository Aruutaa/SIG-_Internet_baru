let map, facilities=[], boundaryLayer, markerCluster, routeControl, selectedBuffer, userMarker, typeChart;
let activeTypes = new Set(Object.keys(TYPE_COLOR).filter(t => t !== 'Lainnya'));
let currentUserLatLng = null;

function initMap(){
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
  const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'© OpenStreetMap © CARTO'});
  const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri'});
  map = L.map('map',{zoomControl:false,layers:[osm]}).setView([-7.72,110.02],11);
  L.control.zoom({position:'topright'}).addTo(map);
  L.control.scale({imperial:false}).addTo(map);
  L.control.layers({'OpenStreetMap':osm,'Carto Light':carto,'Esri Imagery':esri},{},{collapsed:false}).addTo(map);
}
function iconFor(type){
  const color = getTypeColor(type);
  return L.divIcon({className:'', html:`<div style="width:26px;height:26px;border-radius:50%;background:${color};border:4px solid #fff;box-shadow:0 7px 18px rgba(16,32,51,.25)"></div>`, iconSize:[26,26], iconAnchor:[13,13], popupAnchor:[0,-12]});
}
function normalizeFeature(feature, idx){
  const p = getProps(feature), ll = getLatLng(feature) || {lat:p.latitude,lng:p.longitude};
  return {id:p.id || p.gid || idx+1, nama:p.nama_faskes || p.nama || 'Tanpa nama', jenis:p.jenis_faskes || p.jenis || 'Lainnya', kecamatan:p.kecamatan || '-', alamat:p.alamat || '-', latitude:Number(p.latitude ?? ll?.lat), longitude:Number(p.longitude ?? ll?.lng), sumber_data:p.sumber_data || '-', catatan:p.catatan || '-', raw:feature};
}
function filtered(){
  const keyword = qs('#searchText').value.trim().toLowerCase();
  const kec = qs('#kecFilter').value;
  return facilities.filter(f => activeTypes.has(f.jenis) && (!kec || f.kecamatan===kec) && (!keyword || [f.nama,f.jenis,f.kecamatan,f.alamat].join(' ').toLowerCase().includes(keyword)));
}
function renderFilters(){
  const types = [...new Set(facilities.map(f=>f.jenis))].sort();
  activeTypes = new Set(types);
  qs('#typeFilters').innerHTML = types.map(t => `<div class="filter-row"><input type="checkbox" id="type_${t.replace(/\W/g,'_')}" value="${escapeHTML(t)}" checked><label for="type_${t.replace(/\W/g,'_')}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${getTypeColor(t)};margin-right:8px"></span>${escapeHTML(t)}</label></div>`).join('');
  qsa('#typeFilters input').forEach(inp => inp.addEventListener('change', () => {inp.checked ? activeTypes.add(inp.value) : activeTypes.delete(inp.value); renderAll();}));
  const kecs = [...new Set(facilities.map(f=>f.kecamatan).filter(Boolean))].sort();
  qs('#kecFilter').innerHTML = '<option value="">Semua kecamatan</option>' + kecs.map(k=>`<option value="${escapeHTML(k)}">${escapeHTML(k)}</option>`).join('');
}
function popupHTML(f){
  const gm = `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
  return `<div class="popup-title">${escapeHTML(f.nama)}</div><div class="popup-meta">${escapeHTML(f.jenis)} • ${escapeHTML(f.kecamatan)}</div><div><b>Alamat:</b><br>${escapeHTML(f.alamat)}</div><div style="margin-top:6px"><b>Sumber:</b> ${escapeHTML(f.sumber_data)}</div><div class="popup-actions"><button onclick="setDestination(${f.latitude},${f.longitude},'${escapeHTML(f.nama).replace(/'/g,'&#39;')}')">Rute</button><button onclick="makeBuffer(${f.latitude},${f.longitude},1000,'${escapeHTML(f.nama).replace(/'/g,'&#39;')}')">Buffer 1 km</button><a target="_blank" href="${gm}">Google Maps</a></div>`;
}
function renderMarkers(){
  if(markerCluster) map.removeLayer(markerCluster);
  markerCluster = L.markerClusterGroup();
  filtered().forEach(f => {
    if(!Number.isFinite(f.latitude) || !Number.isFinite(f.longitude)) return;
    const m = L.marker([f.latitude,f.longitude], {icon:iconFor(f.jenis), title:f.nama}).bindPopup(popupHTML(f));
    m.on('click', () => updateAnalysis(`Fasilitas yang dipilih: ${f.nama}. Jenis layanan ${f.jenis}, berada di Kecamatan ${f.kecamatan}.`));
    markerCluster.addLayer(m);
  });
  markerCluster.addTo(map);
}
function renderList(){
  const rows = filtered();
  qs('#facilityList').innerHTML = rows.slice(0,80).map(f=>`<div class="facility-card" data-id="${f.id}"><b>${escapeHTML(f.nama)}</b><span>${escapeHTML(f.kecamatan)} • ${escapeHTML(f.alamat)}</span><em class="badge-type" style="background:${getTypeColor(f.jenis)}">${escapeHTML(f.jenis)}</em></div>`).join('') || '<p class="mini-text">Data tidak ditemukan.</p>';
  qsa('.facility-card').forEach(card => card.addEventListener('click', () => {
    const f = facilities.find(x=>String(x.id)===String(card.dataset.id));
    if(f){map.setView([f.latitude,f.longitude],16); updateAnalysis(`Peta diarahkan ke ${f.nama}. Klik marker untuk membuka atribut lengkap.`)}
  }));
}
function updateStats(){
  const rows=filtered();
  qs('#statTotal').textContent=formatNum(facilities.length); qs('#statVisible').textContent=formatNum(rows.length); qs('#statKec').textContent=formatNum(new Set(facilities.map(f=>f.kecamatan)).size);
  updateChart(rows);
}
function updateChart(rows){
  const counts = {}; rows.forEach(f=>counts[f.jenis]=(counts[f.jenis]||0)+1);
  const labels = Object.keys(counts); const data = Object.values(counts);
  if(typeChart) typeChart.destroy();
  typeChart = new Chart(qs('#typeChart'), {type:'bar', data:{labels, datasets:[{label:'Jumlah', data, backgroundColor:labels.map(getTypeColor)}]}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{precision:0}}}}});
}
function updateAnalysis(text){qs('#analysisText').textContent=text; qs('#analysisDock').classList.remove('hidden')}
function renderAll(){renderMarkers(); renderList(); updateStats()}
function distanceMeter(a,b){return map.distance([a.lat,a.lng],[b.lat,b.lng])}
window.makeBuffer = function(lat,lng,radius,name){
  if(selectedBuffer) map.removeLayer(selectedBuffer);
  selectedBuffer = L.circle([lat,lng], {radius, color:'#0f766e', fillColor:'#0f766e', fillOpacity:.12, weight:2}).addTo(map);
  map.fitBounds(selectedBuffer.getBounds());
  const inside = facilities.filter(f => distanceMeter({lat,lng},{lat:f.latitude,lng:f.longitude}) <= radius).length;
  updateAnalysis(`Buffer radius ${(radius/1000).toFixed(1)} km dari ${name}. Terdapat ${inside} fasilitas dalam radius tersebut, termasuk titik pusat.`);
}
window.setDestination = function(lat,lng,name){
  if(!currentUserLatLng){updateAnalysis('Lokasi awal belum tersedia. Klik tombol “Lokasi saya”, atau aktifkan izin lokasi pada browser.'); return;}
  if(routeControl) map.removeControl(routeControl);
  routeControl = L.Routing.control({waypoints:[L.latLng(currentUserLatLng.lat,currentUserLatLng.lng), L.latLng(lat,lng)], routeWhileDragging:false, show:false, addWaypoints:false, lineOptions:{styles:[{color:'#0f766e',weight:5,opacity:.8}]}}).addTo(map);
  updateAnalysis(`Rute dibuat dari posisi pengguna menuju ${name}. Jarak dan waktu mengikuti layanan routing yang tersedia.`);
}
function locateUser(callback){
  if(!navigator.geolocation){updateAnalysis('Browser tidak mendukung geolocation.'); return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    currentUserLatLng = {lat:pos.coords.latitude, lng:pos.coords.longitude};
    if(userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([currentUserLatLng.lat,currentUserLatLng.lng]).addTo(map).bindPopup('Lokasi saya');
    map.setView([currentUserLatLng.lat,currentUserLatLng.lng],14);
    updateAnalysis('Lokasi pengguna berhasil diambil. Posisi ini dapat digunakan sebagai titik awal rute.');
    if(callback) callback(currentUserLatLng);
  }, () => updateAnalysis('Lokasi pengguna tidak dapat diambil. Pastikan izin lokasi browser sudah diaktifkan.'), {enableHighAccuracy:true,timeout:12000});
}
function nearestFacility(){
  locateUser(user=>{
    let rows=filtered().filter(f=>Number.isFinite(f.latitude));
    let nearest = rows.map(f=>({...f, dist:distanceMeter(user,{lat:f.latitude,lng:f.longitude})})).sort((a,b)=>a.dist-b.dist)[0];
    if(nearest){map.setView([nearest.latitude,nearest.longitude],15); updateAnalysis(`Fasilitas terdekat dari posisi Anda adalah ${nearest.nama}, jenis ${nearest.jenis}, dengan estimasi jarak lurus ${(nearest.dist/1000).toFixed(2)} km.`)}
  });
}
async function main(){
  initMap();
  const [facRes, boundRes] = await Promise.all([loadFacilities(), loadBoundary()]);
  facilities = facRes.data.features.map(normalizeFeature);
  qs('#statSource').textContent = facRes.source === 'database' ? 'DB' : 'GeoJSON';
  qs('#systemNote').textContent = facRes.source === 'database' ? 'Data dimuat dari PostgreSQL/PostGIS melalui API PHP.' : 'API database belum aktif. Data dimuat dari GeoJSON statis sebagai fallback.';
  boundaryLayer = L.geoJSON(boundRes.data,{style:{color:'#0f766e',weight:2,fillColor:'#0f766e',fillOpacity:.06}}).addTo(map);
  try{map.fitBounds(boundaryLayer.getBounds(),{padding:[20,20]})}catch(e){}
  renderFilters(); renderAll();
  const legendControl = L.control({position:'bottomright'});
  legendControl.onAdd = function(){
    const div=L.DomUtil.create('div','legend');
    div.innerHTML='<b>Legenda</b><br>' + Object.entries(TYPE_COLOR).filter(([t])=>t!=='Lainnya').map(([t,c])=>`<i style="background:${c}"></i>${t}`).join('<br>') + '<br><span style="border:2px solid #0f766e;width:14px;height:9px;display:inline-block;margin-right:6px"></span>Batas wilayah';
    return div;
  };
  legendControl.addTo(map);
}
document.addEventListener('DOMContentLoaded', () => {
  main().catch(err=>{console.error(err); qs('#systemNote').textContent='Gagal memuat data. Pastikan file dijalankan melalui server lokal.'});
  qs('#togglePanel').addEventListener('click',()=>qs('#mapSidebar').classList.toggle('closed'));
  qs('#searchText').addEventListener('input',renderAll); qs('#kecFilter').addEventListener('change',renderAll);
  qs('#resetFilter').addEventListener('click',()=>{qs('#searchText').value=''; qs('#kecFilter').value=''; activeTypes=new Set([...new Set(facilities.map(f=>f.jenis))]); qsa('#typeFilters input').forEach(i=>i.checked=true); renderAll();});
  qs('#zoomAll').addEventListener('click',()=>{if(markerCluster) map.fitBounds(markerCluster.getBounds(),{padding:[40,40]})});
  qs('#locateMe').addEventListener('click',()=>locateUser()); qs('#nearestBtn').addEventListener('click',nearestFacility);
  qs('#clearAnalysis').addEventListener('click',()=>{if(selectedBuffer) map.removeLayer(selectedBuffer); if(routeControl) map.removeControl(routeControl); updateAnalysis('Analisis dihapus. Gunakan filter, klik marker, atau cari fasilitas terdekat untuk menampilkan hasil baru.');});
  qs('#btnExportCsv').addEventListener('click',()=>download('fasilitas_kesehatan_purworejo.csv', toCSV(filtered()), 'text/csv'));
  qs('#btnPrint').addEventListener('click',()=>window.print()); qs('#hideDock').addEventListener('click',()=>qs('#analysisDock').classList.add('hidden'));
});
