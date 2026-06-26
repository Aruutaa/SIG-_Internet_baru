const API_BASE = 'api';
const GEOJSON_FALLBACK = 'assets/geojson/faskes.geojson';
const BOUNDARY_FALLBACK = 'assets/geojson/pwr.geojson';
const TYPE_COLOR = {
  'Rumah Sakit':'#e63946',
  'Puskesmas':'#2fb344',
  'Klinik':'#ffd23f',
  'Apotek':'#7c4dff',
  'Lainnya':'#1f6fd6'
};
const TYPE_TEXT = {
  'Rumah Sakit':'#ffffff',
  'Puskesmas':'#ffffff',
  'Klinik':'#3d2a00',
  'Apotek':'#ffffff',
  'Lainnya':'#ffffff'
};
function qs(sel, root=document){return root.querySelector(sel)}
function qsa(sel, root=document){return [...root.querySelectorAll(sel)]}
function escapeHTML(value){return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function getTypeColor(type){return TYPE_COLOR[type] || TYPE_COLOR.Lainnya}
function getTypeText(type){return TYPE_TEXT[type] || TYPE_TEXT.Lainnya}
function formatNum(n){return new Intl.NumberFormat('id-ID').format(Number(n)||0)}
function getProps(feature){return feature?.properties || {}}
function getLatLng(feature){
  if(!feature?.geometry) return null;
  if(feature.geometry.type === 'Point') return {lng:Number(feature.geometry.coordinates[0]), lat:Number(feature.geometry.coordinates[1])};
  return null;
}
async function tryJson(url, options={}){
  const res = await fetch(url, {credentials:'include', ...options});
  if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
async function loadFacilities(){
  try{
    const data = await tryJson(`${API_BASE}/fasilitas.php`);
    if(data && data.type === 'FeatureCollection') return {data, source:'database'};
  }catch(e){console.warn('API fasilitas tidak aktif, memakai GeoJSON statis.', e.message)}
  const data = await tryJson(GEOJSON_FALLBACK, {credentials:'same-origin'});
  return {data, source:'geojson'};
}
async function loadBoundary(){
  try{
    const data = await tryJson(`${API_BASE}/boundary.php`);
    if(data && data.type === 'FeatureCollection') return {data, source:'database'};
  }catch(e){console.warn('API boundary tidak aktif, memakai GeoJSON statis.', e.message)}
  const data = await tryJson(BOUNDARY_FALLBACK, {credentials:'same-origin'});
  return {data, source:'geojson'};
}
function toCSV(rows){
  const headers = ['nama_faskes','jenis_faskes','kecamatan','alamat','latitude','longitude','sumber_data','catatan'];
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g,'""')}"`).join(','))).join('\n');
  return '\ufeff' + csv;
}
function download(filename, content, mime='text/plain'){
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function countBy(rows, key){return rows.reduce((acc,row)=>{const v=row[key]||'-'; acc[v]=(acc[v]||0)+1; return acc;}, {})}
function topEntry(obj, asc=false){const entries=Object.entries(obj); if(!entries.length) return ['-',0]; entries.sort((a,b)=>asc ? a[1]-b[1] : b[1]-a[1]); return entries[0]}
function setupNav(){
  const toggle = qs('#mobileToggle'); const links = qs('#navLinks');
  if(toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));
}
document.addEventListener('DOMContentLoaded', setupNav);
