# QULORA V9 · AI Milestone

## Der Meilenstein
Ask QULORA kann jetzt über ein echtes, sicheres KI-Backend laufen. Die GitHub-Pages-App sendet eine Küchenfrage plus einen kompakten QULORA-Betriebskontext an den QULORA-AI-Worker. Der OpenAI-API-Key bleibt ausschließlich serverseitig.

### QULORA AI bekommt Kontext zu
- nächster Gesamtprognose und Prognosekorridor
- Forecast-Treibern
- aktuellem Speiseplan
- prognostiziertem Produktlinien-Mix
- echten Top-Gerichten, soweit vorhanden
- letzten Ist-Essenszahlen
- zukünftigen betrieblichen Ereignissen
- gespeicherten Gerichten aus Speiseplänen
- aktuellen Such-/Bedarfssignalen
- kurzem Chatverlauf

### QULORA AI kann
- freie Gerichtsideen und moderne Varianten entwickeln
- Rezepte und Produktionsabläufe erklären
- Mengen für 40 / 100 / 500 Personen planen
- Burger-, Bowl-, Pasta-, Curry-, Schnitzel- und andere Konzepte empfehlen
- Speisepläne fachlich challengen
- Alternativen vorschlagen
- betriebliche QULORA-Prognosen erklären
- direkte Aktionen zurückgeben: Gericht öffnen, in Speiseplan übernehmen, Datenbasis/Forecast/Lernen öffnen

## Sicheres Backend
Ordner: `ai-backend/`

Dort liegt ein einzelner Cloudflare-Worker `qulora-ai-worker.js`. Er ruft die OpenAI Responses API auf. Der API-Key gehört **nie** in `index.html`.

Schnelleinrichtung: siehe `ai-backend/README_AI_BACKEND.md`.

## Fallback
Ist noch kein Backend verbunden oder fällt es aus, arbeitet der lokale Culinary Copilot weiter. Die App bleibt also benutzbar.

## Bestehende QULORA-Funktionen bleiben erhalten
- Prognose
- Speiseplan / Trend Intelligence
- wöchentlicher Trend-Workflow
- Gerichte-Referenzkatalog + eigene Gerichtshistorie
- persistentes Speiseplan-Gedächtnis
- Such-/Bedarfsradar
- lokale Datensicherung
