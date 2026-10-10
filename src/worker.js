// Minden kérés ezen megy át: karbantartó módban a karbantartas.html-t adja vissza,
// egyébként a dist/ mappa statikus fájljait szolgálja ki.

// Karbantartás alatt is elérhető útvonalak (stílusok, képek, és a CMS, hogy szerkeszteni lehessen).
const MAINTENANCE_ALLOW = ['/css/', '/js/', '/assets/', '/media/', '/admin', '/favicon', '/icon-', '/apple-touch-icon', '/site.webmanifest', '/robots.txt'];

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

    return env.ASSETS.fetch(request);
  },
};
