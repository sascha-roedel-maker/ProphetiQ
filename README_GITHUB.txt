QULORA – GitHub Pages Paket

Lade den kompletten Inhalt dieses Ordners in die oberste Ebene deines GitHub-Repositories:

index.html
manifest.webmanifest
sw.js
favicon.ico
apple-touch-icon.png
README.md
assets/qulora-logo.png
assets/social-preview.png
icons/favicon-32.png
icons/icon-192.png
icons/icon-512.png
icons/maskable-192.png
icons/maskable-512.png

GitHub Pages:
1. Dateien und Ordner exakt mit dieser Struktur hochladen.
2. Settings > Pages öffnen.
3. „Deploy from a branch“ wählen.
4. Branch „main“ und Ordner „/ (root)“ wählen.
5. Speichern.

Wichtig:
- QULORA speichert Pilotdaten aktuell lokal im Browser (localStorage).
- JSON-Export/Import ist in der App eingebaut.
- XLSX-Einlesen nutzt SheetJS über CDN.
- Foto-Speiseplan-OCR nutzt Tesseract.js über CDN.
- Für den produktiven Mehrgerätebetrieb sollte später eine Cloud-Datenbank/Anmeldung ergänzt werden.


V4 Produktlinien-Import:
- MetriQ Blatt Speisenverteilung wird dynamisch gelesen.
- Tag + Gesamt + alle Produktlinien zwischen Tag und Gesamt werden gespeichert.
- Produktlinien-Historie und Produktlinien-Prognose sind in QULORA sichtbar.
- Service-Worker Cache auf V4 angehoben, damit Updates ausgeliefert werden.
