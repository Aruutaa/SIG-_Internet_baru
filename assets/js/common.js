
(function(){
  const toggle = document.getElementById('mobileToggle');
  const links = document.getElementById('navLinks');
  if(toggle && links){ toggle.addEventListener('click', () => links.classList.toggle('show')); }
})();
function showToast(message){
  let toast = document.querySelector('.toast');
  if(!toast){ toast = document.createElement('div'); toast.className='toast'; document.body.appendChild(toast); }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function fmtNumber(n){ return new Intl.NumberFormat('id-ID').format(Number(n || 0)); }
function byId(id){ return document.getElementById(id); }
function uniqueValues(rows, key){ return [...new Set(rows.map(r=>r[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'id')); }
function typeColor(type){
  return { 'Rumah Sakit':'#1e88ff','Puskesmas':'#30a84f','Klinik':'#f2b705','Apotek':'#ef3b45','Laboratorium':'#7b45d9' }[type] || '#08245c';
}
function typeIcon(type){
  return { 'Rumah Sakit':'✚','Puskesmas':'✚','Klinik':'▣','Apotek':'✚','Laboratorium':'⚗' }[type] || '●';
}
function distanceKm(aLat,aLng,bLat,bLng){
  const R = 6371;
  const dLat = (bLat-aLat) * Math.PI / 180;
  const dLng = (bLng-aLng) * Math.PI / 180;
  const s1 = Math.sin(dLat/2) ** 2;
  const s2 = Math.cos(aLat*Math.PI/180) * Math.cos(bLat*Math.PI/180) * Math.sin(dLng/2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1+s2));
}
function toCsv(rows){
  const headers = ['kode','nama','jenis','kecamatan','desa','alamat','telepon','jam','bpjs','igd','rawat_inap','ambulans','bed','dokter','tenaga','rating','lat','lng'];
  const clean = v => `"${String(v ?? '').replaceAll('"','""')}"`;
  return [headers.join(','), ...rows.map(r => headers.map(h => clean(r[h])).join(','))].join('\n');
}
function downloadText(filename, text){
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 300);
}
async function loadFacilities(){
  try{
    const res = await fetch('api/facilities.php?format=json', {cache:'no-store'});
    if(!res.ok) throw new Error('API tidak aktif');
    const json = await res.json();
    if(Array.isArray(json.data) && json.data.length) return json.data;
  }catch(e){}
  const local = JSON.parse(localStorage.getItem('geohealth_facilities') || 'null');
  return Array.isArray(local) && local.length ? local : (window.HEALTH_FACILITIES || []);
}
function saveLocalFacilities(rows){ localStorage.setItem('geohealth_facilities', JSON.stringify(rows)); }
