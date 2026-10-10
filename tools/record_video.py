"""Egységes referencia-videó egy weboldal főoldaláról.

Végiggörget a teljes főoldalon (lágy indulás/megállás), a végén visszaúszik
a tetejére, így a videó hézagmentesen ismétlődik. Kimenet: 960x600-as mp4 és
egy webp állókép, amit a CMS-ben a referenciához csatolhatsz.

Kell hozzá: pip install playwright pillow, valamint ffmpeg és Chrome.
Használat:
  python3 tools/record_video.py https://pelda.hu/ pelda
  → static/media/referencia/pelda.mp4 és pelda-poster.webp
"""
import io, math, subprocess, sys, time
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

FPS = 30
W, H = 1280, 800
OUT = Path(__file__).resolve().parent.parent / 'static' / 'media' / 'referencia'

# Süti-ablakok, előtöltők, beúszó animációk elrejtése, hogy tiszta legyen a kép
CSS = '''html{scroll-behavior:auto!important}
.elementor-invisible{visibility:visible!important;opacity:1!important}
#loftloader-wrapper,.cookie-alert,.loader-section,.pl-square,#CybotCookiebotDialog{display:none!important}
::-webkit-scrollbar{display:none}'''

def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * t)

def timeline(maxy):
    n = int(FPS * min(max(maxy / 700, 4), 13))   # kb. 700 px/mp, 4–13 mp
    return [0] * 24 + [maxy * ease(i / (n - 1)) for i in range(n)] + [maxy] * 30

def record(url, name):
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        page = browser.new_page(viewport={'width': W, 'height': H})
        page.goto(url, wait_until='networkidle', timeout=90000)
        time.sleep(2)
        for text in ['Elfogadom', 'Összes elfogadása', 'Elfogad', 'Accept', 'Bezár']:
            try:
                el = page.get_by_text(text, exact=True).first
                if el.is_visible():
                    el.click(timeout=2000); time.sleep(0.6)
            except Exception:
                pass
        page.mouse.move(W - 10, H - 10)
        height = page.evaluate('document.documentElement.scrollHeight')
        for y in range(0, height, 300):          # lusta képek betöltése
            page.evaluate(f'window.scrollTo(0,{y})'); time.sleep(0.12)
        page.add_style_tag(content=CSS)
        page.evaluate("""[...document.querySelectorAll('body *')].forEach(e=>{const s=getComputedStyle(e);const r=e.getBoundingClientRect();if(s.position==='fixed'&&r.top>500&&r.height<200)e.style.display='none'})""")
        page.evaluate('window.scrollTo(0,0)'); time.sleep(1.5)
        maxy = page.evaluate('document.documentElement.scrollHeight') - H

        frames = []
        for y in timeline(maxy):
            page.evaluate(f'window.scrollTo(0,{int(round(y))})'); time.sleep(0.03)
            shot = Image.open(io.BytesIO(page.screenshot(type='jpeg', quality=95))).convert('RGB')
            frames.append(shot.resize((960, 600), Image.LANCZOS))
        frames += [Image.blend(frames[-1], frames[0], ease((i + 1) / 18)) for i in range(18)]
        browser.close()

    frames[0].save(OUT / f'{name}-poster.webp', 'WEBP', quality=82)
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-vcodec', 'png', '-i', '-',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
           str(OUT / f'{name}.mp4')]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in frames:
        buf = io.BytesIO(); f.save(buf, 'PNG', compress_level=1); proc.stdin.write(buf.getvalue())
    proc.stdin.close(); proc.wait()
    print(f'Kész: static/media/referencia/{name}.mp4 ({len(frames)} képkocka)')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    record(sys.argv[1], sys.argv[2])
