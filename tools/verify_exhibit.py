#!/usr/bin/env python3
"""Pre-commit gate for one new Curio exhibit.

usage: python3 tools/verify_exhibit.py [<curio-repo>] <slug> <out-dir>

Runs the static checks (tools/check_repo.py) on exhibits/<slug>/, builds the site into
<out-dir>/site exactly as the Pages workflow does, serves it, drives Chromium with Playwright
and checks the exhibit page, its mini.js in the hall, that the 3D hall, The Stacks, ?list and
?exhibit= still work. Screenshots and report.json land in <out-dir>. Exit code 1 if any FAIL.
"""
import http.server
import io
import json
import re
import socketserver
import sys
import threading
import time
from functools import partial
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_site  # noqa: E402
import check_repo  # noqa: E402

SITE = "https://blackman99.github.io/curio/"
# warnings the hall already emits for every exhibit; not ours to fix
KNOWN_NOISE = ("Allow attribute will take precedence over 'allowfullscreen'",)
ALLOWED_HOSTS = {"127.0.0.1", "fonts.googleapis.com", "fonts.gstatic.com"}

results = []


def check(name, ok, detail="", warn=False):
    level = "PASS" if ok else ("WARN" if warn else "FAIL")
    results.append({"check": name, "level": level, "detail": detail})
    print(f"[{level}] {name}" + (f" — {detail}" if detail else ""), flush=True)
    return ok


def png_size(p):
    with Image.open(p) as im:
        return im.size


def busy(png_bytes):
    """Std-dev of luminance: ~0 means a blank screen."""
    a = np.asarray(Image.open(io.BytesIO(png_bytes)).convert("L"), dtype=np.float32)
    return float(a.std())


def diff(a, b):
    x = np.asarray(Image.open(io.BytesIO(a)).convert("L"), dtype=np.float32)
    y = np.asarray(Image.open(io.BytesIO(b)).convert("L"), dtype=np.float32)
    return float(np.abs(x - y).mean()) if x.shape == y.shape else 999.0


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(root):
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), partial(Quiet, directory=str(root)))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def headless_shell(p):
    """The pip Playwright may want a browser build that isn't downloaded; fall back to the newest one on disk."""
    if Path(p.chromium.executable_path).exists():
        return None
    cache = Path.home() / "Library/Caches/ms-playwright"
    build = lambda q: int(re.search(r"-(\d+)/", str(q)).group(1))
    found = sorted(cache.glob("chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell"), key=build)
    found = found or sorted(cache.glob("chromium-*/chrome-mac*/*.app/Contents/MacOS/*"), key=build)
    if not found:
        sys.exit("no Chromium found: run `python3 -m playwright install chromium-headless-shell`")
    return str(found[-1])


def visit(page, url, label):
    """Navigate; a slow 'load' (Google Fonts, the network) is a warning, not a crash."""
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    try:
        page.wait_for_load_state("load", timeout=20000)
    except Exception:
        check(f"{label}: load event within 20 s", False, "slow network or a hanging request", warn=True)


def watch(page, bag):
    page.on("console", lambda m: bag.append(f"console.{m.type}: {m.text}") if m.type == "error" and not any(k in m.text for k in KNOWN_NOISE) else None)
    page.on("pageerror", lambda e: bag.append(f"pageerror: {e}"))
    page.on("requestfailed", lambda r: bag.append(f"requestfailed: {r.url} {r.failure}") if "favicon.ico" not in r.url else None)


