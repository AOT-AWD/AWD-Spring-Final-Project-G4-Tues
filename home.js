document.addEventListener('DOMContentLoaded', () => {

  // ── Lucide icons ──────────────────────────────────────────
  lucide.createIcons();

  // ── Navbar scroll shadow ──────────────────────────────────
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('s-navbar--scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── Scroll reveal ─────────────────────────────────────────
  // Elements stay fully visible by default (no opacity:0 flash).
  // When they enter the viewport we add `is-visible` which plays
  // the gentle revealUp keyframe defined in home.css once.
  const reveals = document.querySelectorAll('.s-reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(el => observer.observe(el));

});
