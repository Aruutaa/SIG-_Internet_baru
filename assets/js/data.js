let rows=[], source='—', activeCategory='', sortMode='terbaru';
function normalize(feature, idx){
  const p=getProps(feature), ll=getLatLng(feature);
  const layanan = Array.isArray(p.layanan) ? p.layanan.join(', ') : (p.layanan || p.daftar_layanan || '');
  return {no:idx+1,id:p.id||idx+1,kode_faskes:p.kode_faskes||p.kode||`FS-${idx+1}`,nama_faskes:p.nama_faskes||p.nama||'Tanpa nama',jenis_faskes:p.jenis_faskes||p.jenis||'Lainnya',kecamatan:p.kecamatan||'-',desa:p.desa||'-',alamat:p.alamat||'-',latitude:Number(p.latitude??p.lat??ll?.lat),longitude:Number(p.longitude??p.lng??ll?.lng),telepon:p.telepon||'-',jam_layanan:p.jam_layanan||p.jam_operasional||p.jam||'-',bpjs:asBool(p.bpjs),igd_24_jam:asBool(p.igd_24_jam??p.igd),rawat_inap:asBool(p.rawat_inap),ambulans:asBool(p.ambulans),kapasitas_tempat_tidur:Number(p.kapasitas_tempat_tidur??p.bed??0),jumlah_dokter:Number(p.jumlah_dokter??p.dokter??0),jumlah_tenaga_kesehatan:Number(p.jumlah_tenaga_kesehatan??p.tenaga??0),rating:Number(p.rating??0),layanan,sumber_data:p.sumber_data||'-',catatan:p.catatan||''}
}
function asBool(v){return v===true || v===1 || v==='1' || v==='t' || v==='true' || v==='Ya'}
function filteredRows(){
  const q=qs('#dtSearch').value.trim().toLowerCase();
  let out=rows.filter(r=>(!activeCategory||r.jenis_faskes===activeCategory)&&(!q||Object.values(r).join(' ').toLowerCase().includes(q)));
  out=[...out];
  if(sortMode==='nama') out.sort((a,b)=>a.nama_faskes.localeCompare(b.nama_faskes));
  if(sortMode==='jenis') out.sort((a,b)=>a.jenis_faskes.localeCompare(b.jenis_faskes)||a.nama_faskes.localeCompare(b.nama_faskes));
  if(sortMode==='kecamatan') out.sort((a,b)=>a.kecamatan.localeCompare(b.kecamatan)||a.nama_faskes.localeCompare(b.nama_faskes));
  if(sortMode==='terbaru') out.sort((a,b)=>Number(b.id)-Number(a.id));
  return out;
}
function statusTags(r){return [r.bpjs?'BPJS':null,r.igd_24_jam?'IGD 24 Jam':null,r.rawat_inap?'Rawat Inap':null,r.ambulans?'Ambulans':null].filter(Boolean)}
function render(){
  const f=filteredRows();
  qs('#dtBody').innerHTML=f.map((r,i)=>`<tr><td>${i+1}</td><td><b>${escapeHTML(r.nama_faskes)}</b><br><small>${escapeHTML(r.kode_faskes)}</small></td><td><span class="toy-chip" style="border-color:${getTypeColor(r.jenis_faskes)}">${escapeHTML(r.jenis_faskes)}</span></td><td>${escapeHTML(r.kecamatan)}</td><td>${statusTags(r).map(x=>`<span class="mini-tag">${x}</span>`).join(' ')}<br><small>${escapeHTML(r.jam_layanan)} • Dokter ${r.jumlah_dokter} • Bed ${r.kapasitas_tempat_tidur}</small></td><td>${Number(r.latitude).toFixed(6)}, ${Number(r.longitude).toFixed(6)}</td><td>${escapeHTML(r.sumber_data)}</td></tr>`).join('')||'<tr><td colspan="7">Data tidak ditemukan.</td></tr>';
  qs('#cardList').innerHTML=f.slice(0,12).map(r=>`<article class="publication-card"><div class="pub-cover" style="--card-color:${getTypeColor(r.jenis_faskes)}"><span>${escapeHTML(r.jenis_faskes)}</span></div><div class="pub-body"><div class="pub-meta">${escapeHTML(r.kecamatan)} • ${escapeHTML(r.kode_faskes)}</div><h3>${escapeHTML(r.nama_faskes)}</h3><p>${escapeHTML(r.alamat)}</p><div class="pub-tags">${statusTags(r).map(x=>`<span>${x}</span>`).join('') || '<span>Atribut dasar</span>'}</div><small>${escapeHTML(r.jam_layanan)} • Rating ${r.rating || '-'}</small></div></article>`).join('') || '<p class="mini-text">Data tidak ditemukan.</p>';
}
function renderCategories(){
  const counts=countBy(rows,'jenis_faskes');
  const types=Object.keys(counts).sort();
  qs('#categoryRow').innerHTML=`<button class="category-pill ${activeCategory===''?'active':''}" data-type="">Semua <span>${rows.length}</span></button>`+types.map(t=>`<button class="category-pill ${activeCategory===t?'active':''}" data-type="${escapeHTML(t)}">${escapeHTML(t)} <span>${counts[t]}</span></button>`).join('');
  qsa('.category-pill').forEach(btn=>btn.addEventListener('click',()=>{activeCategory=btn.dataset.type||'';renderCategories();render();updateOverview();}));
}
function updateOverview(){
  const data=filteredRows();
  const byType=countBy(rows,'jenis_faskes'), byKec=countBy(data,'kecamatan');
  const [dom,domN]=topEntry(byType);const [topK,topN]=topEntry(byKec);const [lowK,lowN]=topEntry(byKec,true);
  qs('#dtTotal').textContent=formatNum(data.length);qs('#dtKec').textContent=formatNum(Object.keys(byKec).length);qs('#dtSource').textContent=source==='database'?'Database':'GeoJSON';qs('#dtDominant').textContent=dom==='-'?'—':`${dom} (${domN})`;
  qs('#dtInterpretation').textContent = `Jenis fasilitas paling banyak adalah ${dom} sebanyak ${domN} titik. Hasil filter menampilkan wilayah terbanyak ${topK} (${topN} titik) dan wilayah paling sedikit ${lowK} (${lowN} titik). Atribut kesehatan yang tersedia meliputi BPJS, IGD 24 jam, rawat inap, ambulans, tenaga kesehatan, dokter, tempat tidur, dan jam layanan.`;
}
async function main(){const res=await loadFacilities();source=res.source;rows=res.data.features.map(normalize).filter(r=>Number.isFinite(r.latitude)&&Number.isFinite(r.longitude));renderCategories();updateOverview();render();}
document.addEventListener('DOMContentLoaded',()=>{main().catch(console.error);qs('#dtSearch').addEventListener('input',()=>{render();updateOverview();});qs('#dtSort').addEventListener('change',()=>{sortMode=qs('#dtSort').value;render();});qs('#dtExport').addEventListener('click',()=>download('katalog_fasilitas_kesehatan.csv',toCSV(filteredRows()),'text/csv'))});
