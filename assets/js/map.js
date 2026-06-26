let map, markerCluster, boundaryLayer, osm3dLayer, facilities = [], activeTypes = new Set();
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
function asBool(v){return v===true || v===1 || v==='1' || v==='t' || v==='true' || v==='Ya'}
function normalizeFeature(feature, idx){
  const p = getProps(feature), ll = getLatLng(feature) || {lat:p.latitude||p.lat,lng:p.longitude||p.lng};
  const layanan = Array.isArray(p.layanan) ? p.layanan.join(', ') : (p.layanan || p.daftar_layanan || '');
  return {
    id:p.id || p.gid || idx+1,
    kode:p.kode_faskes || p.kode || `FS-${idx+1}`,
    nama:p.nama_faskes || p.nama || 'Tanpa nama',
    jenis:p.jenis_faskes || p.jenis || 'Lainnya',
    kecamatan:p.kecamatan || '-', desa:p.desa || '-', alamat:p.alamat || '-',
    latitude:Number(p.latitude ?? p.lat ?? ll?.lat), longitude:Number(p.longitude ?? p.lng ?? ll?.lng),
    telepon:p.telepon || '-', jam_layanan:p.jam_layanan || p.jam_operasional || p.jam || '-',
    bpjs:asBool(p.bpjs), igd_24_jam:asBool(p.igd_24_jam ?? p.igd), igd_jam_operasional:p.igd_jam_operasional || (asBool(p.igd_24_jam ?? p.igd) ? '24 jam' : 'Tidak tersedia'),
    rawat_jalan:asBool(p.rawat_jalan ?? true), rawat_inap:asBool(p.rawat_inap), ambulans:asBool(p.ambulans),
    kapasitas_tempat_tidur:Number(p.kapasitas_tempat_tidur ?? p.bed ?? 0), jumlah_dokter:Number(p.jumlah_dokter ?? p.dokter ?? 0),
    jumlah_dokter_umum:Number(p.jumlah_dokter_umum ?? p.dokter_umum ?? p.jumlah_dokter ?? 0), jumlah_dokter_spesialis:Number(p.jumlah_dokter_spesialis ?? p.dokter_spesialis ?? 0),
    dokter_penyakit_dalam:Number(p.dokter_penyakit_dalam ?? 0), konsultasi_penyakit_dalam:asBool(p.konsultasi_penyakit_dalam), jadwal_penyakit_dalam:p.jadwal_penyakit_dalam || 'Belum tersedia',
    jumlah_tenaga_kesehatan:Number(p.jumlah_tenaga_kesehatan ?? p.tenaga ?? 0), rating:Number(p.rating ?? 0), layanan,
    sumber_data:p.sumber_data || '-', catatan:p.catatan || '-', raw:feature
  };
}
function validCoord(f){return Number.isFinite(f.latitude) && Number.isFinite(f.longitude)}
function filtered(){
  const keyword = qs('#searchText').value.trim().toLowerCase();
  const kec = qs('#kecFilter').value;
  const bpjs = qs('#bpjsFilter')?.value || '';
  const igd = qs('#igdFilter')?.value || '';
  const pd = qs('#penyakitDalamFilter')?.value || '';
  return facilities.filter(f => activeTypes.has(f.jenis) && (!kec || f.kecamatan===kec) && (!bpjs || String(Number(!!f.bpjs))===bpjs) && (!igd || String(Number(!!f.igd_24_jam))===igd) && (!pd || String(Number(!!f.konsultasi_penyakit_dalam))===pd) && (!keyword || [f.nama,f.jenis,f.kecamatan,f.desa,f.alamat,f.layanan,f.kode,f.igd_jam_operasional,f.jadwal_penyakit_dalam].join(' ').toLowerCase().includes(keyword)));
}
function makeToyIcon(type){const color = getTypeColor(type);return L.divIcon({className:'', html:`<div class="toy-marker" style="background:${color}"><span></span></div>`, iconSize:[30,30], iconAnchor:[15,30], popupAnchor:[0,-28]});}
function renderFilters(){
  const types = [...new Set(facilities.map(f=>f.jenis))].sort(); activeTypes = new Set(types);
  qs('#typeFilters').innerHTML = types.map(t => {const id = `type_${t.replace(/\W/g,'_')}`;return `<div class="filter-row"><input type="checkbox" id="${id}" value="${escapeHTML(t)}" checked><label for="${id}"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${getTypeColor(t)};margin-right:8px;border:2px solid #fff;box-shadow:0 0 0 1px #001f54"></span>${escapeHTML(t)}</label></div>`;}).join('');
  qsa('#typeFilters input').forEach(inp => inp.addEventListener('change', () => {inp.checked ? activeTypes.add(inp.value) : activeTypes.delete(inp.value); renderAll();}));
  const kecs = [...new Set(facilities.map(f=>f.kecamatan).filter(Boolean))].sort();
  qs('#kecFilter').innerHTML = '<option value="">Semua kecamatan</option>' + kecs.map(k=>`<option value="${escapeHTML(k)}">${escapeHTML(k)}</option>`).join('');
}
function popupHTML(f){
  const gm = `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
  const radius = Number(qs('#radiusSelect')?.value || 3000);
  const tags = [f.bpjs?'BPJS':null,f.igd_24_jam?'IGD':null,f.rawat_jalan?'Rawat Jalan':null,f.rawat_inap?'Rawat Inap':null,f.konsultasi_penyakit_dalam?'Penyakit Dalam':null,f.ambulans?'Ambulans':null].filter(Boolean).map(x=>`<span class="mini-tag ${x==='Penyakit Dalam'?'good':''}">${x}</span>`).join(' ');
  return `<div class="popup-title">${escapeHTML(f.nama)}</div><div class="popup-meta">${escapeHTML(f.jenis)} • ${escapeHTML(f.kecamatan)}</div><div>${tags}</div><div style="margin-top:6px"><b>Alamat:</b><br>${escapeHTML(f.alamat)}</div><div class="availability-grid"><span>IGD: ${escapeHTML(f.igd_jam_operasional)}</span><span>Dokter umum: ${f.jumlah_dokter_umum}</span><span>Spesialis: ${f.jumlah_dokter_spesialis}</span><span>Dokter penyakit dalam: ${f.dokter_penyakit_dalam}</span><span>Rawat jalan: ${f.rawat_jalan?'Ada':'Tidak'}</span><span>Rawat inap: ${f.rawat_inap?'Ada':'Tidak'}</span></div><div style="margin-top:6px"><b>Jadwal penyakit dalam:</b> ${escapeHTML(f.jadwal_penyakit_dalam)}</div><div style="margin-top:6px"><b>Layanan:</b> ${escapeHTML(f.layanan || '-')}</div><div style="margin-top:6px"><b>Sumber:</b> ${escapeHTML(f.sumber_data)}</div><div class="popup-actions"><button type="button" onclick='setDestination(${f.latitude},${f.longitude},${JSON.stringify(f.nama)})'>Rute</button><button type="button" onclick='makeBuffer(${f.latitude},${f.longitude},${radius},${JSON.stringify(f.nama)})'>Buffer ${(radius/1000).toFixed(0)} km</button><a target="_blank" href="${gm}">Google Maps</a></div>`;
}
function renderMarkers(){
  if(markerCluster) map.removeLayer(markerCluster);
  markerCluster = L.markerClusterGroup({showCoverageOnHover:false, maxClusterRadius:48});
  filtered().forEach(f => { if(!validCoord(f)) return; const m = L.marker([f.latitude,f.longitude], {icon:makeToyIcon(f.jenis), title:f.nama}).bindPopup(popupHTML(f)); m.on('click', () => updateAnalysis(`Fasilitas dipilih: ${f.nama}. Informasi yang dicek meliputi IGD, dokter, rawat jalan/inap, dan konsultasi penyakit dalam.`)); markerCluster.addLayer(m); });
  markerCluster.addTo(map);
}

function renderBuildings(){
  const toggle = qs('#osm3dLayerToggle');
  const status = qs('#osm3dStatus');
  const count = qs('#buildingCount');
  const enabled = toggle ? toggle.checked : true;
  if(!enabled){
    if(osm3dLayer){
      try{ if(typeof osm3dLayer.remove === 'function') osm3dLayer.remove(); else if(map && map.removeLayer) map.removeLayer(osm3dLayer); }catch(e){}
      osm3dLayer = null;
    }
    if(count) count.textContent = 'Nonaktif';
    if(status) status.textContent = 'OSM 3D Buildings dinonaktifkan.';
    return;
  }
  if(osm3dLayer){
    if(count) count.textContent = 'Aktif';
    if(status) status.textContent = map.getZoom() >= 16 ? 'OSM 3D Buildings aktif pada zoom detail.' : 'OSM 3D aktif. Klik Mode 3D OSM atau zoom 16–18 agar bentuk bangunan terlihat.';
    return;
  }
  if(!window.OSMBuildings){
    if(count) count.textContent = 'CDN gagal';
    if(status) status.textContent = 'Library OSMBuildings belum termuat. Pastikan laptop tersambung internet lalu refresh halaman.';
    return;
  }
  try{
    osm3dLayer = new OSMBuildings(map);
    osm3dLayer.load('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
    if(typeof osm3dLayer.setStyle === 'function'){
      osm3dLayer.setStyle({
        wallColor:'rgba(11,94,215,0.56)',
        roofColor:'rgba(246,194,62,0.88)',
        color:'rgba(220,53,69,0.24)'
      });
    }
    if(count) count.textContent = 'Aktif';
    if(status) status.textContent = 'OSM 3D Buildings aktif. Klik Mode 3D OSM untuk masuk ke zoom bangunan.';
  }catch(e){
    if(count) count.textContent = 'Gagal';
    if(status) status.textContent = 'OSM 3D gagal dimuat. Periksa koneksi internet/CDN, lalu refresh halaman.';
    console.warn('OSMBuildings error', e);
  }
}
function focusOsm3D(){
  if(qs('#osm3dLayerToggle')) qs('#osm3dLayerToggle').checked = true;
  renderBuildings();
  const rows = filtered().filter(validCoord);
  const target = rows[0] || facilities.find(validCoord) || {latitude:-7.72, longitude:110.02};
  map.setView([target.latitude, target.longitude], 17, {animate:true});
  setTimeout(renderBuildings, 600);
  updateAnalysis('Mode 3D OSM aktif. Peta diarahkan ke zoom 17. Jika bangunan belum muncul, tunggu tile selesai dimuat atau geser sedikit peta. Layer ini membutuhkan koneksi internet.');
}
function renderList(){
  const rows = filtered();
  qs('#facilityList').innerHTML = rows.slice(0,100).map(f=>`<div class="facility-card" data-id="${escapeHTML(f.id)}"><b>${escapeHTML(f.nama)}</b><span>${escapeHTML(f.kecamatan)} • IGD ${escapeHTML(f.igd_jam_operasional)} • Penyakit Dalam ${f.konsultasi_penyakit_dalam?'Ada':'Belum'}</span><em class="badge-type" style="background:${getTypeColor(f.jenis)};color:${getTypeText(f.jenis)}">${escapeHTML(f.jenis)}</em></div>`).join('') || '<p class="mini-text">Data tidak ditemukan.</p>';
  qsa('.facility-card').forEach(card => card.addEventListener('click', () => { const f = facilities.find(x=>String(x.id)===String(card.dataset.id)); if(f && validCoord(f)){map.setView([f.latitude,f.longitude],16); updateAnalysis(`Peta diarahkan ke ${f.nama}. Atribut layanan dapat dibaca pada popup marker.`)} }));
}
function updateStats(){const rows=filtered(); qs('#statTotal').textContent=formatNum(facilities.length); qs('#statVisible').textContent=formatNum(rows.length); qs('#statKec').textContent=formatNum(new Set(facilities.map(f=>f.kecamatan)).size); updateInsight(rows); updateChart(rows);}
function updateInsight(rows){const byType=countBy(rows,'jenis'), byKec=countBy(rows,'kecamatan'); const [domType,domCount]=topEntry(byType); const [topK,topCount]=topEntry(byKec); const [lowK,lowCount]=topEntry(byKec,true); qs('#dominantType').textContent=domType==='-'?'—':`${domType} (${domCount})`; qs('#topKec').textContent=topK==='-'?'—':`${topK} (${topCount})`; qs('#lowKec').textContent=lowK==='-'?'—':`${lowK} (${lowCount})`;}
function updateChart(rows){const counts=countBy(rows,'jenis'); const labels=Object.keys(counts), data=Object.values(counts); if(typeChart) typeChart.destroy(); typeChart=new Chart(qs('#typeChart'),{type:'doughnut',data:{labels,datasets:[{label:'Jumlah',data,backgroundColor:labels.map(getTypeColor),borderColor:'#ffffff',borderWidth:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{position:'bottom',labels:{boxWidth:12,font:{family:'Inter',weight:'700'}}}}}})}
function updateAnalysis(text){qs('#analysisText').textContent=text; qs('#analysisDock').classList.remove('hidden')}
function renderAll(){renderMarkers(); renderBuildings(); renderList(); updateStats()}
function distanceMeter(a,b){return map.distance([a.lat,a.lng],[b.lat,b.lng])}
function radiusValue(){return Number(qs('#radiusSelect').value || 3000)}
window.makeBuffer = function(lat,lng,radius,name){radius=Number(radius||radiusValue()); if(selectedBuffer) map.removeLayer(selectedBuffer); selectedBuffer=L.circle([lat,lng],{radius,color:'#0057D9',fillColor:'#FFC400',fillOpacity:.28,weight:4,dashArray:'9 7'}).addTo(map); map.fitBounds(selectedBuffer.getBounds(),{padding:[30,30]}); const rows=facilities.filter(f=>validCoord(f)&&distanceMeter({lat,lng},{lat:f.latitude,lng:f.longitude})<=radius); const byType=countBy(rows,'jenis'); const pd=rows.filter(f=>f.konsultasi_penyakit_dalam).length; const typeSummary=Object.entries(byType).map(([k,v])=>`${k}: ${v}`).join(', ') || 'tidak ada'; qs('#bufferCount').textContent=`${rows.length} titik`; updateAnalysis(`Buffer radius ${(radius/1000).toFixed(0)} km dari ${name}. Terdapat ${rows.length} fasilitas. Komposisi: ${typeSummary}. Fasilitas dengan konsultasi penyakit dalam dalam radius ini: ${pd}.`);}
window.setDestination = function(lat,lng,name){if(!currentUserLatLng){updateAnalysis('Lokasi awal belum tersedia. Klik “Lokasi saya” terlebih dahulu.'); return;} if(routeControl) map.removeControl(routeControl); routeControl=L.Routing.control({waypoints:[L.latLng(currentUserLatLng.lat,currentUserLatLng.lng),L.latLng(lat,lng)],routeWhileDragging:false,show:false,addWaypoints:false,lineOptions:{styles:[{color:'#E60023',weight:6,opacity:.9}]}}).addTo(map); updateAnalysis(`Rute dibuat dari posisi pengguna menuju ${name}.`)}
function locateUser(callback){if(!navigator.geolocation){updateAnalysis('Browser tidak mendukung fitur lokasi.'); return;} navigator.geolocation.getCurrentPosition(pos=>{currentUserLatLng={lat:pos.coords.latitude,lng:pos.coords.longitude}; if(userMarker) map.removeLayer(userMarker); userMarker=L.marker([currentUserLatLng.lat,currentUserLatLng.lng]).addTo(map).bindPopup('Lokasi saya'); map.setView([currentUserLatLng.lat,currentUserLatLng.lng],14); updateAnalysis('Lokasi pengguna berhasil diambil.'); if(callback) callback(currentUserLatLng);},()=>updateAnalysis('Lokasi pengguna tidak dapat diambil.'),{enableHighAccuracy:true,timeout:12000});}
function nearestFacility(){locateUser(user=>{let rows=filtered().filter(validCoord); let nearest=rows.map(f=>({...f,dist:distanceMeter(user,{lat:f.latitude,lng:f.longitude})})).sort((a,b)=>a.dist-b.dist)[0]; if(nearest){map.setView([nearest.latitude,nearest.longitude],15); updateAnalysis(`Fasilitas terdekat adalah ${nearest.nama}, jenis ${nearest.jenis}, estimasi jarak lurus ${(nearest.dist/1000).toFixed(2)} km. Layanan penting: IGD ${nearest.igd_jam_operasional}, penyakit dalam ${nearest.konsultasi_penyakit_dalam?'tersedia':'belum tersedia'}.`)}})}
function clearAnalysis(){if(selectedBuffer){map.removeLayer(selectedBuffer); selectedBuffer=null;} if(routeControl){map.removeControl(routeControl); routeControl=null;} qs('#bufferCount').textContent='—'; updateAnalysis('Analisis dihapus. Gunakan filter, klik marker, atau cari fasilitas terdekat.');}
function addLegend(){const legendControl=L.control({position:'bottomright'}); legendControl.onAdd=function(){const div=L.DomUtil.create('div','legend'); div.innerHTML='<b>Legenda</b><br>'+Object.entries(TYPE_COLOR).filter(([t])=>t!=='Lainnya').map(([t,c])=>`<i style="background:${c}"></i>${t}`).join('<br>')+'<br><span style="border:2px dashed #0057D9;background:#FFC400;width:14px;height:9px;display:inline-block;margin-right:6px"></span>Buffer radius<br><span style="border:2px solid #0057D9;width:14px;height:9px;display:inline-block;margin-right:6px"></span>Batas wilayah<br><span style="border:2px solid #001f54;background:#FFC400;width:14px;height:9px;display:inline-block;margin-right:6px"></span>OSM 3D Buildings'; return div;}; legendControl.addTo(map);}
async function main(){
  initMap(); const [facRes,boundRes]=await Promise.all([loadFacilities(),loadBoundary()]);
  facilities=facRes.data.features.map(normalizeFeature).filter(validCoord);
  qs('#statSource').textContent = facRes.source === 'database' ? 'DB' : 'GeoJSON';
  qs('#buildingCount').textContent = 'Aktif';
  qs('#systemNote').textContent = facRes.source === 'database' ? 'Data fasilitas dimuat dari PostgreSQL/PostGIS melalui API PHP. Layer bangunan menggunakan OSM 3D Buildings.' : 'API database belum aktif. Data fasilitas dimuat dari GeoJSON fallback. Layer bangunan menggunakan OSM 3D Buildings.';
  boundaryLayer=L.geoJSON(boundRes.data,{style:{color:'#0057D9',weight:4,fillColor:'#FFC400',fillOpacity:.16,dashArray:'8 5'}}).addTo(map);
  try{map.fitBounds(boundaryLayer.getBounds(),{padding:[20,20]})}catch(e){}
  renderFilters(); renderAll(); addLegend();
}
document.addEventListener('DOMContentLoaded',()=>{
  main().catch(err=>{console.error(err); qs('#systemNote').textContent='Gagal memuat data. Pastikan file dijalankan melalui server lokal.'});
  qs('#togglePanel').addEventListener('click',()=>qs('#mapSidebar').classList.toggle('closed'));
  ['searchText','kecFilter','bpjsFilter','igdFilter','penyakitDalamFilter'].forEach(id=>qs('#'+id)?.addEventListener(id==='searchText'?'input':'change',renderAll));
  qs('#osm3dLayerToggle')?.addEventListener('change',renderBuildings);
  qs('#focus3dBtn')?.addEventListener('click',focusOsm3D);
  qs('#radiusSelect').addEventListener('change',()=>{qs('#radiusBadge').textContent=`${Number(qs('#radiusSelect').value)/1000} km`; updateAnalysis(`Radius buffer diubah menjadi ${Number(qs('#radiusSelect').value)/1000} km.`)});
  qs('#resetFilter').addEventListener('click',()=>{qs('#searchText').value=''; qs('#kecFilter').value=''; qs('#bpjsFilter').value=''; qs('#igdFilter').value=''; qs('#penyakitDalamFilter').value=''; qs('#osm3dLayerToggle').checked=true; activeTypes=new Set([...new Set(facilities.map(f=>f.jenis))]); qsa('#typeFilters input').forEach(i=>i.checked=true); renderAll();});
  qs('#zoomAll').addEventListener('click',()=>{if(markerCluster&&markerCluster.getLayers().length)map.fitBounds(markerCluster.getBounds(),{padding:[40,40]})});
  qs('#locateMe').addEventListener('click',()=>locateUser()); qs('#nearestBtn').addEventListener('click',nearestFacility); qs('#clearAnalysis').addEventListener('click',clearAnalysis);
  qs('#btnExportCsv').addEventListener('click',()=>download('fasilitas_kesehatan_purworejo.csv',toCSV(filtered().map(f=>({nama_faskes:f.nama,jenis_faskes:f.jenis,kecamatan:f.kecamatan,alamat:f.alamat,latitude:f.latitude,longitude:f.longitude,telepon:f.telepon,jam_layanan:f.jam_layanan,bpjs:f.bpjs,igd_24_jam:f.igd_24_jam,igd_jam_operasional:f.igd_jam_operasional,rawat_jalan:f.rawat_jalan,rawat_inap:f.rawat_inap,ambulans:f.ambulans,kapasitas_tempat_tidur:f.kapasitas_tempat_tidur,jumlah_dokter:f.jumlah_dokter,jumlah_dokter_umum:f.jumlah_dokter_umum,jumlah_dokter_spesialis:f.jumlah_dokter_spesialis,dokter_penyakit_dalam:f.dokter_penyakit_dalam,konsultasi_penyakit_dalam:f.konsultasi_penyakit_dalam,jadwal_penyakit_dalam:f.jadwal_penyakit_dalam,jumlah_tenaga_kesehatan:f.jumlah_tenaga_kesehatan,rating:f.rating,sumber_data:f.sumber_data,catatan:f.catatan}))), 'text/csv'));
  qs('#btnPrint').addEventListener('click',()=>window.print()); qs('#hideDock').addEventListener('click',()=>qs('#analysisDock').classList.add('hidden'));
});
