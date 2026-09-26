# marciusz.work – István Marci, weboldal-készítés

Statikus weboldal Cloudflare Workeren. A `main` ágra pusholás után a Cloudflare Workers Builds automatikusan élesít (`npx wrangler deploy`).

## Felépítés

```
public/                 ← ez kerül ki a webre (csak ez!)
  index.html            Kezdőoldal: hero, szolgáltatások, csomagok, referencia, folyamat, visszajelzések
  referenciak.html      /referenciak – weboldalak + pólók/karikatúrák galéria
  adatkezeles.html      /adatkezeles – adatkezelési és süti-tájékoztató
  404.html              automatikusan megjelenik minden nem létező címen
  karbantartas.html     karbantartó mód oldala
  css/style.css         minden stílus
  js/main.js            menü, karusszel, űrlapküldés
  assets/img/…          képek (webp)
  assets/fonts/…        saját tárhelyről betöltött betűtípusok (nincs Google Fonts hívás)
src/worker.js           űrlapküldés (/api/contact) + karbantartó mód
wrangler.jsonc          Cloudflare beállítások
```

A navigáció és a lábléc (kapcsolati űrlappal) minden HTML oldalban benne van. Ha módosítod, mindegyik oldalon módosítsd.

## Képek cseréje

A képek csak kódból cserélhetők, nincs feltöltő felület.

- **Pólók és karikatúrák galéria**: `public/assets/img/carousel/` + a `referenciak.html` `carousel__slide` sorai. Új kép: tedd be webp-ként (kb. 1100 px), és másolj le egy `carousel__slide` sort. A számláló (`1 / 10`) magától frissül lapozáskor, de a kezdő értékét írd át.
- **Főoldali referencia csempék**: `public/assets/img/ref/` + az `index.html` `tile__strip` blokkjai. Minden csempében két kép váltakozik. Átlátszó hátterű rajzhoz add a `class="contain"`-t.
- **Laptopban görgő képernyőképek**: `public/assets/img/projects/`. 1000 px széles, teljes oldalas képernyőkép. A `--end` érték adja meg, meddig görgessen (pl. `-76%`).

## 404 oldal

Magától működik: a `wrangler.jsonc`-ben a `"not_found_handling": "404-page"` miatt minden nem létező címen a `public/404.html` jelenik meg, valódi 404-es státusszal.

## Karbantartó mód

1. A `wrangler.jsonc`-ben írd át: `"MAINTENANCE": "true"`
2. Pushold a `main` ágra, és pár perc múlva minden oldal helyén a `karbantartas.html` jelenik meg (503-as státusszal, ami a Google-nek jelzi, hogy ez átmeneti).
3. Visszakapcsolás: `"false"`, és újra push.

Sürgős esetben a Cloudflare dashboardon is átírhatod (Workers → marciusz-hu → Settings → Variables), de a következő push felülírja a `wrangler.jsonc` értékével.

## Kapcsolati űrlap

Az űrlap a `/api/contact` címre küld. A Worker a Cloudflare Email Routinggal e-mailt küld a `CONTACT_TO` secretben megadott (ellenőrzött) címre. A válasz gomb közvetlenül a feladónak válaszol.

- Címzett módosítása: Cloudflare dashboard → Workers → marciusz-hu → Settings → Variables and Secrets → `CONTACT_TO`. Csak az Email Routingban **ellenőrzött** cím lehet.
- Spam elleni védelem: rejtett „csapda” mező + 3 másodperces időkorlát.
- JavaScript nélkül is működik (sima form POST, utána visszairányít).

## Helyi futtatás

```
npx wrangler dev --var CONTACT_TO:teszt@example.com
```

Helyben az e-mail nem megy ki, a wrangler `.eml` fájlba menti.
