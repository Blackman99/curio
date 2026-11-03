#!/usr/bin/env python3
"""Build the published site from the repo.

usage: python3 tools/build_site.py [out-dir]        (default: _site)

The repo keeps every exhibit in exhibits/<slug>/; the site serves it at /<slug>/, so links,
og:image URLs and ?exhibit= deep links stay what they have always been. This script:
  - copies index.html, LICENSE and assets/ to the site root,
  - copies each exhibits/<slug>/ to /<slug>/ (everything except meta.json),
  - writes demos.json from the meta.json files, newest first,
  - writes /<slug>/thumb.webp, the 512 px picture the hall hangs on its walls (og.png stays for social cards).
Needs Pillow with WebP (pip install pillow).
"""
import json
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
THUMB_W, THUMB_Q = 512, 82


def metas(root=ROOT):
    out = []
    for d in sorted((root / "exhibits").iterdir()):
        if d.is_dir() and (d / "meta.json").exists():
            m = json.loads((d / "meta.json").read_text())
            if m.get("slug") != d.name:
                sys.exit(f"exhibits/{d.name}/meta.json: slug is {m.get('slug')!r}, expected {d.name!r}")
            out.append(m)
    # newest first, the order demos.json has always had
    out.sort(key=lambda m: (str(m.get("no", "")), str(m.get("date", ""))), reverse=True)
    return out


def thumb(src, dst):
    with Image.open(src) as im:
        im = im.convert("RGB")
        h = round(im.height * THUMB_W / im.width)
        im.resize((THUMB_W, h), Image.LANCZOS).save(dst, "WEBP", quality=THUMB_Q, method=6)


def build(out, root=ROOT):
    out = Path(out).resolve()
    if out == root or root in out.parents and out.name in ("exhibits", "assets", "tools"):
        sys.exit(f"refusing to build into {out}")
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    for f in ("index.html", "LICENSE"):
        shutil.copy2(root / f, out / f)
    shutil.copytree(root / "assets", out / "assets")
    ms = metas(root)
    for m in ms:
        src, dst = root / "exhibits" / m["slug"], out / m["slug"]
        shutil.copytree(src, dst, ignore=shutil.ignore_patterns("meta.json", ".DS_Store"))
        thumb(src / "og.png", dst / "thumb.webp")
    (out / "demos.json").write_text(json.dumps(ms, indent=1) + "\n")
    (out / ".nojekyll").write_text("")
    return out, ms


if __name__ == "__main__":
    out, ms = build(sys.argv[1] if len(sys.argv) > 1 else ROOT / "_site")
    size = sum(f.stat().st_size for f in out.rglob("*") if f.is_file())
    print(f"built {len(ms)} exhibits into {out} ({size / 2**20:.1f} MB)")
