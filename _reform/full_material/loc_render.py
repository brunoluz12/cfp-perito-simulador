# -*- coding: utf-8 -*-
"""Renderiza as páginas do LOC.pdf (escaneado) em PNG para OCR."""
import os
import sys

import fitz

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

PDF = r"..\Locais de Crime e suas Interfaces (LOC)\LOC.pdf"
OUT = sys.argv[1] if len(sys.argv) > 1 else "loc_png"
P_INI, P_FIM = 13, 200  # páginas impressas (1-based)

os.makedirs(OUT, exist_ok=True)
doc = fitz.open(PDF)
for p in range(P_INI, P_FIM + 1):
    destino = os.path.join(OUT, f"p{p:03d}.png")
    if os.path.exists(destino):
        continue
    pix = doc[p - 1].get_pixmap(dpi=250)
    pix.save(destino)
    if p % 20 == 0:
        print(f"...p{p}")
print(f"OK: páginas {P_INI}-{P_FIM} renderizadas em {OUT}")
