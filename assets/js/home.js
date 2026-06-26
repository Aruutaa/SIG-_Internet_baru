
document.addEventListener('DOMContentLoaded', async () => {
  const rows = await loadFacilities();
  const types = uniqueValues(rows, 'jenis');
  const districts = uniqueValues(rows, 'kecamatan');
  const typeCounts = Object.fromEntries(types.map(t => [t, rows.filter(r => r.jenis === t).length]));
  if(byId('homeTotal')) byId('homeTotal').textContent = fmtNumber(rows.length);
  if(byId('homeTypes')) byId('homeTypes').textContent = fmtNumber(types.length);
  if(byId('homeDistricts')) byId('homeDistricts').textContent = fmtNumber(districts.length);
  if(byId('homeBpjs')) byId('homeBpjs').textContent = fmtNumber(rows.filter(r => r.bpjs).length);
  const list = byId('homeTypeList');
  if(list){
    list.innerHTML = types.map(t => `<div class="line"><b>${t}</b><span>${fmtNumber(typeCounts[t])} titik</span></div>`).join('');
  }
});
