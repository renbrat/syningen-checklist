#!/usr/bin/env python3
"""Sjekker at norsk, tysk og engelsk tekst på gjestesiden har samme oppbygning.

Kjør fra mappen gjest:   python3 sjekk_innhold.py

Sjekker:
- samme innstillinger (knapper og menyer) i alle språk
- samme seksjoner (##) og underseksjoner (###) i samme rekkefølge
- samme antall punkter, steg, advarsler, bilder, lenker og ringeknapper per underseksjon
- at ingen tekst inneholder «TODO» eller lange tallrekker (mulige koder)
- at bildene som det vises til, finnes (mangler de, skjules de på siden: bare en advarsel)
"""
import os
import re
import sys

MAPPE = os.path.dirname(os.path.abspath(__file__))
SPRAK = ["no", "de", "en"]


def les(lang):
    sti = os.path.join(MAPPE, "innhold", lang + ".md")
    with open(sti, encoding="utf-8") as f:
        tekst = f.read()
    tekst = re.sub(r"<!--.*?-->", "", tekst, flags=re.S)
    innst, del_ = {}, []
    linjer = tekst.splitlines()
    i = 0
    while i < len(linjer) and not linjer[i].startswith("## "):
        m = re.match(r"^([a-z_]+):\s*(.*)$", linjer[i])
        if m:
            innst[m.group(1)] = m.group(2)
        i += 1
    struktur = []  # liste av (nivå, id, telling)
    gjeldende = None
    for linje in linjer[i:]:
        m = re.match(r"^(##|###) .+?\{#([\w-]+)\}\s*$", linje)
        if m:
            gjeldende = {"niva": m.group(1), "id": m.group(2), "ul": 0, "ol": 0, "advarsel": 0,
                         "info": 0, "bilder": [], "lenker": [], "makro": []}
            struktur.append(gjeldende)
            continue
        if gjeldende is None:
            continue
        if re.match(r"^- ", linje):
            gjeldende["ul"] += 1
        elif re.match(r"^\d+\. ", linje):
            gjeldende["ol"] += 1
        elif linje.startswith("> !"):
            gjeldende["advarsel"] += 1
        elif linje.startswith(">"):
            gjeldende["info"] += 1
        m = re.match(r"^!\[[^\]]*\]\(([^)]+)\)", linje)
        if m:
            gjeldende["bilder"].append(m.group(1))
        gjeldende["lenker"] += re.findall(r"\]\((https://[^)]+)\)", linje)
        gjeldende["makro"] += re.findall(r"\[\[([\w:-]+)\]\]", linje)
        del_.append(linje)
    return innst, struktur, "\n".join(del_)


def main():
    feil, advarsler = [], []
    data = {l: les(l) for l in SPRAK}
    ref_innst, ref_str, _ = data["no"]

    for lang in SPRAK:
        innst, struktur, tekst = data[lang]
        if set(innst) != set(ref_innst):
            feil.append(f"{lang}: innstillinger avviker fra norsk: mangler {sorted(set(ref_innst) - set(innst))}, ekstra {sorted(set(innst) - set(ref_innst))}")
        tomme = [k for k, v in innst.items() if not v.strip()]
        if tomme:
            feil.append(f"{lang}: tomme innstillinger: {tomme}")

        ider = [(s["niva"], s["id"]) for s in struktur]
        ref_ider = [(s["niva"], s["id"]) for s in ref_str]
        if ider != ref_ider:
            feil.append(f"{lang}: seksjonene er ikke like som i norsk.\n   norsk: {[i for _, i in ref_ider]}\n   {lang}:    {[i for _, i in ider]}")
        else:
            for a, b in zip(ref_str, struktur):
                for felt in ("ul", "ol", "advarsel", "info", "bilder", "lenker", "makro"):
                    if a[felt] != b[felt]:
                        feil.append(f"{lang}: «{b['id']}» har ulikt {felt}: norsk {a[felt]!r}, {lang} {b[felt]!r}")

        for nr, linje in enumerate(tekst.splitlines(), 1):
            if "TODO" in linje.upper().replace("TODOS", "TODO"):
                feil.append(f"{lang}: inneholder TODO: {linje.strip()}")
            if re.search(r"\d{4,}", linje):
                feil.append(f"{lang}: lang tallrekke (mulig kode?): {linje.strip()}")

        for s in struktur:
            for b in s["bilder"]:
                if not os.path.exists(os.path.join(MAPPE, b)):
                    advarsler.append(f"{lang}: bildet {b} finnes ikke ennå (skjules på siden)")

    for a in sorted(set(advarsler)):
        print("Advarsel:", a)
    if feil:
        print()
        for f in feil:
            print("FEIL:", f)
        print(f"\n{len(feil)} feil.")
        return 1
    print(f"OK: {', '.join(SPRAK)} har like seksjoner ({len(ref_str)} overskrifter).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
