/* =============================================
   JOGI PANGGABEAN — Portfolio
   Nav + mobile menu (3D + scroll handled by orbital-journey.js)
   ============================================= */

/* ── Nav scroll effect ── */
const nav = document.getElementById('global-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile menu ── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});
