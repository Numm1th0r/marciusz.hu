// Oldalgenerátor: a content/ JSON fájlokból (ezeket szerkeszti a Sveltia CMS)
// statikus HTML-t ír a dist/ mappába, és mellé másolja a static/ tartalmát.
// Nincs függősége, sima Node futtatja: `node build.mjs`.
// A Cloudflare a `wrangler deploy` előtt magától lefuttatja (lásd wrangler.jsonc → build).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'dist');
const SITE_URL = 'https://marciusz.work';

// ---------------------------------------------------------------- segédek

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
const readFolder = (dir) =>
  fs.readdirSync(path.join(CONTENT, dir))
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ slug: f.replace(/\.json$/, ''), ...readJson(path.join(dir, f)) }))
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.slug.localeCompare(b.slug));

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lines = (s = '') => esc(s).replace(/\n/g, '<br>');
const list = (arr) => (Array.isArray(arr) ? arr : []);
const mailto = (email, subject) => `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
const host = (url = '') => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

// Nagyon egyszerű markdown: ## címek, bekezdések, - listák, **félkövér**, [link](url)
function markdown(src = '') {
  const inline = (t) =>
    esc(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
        const ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${href}"${ext}>${text}</a>`;
      });
  return src.trim().split(/\n{2,}/).map((block) => {
    if (block.startsWith('## ')) return `<h2>${inline(block.slice(3))}</h2>`;
    if (/^[-*] /.test(block)) return `<ul>${block.split('\n').map((l) => `<li>${inline(l.replace(/^[-*] /, ''))}</li>`).join('')}</ul>`;
    return `<p>${inline(block).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

// ---------------------------------------------------------------- tartalom

const site = readJson('site.json');
const home = readJson('home.json');
const refPage = readJson('referencia-oldal.json');
const privacy = readJson('adatkezeles.json');
const references = readFolder('referenciak');
const testimonials = readFolder('velemenyek');

// ---------------------------------------------------------------- közös részek

const WAVE = 'M0,90 C200,125 380,105 560,60 C720,20 900,15 1060,50 C1120,63 1160,78 1200,82 V120 H0 Z';
const wave = (fill, cls = '', bg = '') =>
  `<svg class="wave ${cls}" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true"${bg ? ` style="background:${bg}"` : ''}><path d="${WAVE}" fill="${fill}"/></svg>`;

const CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
const BACK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 19l-7-7 7-7M3 12h18"/></svg>';
const MAIL = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"/><path d="M3 7l9 6 9-6"/></svg>';

const ICONS = {
  landing: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M8 13h8M8 17h5"/>',
  pages: '<rect x="3" y="7" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 012 2v12"/>',
  refresh: '<path d="M21 12a9 9 0 01-15.4 6.4M3 12a9 9 0 0115.4-6.4"/><path d="M21 4v5h-5M3 20v-5h5"/>',
  pen: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
  shop: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/>',
  chat: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
};
const icon = (name) =>
  `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ffba08" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.landing}</svg>`;

function head({ title, description, urlPath, noindex = false }) {
  const url = SITE_URL + urlPath;
  return `<!DOCTYPE html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#ececec">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:locale" content="hu_HU">
<meta property="og:site_name" content="${esc(site.siteName)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/media/og-kep.jpg">
<link rel="preload" href="/assets/fonts/bowlby-one-sc-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/nunito-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/style.css">
</head>
`;
}

function nav(active) {
  const items = [
    ['home', '/', 'Kezdőoldal'],
    ['szolg', '/#szolgaltatasok', 'Szolgáltatások'],
    ['csomag', '/#csomagok', 'Csomagok'],
    ['ref', '/referenciak', 'Referencia'],
  ];
  const cur = (k) => (k === active ? ' aria-current="page"' : '');
  return `<header class="nav" id="nav">
  <div class="container nav__inner">
    <a class="logo" href="/" aria-label="István Marci – kezdőoldal">IM</a>
    <nav class="nav__links" aria-label="Fő navigáció">
      ${items.map(([k, h, t]) => `<a class="nav__link" href="${h}"${cur(k)}>${t}</a>`).join('\n      ')}
      <a class="nav__cta" href="#kapcsolat">Kapcsolat</a>
    </nav>
    <button class="nav__toggle" type="button" aria-label="Menü megnyitása" aria-expanded="false" aria-controls="mobile-menu">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#32292f" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>
  <nav class="nav__mobile" id="mobile-menu" aria-label="Mobil navigáció">
    ${items.map(([k, h, t]) => `<a href="${h}"${cur(k)}>${t}</a>`).join('\n    ')}
    <a class="nav__cta" href="#kapcsolat">Kapcsolat</a>
  </nav>
</header>
`;
}

function contactAndFooter() {
  const tips = list(site.contactTips);
  return `
<section class="contact" id="kapcsolat" aria-labelledby="kapcsolat-cim">
  <div class="container contact__grid">
    <div class="contact__main">
      <h2 class="display h2" id="kapcsolat-cim">${lines(site.contactHeading)}</h2>
      <p class="contact__sub">${esc(site.contactText)}</p>
      <div class="mail-card">
        <a class="mail-card__link" href="${mailto(site.email)}">
          <span class="mail-card__icon">${MAIL}</span>
          <span class="mail-card__address">${esc(site.email)}</span>
        </a>
        <div class="mail-card__actions">
          <a class="btn btn--yellow btn--sm" href="${mailto(site.email, 'Ajánlatkérés')}">E-mailt írok</a>
          <button class="btn btn--ghost-light btn--sm" type="button" data-copy="${esc(site.email)}">Cím másolása</button>
        </div>
      </div>
      ${site.contactNote ? `<p class="contact__note">${CHECK}<span>${esc(site.contactNote)}</span></p>` : ''}
    </div>
    <div class="contact__side">
      ${site.contactImage ? `<img class="contact__img" src="${esc(site.contactImage)}" alt="" loading="lazy" decoding="async">` : ''}
      ${tips.length ? `<div class="tips">
        <h3 class="tips__title">${esc(site.contactTipsHeading)}</h3>
        <ul>${tips.map((t) => `<li>${CHECK}<span>${esc(t)}</span></li>`).join('')}</ul>
      </div>` : ''}
    </div>
  </div>
</section>
${wave('#32292f', 'wave--flush', '#19647e')}
<footer class="footer">
  <div class="container footer__inner">
    <div class="footer__brand">
      <a class="footer__logo" href="/" aria-label="Kezdőoldal">IM</a>
      <div>
        <p class="footer__copy">${esc(site.footerText)}</p>
        ${site.credits ? `<p class="footer__credits">${esc(site.credits)}</p>` : ''}
      </div>
    </div>
    <nav class="footer__links" aria-label="Lábléc">
      <a href="/referenciak">Referenciák</a>
      <a href="${mailto(site.email)}">${esc(site.email)}</a>
      <a href="/adatkezeles">Adatkezelés és sütik</a>
    </nav>
  </div>
</footer>

<button class="to-top" type="button" aria-label="Vissza a tetejére">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11l7-7 7 7M12 4v16"/></svg>
</button>
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

const page = (meta, active, main) => `${head(meta)}<body>\n${nav(active)}<main>\n${main}\n</main>\n${contactAndFooter()}`;

// ---------------------------------------------------------------- kezdőoldal

function renderHome() {
  const { hero, services, packages, reference } = home;
  const li = (t) => `<li>${CHECK}<span>${esc(t)}</span></li>`;

  const serviceCards = list(services.items).map((s) => {
    const tag = s.link ? 'a' : 'div';
    const href = s.link ? ` href="${esc(s.link)}"` : '';
    return `<${tag} class="glass-card"${href}>
          ${icon(s.icon)}
          <h3 class="display h3">${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
          ${s.link && s.linkLabel ? `<span class="more">${esc(s.linkLabel)}</span>` : ''}
        </${tag}>`;
  }).join('\n        ');

  const packageCards = list(packages.items).map((p) => `<article class="package${p.featured ? ' package--featured' : ''}">
          ${p.badge ? `<span class="package__badge">${esc(p.badge)}</span>` : ''}
          <h3 class="display">${esc(p.title)}</h3>
          <p class="body-text package__desc">${esc(p.description)}</p>
          <ul class="package__list">${list(p.features).map(li).join('')}</ul>
          ${p.duration ? `<p class="package__meta">${esc(p.durationLabel || 'Átfutás:')} <strong>${esc(p.duration)}</strong></p>` : ''}
          <div class="package__foot"><a class="btn ${p.featured ? 'btn--yellow' : 'btn--dark'} btn--sm" href="${mailto(site.email, `Ajánlatkérés: ${p.title}`)}">${esc(p.buttonLabel || 'Ezt kérem')}</a></div>
        </article>`).join('\n        ');

  const tiles = list(reference.tiles).map((t, i) => `<div class="tile tile--${t.shape === 'square' ? 'square' : 'tall'}${i % 2 ? ' tile--offset' : ''}">
          <div class="tile__strip">
            <img src="${esc(t.image1)}" alt="" loading="lazy" decoding="async">
            <img src="${esc(t.image2 || t.image1)}" alt="" loading="lazy" decoding="async">
          </div>
        </div>`).join('\n        ');

  const quotes = testimonials.map((q, i) => `<figure class="quote">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#ffba08" aria-hidden="true"><path d="M7 7h4v10H3V11c0-2.2 1.8-4 4-4zm10 0h4v10h-8V11c0-2.2 1.8-4 4-4z"/></svg>
          <blockquote>${esc(q.quote)}</blockquote>
          <figcaption>
            <div class="avatar avatar--${i % 3}">${esc((q.name || '?').trim().charAt(0).toUpperCase())}</div>
            <div><div class="quote__name">${esc(q.name)}</div>${q.role ? `<div class="quote__role">${esc(q.role)}</div>` : ''}</div>
          </figcaption>
        </figure>`).join('\n        ');

  const main = `
  <section class="hero section--light" id="kezdooldal">
    <div class="container hero__grid">
      <div>
        ${hero.eyebrow ? `<p class="eyebrow">${esc(hero.eyebrow)}</p>` : ''}
        <h1 class="display h1">${lines(hero.heading)}</h1>
        <p class="lead">${esc(hero.lead)}</p>
        <div class="btn-row">
          <a class="btn btn--blue" href="#kapcsolat">${esc(hero.primaryLabel)}</a>
          <a class="btn btn--ghost" href="/referenciak">${esc(hero.secondaryLabel)}</a>
        </div>
      </div>
      <div class="hero-art">
        <div class="hero-art__frame">
          <img src="${esc(hero.image)}" alt="${esc(hero.imageAlt)}" fetchpriority="high">
        </div>
      </div>
    </div>
    ${wave('#19647e', 'wave--tight')}
  </section>

  <section class="section section--blue on-blue" id="szolgaltatasok" aria-labelledby="szolg-cim">
    <div class="container">
      <div class="section-head">
        <h2 class="display h2" id="szolg-cim">${lines(services.heading)}</h2>
        <p class="lead">${esc(services.lead)}</p>
      </div>
      <div class="cards swipe">
        ${serviceCards}
      </div>
    </div>
    ${wave('#ececec')}
  </section>

  <section class="section section--light" id="csomagok" aria-labelledby="csomag-cim">
    <div class="container">
      <div class="section-head">
        <h2 class="display h2" id="csomag-cim">${lines(packages.heading)}</h2>
        <p class="lead">${esc(packages.lead)}</p>
      </div>
      <div class="packages swipe">
        ${packageCards}
      </div>
      ${packages.note ? `<div class="packages-note">
        <p>${esc(packages.note)}</p>
        <a href="${mailto(site.email, 'Segíts választani')}">${esc(packages.noteLink)}</a>
      </div>` : ''}
    </div>
    ${wave('#32292f')}
  </section>

  <section class="section section--dark on-dark" id="referencia" aria-labelledby="ref-cim">
    <div class="container ref__grid">
      <div class="tiles" aria-hidden="true">
        ${tiles}
      </div>
      <div class="ref__text">
        <h2 class="display h2" id="ref-cim">${lines(reference.heading)}</h2>
        <p class="lead">${esc(reference.text)}</p>
        <div class="btn-row">
          <a class="btn btn--yellow" href="/referenciak">${esc(reference.primaryLabel)}</a>
          <a class="btn btn--ghost-light" href="#kapcsolat">${esc(reference.secondaryLabel)}</a>
        </div>
      </div>
    </div>
    ${wave(testimonials.length ? '#ececec' : '#19647e')}
  </section>
${testimonials.length ? `
  <section class="section section--light" id="visszajelzesek" aria-labelledby="vissza-cim">
    <div class="container">
      <h2 class="display h2" id="vissza-cim">${lines(home.testimonials?.heading || 'Visszajelzések')}</h2>
      <div class="quotes swipe">
        ${quotes}
      </div>
    </div>
    ${wave('#19647e')}
  </section>` : ''}`;

  return page({ title: home.title, description: home.description, urlPath: '/' }, 'home', main);
}

// ---------------------------------------------------------------- referenciák

function renderReferences() {
  const g = refPage.gallery || {};
  const images = list(g.images);

  const projects = references.map((r, i) => `
      <article class="project${i % 2 ? ' project--flip' : ''}" id="${esc(r.slug)}">
        <div class="project__text">
          <h2 class="display h2--card">${esc(r.title)}</h2>
          <div class="tags">${list(r.tags).map((t, j) => `<span class="tag${j === 0 ? ' tag--dark' : ''}">${esc(t)}</span>`).join('')}</div>
          <p class="body-text">${esc(r.description)}</p>
          ${r.url ? `<a class="btn btn--dark btn--sm" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(refPage.projectButtonLabel || 'Megnézem az oldalt')}</a>` : ''}
        </div>
        <div class="project__media">
          <div class="browser">
            <div class="browser__bar" aria-hidden="true"><span class="browser__dots"><i></i><i></i><i></i></span><span class="browser__url">${esc(host(r.url))}</span></div>
            <div class="browser__screen">
              ${r.video
                ? `<video muted loop playsinline preload="none"${r.poster ? ` poster="${esc(r.poster)}"` : ''} aria-label="${esc(r.title)} weboldal bemutató videója"><source src="${esc(r.video)}" type="video/mp4"></video>`
                : r.poster ? `<img src="${esc(r.poster)}" alt="${esc(r.title)} weboldal" loading="lazy" decoding="async">` : ''}
            </div>
          </div>
        </div>
      </article>`).join('');

  const slides = images.map((im, i) =>
    `            <div class="carousel__slide"><img src="${esc(im.image)}" alt="${esc(im.alt)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async"></div>`).join('\n');

  const main = `
  <section class="page-top section--light">
    <div class="container container--narrow">
      <a class="back" href="/">${BACK}Vissza</a>
      <h1 class="display h2 page-title">${lines(refPage.heading)}</h1>
      <p class="lead">${esc(refPage.lead)}</p>

      <div class="projects">${projects}
      </div>
${images.length ? `
      <div class="gallery" id="polok-karikaturak">
        <div class="carousel" data-carousel>
          <div class="carousel__track" tabindex="0" aria-label="${esc(g.heading)}, lapozható galéria">
${slides}
          </div>
          <button class="carousel__btn carousel__btn--prev" type="button" aria-label="Előző kép"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>
          <button class="carousel__btn carousel__btn--next" type="button" aria-label="Következő kép"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>
          <span class="carousel__count" aria-hidden="true">1 / ${images.length}</span>
        </div>
        <div>
          <h2 class="display h2--card">${lines(g.heading)}</h2>
          <p class="body-text">${esc(g.text)}</p>
          <a class="btn btn--dark btn--sm" href="${mailto(site.email, g.heading || 'Grafika')}">${esc(g.buttonLabel)}</a>
        </div>
      </div>` : ''}
    </div>
    ${wave('#19647e')}
  </section>`;

  return page({ title: refPage.title, description: refPage.description, urlPath: '/referenciak' }, 'ref', main);
}

// ---------------------------------------------------------------- adatkezelés, 404, karbantartás

function renderPrivacy() {
  const main = `
  <section class="page-top section--light">
    <div class="container" style="max-width:860px">
      <a class="back" href="/">${BACK}Vissza</a>
      <div class="doc">
        <h1 class="display">${esc(privacy.title)}</h1>
        ${privacy.updated ? `<p class="updated">Utolsó frissítés: ${esc(privacy.updated)}</p>` : ''}
        ${markdown(privacy.body)}
      </div>
    </div>
    ${wave('#19647e')}
  </section>`;
  return page({ title: `${privacy.title} – István Marci`, description: 'Adatkezelési és süti-tájékoztató a marciusz.work weboldalhoz.', urlPath: '/adatkezeles' }, '', main);
}

function render404() {
  const main = `
  <section class="section--light">
    <div class="center-page">
      <div class="center-page__box">
        <div class="big-num">404</div>
        <h1 class="display">Hoppá, eltévedtél?</h1>
        <p class="lead">Ezt az oldalt nem találom. Lehet, hogy elírás van a címben, vagy időközben áthelyeztem. A főoldalon mindent megtalálsz!</p>
        <div class="btn-row">
          <a class="btn btn--dark" href="/">Vissza a főoldalra</a>
          <a class="btn btn--ghost" href="/referenciak">Referenciák</a>
        </div>
      </div>
    </div>
    ${wave('#19647e')}
  </section>`;
  return page({ title: 'Az oldal nem található – István Marci', description: 'A keresett oldal nem található.', urlPath: '/404', noindex: true }, '', main);
}

function renderMaintenance() {
  return `${head({ title: 'Karbantartás – István Marci', description: 'Az oldal karbantartás alatt áll.', urlPath: '/karbantartas', noindex: true })}<body class="maintenance">
<main class="center-page">
  <div class="center-page__box maintenance__card">
    <div class="maintenance__icon">
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#32292f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    </div>
    <h1 class="display">Karbantartás</h1>
    <p class="lead">Épp csinosítom az oldalt, hogy még jobb legyen. Nézz vissza egy kicsit később!</p>
    <p class="lead">Addig is elérsz e-mailben: <a href="${mailto(site.email)}"><strong>${esc(site.email)}</strong></a></p>
  </div>
</main>
</body>
</html>
`;
}

// ---------------------------------------------------------------- kiírás

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'static'), OUT, { recursive: true });

const pages = {
  'index.html': renderHome(),
  'referenciak.html': renderReferences(),
  'adatkezeles.html': renderPrivacy(),
  '404.html': render404(),
  'karbantartas.html': renderMaintenance(),
};
for (const [file, html] of Object.entries(pages)) fs.writeFileSync(path.join(OUT, file), html);

fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', '/referenciak', '/adatkezeles'].map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`);

console.log(`Kész: ${Object.keys(pages).length} oldal, ${references.length} referencia, ${testimonials.length} vélemény → dist/`);
