# Handoff: Marciusz.hu — István Marci portfólió oldal

## Overview
Egyoldalas (SPA-szerű) személyes portfólió oldal egy magyar hobbi-grafikusnak. Bemutatja a szolgáltatásokat (pólótervezés, karikatúra, weboldal, egyedi grafika), a referencia weboldalakat, egy feltölthető kép-karusszelt pólókról/karikatúrákról, és egy kapcsolatfelvételi űrlapot. Nézetek közti váltás kliensoldali state-tel történik, oldalújratöltés nélkül.

## About the Design Files
A csomagban lévő fájlok **HTML-ben készült design referenciák** — prototípusok, amik a szándékolt megjelenést és viselkedést mutatják, nem közvetlenül másolható produkciós kód. A feladat ezeknek a designoknak az **újraalkotása a cél kódbázis meglévő környezetében** (React, Vue, Astro, sima statikus HTML, stb.), annak bevett mintáit és könyvtárait használva — vagy ha még nincs környezet, a projekthez legjobban illő megoldás kiválasztása és abban való implementálás.

Megjegyzés: a `index.html` egy önálló, offline is működő build — GitHub Pages-re azonnal feltölthető, ha nem kell kódbázisba integrálás. A `reference/Portfolio.dc.html` az eredeti, olvasható forrás.

## Fidelity
**High-fidelity (hifi).** Végleges színek, tipográfia, térközök és interakciók. A UI-t pixelpontosan kell újraalkotni, a kódbázis meglévő könyvtáraival és mintáival.

## Screens / Views
A kliensoldali `view` state öt értéket vehet fel: `home`, `websites`, `notfound`, `maintenance`, `cookies`.

### Közös elemek

**Sticky navigáció** (minden nézetben)
- Fix a viewport tetején, `z-index` a tartalom felett; háttér `#ececec`, alsó szegély `1px solid rgba(50,41,47,0.10)`.
- Belső szélesség max `1240px`, középre; vízszintes padding `clamp(16px, 4vw, 32px)`; magasság `clamp(78px, 9vw, 96px)`; flex, `space-between`, `align-items:center`.
- **Logó**: `48px × 48px` (mobil `44px`) négyzet, `background:#32292f`, `border-radius:14px`, benne "IM" felirat — Bowlby One SC, `clamp(18px,2.2vw,22px)`, `letter-spacing:0.03em`, `color:#ffffff`. Kattintásra a `home` nézetre visz.
- **Menüpontok** (desktop, `≥1024px`): Kezdőoldal, Rólam, Szolgáltatások, Referencia, Kapcsolat. Nunito `700`, `15px`, `letter-spacing:0.02em`, `color:#32292f`; hover `color:#19647e`. Gap `clamp(20px,2.4vw,36px)`.
- **Mobil menü** (`<1024px`): hamburger ikon, lenyíló panel `background:#ececec`, elemek egymás alatt, `18px` betűméret.
- A "Rólam" menüpont a Szolgáltatások szekcióra navigál (a Rólam szekció el lett távolítva).

**Footer**
- Fölötte dekoratív hullám SVG: `viewBox="0 0 1200 120"`, `preserveAspectRatio="none"`, magasság `clamp(38px,6vw,88px)`, `fill:#19647e`, `margin-bottom:-1px`.
- Footer háttér `#19647e`, padding `clamp(48px,6vw,72px) 0`. Belső konténer max `1240px`, flex, `wrap`, `gap:32px`, `space-between`.
- Bal oldal: `48px × 48px` fehér négyzet `border-radius:14px`, benne "IM" Bowlby One SC `20px` `#32292f`; alatta/mellette copyright: Nunito `600`, `14px`, `rgba(255,255,255,0.55)` — "© 2026 István Marci. Minden jog fenntartva."
- Jobb oldal: linkek a `notfound`, `maintenance`, `cookies` nézetekre (fejlesztői/technikai aloldalak).

