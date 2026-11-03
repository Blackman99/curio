#!/usr/bin/env python3
"""Static checks for every exhibit (CI runs this before building the site).

usage: python3 tools/check_repo.py [slug ...]      (no slug: check them all)

Each exhibits/<slug>/ must hold index.html, og.png (1200×630 PNG), mini.js (default-exports the
hall's mini exhibit) and meta.json (its demos.json entry). Exit 1 on any FAIL; WARNs don't fail.
"""
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://blackman99.github.io/curio/"
FIELDS = ("slug", "title", "no", "date", "kind", "blurb", "color", "exhibit", "lane")
LANES = ("3d", "web", "science", "ml")
# pages made before these conventions were written down (Nos. 001–035) only WARN on the page-head checks
STRICT_FROM = "036"

results = []


def check(name, ok, detail="", warn=False):
    level = "PASS" if ok else ("WARN" if warn else "FAIL")
    results.append({"check": name, "level": level, "detail": detail})
    if level != "PASS" or VERBOSE:
        print(f"[{level}] {name}" + (f" — {detail}" if detail else ""), flush=True)
    return ok


def png_size(p):
    head = p.read_bytes()[:24]
    if head[:8] != b"\x89PNG\r\n\x1a\n" or head[12:16] != b"IHDR":
        return None
    return struct.unpack(">II", head[16:24])


def load_all(root=ROOT):
    out = {}
    for d in sorted((root / "exhibits").iterdir()):
        if d.is_dir():
            try:
                out[d.name] = json.loads((d / "meta.json").read_text())
            except FileNotFoundError:
                out[d.name] = None
            except json.JSONDecodeError as e:
                out[d.name] = {"_error": str(e)}
    return out


def check_exhibit(slug, meta, root=ROOT):
    d = root / "exhibits" / slug
    p = f"exhibits/{slug}"
    if not check(f"{p}/meta.json exists and parses", isinstance(meta, dict) and "_error" not in meta, (meta or {}).get("_error", "")):
        return
    missing = [f for f in FIELDS if not str(meta.get(f, "")).strip()]
    check(f"{p}: meta has every field", not missing, "missing: " + ", ".join(missing) if missing else "")
    check(f"{p}: slug matches the folder", meta.get("slug") == slug, str(meta.get("slug")))
    check(f"{p}: number is 3 digits", bool(re.fullmatch(r"\d{3}", str(meta.get("no", "")))), str(meta.get("no")))
    check(f"{p}: date is ISO", bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(meta.get("date", "")))), str(meta.get("date")))
    check(f"{p}: color is #rrggbb", bool(re.fullmatch(r"#[0-9a-fA-F]{6}", str(meta.get("color", "")))), str(meta.get("color")))
    check(f"{p}: lane is one of {', '.join(LANES)}", meta.get("lane") in LANES, str(meta.get("lane")))
    check(f"{p}: kind fits the hall's nameplate (≤34 chars)", len(str(meta.get("kind", ""))) <= 34, f"{len(str(meta.get('kind', '')))} chars", warn=True)
    check(f"{p}: blurb length 120–420 chars", 120 <= len(str(meta.get("blurb", ""))) <= 420, f"{len(str(meta.get('blurb', '')))} chars", warn=True)

    page, og, mini = d / "index.html", d / "og.png", d / "mini.js"
    check(f"{p}/index.html exists", page.exists())
    if check(f"{p}/og.png exists", og.exists()):
        size = png_size(og)
        check(f"{p}/og.png is a 1200×630 PNG", size == (1200, 630), str(size))
        kb = og.stat().st_size // 1024
        check(f"{p}/og.png under 1 MB", kb < 1024, f"{kb} KB", warn=True)
    if check(f"{p}/mini.js exists", mini.exists()):
        js = mini.read_text()
        check(f"{p}/mini.js default-exports a builder (T,col)", bool(re.search(r"export\s+default\s+function\s*[A-Za-z0-9_$]*\s*\(\s*T\s*,\s*col\s*\)", js)))
        check(f"{p}/mini.js imports nothing", not re.search(r"^\s*import\s", js, re.M), "mini exhibits are self-contained")
    if page.exists():
        html, w = page.read_text(), str(meta.get("no", "999")) < STRICT_FROM
        kb = len(html.encode()) // 1024
        check(f"{p}: page under 200 KB", kb < 200, f"{kb} KB", warn=True)
        check(f"{p}: has <title>", "<title>" in html, warn=w)
        check(f"{p}: has meta description", 'name="description"' in html, warn=w)
        check(f"{p}: has viewport meta", 'name="viewport"' in html, warn=w)
        check(f"{p}: og:image points at this slug", f'content="{SITE}{slug}/og.png"' in html and 'property="og:image"' in html, warn=w)
        check(f"{p}: twitter:image points at this slug", 'name="twitter:image"' in html and html.count(f"{SITE}{slug}/og.png") >= 2, warn=w)
        check(f"{p}: uses the Curio favicon", "../assets/favicon.svg" in html, warn=w)
        check(f"{p}: has a back link to the cabinet", 'href="../"' in html, warn=w)
        check(f"{p}: handles prefers-reduced-motion", "prefers-reduced-motion" in html, warn=w)
        check(f"{p}: no external scripts", not re.search(r"<script[^>]+src=[\"']https?://", html))


def main(argv):
    allm = load_all()
    slugs = argv or sorted(allm)
    for s in slugs:
        if s not in allm:
            check(f"exhibits/{s}/ exists", False)
            continue
        check_exhibit(s, allm[s])
    good = [m for m in allm.values() if isinstance(m, dict) and "_error" not in m]
    for f in ("slug", "no", "exhibit"):
        vals = [m.get(f) for m in good]
        dup = sorted({str(v) for v in vals if vals.count(v) > 1})
        check(f"{f} values are unique across exhibits", not dup, ", ".join(dup))
    stray = sorted(p.name for p in ROOT.iterdir() if p.is_dir() and (p / "index.html").exists() and p.name not in ("exhibits", "assets", "tools", "_site"))
    check("no exhibit folders left at the repo root", not stray, ", ".join(stray))
    fails = sum(r["level"] == "FAIL" for r in results)
    warns = sum(r["level"] == "WARN" for r in results)
    print(f"{len(results) - fails - warns} pass, {warns} warn, {fails} fail ({len(slugs)} exhibit{'s' if len(slugs) != 1 else ''})")
    return 1 if fails else 0


VERBOSE = False
if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "-v"]
    VERBOSE = len(args) != len(sys.argv) - 1
    sys.exit(main(args))
