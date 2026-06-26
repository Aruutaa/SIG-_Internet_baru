async function login(email,password){
  try{const res=await tryJson(`${API_BASE}/login.php`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});localStorage.setItem('geohealth_user',JSON.stringify(res.user));return {ok:true,mode:'database'}}
  catch(e){if(email==='admin@webgis.local'&&password==='admin123'){localStorage.setItem('geohealth_user',JSON.stringify({name:'Administrator Demo',email,role:'admin',mode:'demo'}));return {ok:true,mode:'demo'}};return {ok:false,error:e.message}}
}
async function registerUser(name,email,password){
  try{const res=await tryJson(`${API_BASE}/register.php`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});return {ok:true,user:res.user,mode:'database'}}
  catch(e){const user={name,email,role:'public',mode:'demo'};localStorage.setItem('geohealth_user',JSON.stringify(user));return {ok:true,user,mode:'demo',warning:e.message}}
}
async function getMe(){try{const res=await tryJson(`${API_BASE}/me.php`);if(res.authenticated){localStorage.setItem('geohealth_user',JSON.stringify(res.user));return res.user}}catch(e){} try{return JSON.parse(localStorage.getItem('geohealth_user')||'null')}catch(e){return null}}
async function logout(){try{await tryJson(`${API_BASE}/logout.php`,{method:'POST'})}catch(e){} localStorage.removeItem('geohealth_user'); location.href='login.html'}
document.addEventListener('DOMContentLoaded',()=>{
  qsa('[data-auth-tab]').forEach(btn=>btn.addEventListener('click',()=>{qsa('[data-auth-tab]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const tab=btn.dataset.authTab;qs('#loginPane')?.classList.toggle('hidden',tab!=='login');qs('#registerPane')?.classList.toggle('hidden',tab!=='register')}));
  const form=qs('#loginForm'); if(form){form.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(form);const msg=qs('#loginMsg');msg.innerHTML='<div class="notice">Memproses login...</div>';const res=await login(fd.get('email'),fd.get('password')); if(res.ok){msg.innerHTML=`<div class="success">Login berhasil. Mode: ${res.mode}.</div>`; setTimeout(()=>location.href='admin.html',700)} else msg.innerHTML='<div class="notice">Login gagal. Periksa email, password, atau koneksi API.</div>';})}
  const reg=qs('#registerForm'); if(reg){reg.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(reg);const msg=qs('#registerMsg');msg.innerHTML='<div class="notice">Membuat akun...</div>';const res=await registerUser(fd.get('name'),fd.get('email'),fd.get('password')); if(res.ok){msg.innerHTML=`<div class="success">Akun berhasil dibuat sebagai public user. Mode: ${res.mode}.</div>`; setTimeout(()=>location.href='map.html',900)} else msg.innerHTML='<div class="notice">Akun gagal dibuat.</div>';})}
});
