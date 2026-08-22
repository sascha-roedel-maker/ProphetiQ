# QULORA AI Backend V1

Dieses Backend macht aus dem lokalen Ask-QULORA-Regelmodus einen echten KI-Fachassistenten, ohne den OpenAI-API-Key in `index.html` zu veröffentlichen.

## Schnellster Pilot-Weg (Cloudflare Worker)

1. Auf Cloudflare einen neuen Worker `qulora-ai` anlegen.
2. Den Inhalt von `qulora-ai-worker.js` in den Worker-Editor übernehmen und deployen.
3. In **Settings → Variables and Secrets** ein Secret `OPENAI_API_KEY` anlegen.
4. Optional `OPENAI_MODEL` auf `gpt-5.6-terra` (Standard) oder ein anderes freigeschaltetes Modell setzen.
5. Unter `ALLOWED_ORIGINS` muss mindestens `https://sascha-roedel-maker.github.io` stehen.
6. Worker-URL kopieren, z. B. `https://qulora-ai.<account>.workers.dev`.
7. In QULORA → Ask QULORA → **AI Backend verbinden** die URL einmal eintragen und testen.

Danach werden freie Küchenfragen über das sichere Backend beantwortet. Fällt das Backend aus, nutzt QULORA automatisch den lokalen Culinary-Copilot als Fallback.

## Wichtig

- Den OpenAI-API-Key niemals in `index.html`, GitHub Pages oder `wrangler.toml` speichern.
- Vor einem breiten Kundenrollout gehören Authentifizierung, Rate Limits, Mandantentrennung, Audit-Logs und zentrale Datenhaltung in die nächste Backend-Stufe.
