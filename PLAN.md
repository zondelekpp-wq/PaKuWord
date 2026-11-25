# PaKuWord – work plan

## Branches
- `main` – what users get (GitHub Pages). Changed **once a month** by the release.
- `dev` – daily work. Every daily session commits here.

## Daily session (every day, on `dev`)
1. **New domain:** take the first unchecked domain from the queue below, add it to `categories.js` (names in all 8 languages + icon) and write **30 entries** for it in `en` and in `pl`.
2. **+30 to existing domains:** add **30 more entries in total** to the existing domains (per language), always choosing the domains with the fewest entries first (ties: oldest first). Can be one domain or split, e.g. 15 + 15.
3. **Biographies:** while any of the 50 figures lacks a biography, add the next **2 figures** (chronological order from `figures.js`) to `figtext-en.js` and `figtext-pl.js`.
4. Put the day's entries in `pack-YYYY-MM-DD-en.js` and `pack-YYYY-MM-DD-pl.js`, append both to `catalog.js`.
5. `node _validate.js` → must be `OK`.
6. Tick the domain below and add one line to the log. Commit and push to `dev`.

## Monthly release (1st day of the month)
Merge `dev` into `main`, set `PW_VERSION` to the release date, write the newest `PW_CHANGES` entry in all 8 languages (new domains by name, number of new words, new biographies, fixes), validate, rebuild the download package with `python3 _build_zip.py`, push `main`, merge `main` back into `dev`. Users see a “What’s new” screen once on their next visit (it can be read aloud).

## Domain queue
- [x] his – History
- [x] mat – Mathematics
- [x] arc – Archaeology
- [x] cook – Cooking
- [ ] art – Art
- [ ] ast – Astronomy
- [ ] phy – Physics
- [ ] bio – Biology
- [ ] chem – Chemistry
- [ ] mus – Music
- [ ] phi – Philosophy
- [ ] geo – Geography
- [ ] it – Computing & IT
- [ ] fin – Personal finance
- [ ] eco – Ecology & climate
- [ ] lit – Literature
- [ ] archi – Architecture
- [ ] spo – Sport
- [ ] ling – Linguistics
- [ ] soc – Sociology
- [ ] civ – Civics & government
- [ ] econ – Economics
- [ ] eng – Engineering
- [ ] film – Film & theatre
- [ ] myth – Mythology
- [ ] edu – Education
- [ ] neuro – Neuroscience
- [ ] geol – Geology
- [ ] ocean – Oceans & seas
- [ ] meteo – Weather & meteorology
- [ ] bot – Botany & gardening
- [ ] zoo – Zoology
- [ ] media – Media & journalism
- [ ] mkt – Marketing
- [ ] work – Work & careers
- [ ] aid – First aid
- [ ] sec – Online safety
- [ ] photo – Photography
- [ ] fash – Fashion & textiles
- [ ] logic – Logic & critical thinking

## Status
- Words: en 270, pl 270 (med 30, law 30, gen 30, psy 30, biz 30, his 30, mat 30, arc 30, cook 30)
- Figure biographies: 18 / 50 (en, pl)
- Other languages (de, es, fr, zh, uk, lv): interface ready, words fall back to English – planned later.

## Log
- 2026-11-21 – v1: 5 domains, 30 words en + 30 pl, biographies 1–10, reading aloud, monthly updates. Released as 2026.11.21.
- 2026-11-22 – new domain History (his, 30 words); +6 each to med, law, gen, psy, biz; 60 words en + 60 pl; biographies 11–12 (Gutenberg, Leonardo da Vinci).
- 2026-11-23 – new domain Mathematics (mat, 30 words); +6 each to med, law, gen, psy, biz; 60 words en + 60 pl; biographies 13–14 (Albrecht Dürer, Nicolaus Copernicus).
- 2026-11-24 – new domain Archaeology (arc, 30 words); +6 each to med, law, gen, psy, biz; 60 words en + 60 pl; biographies 15–16 (Miguel de Cervantes, Galileo Galilei).
- 2026-11-25 – new domain Cooking (cook, 30 words); +6 each to med, law, gen, psy, biz; 60 words en + 60 pl; biographies 17–18 (William Shakespeare, Rembrandt).