**Hullám-elválasztók**
A szekciók között ugyanaz az SVG path ismétlődik, a következő szekció színére töltve:
```
M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.2,192.21,115.68,236.4,113.25,279.79,93.64,321.39,56.44Z
```
Mindegyik egy `waves` prop-tól függ (kikapcsolható).

---

### 1. `home` — Kezdőoldal

**Hero**
- Háttér `#ececec`; felső padding `calc(clamp(78px,9vw,96px) + clamp(40px,7vw,80px))` (a sticky nav magassága + levegő).
- Kétkolumnás grid: `repeat(auto-fit, minmax(min(100%,340px),1fr))`, `gap:clamp(32px,5vw,72px)`, `align-items:center`.
- **Bal kolumna**:
  - Eyebrow: Nunito `800`, `13px`, `letter-spacing:0.22em`, `text-transform:uppercase`, `color:#19647e`, `margin-bottom:18px` — "Hobbi-grafikus · Debrecen"
  - H1: Bowlby One SC, `clamp(58px,11vw,128px)`, `line-height:0.92`, `letter-spacing:0.03em`, `color:#32292f`, uppercase — "Szia!"
  - Bevezető: Nunito `500`, `clamp(16px,1.5vw,19px)`, `line-height:1.7`, `color:rgba(50,41,47,0.82)`, `max-width:48ch`, `margin-top:24px`, `text-wrap:pretty`
  - Két gomb, flex `gap:14px`, `margin-top:36px`:
    - Primary "Kapcsolat": `background:#19647e`, `color:#ffffff`, padding `18px 34px`, `border-radius:999px`, Bowlby One SC `clamp(16px,1.4vw,19px)` uppercase; hover `transform:translateY(-4px)`; active `translateY(0)`; `transition:transform .2s, background .2s`
    - Secondary "Munkáim": átlátszó háttér, `color:#32292f`, `border:2px solid rgba(50,41,47,0.35)`, padding `16px 32px`; hover `background:rgba(50,41,47,0.08)`, `border-color:#32292f`, `translateY(-4px)`
- **Jobb kolumna**: karakter-illusztráció (`assets/char-portrait.png`), `max-width:min(360px,72vw)`, mögötte radiális glow `radial-gradient(closest-side, rgba(110,196,222,0.24), transparent 70%)` `filter:blur(10px)`. Az illusztráció `animation: floaty 7s ease-in-out infinite` (lásd Animations).
- Alján hullám `fill:#19647e`.

**Szolgáltatások** (`id="szolgaltatasok"`)
- Háttér `#19647e`, padding `clamp(56px,8vw,104px) 0 0`.
- Szekció-címsor: Bowlby One SC, `clamp(34px,5.4vw,64px)`, `line-height:1.02`, `color:#ffffff`, uppercase.
- **Kártyarács**: `display:flex`, `flex-wrap:wrap`, `gap:clamp(16px,2vw,28px)`. Minden kártya `flex:1 1 380px; max-width:calc(50% - clamp(8px,1vw,14px))` — **soronként maximum 2 kártya**, mobilon 1.
- Négy kártya (Pólótervezés, Karikatúra, Weboldal, Egyedi ötlet), mind azonos stílusú (egyik sem kiemelt):
  - `background:rgba(255,255,255,0.09)`, `border:1px solid rgba(255,255,255,0.22)`, `border-radius:28px`, padding `clamp(28px,3vw,40px)`, `color:#ffffff`
  - hover: `transform:translateY(-8px)`, `background:rgba(255,255,255,0.15)`; `transition:transform .3s, background .3s`
  - Ikon: `44px × 44px` SVG, `stroke`/`fill: #ffba08`, `stroke-width:2`, `margin-bottom:20px`
  - H3: Bowlby One SC, `clamp(21px,2.1vw,27px)`, uppercase, `margin-bottom:12px`
  - Leírás: Nunito `500`, `16px`, `line-height:1.65`, `rgba(255,255,255,0.82)`
  - A "Weboldal" kártya `<button>`, kattintásra a `websites` nézetre navigál; szövege: "Nézd meg a portfóliómat és a korábbi oldalakat →"

