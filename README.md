# QULORA V8.1 Compact

Diese Version ist bewusst für einfaches GitHub-Handling gebaut.

## Was jetzt direkt in index.html steckt
- komplette Oberfläche, CSS und JavaScript
- QULORA-Logo
- alle Food-Kategorievisuals (kein assets/food-Ordner mehr)
- Favicon
- Trend-Logik und Fallback-Daten

## Was bewusst separat bleibt
- `trend-data.json` – wird sonntags automatisch aktualisiert
- `sw.js` – Service Worker muss als echte Datei unter derselben Domain liegen
- `manifest.webmanifest` + `icon-192.png` + `icon-512.png` – für PWA/Home-Screen-Installation
- `.github/workflows/qulora-weekly-trends.yml` – GitHub benötigt Workflows genau in diesem Ordner

Es gibt **keinen assets-Ordner und keinen scripts-Ordner mehr**.

Wenn du später nur eine neue QULORA-Oberfläche bekommst, reicht normalerweise der Austausch von `index.html` und ggf. `sw.js`. Die Trend-Automatik und Icons können liegen bleiben.
