# Gjestesiden: det som mangler

Sist oppdatert: 2026-11-06

Ingenting her vises på siden. Når et punkt er levert, oppdaterer Renate teksten i
`innhold/no.md`, `innhold/de.md` og `innhold/en.md` (samme sted i alle tre) og kjører
`python3 sjekk_innhold.py`.

## Ankomst
- [ ] **Renate:** Bekreft parkeringen: kan gjester parkere ved hytta, hvor er plassene ovenfor hytta, og skal man lesse ut ved hytta og så kjøre opp igjen?
- [ ] **Renate/Kristiane:** Bekreft hvem som driver bommen (NorgesBom eller YouPark), pris per passering og hva som skjer ved forsinket betaling.
- [ ] **Bjørg/Kristiane:** Telefonnummer til snøbrøyteren, Olav Espegaard. Bekreft også at han vil bli ringt av gjester. Legg nummeret inn i `kontakt.js` under `broyting` (til da viser siden Kristiane).

## Døra
- [ ] **Bjørg:** Kort liste over hva gjesten kan prøve selv før de ringer når kodedøra ikke åpner seg. Ingen koder eller nøkkelplasseringer.
- [ ] **Kristiane:** Står instruksjonen for kodelåsen (hvordan man taster) i Airbnb-meldingen? Siden viser bare «Følg instruksjonen i Airbnb-meldingen din».

## Peisen
- [ ] **Bjørg:** Word-versjon av peisveiledningen. Teksten nå bygger på bruksanvisningen (Camina Schmid, side 20–22) og Bjørgs tips.
- [ ] **Bjørg:** Bekreft at luftspaken sitter under peisdøra, og hvilken vei som er åpen og lukket. Ta bilde: lagre som `bilder/peis-spak.jpg`.

## Stampen
- [ ] **Bjørg:** Den norske stampveiledningen mangler to punkter som står i den tyske (tømming med lensepumpe og presenning før avreise). De er tatt med på siden. Bekreft at de stemmer.
- [ ] **Bjørg:** Filen «Brukerveiledning av stamp_Engelsk.docx» inneholder tysk tekst. Bør rettes i arkivet.
- [ ] **Bjørg:** Er stikkontakten til lyset ved stampen fortsatt fjernet? Hvis den er satt opp igjen, fjern avsnittet «Lys ved stampen».
- [ ] **Bjørg:** Hvordan fyrer man i stampovnen (opptenning, hvor lenge før vannet er varmt)? Mangler i dag.

## Badstua og vann
- [ ] **Bjørg:** Mer om badstua (hvordan den slås på, hvor lenge den trenger) hvis gjester skal ha det.

## Når noe ikke fungerer
- [ ] **Renate/Bjørg:** Hvor er teknisk rom? Legg inn en setning om veien dit.
- [ ] **Renate:** Bilder av hovedsikringen og hovedkranen. Lagre som `bilder/hovedsikring.jpg` og `bilder/hovedkran.jpg` (de vises automatisk når filene finnes). Maks ca. 1200 px bredde.

## Kontakt
- [ ] **Familien:** Er det greit at Kristianes nummer står på en åpen side? (Tidligere anbefaling i TODO.md i arkivet: bare i Airbnb-meldingen og permen.) Fjernes ved å tømme `telefon` i `kontakt.js`.

## Teknisk
- [ ] **Renate:** Rot-siden (familiesiden) har ikke noindex. Vurder å legge til `<meta name="robots" content="noindex">` der også.
