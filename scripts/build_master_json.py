#!/usr/bin/env python3
"""Genera JSON maestros del visor desde BBDD_Visor_Geoindicadores_2025_2026.xlsx.

Reglas clave:
- 0 es un valor valido y nunca se convierte en nulo.
- Solo None o cadenas vacias se interpretan como ausencia de dato.
- Los barrios se leen por nombre, no por posicion fija.
- Los agregados territoriales distinguen REAL, PROMEDIO y DIFERENCIA.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from openpyxl import load_workbook

YEARS = (2025, 2026)
EXPECTED_BARRIOS = 27


def blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def scalar(value: Any) -> Any:
    if blank(value):
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value
    text = str(value).strip()
    try:
        number = float(text.replace(",", "."))
        return int(number) if number.is_integer() else number
    except ValueError:
        return text


def norm(value: Any) -> str:
    return str(value or "").strip().upper()


def find_cell(ws, predicate):
    for row in ws.iter_rows():
        for cell in row:
            if predicate(cell.value):
                return cell
    return None


def code_columns(ws):
    code_anchor = find_cell(ws, lambda v: norm(v) == "IAT_1")
    if not code_anchor:
        raise RuntimeError(f"No se encontro fila de codigos en hoja {ws.title}")
    result = {}
    for cell in ws[code_anchor.row]:
        value = norm(cell.value)
        if value.startswith(("IAT_", "IUT_", "IST_", "IET_", "IIT_")):
            result[cell.column] = value
    return result, code_anchor.row


def barrio_rows(ws, code_row):
    # En la BBDD actual, los barrios comienzan inmediatamente despues de la fila de codigos.
    rows = []
    for r in range(code_row + 1, ws.max_row + 1):
        barrio = ws.cell(r, 3).value
        seq = ws.cell(r, 2).value
        if norm(ws.cell(r, 2).value) == "TIPO DE VALOR":
            break
        if blank(barrio):
            continue
        # Evita capturar encabezados o notas posteriores.
        if isinstance(seq, (int, float)) or (isinstance(seq, str) and seq.strip().isdigit()):
            rows.append(r)
    return rows


def parse_barrios(ws):
    codes, code_row = code_columns(ws)
    rows = barrio_rows(ws, code_row)
    records = []
    for r in rows:
        name = str(ws.cell(r, 3).value).strip()
        vals = {code: scalar(ws.cell(r, col).value) for col, code in codes.items()}
        records.append({"nombre": name, "valores": vals})
    return records, list(codes.values())


def parse_territorios(ws):
    codes, _ = code_columns(ws)
    out = {"real": {}, "promedio": {}, "diferencia": {}}
    for r in range(1, ws.max_row + 1):
        tipo = norm(ws.cell(r, 2).value)
        territorio = ws.cell(r, 3).value
        if tipo not in {"TERRITORIO REAL", "TERRITORIO PROMEDIO", "DIFERENCIA TERRITORIAL"} or blank(territorio):
            continue
        key = {"TERRITORIO REAL": "real", "TERRITORIO PROMEDIO": "promedio", "DIFERENCIA TERRITORIAL": "diferencia"}[tipo]
        out[key][str(territorio).strip()] = {code: scalar(ws.cell(r, col).value) for col, code in codes.items()}
    return out


def parse_comuna(ws):
    codes, _ = code_columns(ws)
    out = {"real": {}, "promedio_barrios": {}}
    for r in range(1, ws.max_row + 1):
        tipo = norm(ws.cell(r, 2).value)
        comuna = ws.cell(r, 3).value
        if tipo not in {"COMUNA REAL", "COMUNA PROMEDIO BARRIOS"} or blank(comuna):
            continue
        key = "real" if tipo == "COMUNA REAL" else "promedio_barrios"
        out[key][str(comuna).strip()] = {code: scalar(ws.cell(r, col).value) for col, code in codes.items()}
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("xlsx", type=Path)
    parser.add_argument("--out-dir", type=Path, default=Path("data"))
    args = parser.parse_args()

    wb = load_workbook(args.xlsx, data_only=True, read_only=True)
    stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")

    master_barrio = {
        "meta": {
            "fuente": args.xlsx.name,
            "generado_utc": stamp,
            "regla_nulos": "0 es dato valido; solo ausencia real se guarda como null",
            "barrios_esperados": EXPECTED_BARRIOS,
        },
        "anios": {},
    }
    master_aggregates = {
        "meta": {
            "fuente": args.xlsx.name,
            "generado_utc": stamp,
            "barrios_esperados": EXPECTED_BARRIOS,
        },
        "anios": {},
    }

    indicator_union = []
    for year in YEARS:
        ws = wb[str(year)]
        barrios, codes = parse_barrios(ws)
        if len(barrios) != EXPECTED_BARRIOS:
            raise RuntimeError(f"Hoja {year}: se esperaban {EXPECTED_BARRIOS} barrios y se leyeron {len(barrios)}")
        names = [b["nombre"] for b in barrios]
        if len(set(map(norm, names))) != EXPECTED_BARRIOS:
            raise RuntimeError(f"Hoja {year}: hay nombres de barrio duplicados")
        indicator_union.extend(c for c in codes if c not in indicator_union)
        master_barrio["anios"][str(year)] = barrios
        master_aggregates["anios"][str(year)] = {
            "territorio": parse_territorios(ws),
            "comuna": parse_comuna(ws),
        }

    master_barrio["indicadores"] = indicator_union
    args.out_dir.mkdir(parents=True, exist_ok=True)
    barrio_path = args.out_dir / "master-barrio.json"
    aggregates_path = args.out_dir / "master-aggregates.json"
    barrio_path.write_text(json.dumps(master_barrio, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    aggregates_path.write_text(json.dumps(master_aggregates, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {barrio_path}")
    print(f"OK: {aggregates_path}")


if __name__ == "__main__":
    main()
