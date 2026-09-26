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

  // ---- Csomag gombok: előre kiválasztják a témát az űrlapon ----
  var topic = document.getElementById('topic');
  document.querySelectorAll('[data-package]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (topic) topic.value = el.getAttribute('data-package');
    });
  });

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

  // ---- Laptop képernyőképek: a "Betöltés…" felirat eltüntetése ----
  document.querySelectorAll('.laptop__screen img').forEach(function (img) {
    function done() { var l = img.parentNode.querySelector('.loading'); if (l) l.remove(); }
    if (img.complete && img.naturalWidth) done(); else img.addEventListener('load', done);
  });

  // ---- Kapcsolati űrlap ----
  var card = document.getElementById('form-card');
  var form = document.getElementById('contact-form');
  if (!form) return;
  var errorBox = form.querySelector('.form__error');
  var submit = form.querySelector('.form__submit');
  form.elements.t.value = String(Date.now());

  function showError(msg) {
    errorBox.innerHTML = msg;
    errorBox.classList.add('is-visible');
  }

  // JS nélküli beküldés után a szerver ide irányít vissza
  if (/[?&]elkuldve=1/.test(location.search)) {
    card.classList.add('is-sent');
    history.replaceState(null, '', location.pathname + '#kapcsolat');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.classList.remove('is-visible');

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    if (!name || !email || !message) return showError('Kérlek, tölts ki minden mezőt.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Úgy tűnik, elírtad az e-mail címed.');

    submit.disabled = true;
    submit.textContent = 'Küldés…';

    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        if (!r.ok) throw new Error(r.data && r.data.error);
        form.reset();
        form.elements.t.value = String(Date.now());
        card.classList.add('is-sent');
      })
      .catch(function (err) {
        showError((err && err.message ? err.message + ' ' : 'Valami hiba történt a küldés közben. ') +
          'Írj nekem közvetlenül: <a href="mailto:info@marciusz.work">info@marciusz.work</a>');
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = 'Üzenet küldése';
      });
  });

  document.getElementById('form-reset').addEventListener('click', function () {
    card.classList.remove('is-sent');
  });
})();
