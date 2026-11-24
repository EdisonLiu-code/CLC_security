const link = location.hash.slice(1);
const status = document.getElementById('status');
if (!window.CLC_WORKER_ORIGIN) {
  status.textContent = '安總網站尚未連線。';
  status.hidden = false;
} else {
  const worker = new URL(window.CLC_WORKER_ORIGIN);
  const login = document.getElementById('sign-in');
  login.href = new URL('/auth/start', worker);
  login.hidden = false;
  if (/^[A-Za-z0-9_-]{43}$/.test(link)) {
    const portal = document.getElementById('portal');
    portal.src = new URL('/view/' + link + '/', worker);
    portal.hidden = false;
    document.getElementById('entrance').hidden = true;
  } else if (link) {
    status.textContent = '分享連結有誤，請重新開啟教會提供的完整連結。';
    status.hidden = false;
  }
}
