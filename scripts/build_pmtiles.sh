#!/usr/bin/env bash
set -euo pipefail

SOURCE="${1:-data/calles_santiago.geojson}"
OUT="${2:-data/calles_santiago.pmtiles}"
MANIFEST="${3:-data/pmtiles-manifest.json}"

if [[ ! -f "$SOURCE" ]]; then
  echo "Falta fuente: $SOURCE" >&2
  exit 2
fi
if ! command -v tippecanoe >/dev/null 2>&1; then
  echo "Falta tippecanoe en PATH" >&2
  exit 3
fi
if ! command -v pmtiles >/dev/null 2>&1; then
  echo "Falta CLI pmtiles en PATH" >&2
  exit 4
fi

mkdir -p "$(dirname "$OUT")"
TMP="${OUT%.pmtiles}.mbtiles"
rm -f "$TMP" "$OUT"

tippecanoe \
  -o "$TMP" \
  --force \
  --layer=calles_santiago \
  --minimum-zoom=10 \
  --maximum-zoom=16 \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  "$SOURCE"

pmtiles convert "$TMP" "$OUT"
rm -f "$TMP"

python - "$SOURCE" "$OUT" "$MANIFEST" <<'PY'
import hashlib,json,sys
from pathlib import Path
src,out,manifest=map(Path,sys.argv[1:])
def sha256(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()
data={
  'source':str(src),
  'source_bytes':src.stat().st_size,
  'source_sha256':sha256(src),
  'pmtiles':str(out),
  'pmtiles_bytes':out.stat().st_size,
  'pmtiles_sha256':sha256(out),
}
manifest.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(data,indent=2,ensure_ascii=False))
PY
