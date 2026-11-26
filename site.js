const visitorHome = document.querySelector('.visitor-nav a[href$="#quick"]');

if (window.self === window.top && visitorHome) {
  const destination = new URL(visitorHome.href);
  const section = location.hash;
  if (/^#(?:quick|roster|duty(?:\/(?:door|hall|inside|lead))?|evacuation(?:\/(?:map|E[1-7]))?|map)$/.test(section)) {
    destination.hash = section;
  }
  location.replace(destination.href);
}
