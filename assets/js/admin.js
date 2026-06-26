
let adminRows = [];
document.addEventListener('DOMContentLoaded', async () => {
  if(sessionStorage.getItem('geohealth_admin') !== '1'){
    showToast('Silakan login terlebih dahulu.');
    setTimeout(()=>location.href='login.html', 800);
    return;
  }
  adminRows = await loadFacilities();
  saveLocalFacilities(adminRows);
  bindAdmin(); renderAdmin();
});
function bindAdmin(){
  byId('adminSearch').addEventListener('input', renderAdmin);
  byId('btnAdminExport').addEventListener('click', () => downloadText('admin_faskes_purworejo.csv', toCsv(getAdminRows())));
  byId('btnLogout').addEventListener('click', () => { sessionStorage.removeItem('geohealth_admin'); location.href='login.html'; });
  byId('btnClearForm').addEventListener('click', clearForm);
  byId('facilityForm').addEventListener('submit', saveFacility);
  byId('adminTable').addEventListener('click', e => {
    const edit = e.target.closest('[data-edit]'); const del = e.target.closest('[data-delete]');
    if(edit) fillForm(adminRows.find(r=>String(r.id)===edit.dataset.edit));
    if(del) deleteFacility(del.dataset.delete);
  });
}
function getAdminRows(){
  const q = byId('adminSearch').value.toLowerCase().trim();
  return adminRows.filter(r => !q || [r.kode,r.nama,r.jenis,r.kecamatan,r.alamat].join(' ').toLowerCase().includes(q));
}
function renderAdmin(){
  const rows = getAdminRows();
  byId('adminSummary').textContent = `${fmtNumber(rows.length)} data tampil dari ${fmtNumber(adminRows.length)} data.`;
  byId('adminTable').innerHTML = rows.map(r => `<tr><td>${r.kode || '-'}</td><td>${r.nama}</td><td>${r.jenis}</td><td>${r.kecamatan}</td><td><span class="status ${r.bpjs?'ok':'warn'}">${r.bpjs?'Ya':'Tidak'}</span></td><td><span class="status ${r.igd?'ok':'warn'}">${r.igd?'24 Jam':'Tidak'}</span></td><td>${Number(r.lat).toFixed(5)}, ${Number(r.lng).toFixed(5)}</td><td><button class="btn btn-light btn-sm" data-edit="${r.id}" type="button">Edit</button> <button class="btn btn-red btn-sm" data-delete="${r.id}" type="button">Hapus</button></td></tr>`).join('');
}
function formValue(){
  const id = byId('id').value || Date.now();
  return {
    id:Number(id), kode:`FS-${String(id).slice(-6)}`, nama:byId('nama').value.trim(), jenis:byId('jenis').value, kecamatan:byId('kecamatan').value.trim(), desa:'-', alamat:byId('alamat').value.trim(),
    lat:Number(byId('lat').value), lng:Number(byId('lng').value), telepon:byId('telepon').value.trim(), jam:byId('jam').value.trim(), dokter:Number(byId('dokter').value||0), bed:Number(byId('bed').value||0), tenaga:0,
    bpjs:byId('bpjs').checked, igd:byId('igd').checked, rawat_inap:byId('rawat_inap').checked, ambulans:byId('ambulans').checked, akreditasi:'-', operasional:'Aktif', rating:0, layanan:[], updated_at:new Date().toISOString().slice(0,10)
  };
}
async function saveFacility(e){
  e.preventDefault();
  const row = formValue();
  const i = adminRows.findIndex(r=>Number(r.id)===Number(row.id));
  if(i >= 0) adminRows[i] = {...adminRows[i], ...row}; else adminRows.unshift(row);
  saveLocalFacilities(adminRows);
  try{
    await fetch('api/facilities.php', {method:i>=0?'PUT':'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(row)});
  }catch(err){}
  clearForm(); renderAdmin(); showToast('Data tersimpan.');
}
function fillForm(r){
  if(!r) return;
  ['id','nama','jenis','kecamatan','alamat','lat','lng','telepon','jam','dokter','bed'].forEach(k => byId(k).value = r[k] ?? '');
  ['bpjs','igd','rawat_inap','ambulans'].forEach(k => byId(k).checked = !!r[k]);
  window.scrollTo({top:0, behavior:'smooth'});
}
function clearForm(){ byId('facilityForm').reset(); byId('id').value=''; }
async function deleteFacility(id){
  if(!confirm('Hapus data ini?')) return;
  adminRows = adminRows.filter(r=>String(r.id)!==String(id)); saveLocalFacilities(adminRows);
  try{ await fetch(`api/facilities.php?id=${encodeURIComponent(id)}`, {method:'DELETE'}); }catch(err){}
  renderAdmin(); showToast('Data dihapus.');
}
