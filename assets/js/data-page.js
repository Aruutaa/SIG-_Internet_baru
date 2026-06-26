
let rows = [], activeCategory = 'Semua';
document.addEventListener('DOMContentLoaded', async () => {
  rows = await loadFacilities();
  buildCategories(); bindDataEvents(); renderCards();
});
function buildCategories(){
  const types = ['Semua', ...uniqueValues(rows,'jenis')];
  byId('categoryRow').innerHTML = types.map((t,i)=>`<button class="category-chip ${i===0?'active':''}" type="button" data-type="${t}"><span class="dot" style="background:${t==='Semua'?'#0d0d0f':typeColor(t)}"></span>${t}</button>`).join('');
}
function bindDataEvents(){
  byId('categoryRow').addEventListener('click', e => {
    const btn = e.target.closest('.category-chip'); if(!btn) return;
    activeCategory = btn.dataset.type;
    document.querySelectorAll('.category-chip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); renderCards();
  });
  byId('dataSearch').addEventListener('input', renderCards);
  byId('sortSelect').addEventListener('change', renderCards);
  byId('downloadData').addEventListener('click', () => downloadText('katalog_faskes_purworejo.csv', toCsv(getRows())));
}
function getRows(){
  const q = byId('dataSearch').value.toLowerCase().trim();
  let result = rows.filter(r => (activeCategory === 'Semua' || r.jenis === activeCategory) && (!q || [r.nama,r.jenis,r.kecamatan,r.desa,r.alamat,(r.layanan||[]).join(' ')].join(' ').toLowerCase().includes(q)));
  const sort = byId('sortSelect').value;
  if(sort === 'name') result.sort((a,b)=>a.nama.localeCompare(b.nama,'id'));
  if(sort === 'rating') result.sort((a,b)=>(b.rating||0)-(a.rating||0));
  if(sort === 'bed') result.sort((a,b)=>(b.bed||0)-(a.bed||0));
  if(sort === 'newest') result.sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')));
  return result;
}
function renderCards(){
  const result = getRows();
  byId('dataTitle').textContent = activeCategory === 'Semua' ? 'Semua data' : activeCategory;
  byId('dataSummary').textContent = `${fmtNumber(result.length)} fasilitas tampil dari ${fmtNumber(rows.length)} data.`;
  byId('facilityCards').innerHTML = result.map(row => `
    <article class="card data-card">
      <div class="data-thumb"><span class="badge" style="background:${typeColor(row.jenis)}">${row.jenis}</span></div>
      <div class="data-body">
        <div class="meta"><span>${row.updated_at || '-'}</span><span>•</span><span>${row.kecamatan}</span><span>•</span><span>Rating ${row.rating || '-'}</span></div>
        <h3>${row.nama}</h3>
        <p>${row.alamat}. Layanan utama: ${(row.layanan||[]).slice(0,4).join(', ') || '-'}.</p>
        <div class="toolbar"><a class="btn btn-light btn-sm" href="map.html">Lihat di peta</a><span class="tag">${row.bpjs?'BPJS':'Non-BPJS'}</span><span class="tag">${row.jam || '-'}</span></div>
      </div>
    </article>`).join('') || '<div class="card"><h3>Data tidak ditemukan</h3><p>Ubah kata kunci atau kategori.</p></div>';
}