**Referencia** (`id="referencia"`)
- Kétkolumnás: bal oldalon szöveg, jobb oldalon 4 csempés kép-grid `grid-template-columns:1fr 1fr`, `gap:clamp(12px,1.4vw,18px)`.
- Csempék: 2 db `aspect-ratio:3/4` és 2 db `aspect-ratio:1/1`, `border-radius:24px`, `overflow:hidden`; a 2. és 4. csempe `margin-top:clamp(20px,4vw,40px)` (elcsúsztatott, masonry-szerű ritmus).
- Minden csempe **két képet** tartalmaz egy vízszintes "filmszalagban": `display:flex; width:200%; height:100%`, benne két `width:50%; flex-shrink:0` elem. A szalag `animation: refSlideRow 8s infinite` — a képek be/kicsúsznak (slide in / slide out), nem áttűnnek.
- A képhelyek felhasználó által feltölthető placeholderek (lásd Assets).

**Kapcsolat** (`id="kapcsolat"`)
- Háttér `#19647e`, padding `clamp(56px,8vw,104px) 0 clamp(64px,9vw,120px)`.
- Fehér kártya: `background:#ffffff`, `border-radius:32px`, padding `clamp(24px,4vw,52px)`, `margin-top:clamp(28px,4vw,44px)`.
- Űrlap mezők: név, e-mail, üzenet. Elküldés után `sent` state → visszajelző állapot (lásd State Management).
- Fölötte sárga CTA-sáv: `background:#ffba08`, `border-radius:32px`, padding `clamp(28px,4vw,52px)`, flex `wrap`, `gap:24px`, `space-between`.
- A szekció után hullám `fill:#32292F` (a mögötte lévő terület `background:#19647e`).

---

### 2. `websites` — Weboldalaim

Referencia weboldalak listája, mindegyik egy `<article>` kártya:
- `background:#ffffff`, `border-radius:32px`, padding `clamp(24px,3.4vw,52px)`
- Grid `repeat(auto-fit, minmax(min(100%,280px),1fr))`, `gap:clamp(24px,4vw,52px)`, `align-items:center`
- Bal: szöveg (H2 Bowlby One SC `clamp(24px,3vw,40px)` `line-height:1.08` `#32292f` uppercase; leírás; CTA link). Jobb: böngésző-mockup a screenshottal.
- **Minden második projekt tükrözve**: a 2. kártyán a szövegoszlop `order:2`, a mockup `order:1` — így a mockup balra kerül. (1. és 3. változatlan.)
- CTA link: `background:#32292f`, `color:#ffffff`, padding `17px 30px`, `border-radius:999px`, Bowlby One SC `16px` uppercase; hover `background:#19647e`, `translateY(-4px)`.

**"Pólók és karikatúrák" blokk** (a projektek után)
- `background:#ffffff`, `border-radius:32px`, padding `clamp(24px,3.4vw,52px)`, `margin-top:clamp(20px,3vw,36px)`
- Grid `repeat(auto-fit, minmax(min(100%,320px),1fr))`, `gap:clamp(24px,4vw,52px)`, `align-items:center`
- **Bal: swipe-olható kép-karusszel**
  - Külső keret: `position:relative`, `aspect-ratio:4/3`, `border-radius:24px`, `overflow:hidden`
  - Görgetősáv: `display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; scrollbar-width:none` — natív touch swipe
  - 8 slide, mind `flex:0 0 100%; scroll-snap-align:center; height:100%`; a képek `object-fit:contain`, középre igazítva (nagy képek nem lógnak ki és nem vágódnak)
  - Nyíl-gombok: `40px × 40px`, `border-radius:999px`, `background:rgba(255,255,255,0.9)`, `color:#32292f`, `box-shadow:0 4px 10px rgba(0,0,0,0.15)`; balra `left:12px`, jobbra `right:12px`, `top:50%`, `transform:translateY(-50%)`
  - **Végtelen (körkörös) léptetés**: a jobb szélen a következő gomb `scrollLeft = 0`-ra ugrik, a bal szélen az előző a végére — mindkettő `behavior:'smooth'`
