#!/usr/bin/env python3
"""After a push: wait for the Pages workflow to deploy the commit, then check the live exhibit.

usage: python3 tools/check_live.py <slug> <commit-sha> [timeout-seconds] [screenshot.png]

Exit 0 when the "Pages" workflow run for <commit-sha> finished with success, the live page,
og.png, thumb.webp, mini.js and demos.json entry are all there, and the live page renders in
headless Chromium without page errors (screenshot saved if a path is given); 1 otherwise.
"""
import json
import subprocess
import sys
import time
from pathlib import Path

REPO = "Blackman99/curio"
SITE = "https://blackman99.github.io/curio/"


def gh(path):
    out = subprocess.run(["gh", "api", path], capture_output=True, text=True, timeout=60)
    if out.returncode:
        raise RuntimeError(out.stderr.strip())
    return json.loads(out.stdout)


def get(url):
    # curl, not urllib: the python.org build on this Mac has no CA bundle
    out = subprocess.run(["curl", "-sS", "-H", "Cache-Control: no-cache", "-w", "\n%{http_code}", f"{url}?t={int(time.time())}"], capture_output=True, timeout=60)
    if out.returncode:
        raise RuntimeError(out.stderr.decode().strip())
    body, _, code = out.stdout.rpartition(b"\n")
    return int(code), body


def main():
    slug, sha = sys.argv[1], sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 900
    sha = gh(f"repos/{REPO}/commits/{sha}")["sha"]
    t0, run = time.time(), None
    while time.time() - t0 < limit:
        try:
            runs = gh(f"repos/{REPO}/actions/runs?head_sha={sha}&event=push")["workflow_runs"]
            run = next((r for r in runs if r["name"] == "Pages"), None)
        except Exception as e:  # transient API trouble: keep waiting
            print("gh api:", e)
        if run and run["status"] == "completed":
            break
        time.sleep(15)
    if not run or run["status"] != "completed":
        print(f"FAIL: the Pages workflow for {sha[:7]} has not finished after {limit}s ({run and run['status']})")
        return 1
    secs = (time.mktime(time.strptime(run["updated_at"], "%Y-%m-%dT%H:%M:%SZ")) - time.mktime(time.strptime(run["run_started_at"], "%Y-%m-%dT%H:%M:%SZ")))
    print(f"Pages workflow for {sha[:7]}: {run['conclusion']} in {secs:.0f} s → {run['html_url']}")
    if run["conclusion"] != "success":
        return 1
    ok = True
    for i in range(10):  # the CDN can lag the build by a minute or two
        try:
            s1, page = get(f"{SITE}{slug}/")
            s2, og = get(f"{SITE}{slug}/og.png")
            s3, demos = get(f"{SITE}demos.json")
            s4, th = get(f"{SITE}{slug}/thumb.webp")
            s5, mini = get(f"{SITE}{slug}/mini.js")
            listed = any(d.get("slug") == slug for d in json.loads(demos))
            ok = (s1 == 200 and s2 == 200 and listed and len(page) > 1000 and og[:8] == b"\x89PNG\r\n\x1a\n"
                  and s4 == 200 and th[:4] == b"RIFF" and th[8:12] == b"WEBP" and s5 == 200 and b"export default" in mini)
            print(f"page {s1} ({len(page)} bytes) · og.png {s2} ({len(og)} bytes) · thumb.webp {s4} ({len(th)} bytes) · mini.js {s5} · listed in demos.json: {listed}")
            if ok:
                break
        except Exception as e:
            ok = False
            print("not live yet:", e)
        time.sleep(20)
    print("LIVE:" if ok else "FAIL: not live:", f"{SITE}{slug}/")
    if ok:
        ok = render(f"{SITE}{slug}/", sys.argv[4] if len(sys.argv) > 4 else None)
    return 0 if ok else 1


def render(url, shot):
    """Open the live page the way a visitor would and look for page errors."""
    sys.path.insert(0, str(Path(__file__).parent))
    from verify_exhibit import headless_shell
    from playwright.sync_api import sync_playwright
    errs = []
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path=headless_shell(p), args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        pg = br.new_page(viewport={"width": 1440, "height": 900})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        pg.goto(url, wait_until="domcontentloaded", timeout=60000)
        pg.wait_for_timeout(6000)
        if shot:
            pg.screenshot(path=shot)
        br.close()
    print("live render:", "no page errors" if not errs else "; ".join(errs[:5]), f"→ {shot}" if shot else "")
    return not errs


if __name__ == "__main__":
    sys.exit(main())
