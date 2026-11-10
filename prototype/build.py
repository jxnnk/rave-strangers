"""Builds prototype/index.html from src/app.html and the map geometry.

Run from the repo root:  python3 prototype/build.py
"""
import json
from pathlib import Path

here = Path(__file__).parent
app = (here / "src" / "app.html").read_text(encoding="utf-8")
geo = json.loads((here / "src" / "germany.geo.json").read_text(encoding="utf-8"))
assert "/*GEO*/null" in app, "placeholder /*GEO*/null missing in src/app.html"
out = app.replace("/*GEO*/null", json.dumps(geo, ensure_ascii=False))
(here / "index.html").write_text(out, encoding="utf-8")
print(f"wrote prototype/index.html ({len(out):,} chars)")