- **Jobb: szöveg** — H2 "Pólók és karikatúrák" (Bowlby One SC `clamp(24px,3vw,40px)` uppercase `#32292f`); bekezdés Nunito `500` `16px` `line-height:1.7` `rgba(50,41,47,0.82)` `max-width:44ch`: karikatúra fotóról, pólóminta tervezése és nyomdakész digitalizálása, vázlat vagy régi kép is elég. CTA gomb "Szólj, ha kellene egy" → `kapcsolat` szekció.

### 3. `notfound` / `maintenance` / `cookies`
Technikai aloldalak ugyanazzal a nav/footer kerettel: 404, karbantartás alatt, süti-tájékoztató. Központosított szöveg-blokk, visszairányító gombbal a kezdőoldalra.

## Interactions & Behavior
- **Navigáció**: `view` state váltás, nincs oldalújratöltés. Szekció-linkek `home` nézeten belül smooth scrollal az `id`-hoz; más nézetből először `home`-ra váltás, majd scroll.
- **Mobil menü**: `menu` boolean, hamburger nyitja/zárja; navigációra automatikusan záródik.
- **Kártya hover**: `translateY(-8px)` + világosabb háttér, `.3s`.
- **Gomb hover**: `translateY(-4px)`, `.2s`; active `translateY(0)`.
- **Referencia csempék**: `refSlideRow` 8s végtelen slide-váltás két kép között (CSS-only, nincs JS).
- **Karusszel**: natív horizontális scroll + scroll-snap (touch swipe működik); nyílgombok `scrollBy(clientWidth)` / körkörös átugrás.
- **Scroll-to-top gomb**: `showTop` state, `window.scrollY` alapján jelenik meg.
- **Kapcsolat űrlap**: submit → `sent: true`, sikeres visszajelzés. (Nincs backend — a cél kódbázisban be kell kötni.)
- **Reszponzív**: minden grid `auto-fit` + `minmax`, egykolumnásra esik; a mobil nav breakpointja `1024px`.

## State Management
```js
{
  view: 'home',      // 'home' | 'websites' | 'notfound' | 'maintenance' | 'cookies'
  menu: false,       // mobil menü nyitva
  mobile: window.innerWidth < 1024,  // resize listener frissíti
  showTop: false,    // scroll-to-top gomb látható
  sent: false        // kapcsolat űrlap elküldve
}
```
Ref: `carouselRef` — a karusszel görgetősávjára, a nyílgombok használják.

Prop: `waves` (default `true`) — a dekoratív hullám-elválasztók be/kikapcsolása.

Data fetching: nincs. Egyetlen backend-igény a kapcsolat űrlap elküldése (e-mail vagy form-endpoint).

## Design Tokens

**Colors**
| Token | Hex | Használat |
| --- | --- | --- |
| Sötét | `#32292f` | fő szövegszín, logó háttér, CTA gomb |
| Kék (brand) | `#19647e` | szolgáltatások + kapcsolat szekció, footer, primary gomb, eyebrow |
| Világoskék | `#6ec4de` | hero glow (`rgba(110,196,222,0.24)`) |
| Sárga (accent) | `#ffba08` | kártya-ikonok, CTA sáv |
| Világos háttér | `#ececec` | nav, hero, oldalháttér |
| Fehér | `#ffffff` | kártyák, űrlap |
| Szöveg 82% | `rgba(50,41,47,0.82)` | bekezdés világos háttéren |
| Szöveg fehér 82% | `rgba(255,255,255,0.82)` | bekezdés kék háttéren |
| Kártya háttér | `rgba(255,255,255,0.09)` | glass kártyák |
| Kártya szegély | `rgba(255,255,255,0.22)` | glass kártyák |

