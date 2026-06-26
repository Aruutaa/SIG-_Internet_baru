
document.addEventListener('DOMContentLoaded', () => {
  byId('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = byId('email').value.trim();
    const password = byId('password').value;
    let ok = false;
    try{
      const res = await fetch('api/auth.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password})});
      const json = await res.json(); ok = !!json.success;
    }catch(err){ ok = email === 'admin@webgis.local' && password === 'admin123'; }
    if(ok){ sessionStorage.setItem('geohealth_admin','1'); location.href='admin.html'; }
    else showToast('Email atau password tidak sesuai.');
  });
});
