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

  // ---- Mobilon lapozható sorok (kártyasorok, galéria): pöttyök az aktuális elemhez ----
  document.querySelectorAll('.swipe, [data-carousel] .carousel__track').forEach(function (row) {
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
    var anchor = row.closest('[data-carousel]') || row;
    anchor.parentNode.insertBefore(dots, anchor.nextSibling);
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

  // ---- Referencia-videók: csak láthatóan (és a pakli tetején) játszódnak ----
  var videos = document.querySelectorAll('.laptop__screen video');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function syncVideo(v) {
    var card = v.closest('.project');
    var hidden = card && card.getAttribute('data-deck-hidden') === '1';
    if (v.getAttribute('data-inview') === '1' && !hidden && !reduceMotion) {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      v.pause();
    }
  }
  if (videos.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.setAttribute('data-inview', en.isIntersecting ? '1' : '0');
        syncVideo(en.target);
      });
    }, { threshold: 0.35 });
    videos.forEach(function (v) { io.observe(v); });
  }

  // ---- Referenciák mobilon: Tinder-szerű, húzható pakli ----
  var deck = document.querySelector('.projects');
  if (deck && deck.children.length > 1) {
    var mq = window.matchMedia('(max-width: 759px)');
    var cards = Array.prototype.slice.call(deck.querySelectorAll(':scope > .project'));
    var order = cards.slice();
    // ugyanaz a pötty-sor, mint a többi lapozható sor alatt
    var controls = document.createElement('div');
    controls.className = 'swipe-dots';
    cards.forEach(function (c, j) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', (j + 1) + '. referencia: ' + (c.querySelector('h2') || c).textContent.trim());
      d.addEventListener('click', function () { next(-1, c); });
      controls.appendChild(d);
    });
    var dotsWrap = controls;
    var hint = document.createElement('p');
    hint.className = 'swipe-hint';
    hint.textContent = 'Húzd oldalra a következő referenciához';
    var busy = false, dragged = false, ro = null;

    function top() { return order[0]; }
    function fitHeight() { deck.style.height = (top().offsetHeight + 16) + 'px'; }
    function layout() {
      order.forEach(function (c, i) {
        c.style.zIndex = String(order.length - i);
        c.setAttribute('data-deck-hidden', i === 0 ? '0' : '1');
        c.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
        if (i === 0) { c.style.transform = ''; c.style.opacity = '1'; c.style.visibility = 'visible'; }
        else if (i === 1) { c.style.transform = 'translateY(14px) scale(0.95)'; c.style.opacity = '1'; c.style.visibility = 'visible'; }
        else { c.style.transform = 'translateY(14px) scale(0.95)'; c.style.opacity = '0'; c.style.visibility = 'hidden'; }
      });
      Array.prototype.forEach.call(dotsWrap.children, function (d, j) { d.setAttribute('aria-current', String(cards[j] === top())); });
      if (ro) { ro.disconnect(); ro.observe(top()); }
      fitHeight();
      videos.forEach(syncVideo);
    }
    // a legfelső kártyát kidobja; ha van cél, addig forgat, amíg az kerül felülre
    function next(dir, target) {
      if (busy || target === top()) return;
      busy = true;
      var c = top();
      c.classList.add('is-dragging');
      c.style.transition = 'transform .35s ease-in, opacity .35s ease-in';
      c.style.transform = 'translateX(' + (dir * 130) + '%) rotate(' + (dir * 18) + 'deg)';
      c.style.opacity = '0';
      setTimeout(function () {
        order.push(order.shift());
        if (target) while (order[0] !== target) order.push(order.shift());
        c.classList.remove('is-dragging');
        c.style.transition = 'none';
        layout();
        void c.offsetWidth;
        c.style.transition = '';
        busy = false;
      }, 340);
    }
    // húzás
    var sx = 0, sy = 0, dx = 0, mode = null, pid = null;
    function onDown(e) {
      if (!deck.classList.contains('is-deck') || busy || e.button > 0) return;
      if (e.currentTarget !== top()) return;
      sx = e.clientX; sy = e.clientY; dx = 0; mode = null; pid = e.pointerId; dragged = false;
    }
    function onMove(e) {
      if (pid !== e.pointerId || mode === 'scroll') return;
      var mx = e.clientX - sx, my = e.clientY - sy;
      if (!mode) {
        if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) {
          mode = 'drag';
          try { top().setPointerCapture(pid); } catch (err) {}
          top().style.transition = 'none';
          top().classList.add('is-dragging');
        } else if (Math.abs(my) > 8) { mode = 'scroll'; return; } else return;
      }
      dx = mx;
      dragged = true;
      top().style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 16) + 'deg)';
    }
    function onUp(e) {
      if (pid !== e.pointerId) return;
      pid = null;
      if (mode !== 'drag') { mode = null; return; }
      mode = null;
      var c = top();
      c.style.transition = '';
      c.classList.remove('is-dragging');
      if (Math.abs(dx) > c.offsetWidth * 0.25) next(dx > 0 ? 1 : -1);
      else c.style.transform = '';
      setTimeout(function () { dragged = false; }, 0);
    }
    cards.forEach(function (c) {
      c.addEventListener('pointerdown', onDown);
      c.addEventListener('pointermove', onMove);
      c.addEventListener('pointerup', onUp);
      c.addEventListener('pointercancel', onUp);
      c.addEventListener('click', function (e) { if (dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
      c.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });

    function setup() {
      if (mq.matches) {
        deck.classList.add('is-deck');
        if (!controls.parentNode) { deck.parentNode.insertBefore(controls, deck.nextSibling); deck.parentNode.insertBefore(hint, controls.nextSibling); }
        if ('ResizeObserver' in window) ro = ro || new ResizeObserver(fitHeight);
        layout();
      } else {
        deck.classList.remove('is-deck');
        deck.style.height = '';
        if (ro) ro.disconnect();
        if (controls.parentNode) { controls.remove(); hint.remove(); }
        cards.forEach(function (c) {
          ['transform', 'opacity', 'visibility', 'zIndex', 'transition'].forEach(function (k) { c.style[k] = ''; });
          c.removeAttribute('data-deck-hidden');
          c.removeAttribute('aria-hidden');
        });
        order = cards.slice();
        videos.forEach(syncVideo);
      }
    }
    if (mq.addEventListener) mq.addEventListener('change', setup); else mq.addListener(setup);
    window.addEventListener('resize', function () { if (deck.classList.contains('is-deck')) fitHeight(); });
    setup();
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