**Typography**
- Display: **Bowlby One SC** (Google Fonts) — `letter-spacing:0.03em`, `text-transform:uppercase`. H1 `clamp(58px,11vw,128px)` / `line-height:0.92`; H2 `clamp(34px,5.4vw,64px)` / `1.02`; kártya-H2 `clamp(24px,3vw,40px)` / `1.08`; H3 `clamp(21px,2.1vw,27px)`; gombok `clamp(16px,1.4vw,19px)`.
- Body: **Nunito** (Google Fonts), `400/500/600/700/800/900`. Bevezető `clamp(16px,1.5vw,19px)` / `1.7`; bekezdés `16px` / `1.65–1.7`; nav `15px` `700`; eyebrow `13px` `800` `letter-spacing:0.22em`; footer `14px` `600`.

**Spacing** — `clamp()` alapú fluid skála: szekció padding `clamp(56px,8vw,104px)`, konténer padding `clamp(16px,4vw,32px)`, kártya padding `clamp(28px,3vw,40px)`, gap `clamp(16px,2vw,28px)` / `clamp(24px,4vw,52px)`. Konténer max szélesség `1240px`.

**Border radius** — `14px` (logó négyzet), `18px`, `24px` (csempe, karusszel), `28px` (kártya), `32px` (nagy kártya), `999px` (pill gomb).

**Shadows** — `0 4px 10px rgba(0,0,0,0.15)` (karusszel nyílgomb). Egyébként árnyék helyett elevation `translateY` + háttér-váltás.

**Animations**
```css
@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-14px); }
}
@keyframes refSlideRow {
  0%, 42%  { transform: translateX(0); }
  50%, 92% { transform: translateX(-50%); }
  100%     { transform: translateX(0); }
}
```
`floaty 7s ease-in-out infinite` — hero illusztráció. `refSlideRow 8s infinite` — referencia csempék képváltása.

## Assets
`reference/assets/`:
- `char-portrait.png` — karakter-illusztráció kék ingben (hero, jobb kolumna)
- `char-chat.png`, `char-sitting.png` — további karakter-pózok (jelenleg nem használtak, tartalék)
- weboldal-screenshotok a `websites` nézet böngésző-mockupjaihoz

**Feltölthető képhelyek**: a referencia csempék (8 db) és a "Pólók és karikatúrák" karusszel (8 db) placeholder komponenst használnak — a designban a felhasználó dobja be a saját képeit, és a választás perzisztálódik. A cél kódbázisban ezeket **valódi `<img>` elemekre kell cserélni** a végleges pólóterv/karikatúra fotókkal; a placeholder mechanizmus csak a prototípus kényelmi eszköze. Kép-illesztés: karusszel `object-fit:contain` (középre, nem vágva), csempék `object-fit:cover`.

**Fontok**: Google Fonts — Bowlby One SC és Nunito (400–900).

## Files
- `index.html` — önálló, offline működő build (minden inline-olva). Statikus hostinghoz (pl. GitHub Pages) azonnal használható.
- `reference/Portfolio.dc.html` — az olvasható forrás: teljes markup, inline stílusok, logika (nézetváltás, karusszel, űrlap).
- `reference/assets/` — a designban használt képek.

## Suggested next steps for the developer
1. Ha statikus oldal a cél: `index.html` a repo gyökerébe, GitHub Pages bekapcsolása — kész.
2. Ha kódbázisba integrálás: `reference/Portfolio.dc.html` a pixelpontos referencia; a fenti tokenekkel és szekció-leírásokkal újraalkotni a cél framework komponenseiben.
3. Kapcsolat űrlap backend bekötése (form endpoint vagy e-mail szolgáltatás).
4. Placeholder képhelyek helyére a végleges pólóterv/karikatúra fotók.
