(function () {
  'use strict';

  // ---- Navigáció: vonal csak görgetés után, mobil menü ----
  var nav = document.getElementById('nav');
  var toggle = nav && nav.querySelector('.nav__toggle');
  var toTop = document.querySelector('.to-top');

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 4);
    if (toTop) toTop.classList.toggle('is-visible', y > 480);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü megnyitása');
    }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
    });
    nav.querySelectorAll('.nav__mobile a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeMenu(); });
  }

  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // ---- Karusszel ----
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel__track');
    var count = root.querySelector('.carousel__count');
    var total = track.children.length;

    function index() { return Math.round(track.scrollLeft / track.clientWidth); }
    function go(i) {
      var n = (i + total) % total;
      track.scrollTo({ left: n * track.clientWidth, behavior: 'smooth' });
    }
    root.querySelector('.carousel__btn--prev').addEventListener('click', function () { go(index() - 1); });
    root.querySelector('.carousel__btn--next').addEventListener('click', function () { go(index() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
    });
    var t;
    track.addEventListener('scroll', function () {
      clearTimeout(t);
      t = setTimeout(function () { if (count) count.textContent = (index() + 1) + ' / ' + total; }, 60);
    }, { passive: true });
  });

  // ---- Mobilon swipe-olható kártyasorok: pöttyök az aktuális kártyához ----
  document.querySelectorAll('.swipe').forEach(function (row) {
    var items = row.children;
    if (items.length < 2) return;
    var dots = document.createElement('div');
    dots.className = 'swipe-dots';
    Array.prototype.forEach.call(items, function (item, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', (i + 1) + '. kártya');
      d.addEventListener('click', function () {
        row.scrollTo({ left: item.offsetLeft - row.firstElementChild.offsetLeft, behavior: 'smooth' });
      });
      dots.appendChild(d);
    });
    row.parentNode.insertBefore(dots, row.nextSibling);
    function update() {
      var first = row.firstElementChild.offsetLeft;
      var i = 0, best = Infinity;
      Array.prototype.forEach.call(items, function (item, j) {
        var dist = Math.abs(item.offsetLeft - first - row.scrollLeft);
        if (dist < best) { best = dist; i = j; }
      });
      Array.prototype.forEach.call(dots.children, function (d, j) { d.setAttribute('aria-current', String(j === i)); });
    }
    var t;
    row.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 50); }, { passive: true });
    update();
  });

  // ---- Referencia-videók: csak láthatóan töltődnek be és játszódnak ----
  var videos = document.querySelectorAll('.laptop__screen video');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (videos.length && 'IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    videos.forEach(function (v) { io.observe(v); });
  }

  // ---- E-mail cím másolása ----
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Kimásolva!';
        btn.classList.add('is-copied');
        setTimeout(function () { btn.textContent = label; btn.classList.remove('is-copied'); }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { window.prompt('Másold ki a címet:', text); });
      } else {
        window.prompt('Másold ki a címet:', text);
      }
    });
  });
})();
