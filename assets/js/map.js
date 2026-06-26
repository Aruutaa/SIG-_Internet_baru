let map, markerCluster, boundaryLayer, facilities = [], activeTypes = new Set();
let selectedBuffer = null, routeControl = null, userMarker = null, currentUserLatLng = null, typeChart = null;

function initMap(){
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
  const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19,attribution:'© OpenStreetMap © CARTO'});
  const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri'});
  map = L.map('map',{zoomControl:false,layers:[carto]}).setView([-7.72,110.02],11);
  L.control.zoom({position:'topright'}).addTo(map);
  L.control.scale({metric:true,imperial:false,position:'bottomleft'}).addTo(map);
  L.control.layers({'Toy Light':carto,'OpenStreetMap':osm,'Satelit':esri}, {}, {position:'topright',collapsed:true}).addTo(map);
}

function normalizeFeature(feature, idx){
  const p = getProps(feature), ll = getLatLng(feature) || {lat:p.latitude,lng:p.longitude};
  return {
    id:p.id || p.gid || idx+1,
    nama:p.nama_faskes || p.nama || 'Tanpa nama',
    jenis:p.jenis_faskes || p.jenis || 'Lainnya',
    kecamatan:p.kecamatan || '-',
    alamat:p.alamat || '-',
    latitude:Number(p.latitude ?? ll?.lat),
    longitude:Number(p.longitude ?? ll?.lng),
    sumber_data:p.sumber_data || '-',
    catatan:p.catatan || '-',
    raw:feature
  };
}
function validCoord(f){return Number.isFinite(f.latitude) && Number.isFinite(f.longitude)}
function filtered(){
  const keyword = qs('#searchText').value.trim().toLowerCase();
  const kec = qs('#kecFilter').value;
  return facilities.filter(f => activeTypes.has(f.jenis) && (!kec || f.kecamatan===kec) && (!keyword || [f.nama,f.jenis,f.kecamatan,f.alamat].join(' ').toLowerCase().includes(keyword)));
}
function iconFor(type){
  const color = getTypeColor(type);
  return L.divIcon({className:'toy-marker', html:`<span></span>`, iconSize:[30,30], iconAnchor:[15,30], popupAnchor:[0,-30], bgPos:[0,0], iconUrl:null, shadowUrl:null, style:`background:${color}`});
}
function makeToyIcon(type){
  const color = getTypeColor(type);
  return L.divIcon({className:'', html:`<div class="toy-marker" style="background:${color}"><span></span></div>`, iconSize:[30,30], iconAnchor:[15,30], popupAnchor:[0,-28]});
}
function renderFilters(){
  const types = [...new Set(facilities.map(f=>f.jenis))].sort();
  activeTypes = new Set(types);
  qs('#typeFilters').innerHTML = types.map(t => {
    const id = `type_${t.replace(/\W/g,'_')}`;
    return `<div class="filter-row"><input type="checkbox" id="${id}" value="${escapeHTML(t)}" checked><label for="${id}"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${getTypeColor(t)};margin-right:8px;border:2px solid #fff;box-shadow:0 0 0 1px #c8d8eb"></span>${escapeHTML(t)}</label></div>`;
  }).join('');
  qsa('#typeFilters input').forEach(inp => inp.addEventListener('change', () => {inp.checked ? activeTypes.add(inp.value) : activeTypes.delete(inp.value); renderAll();}));
  const kecs = [...new Set(facilities.map(f=>f.kecamatan).filter(Boolean))].sort();
  qs('#kecFilter').innerHTML = '<option value="">Semua kecamatan</option>' + kecs.map(k=>`<option value="${escapeHTML(k)}">${escapeHTML(k)}</option>`).join('');
}
function popupHTML(f){
  const gm = `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
  const radius = Number(qs('#radiusSelect')?.value || 3000);
  return `<div class="popup-title">${escapeHTML(f.nama)}</div><div class="popup-meta">${escapeHTML(f.jenis)} • ${escapeHTML(f.kecamatan)}</div><div><b>Alamat:</b><br>${escapeHTML(f.alamat)}</div><div style="margin-top:6px"><b>Sumber:</b> ${escapeHTML(f.sumber_data)}</div><div class="popup-actions"><button type="button" onclick='setDestination(${f.latitude},${f.longitude},${JSON.stringify(f.nama)})'>Rute</button><button type="button" onclick='makeBuffer(${f.latitude},${f.longitude},${radius},${JSON.stringify(f.nama)})'>Buffer ${(radius/1000).toFixed(0)} km</button><a target="_blank" href="${gm}">Google Maps</a></div>`;
}
function renderMarkers(){
  if(markerCluster) map.removeLayer(markerCluster);
  markerCluster = L.markerClusterGroup({showCoverageOnHover:false, maxClusterRadius:48});
  filtered().forEach(f => {
    if(!validCoord(f)) return;
    const m = L.marker([f.latitude,f.longitude], {icon:makeToyIcon(f.jenis), title:f.nama}).bindPopup(popupHTML(f));
    m.on('click', () => updateAnalysis(`Fasilitas dipilih: ${f.nama}. Jenis layanan ${f.jenis}, berada di Kecamatan ${f.kecamatan}. Gunakan tombol buffer atau rute untuk analisis lanjutan.`));
    markerCluster.addLayer(m);
  });
  markerCluster.addTo(map);
}
function renderList(){
  const rows = filtered();
  qs('#facilityList').innerHTML = rows.slice(0,100).map(f=>`<div class="facility-card" data-id="${escapeHTML(f.id)}"><b>${escapeHTML(f.nama)}</b><span>${escapeHTML(f.kecamatan)} • ${escapeHTML(f.alamat)}</span><em class="badge-type" style="background:${getTypeColor(f.jenis)};color:${getTypeText(f.jenis)}">${escapeHTML(f.jenis)}</em></div>`).join('') || '<p class="mini-text">Data tidak ditemukan.</p>';
  qsa('.facility-card').forEach(card => card.addEventListener('click', () => {
    const f = facilities.find(x=>String(x.id)===String(card.dataset.id));
    if(f && validCoord(f)){map.setView([f.latitude,f.longitude],16); updateAnalysis(`Peta diarahkan ke ${f.nama}. Klik marker untuk membuka atribut lengkap dan analisis radius.`)}
  }));
}
function updateStats(){
  const rows=filtered();
  qs('#statTotal').textContent=formatNum(facilities.length);
  qs('#statVisible').textContent=formatNum(rows.length);
  qs('#statKec').textContent=formatNum(new Set(facilities.map(f=>f.kecamatan)).size);
  updateInsight(rows);
  updateChart(rows);
}
function updateInsight(rows){
  const byType = countBy(rows,'jenis');
  const byKec = countBy(rows,'kecamatan');
  const [domType, domCount] = topEntry(byType);
  const [topK, topCount] = topEntry(byKec);
  const [lowK, lowCount] = topEntry(byKec,true);
  qs('#dominantType').textContent = domType === '-' ? '—' : `${domType} (${domCount})`;
  qs('#topKec').textContent = topK === '-' ? '—' : `${topK} (${topCount})`;
  qs('#lowKec').textContent = lowK === '-' ? '—' : `${lowK} (${lowCount})`;
}
function updateChart(rows){
  const counts = countBy(rows,'jenis');
  const labels = Object.keys(counts); const data = Object.values(counts);
  if(typeChart) typeChart.destroy();
  typeChart = new Chart(qs('#typeChart'), {
    type:'doughnut',
    data:{labels, datasets:[{label:'Jumlah', data, backgroundColor:labels.map(getTypeColor), borderColor:'#ffffff', borderWidth:4}]},
    options:{responsive:true, maintainAspectRatio:false, cutout:'58%', plugins:{legend:{position:'bottom', labels:{boxWidth:12, font:{family:'Nunito', weight:'800'}}}}}
  });
}
function updateAnalysis(text){qs('#analysisText').textContent=text; qs('#analysisDock').classList.remove('hidden')}
function renderAll(){renderMarkers(); renderList(); updateStats()}
function distanceMeter(a,b){return map.distance([a.lat,a.lng],[b.lat,b.lng])}
function radiusValue(){return Number(qs('#radiusSelect').value || 3000)}
window.makeBuffer = function(lat,lng,radius,name){
  radius = Number(radius || radiusValue());
  if(selectedBuffer) map.removeLayer(selectedBuffer);
  selectedBuffer = L.circle([lat,lng], {radius, color:'#1f6fd6', fillColor:'#ffd23f', fillOpacity:.23, weight:3, dashArray:'9 7'}).addTo(map);
  map.fitBounds(selectedBuffer.getBounds(), {padding:[30,30]});
  const rows = facilities.filter(f => validCoord(f) && distanceMeter({lat,lng},{lat:f.latitude,lng:f.longitude}) <= radius);
  const byType = countBy(rows,'jenis');
  const typeSummary = Object.entries(byType).map(([k,v])=>`${k}: ${v}`).join(', ') || 'tidak ada';
  qs('#bufferCount').textContent = `${rows.length} titik`;
  updateAnalysis(`Buffer radius ${(radius/1000).toFixed(0)} km dari ${name}. Terdapat ${rows.length} fasilitas dalam radius tersebut. Komposisi: ${typeSummary}. Analisis ini berbasis jumlah titik fasilitas, belum memakai data jumlah penduduk.`);
}
window.setDestination = function(lat,lng,name){
  if(!currentUserLatLng){updateAnalysis('Lokasi awal belum tersedia. Klik “Lokasi saya” terlebih dahulu, lalu izinkan akses lokasi pada browser.'); return;}
  if(routeControl) map.removeControl(routeControl);
  routeControl = L.Routing.control({waypoints:[L.latLng(currentUserLatLng.lat,currentUserLatLng.lng), L.latLng(lat,lng)], routeWhileDragging:false, show:false, addWaypoints:false, lineOptions:{styles:[{color:'#e63946',weight:6,opacity:.85}]} }).addTo(map);
  updateAnalysis(`Rute dibuat dari posisi pengguna menuju ${name}. Jarak dan waktu mengikuti layanan routing yang tersedia.`);
}
function locateUser(callback){
  if(!navigator.geolocation){updateAnalysis('Browser tidak mendukung fitur lokasi.'); return;}
  navigator.geolocation.getCurrentPosition(pos=>{
    currentUserLatLng = {lat:pos.coords.latitude, lng:pos.coords.longitude};
    if(userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([currentUserLatLng.lat,currentUserLatLng.lng]).addTo(map).bindPopup('Lokasi saya');
    map.setView([currentUserLatLng.lat,currentUserLatLng.lng],14);
    updateAnalysis('Lokasi pengguna berhasil diambil. Posisi ini dapat digunakan sebagai titik awal rute dan pencarian fasilitas terdekat.');
    if(callback) callback(currentUserLatLng);
  }, () => updateAnalysis('Lokasi pengguna tidak dapat diambil. Pastikan izin lokasi browser sudah diaktifkan.'), {enableHighAccuracy:true,timeout:12000});
}
function nearestFacility(){
  locateUser(user=>{
    let rows=filtered().filter(validCoord);
    let nearest = rows.map(f=>({...f, dist:distanceMeter(user,{lat:f.latitude,lng:f.longitude})})).sort((a,b)=>a.dist-b.dist)[0];
    if(nearest){map.setView([nearest.latitude,nearest.longitude],15); updateAnalysis(`Fasilitas terdekat dari posisi Anda adalah ${nearest.nama}, jenis ${nearest.jenis}, dengan estimasi jarak lurus ${(nearest.dist/1000).toFixed(2)} km. Klik marker untuk membuat rute.`)}
  });
}
function clearAnalysis(){
  if(selectedBuffer){map.removeLayer(selectedBuffer); selectedBuffer=null;}
  if(routeControl){map.removeControl(routeControl); routeControl=null;}
  qs('#bufferCount').textContent = '—';
  updateAnalysis('Analisis dihapus. Gunakan filter, klik marker, atau cari fasilitas terdekat untuk menampilkan hasil baru.');
}
function addLegend(){
  const legendControl = L.control({position:'bottomright'});
  legendControl.onAdd = function(){
    const div=L.DomUtil.create('div','legend');
    div.innerHTML='<b>Legenda</b><br>' + Object.entries(TYPE_COLOR).filter(([t])=>t!=='Lainnya').map(([t,c])=>`<i style="background:${c}"></i>${t}`).join('<br>') + '<br><span style="border:2px dashed #1f6fd6;background:#ffd23f;width:14px;height:9px;display:inline-block;margin-right:6px"></span>Buffer radius<br><span style="border:2px solid #1f6fd6;width:14px;height:9px;display:inline-block;margin-right:6px"></span>Batas wilayah';
    return div;
  };
  legendControl.addTo(map);
}
async function main(){
  initMap();
  const [facRes, boundRes] = await Promise.all([loadFacilities(), loadBoundary()]);
  facilities = facRes.data.features.map(normalizeFeature).filter(validCoord);
  qs('#statSource').textContent = facRes.source === 'database' ? 'DB' : 'GeoJSON';
  qs('#systemNote').textContent = facRes.source === 'database' ? 'Data dimuat dari PostgreSQL/PostGIS melalui API PHP.' : 'API database belum aktif. Data dimuat dari GeoJSON statis sebagai fallback.';
  boundaryLayer = L.geoJSON(boundRes.data,{style:{color:'#1f6fd6',weight:3,fillColor:'#ffd23f',fillOpacity:.14,dashArray:'8 5'}}).addTo(map);
  try{map.fitBounds(boundaryLayer.getBounds(),{padding:[20,20]})}catch(e){}
  renderFilters(); renderAll(); addLegend();
}
document.addEventListener('DOMContentLoaded', () => {
  main().catch(err=>{console.error(err); qs('#systemNote').textContent='Gagal memuat data. Pastikan file dijalankan melalui server lokal.'});
  qs('#togglePanel').addEventListener('click',()=>qs('#mapSidebar').classList.toggle('closed'));
  qs('#searchText').addEventListener('input',renderAll); qs('#kecFilter').addEventListener('change',renderAll);
  qs('#radiusSelect').addEventListener('change',()=>{qs('#radiusBadge').textContent=`${Number(qs('#radiusSelect').value)/1000} km`; updateAnalysis(`Radius buffer diubah menjadi ${Number(qs('#radiusSelect').value)/1000} km. Klik marker lalu pilih tombol buffer untuk menjalankan analisis.`)});
  qs('#resetFilter').addEventListener('click',()=>{qs('#searchText').value=''; qs('#kecFilter').value=''; activeTypes=new Set([...new Set(facilities.map(f=>f.jenis))]); qsa('#typeFilters input').forEach(i=>i.checked=true); renderAll();});
  qs('#zoomAll').addEventListener('click',()=>{if(markerCluster && markerCluster.getLayers().length) map.fitBounds(markerCluster.getBounds(),{padding:[40,40]})});
  qs('#locateMe').addEventListener('click',()=>locateUser()); qs('#nearestBtn').addEventListener('click',nearestFacility);
  qs('#clearAnalysis').addEventListener('click',clearAnalysis);
  qs('#btnExportCsv').addEventListener('click',()=>download('fasilitas_kesehatan_purworejo.csv', toCSV(filtered().map(f=>({nama_faskes:f.nama,jenis_faskes:f.jenis,kecamatan:f.kecamatan,alamat:f.alamat,latitude:f.latitude,longitude:f.longitude,sumber_data:f.sumber_data,catatan:f.catatan}))), 'text/csv'));
  qs('#btnPrint').addEventListener('click',()=>window.print()); qs('#hideDock').addEventListener('click',()=>qs('#analysisDock').classList.add('hidden'));
});