def main():
    args = sys.argv[1:]
    if len(args) == 2:
        args = [Path(__file__).resolve().parent.parent] + args
    repo, slug, out = Path(args[0]).resolve(), args[1], Path(args[2]).resolve()
    out.mkdir(parents=True, exist_ok=True)

    # ---- static checks (shared with CI) --------------------------------
    check_repo.results = results
    check_repo.check = check
    allm = check_repo.load_all(repo)
    if not check(f"exhibits/{slug}/ exists", slug in allm):
        return finish(out)
    check_repo.check_exhibit(slug, allm[slug], repo)
    good = [m for m in allm.values() if isinstance(m, dict) and "_error" not in m]
    for f in ("slug", "no", "exhibit"):
        vals = [m.get(f) for m in good]
        dup = sorted({str(v) for v in vals if vals.count(v) > 1})
        check(f"{f} values are unique", not dup, ", ".join(dup))
    entry = allm[slug] if isinstance(allm[slug], dict) else {}
    nos = [str(m.get("no", "")) for m in good]
    check("number is the highest", str(entry.get("no")) == max(nos), f"{entry.get('no')} vs max {max(nos)}")
    if any(r["level"] == "FAIL" for r in results):
        return finish(out)

    # ---- build the site exactly as the Pages workflow does ---------------
    site, demos = build_site.build(out / "site", root=repo)
    check("site builds", (site / slug / "index.html").exists() and (site / slug / "thumb.webp").exists(), str(site))

    # ---- browser checks ------------------------------------------------
    httpd, base = serve(site)
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=headless_shell(p), args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"])
            run_browser(browser, base, slug, entry, demos, out)
            browser.close()
    finally:
        httpd.shutdown()
    return finish(out)


