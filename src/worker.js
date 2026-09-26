import { EmailMessage } from 'cloudflare:email';

// Karbantartás alatt is elérhető útvonalak (a karbantartó oldal stílusai, képei).
const MAINTENANCE_ALLOW = ['/css/', '/js/', '/assets/', '/favicon', '/icon-', '/apple-touch-icon', '/site.webmanifest', '/robots.txt'];

const FROM = 'urlap@marciusz.work';
const TOPICS = [
  'Landoló oldal',
  'Komplex weboldal',
  'Meglévő weboldal felújítása',
  'Grafika (logó, illusztráció, póló, karikatúra)',
  'Még nem tudom, segíts dönteni',
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (env.MAINTENANCE === 'true' && !MAINTENANCE_ALLOW.some((p) => url.pathname.startsWith(p))) {
      const page = await env.ASSETS.fetch(new Request(new URL('/karbantartas', url)));
      return new Response(page.body, {
        status: 503,
        headers: { 'content-type': 'text/html; charset=utf-8', 'retry-after': '3600', 'cache-control': 'no-store' },
      });
    }

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const reply = (status, body) => {
    if (wantsJson) return Response.json(body, { status });
    // JS nélküli beküldés: vissza az oldalra
    const back = new URL(request.headers.get('referer') || '/', request.url);
    if (status === 200) back.searchParams.set('elkuldve', '1');
    back.hash = 'kapcsolat';
    return status === 200
      ? Response.redirect(back.toString(), 303)
      : new Response(body.error, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  };

  let form;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { error: 'Hibás kérés.' });
  }

  const field = (k) => String(form.get(k) || '').trim();
  const name = field('name').slice(0, 100);
  const email = field('email').slice(0, 200);
  const message = field('message').slice(0, 5000);
  const topic = TOPICS.includes(field('topic')) ? field('topic') : 'Nincs megadva';

  // Spam-szűrés: kitöltött rejtett mező, vagy 3 mp-en belüli beküldés. A robot "sikert" lát.
  const t = Number(field('t'));
  if (field('website') || (t && Date.now() - t < 3000)) return reply(200, { ok: true });

  if (!name || !email || !message) return reply(400, { error: 'Kérlek, tölts ki minden mezőt.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, { error: 'Úgy tűnik, elírtad az e-mail címed.' });

  if (!env.CONTACT_TO || !env.CONTACT_EMAIL) {
    console.error('Hiányzó CONTACT_TO secret vagy CONTACT_EMAIL binding');
    return reply(500, { error: 'Az űrlap most nem elérhető.' });
  }

  const raw = buildMime({
    from: FROM,
    fromName: 'marciusz.work űrlap',
    to: env.CONTACT_TO,
    replyTo: email,
    subject: `Új ajánlatkérés: ${name} (${topic})`,
    text: [
      `Név: ${name}`,
      `E-mail: ${email}`,
      `Téma: ${topic}`,
      '',
      'Üzenet:',
      message,
      '',
      '—',
      `Küldve: ${new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' })}`,
      'A válasz gombbal közvetlenül a feladónak válaszolsz.',
    ].join('\n'),
  });

  try {
    await env.CONTACT_EMAIL.send(new EmailMessage(FROM, env.CONTACT_TO, raw));
  } catch (err) {
    console.error('E-mail küldési hiba:', err && err.message);
    return reply(502, { error: 'Nem sikerült elküldeni az üzenetet.' });
  }
  return reply(200, { ok: true });
}

// Egyszerű, UTF-8 szöveges MIME üzenet (fejléc-injektálás ellen szűrve).
function buildMime({ from, fromName, to, replyTo, subject, text }) {
  const clean = (s) => String(s).replace(/[\r\n]+/g, ' ');
  const b64 = (s) => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  };
  // RFC 2047: egy kódolt szó legfeljebb 75 karakter, ezért rövid darabokra bontjuk
  const encodeWords = (s) => (s.match(/[\s\S]{1,16}/gu) || ['']).map((c) => `=?UTF-8?B?${b64(c)}?=`).join('\r\n ');
  const body = b64(text.replace(/\r?\n/g, '\r\n')).replace(/.{1,76}/g, '$&\r\n');
  return [
    `From: =?UTF-8?B?${b64(clean(fromName))}?= <${clean(from)}>`,
    `To: ${clean(to)}`,
    `Reply-To: ${clean(replyTo)}`,
    `Subject: ${encodeWords(clean(subject))}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@marciusz.work>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    body,
  ].join('\r\n');
}
