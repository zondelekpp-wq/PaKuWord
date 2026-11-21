# PaKuWord – content guide (read before every content session)

PaKuWord shows one word or phrase a day, explained properly. Users include children (Junior mode), teens, adults, neurodivergent people (ADHD, autism, PTSD) and blind or low-vision people who **listen** to every text through the phone's speech engine. Quality and accuracy matter more than quantity.

## Files (all flat, no subfolders)
- `categories.js` – knowledge domains: `id: {icon|svg, n:{en,pl,de,es,fr,zh,uk,lv}}`. Every new domain needs names in **all 8 languages**. `icon` must be a built-in name (see `_validate.js` ICONS) or give `svg:` with inner SVG for a 24×24 viewBox in line style (stroke only, no fill).
- `pack-YYYY-MM-DD-en.js`, `pack-YYYY-MM-DD-pl.js` – one new pack per language per day. Format:
  ```js
  window.PW_CONTENT = window.PW_CONTENT || {};
  window.PW_CONTENT.en = (window.PW_CONTENT.en || []).concat([ {...}, {...} ]);
  ```
- `catalog.js` – append every new pack file name at the end of `PW_FILES` (order matters; the service worker caches this list).
- `figtext-en.js`, `figtext-pl.js` – figure biographies, keyed by the ids in `figures.js` (chronological order). Polish entries also need `n` (Polish name).
- `version.js` – changed **only** by the monthly release.
- `PLAN.md` – the work queue and the daily log. Always update it.

## Entry fields
| field | meaning |
|---|---|
| `id` | lowercase, unique, stable. Shared concepts use the **same id in every language** (e.g. `his_renaissance`). Language-specific: `<cat>_<lang>_<name>` plus `only:1`. |
| `cat` | category id |
| `t` | the term as it is written in that language |
| `s` | one-sentence definition |
| `l` | the long explanation: 3–5 sentences, 300–650 characters, plain language, what it is, how/where it's used, how it differs from similar things |
| `x` | a realistic example sentence |
| `f` | a true, checkable “Did you know?” fact (etymology, history, surprising detail) |
| `js`, `jl`, `jx` | Junior short/long/example: for ages ~7–12, warm and concrete, examples from school, home, playground |
| `j:false` | hide in Junior mode (death/inheritance, sexuality, crime details, money pressure, frightening illness). Then junior fields may be omitted. |
| `only:1` | exists only in this language/culture – shown with a ★ badge |
| `c` | for law and other country-dependent topics: the system described (`"Polska"`, `"England & Wales"`) |

## Rules
1. **Accuracy first.** Only facts you are confident about. No invented quotes, dates, statistics or studies. If unsure, leave the fact out or pick a different word.
2. **Write it yourself.** Never copy dictionary or encyclopedia text; explanations are original.
3. **Listenable.** Texts are read aloud by TTS: avoid tables, emojis, “see above”, unexplained abbreviations; write numbers so they read well.
4. **Kind and inclusive.** No stereotypes, no shaming. Mental-health and neurodiversity topics: respectful, non-pathologising language. Never give dosing, diet targets or weight numbers; nothing that could encourage self-harm or disordered eating.
5. **Each language is written natively**, not translated word for word. Polish uses correct Polish terms; law and civics describe the country of that language.
6. **Per daily pack and language:** about 10–15% language-specific words (`only:1`).
7. **Spread of difficulty:** mostly useful, everyday-relevant terms; a few delightful advanced ones.
8. Ids of shared words must match between `en` and `pl` (the app uses them for the foreign-language learning mode).

## Before committing
```
node _validate.js
```
Must print `OK`. Fix every ERROR. Read WARN lines and fix what makes sense.
