# marciusz.work – István Marci, weboldal-készítés

Statikus weboldal Cloudflare Workeren, [Sveltia CMS](https://sveltiacms.app)-sel szerkeszthető tartalommal.
A `main` ágra pusholás (vagy CMS-mentés) után a Cloudflare Workers Builds magától élesít: a `wrangler deploy` előbb lefuttatja a `node build.mjs`-t, ami a `content/` mappából legenerálja az oldalakat a `dist/` mappába.

## Szerkesztés a CMS-ben

1. Nyisd meg: **https://marciusz.work/admin/**
2. **Sign In Using Access Token** → illeszd be a GitHub tokenedet (a felugró ablakban van link a token létrehozásához, a jogosultságok előre ki vannak jelölve).
3. Szerkessz, majd **Save**. A mentés egy commit a `main` ágra, 1–2 perc múlva élesben van.

| Menüpont | Mit takar |
|---|---|
| **Oldalak → Kezdőoldal** | Nyitó blokk, szolgáltatás-kártyák, csomagok, referencia blokk és a képcsempék |
| **Oldalak → Referenciák oldal** | Bevezető, a pólók és karikatúrák galéria képei |
| **Oldalak → Adatkezelés** | Az adatkezelési tájékoztató szövege |
| **Oldalak → Kapcsolat és lábléc** | E-mail cím, kapcsolat-blokk szövegei és tippjei, lábléc |
| **Referenciák** | A weboldal-referenciák, újat is hozzáadhatsz |
| **Vélemények** | Ügyfélvélemények, újat is hozzáadhatsz |

A feltöltött képeket a CMS automatikusan webp-re alakítja és legfeljebb 2000 px-re kicsinyíti. A csempékhez és a galériához **négyzetes vagy álló** képek valók; a keretet mindig kitöltik, ezért a szélük levágódhat.

Helyben, bejelentkezés nélkül: `npx wrangler dev`, majd http://localhost:8787/admin/ → **Work with Local Repository** (Chrome/Edge).

## Új referencia videója

Minden referenciához egységes, görgetős videó tartozik (960×600, a teljes főoldalon végigmegy):

```
pip install playwright pillow      # + ffmpeg és Chrome
python3 tools/record_video.py https://pelda.hu/ pelda
```

Ez a `static/media/referencia/pelda.mp4` és `pelda-poster.webp` fájlokat készíti el. Ezeket a CMS-ben a referencia **Videó** és **Állókép** mezőjébe válaszd ki (vagy pushold, és a JSON-ban add meg az útvonalukat).

## Felépítés

```
content/                a szerkeszthető tartalom (ezt írja a CMS)
  home.json             kezdőoldal
  referencia-oldal.json referenciák oldal + galéria
  adatkezeles.json      adatkezelési tájékoztató (markdown)
  site.json             e-mail, kapcsolat-blokk, lábléc
  referenciak/*.json    egy fájl = egy referencia
  velemenyek/*.json     egy fájl = egy vélemény
static/                 változatlanul kerül ki: css, js, betűk, faviconok
  media/                képek és videók (ide tölt fel a CMS is)
  admin/                a CMS: index.html, config.yml, vendor/
build.mjs               oldalgenerátor (függőség nélküli Node)
src/worker.js           karbantartó mód
tools/record_video.py   referencia-videó készítése
dist/                   generált kimenet (nincs verziókezelve)
```

**Fontos:** a `static/admin/config.yml` és a `build.mjs` ugyanazokat a mezőket használja. Ha a CMS-ben új mezőt veszel fel, a `build.mjs`-ben is jelenítsd meg.

## 404 oldal

Magától működik: a `wrangler.jsonc` `"not_found_handling": "404-page"` beállítása miatt minden nem létező címen a 404 oldal jelenik meg, valódi 404-es státusszal.

## Karbantartó mód

1. A `wrangler.jsonc`-ben: `"MAINTENANCE": "true"`
2. Push a `main`-re. Pár perc múlva minden oldal helyén a karbantartás oldal jelenik meg (503-as státusszal, ami a Google-nek jelzi, hogy átmeneti). A `/admin/` ilyenkor is elérhető.
3. Visszakapcsolás: `"false"`, és újra push.

## E-mail

Az info@marciusz.work címre érkező leveleket a Cloudflare Email Routing továbbítja a saját postafiókodba (Cloudflare dashboard → marciusz.work → Email → Email Routing → Routing rules).

## Helyi futtatás

```
npx wrangler dev        # lefuttatja a buildet is, http://localhost:8787
node build.mjs          # csak a dist/ generálása
```
