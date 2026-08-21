# QULORA

**Predictive Culinary Intelligence** – eine mobile-first PWA für Betriebsgastronomie.

## Produktkern

QULORA folgt konsequent dieser Kette:

**Gesamtessenszahl → Absatz je Gericht → Produktionsmenge → Speiseplan bewerten → Speiseplan optimieren → Ist zurückspielen → besser werden.**

## In dieser Version eingebaut

- Gesamtprognose mit Erwartungswert, Korridor und Prognosesicherheit
- 7 kommende Betriebstage und Forecast-Kalender
- Gerichte-Datenbank mit Suche, Auswahlquote, Ø Absatz, Einsätzen, Best-/Schwächstwert
- Top-Scorer nach Produktlinie und Vergleichssituation
- Speiseplan-Import aus Text, CSV, XLS/XLSX und Foto-OCR
- Absatz- und Produktionsprognose pro Gericht
- Optimierung nur innerhalb derselben Produktlinie plus Wiederholungscheck
- automatische 5-Tage-Speiseplanvorschläge
- ähnliche Gerichte als Lernbasis für neue/seltene Gerichte
- Ausverkauft-Erfassung inklusive Uhrzeit
- Prognose vs. Ist, messbare Trefferqualität und GL-Korrektur
- zukünftige Ereignisse, Was-wäre-wenn-Szenarien, Frühwarnungen
- Produktionsstrategie aus Grundproduktion, flexibler Nachproduktion und Reserve
- Ask QULORA für natürliche Fragen zu Prognose, Gerichten und Speiseplan
- PWA-Manifest, Service Worker und App-Icons für iOS/Android

## Datenhaltung im Pilot

Die App speichert Daten zunächst lokal im Browser (`localStorage`). JSON-Export und -Import sind eingebaut. Für den späteren Mehrgeräte-/Mehrstandortbetrieb sollte eine Cloud-Datenbank mit Anmeldung ergänzt werden.

## Externe Bibliotheken

- SheetJS wird für XLS/XLSX über CDN geladen.
- Tesseract.js wird für Foto-OCR über CDN geladen.

Der Kern der App selbst benötigt kein Framework.
