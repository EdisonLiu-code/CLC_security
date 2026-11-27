const visitorHome = document.querySelector('.visitor-nav a[href$="#quick"]');
const isEmbedded = window.self !== window.top;
const allowedParentOrigins = new Set([
  'https://clc-dx04.pages.dev',
  'https://clc-sr-portal.pages.dev',
]);

if (!isEmbedded && visitorHome) {
  const destination = new URL(visitorHome.href);
  const section = location.hash;
  if (/^#(?:quick|roster|duty(?:\/(?:door|hall|inside|lead))?|evacuation(?:\/(?:map|E[1-7]))?|map)$/.test(section)) {
    destination.hash = section;
  }
  location.replace(destination.href);
}

const adminLoginLink = document.querySelector('[data-admin-login]');
if (adminLoginLink) {
  adminLoginLink.addEventListener('click', (event) => {
    if (!isEmbedded) return;
    event.preventDefault();

    const loginUrl = new URL(adminLoginLink.href);
    loginUrl.searchParams.set('return_to', window.location.href);
    loginUrl.searchParams.set('popup', '1');

    const width = 520;
    const height = 660;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - width) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - height) / 2));
    const popup = window.open(
      loginUrl.toString(),
      'clc-admin-login',
      `popup=yes,width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      window.top.location.href = loginUrl.toString();
    }
  });
}

window.addEventListener('message', (event) => {
  const workerOrigin = window.CLC_WORKER_ORIGIN || 'https://clc-security.piggingg.workers.dev';
  if (event.origin !== workerOrigin && !allowedParentOrigins.has(event.origin)) return;

  if (event.data?.type === 'clc-auth-complete') {
    const targetUrl = event.data.redirectUrl || 'https://clc-security.piggingg.workers.dev/public/#roster';
    window.location.href = targetUrl;
  }
});