def run_browser(browser, base, slug, entry, demos, out):
    url = f"{base}{slug}/"

    # desktop
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    errs, hosts = [], set()
    watch(page, errs)
    page.on("request", lambda r: hosts.add(re.sub(r"^https?://([^/:]+).*", r"\1", r.url)) if r.url.startswith("http") else None)
    visit(page, url, "desktop")
    page.wait_for_timeout(1500)
    a = page.screenshot(path=str(out / "desk-1.png"))
    page.wait_for_timeout(2500)
    b = page.screenshot(path=str(out / "desk-2.png"))
    check("desktop: not blank", busy(b) > 6, f"luma std {busy(b):.1f}")
    check("desktop: picture moves on its own", diff(a, b) > 0.15, f"mean diff {diff(a, b):.2f}", warn=True)
    fps = page.evaluate("()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;performance.now()-t0<2000?requestAnimationFrame(f):r(n/((performance.now()-t0)/1000))};requestAnimationFrame(f)})")
    check("desktop: frame rate (software GL, info only)", True, f"{fps:.0f} fps")
    # poke it: move, drag, click, scroll, a key
    page.mouse.move(720, 450)
    page.mouse.down()
    page.mouse.move(900, 380, steps=12)
    page.mouse.up()
    page.mouse.click(720, 450)
    page.mouse.wheel(0, 600)
    page.keyboard.press("Space")
    page.wait_for_timeout(1500)
    page.screenshot(path=str(out / "desk-3-after-input.png"))
    check("desktop: no console/page errors", not errs, "; ".join(errs[:5]))
    odd = sorted(h for h in hosts if h not in ALLOWED_HOSTS)
    check("only local + Google Fonts requests", not odd, ", ".join(odd))
    ctx.close()

    # phone
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    errs = []
    watch(page, errs)
    visit(page, url, "phone")
    page.wait_for_timeout(2500)
    shot = page.screenshot(path=str(out / "phone.png"))
    check("phone: not blank", busy(shot) > 6, f"luma std {busy(shot):.1f}")
    over = page.evaluate("()=>document.documentElement.scrollWidth-innerWidth")
    check("phone: no sideways overflow", over <= 1, f"{over}px")
    page.touchscreen.tap(195, 420)
    page.wait_for_timeout(800)
    check("phone: no console/page errors", not errs, "; ".join(errs[:5]))
    ctx.close()

    # reduced motion
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    errs = []
    watch(page, errs)
    visit(page, url, "reduced motion")
    page.wait_for_timeout(2000)
    shot = page.screenshot(path=str(out / "reduced-motion.png"))
    check("reduced motion: not blank", busy(shot) > 6, f"luma std {busy(shot):.1f}")
    check("reduced motion: no errors", not errs, "; ".join(errs[:5]))
    ctx.close()

    # the cabinet itself
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    errs = []
    watch(page, errs)
    visit(page, base, "hall")
    page.wait_for_timeout(6000)
    page.screenshot(path=str(out / "hall.png"))
    slugs = [d["slug"] for d in demos]
    probe = page.evaluate(
        """async([slug,slugs])=>{const T=await import('./assets/vendor/three.module.min.js');const missing=[];
        for(const s of slugs){try{const m=await import('./'+s+'/mini.js');if(typeof m.default!=='function')missing.push(s)}catch(e){missing.push(s+': '+e.message)}}
        const x=(await import('./'+slug+'/mini.js')).default(T,new T.Color('#ffffff'));
        if(x.tick){x.tick(1.3,.016,0);x.tick(7.9,.016,0)}const s=new T.Box3().setFromObject(x.obj).getSize(new T.Vector3());
        return {missing,size:[s.x,s.y,s.z],mats:Array.isArray(x.mats)}}""",
        [slug, slugs],
    )
    check("every exhibit's mini.js loads", not probe["missing"], ", ".join(probe["missing"]))
    big = max(probe["size"])
    check("mini exhibit fits its case (≤1.15u)", 0.3 < big <= 1.15, "size " + " × ".join(f"{v:.2f}" for v in probe["size"]))
    check("builder returns mats array", probe["mats"])
    try:
        page.wait_for_function("()=>window.__archive&&window.__archive.state().ready", timeout=40000, polling=500)
    except Exception:
        pass
    hall = page.evaluate("""()=>{const A=window.__archive;if(!A)return null;const s=A.state();return {ready:s.ready,rooms:s.rooms.map(r=>r.kind),stacks:s.stacks,
        drawer:s.slots.filter(x=>x.slug===%s).map(x=>x.room),fails:s.specs.fails}}""" % json.dumps(slug))
    if check("hall: ready within 46 s (software GL)", bool(hall and hall["ready"]), "" if hall else "window.__archive missing", warn=True):
        check("hall: at most 8 galleries on the floor", hall["rooms"].count("gallery") <= 8, str(hall["rooms"].count("gallery")))
        check("hall: The Stacks has a drawer for every exhibit", hall["stacks"] and hall["stacks"]["filled"] == len(demos), str(hall["stacks"]))
        check("hall: the new exhibit has a case or a drawer", len(hall["drawer"]) >= 1, str(hall["drawer"]))
        check("hall: no mini exhibit failed to load", not hall["fails"], str(hall["fails"]))
    res = page.evaluate("()=>performance.getEntriesByType('resource').map(e=>e.name)")
    check("hall hangs thumb.webp, not og.png", any(r.endswith("thumb.webp") for r in res) and not any(r.endswith("/og.png") for r in res),
          f"{sum(r.endswith('thumb.webp') for r in res)} thumbs, {sum(r.endswith('/og.png') for r in res)} og.png")
    check("hall: no console/page errors", not errs, "; ".join(errs[:5]))

    visit(page, base + "?list", "list")
    page.wait_for_timeout(1500)
    page.screenshot(path=str(out / "list.png"), full_page=False)
    hrefs = page.eval_on_selector_all("a[href]", "els=>els.map(e=>e.getAttribute('href'))")
    check("?list links to the exhibit", any(h and slug in h for h in hrefs))

    errs.clear()
    visit(page, base + f"?exhibit={slug}", "viewer")
    page.wait_for_timeout(5000)
    page.screenshot(path=str(out / "hall-viewer.png"))
    src = page.evaluate("()=>{const f=document.querySelector('#vif');return f?f.src:''}")
    check("?exhibit= opens it in the viewer", slug in src, src)
    check("viewer: no console/page errors", not errs, "; ".join(errs[:5]))
    ctx.close()


def finish(out):
    fails = [r for r in results if r["level"] == "FAIL"]
    warns = [r for r in results if r["level"] == "WARN"]
    (out / "report.json").write_text(json.dumps({"ok": not fails, "fails": len(fails), "warns": len(warns), "results": results}, ensure_ascii=False, indent=1))
    print(f"\n{len(results) - len(fails) - len(warns)} pass, {len(warns)} warn, {len(fails)} fail → {out / 'report.json'}")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
