const link = location.hash.slice(1);
const status = document.getElementById('status');
if (!window.CLC_WORKER_ORIGIN) {
  status.textContent = '安總網站尚未連線。';
  status.hidden = false;
} else {
  const worker = new URL(window.CLC_WORKER_ORIGIN);
  for (const [id, path] of [['sign-in', '/auth/start'], ['backend', '/manage']]) {
    const tab = document.getElementById(id);
    tab.href = new URL(path, worker);
    tab.hidden = false;
  }
  const portal = document.getElementById('portal');
  const sharedLink = /^[A-Za-z0-9_-]{43}$/.test(link);
  portal.src = new URL(sharedLink ? '/view/' + link + '/' : '/public/', worker);
  if (sharedLink) document.getElementById('home-link').href = location.href;
  document.body.dataset.view = 'portal';
  portal.hidden = false;
  document.getElementById('entrance').hidden = true;
}
