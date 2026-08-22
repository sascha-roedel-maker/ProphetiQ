/**
 * QULORA AI Backend V1 — Cloudflare Worker
 * Keeps the OpenAI API key server-side and turns Ask QULORA into a real culinary specialist.
 */

const DEFAULT_MODEL = "gpt-5.6-terra";
const MAX_BODY_BYTES = 120_000;
const MAX_HISTORY = 12;

const QULORA_SYSTEM = `
Du bist QULORA AI — ein spezialisierter Fachassistent für Betriebsgastronomie, Gemeinschaftsgastronomie (GV), Küchenproduktion und kulinarische Planung.

DEINE IDENTITÄT
- Du bist kein allgemeiner Chatbot. Du bist der digitale kulinarische Fachmann für Betriebsrestaurants und professionelle Küchen.
- Dein Fokus: Was kochen? Wie kochen? Wie viel produzieren? Welche Alternativen? Welche Gerichte passen zusammen? Speiseplan, Auswahlquoten, Produktionsmengen, Rezeptskalierung, Mise en Place, Waren-/Resteverwertung, Trends, Gästebedarf und QULORA-Prognosen.
- Antworte standardmäßig auf Deutsch, klar, praxisnah und auf professionellem GV-Niveau.

DATENDISZIPLIN
- Trenne strikt zwischen BETRIEBSDATEN aus dem gelieferten QULORA-Kontext und ALLGEMEINER FACHEMPFEHLUNG.
- Erfinde niemals historische Verkäufe, Auswahlquoten, Forecast-Genauigkeit, Ausverkaufszeiten, andere Betriebe oder interne Betriebsdaten.
- Wenn QULORA keine belastbare betriebliche Datenbasis hat, sage das kurz und gib eine fachlich sinnvolle Startannahme mit klarer Kennzeichnung.
- Bei Mengen immer Annahmen nennen, wenn Portionsgröße oder Ausgabeform nicht eindeutig sind.
- Bei einer expliziten Personenanzahl rechne nachvollziehbar und praxisnah für GV. Berücksichtige Beilagen, Puffer und flexible Nachproduktion, wenn sinnvoll.

KÜCHENKOMPETENZ
- Entwickle konkrete Gerichtsideen und Varianten, auch modern, vegetarisch/vegan, international oder klassisch.
- Gib bei Zubereitungsfragen einen umsetzbaren Ablauf für professionelle Küche: Vorbereitung, Gar-/Produktionslogik, Warmhaltung/Finish und typische Fehler.
- Bei Speiseplänen achte auf Produktlinien, Abwechslung, Wiederholung, Textur, Farbe, Proteinmix, vegetarische Balance, Produktionskomplexität und Gästetauglichkeit.
- Bei Alternativen bleibe möglichst innerhalb der gewünschten Produktlinie oder erkläre transparent, wenn du bewusst davon abweichst.
- Bei Resteverwertung priorisiere Lebensmittelsicherheit und realistische Küchenprozesse.

SICHERHEIT & QUALITÄT
- Bei Allergenen, Hygiene, HACCP oder rechtlich relevanten Fragen: keine Normen oder Grenzwerte erfinden. Kennzeichne Unsicherheit und frage nach Land/Bundesland bzw. verweise auf die betriebliche HACCP-Vorgabe, wenn eine exakte Rechtsaussage nötig wäre.
- Keine medizinische Ernährungsberatung oder Diagnosen. Bleibe bei gastronomischer und kulinarischer Einordnung.
- Wenn eine Frage deutlich außerhalb Essen/GV/Küche liegt, sage knapp, dass QULORA dafür bewusst nicht gedacht ist, und lenke zurück in den Food-Kontext.

INTERAKTION
- Denke nicht nur in Text. Wenn sinnvoll, schlage 1–3 direkte QULORA-Aktionen vor.
- Erlaubte Action-Typen: dish, menu-add, menu, dishes, data, forecast, learn.
- Verwende dish für ein konkretes Gericht, menu-add wenn ein vorgeschlagenes Gericht direkt in den Speiseplan übernommen werden kann, menu für Speiseplan, dishes für Gerichte-Datenbank, data für Datenbasis, forecast für Prognose, learn für Lern-/Bedarfsradar.

AUSGABEFORMAT
Antworte ausschließlich als valides JSON-Objekt ohne Markdown-Codeblock:
{
  "answer": "Deine fachliche Antwort als gut lesbarer Text.",
  "actions": [
    {"type":"dish|menu-add|menu|dishes|data|forecast|learn","value":"optional","label":"kurzer Buttontext"}
  ],
  "confidence": "high|medium|low",
  "basis": "kurzer Hinweis, worauf die Antwort basiert"
}
Maximal 3 Actions. Die Antwort darf Absätze und Aufzählungen enthalten, aber muss als JSON-String korrekt escaped sein.
`;

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      "cache-control": "no-store",
    },
  });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  const configured = String(env.ALLOWED_ORIGINS || "https://sascha-roedel-maker.github.io,http://localhost:8000,http://127.0.0.1:8000")
    .split(",").map(x => x.trim()).filter(Boolean);
  if (!origin) return configured[0] || "*";
  if (configured.includes("*") || configured.includes(origin)) return origin;
  return null;
}

function safeText(value, max = 8000) {
  return String(value ?? "").slice(0, max);
}

function compactContext(ctx = {}) {
  return {
    now: safeText(ctx.now, 80),
    siteType: safeText(ctx.siteType, 60),
    dataMode: safeText(ctx.dataMode, 40),
    forecast: ctx.forecast || null,
    currentMenu: Array.isArray(ctx.currentMenu) ? ctx.currentMenu.slice(0, 20) : [],
    productLines: Array.isArray(ctx.productLines) ? ctx.productLines.slice(0, 20) : [],
    topDishes: Array.isArray(ctx.topDishes) ? ctx.topDishes.slice(0, 16) : [],
    recentActuals: Array.isArray(ctx.recentActuals) ? ctx.recentActuals.slice(-18) : [],
    futureEvents: Array.isArray(ctx.futureEvents) ? ctx.futureEvents.slice(0, 12) : [],
    learnedDishes: Array.isArray(ctx.learnedDishes) ? ctx.learnedDishes.slice(0, 80) : [],
    demandSignals: Array.isArray(ctx.demandSignals) ? ctx.demandSignals.slice(0, 20) : [],
  };
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string") return data.output_text;
  const chunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

function parseModelJson(text) {
  let raw = String(text || "").trim();
  raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first >= 0 && last > first) raw = raw.slice(first, last + 1);
  try {
    const parsed = JSON.parse(raw);
    const actions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3).filter(a =>
      ["dish","menu-add","menu","dishes","data","forecast","learn"].includes(a?.type)
    ).map(a => ({
      type: a.type,
      value: safeText(a.value, 180),
      label: safeText(a.label || "Öffnen", 60),
    })) : [];
    return {
      answer: safeText(parsed.answer || raw, 12000),
      actions,
      confidence: ["high","medium","low"].includes(parsed.confidence) ? parsed.confidence : "medium",
      basis: safeText(parsed.basis || "QULORA AI Fachwissen + bereitgestellter Betriebskontext", 240),
    };
  } catch {
    return { answer: safeText(raw, 12000), actions: [], confidence: "medium", basis: "QULORA AI Fachwissen" };
  }
}

async function callOpenAI(message, context, history, env) {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY fehlt im Worker-Secret");
  const model = env.OPENAI_MODEL || DEFAULT_MODEL;
  const recentHistory = (Array.isArray(history) ? history : []).slice(-MAX_HISTORY).map(m => ({
    role: m?.role === "assistant" ? "assistant" : "user",
    text: safeText(m?.text, 4000),
  }));

  const input = [
    "AKTUELLER QULORA-BETRIEBSKONTEXT (nur als Datenquelle verwenden, nichts ergänzen):",
    JSON.stringify(compactContext(context)),
    "LETZTER CHATVERLAUF:",
    JSON.stringify(recentHistory),
    "NEUE FRAGE DES NUTZERS:",
    safeText(message, 8000),
  ].join("\n\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: QULORA_SYSTEM,
      input,
      max_output_tokens: 1400,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.error?.message || `OpenAI HTTP ${response.status}`;
    throw new Error(msg);
  }
  return { ...parseModelJson(extractOutputText(data)), model, responseId: data?.id || null };
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env);
    if (!origin) return json({ ok: false, error: "Origin nicht erlaubt" }, 403, "null");

    if (request.method === "OPTIONS") return json({ ok: true }, 204, origin);
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json({
        ok: true,
        service: "QULORA AI",
        version: "1.0.0",
        model: env.OPENAI_MODEL || DEFAULT_MODEL,
        keyConfigured: Boolean(env.OPENAI_API_KEY),
      }, 200, origin);
    }

    if (request.method === "POST" && url.pathname === "/v1/chat") {
      const len = Number(request.headers.get("content-length") || 0);
      if (len > MAX_BODY_BYTES) return json({ ok: false, error: "Anfrage zu groß" }, 413, origin);
      let body;
      try { body = await request.json(); } catch { return json({ ok: false, error: "Ungültiges JSON" }, 400, origin); }
      const message = safeText(body?.message, 8000).trim();
      if (!message) return json({ ok: false, error: "message fehlt" }, 400, origin);
      try {
        const result = await callOpenAI(message, body?.context || {}, body?.history || [], env);
        return json({ ok: true, ...result }, 200, origin);
      } catch (error) {
        console.error("QULORA AI error", error);
        return json({ ok: false, error: safeText(error?.message || "AI-Anfrage fehlgeschlagen", 500) }, 502, origin);
      }
    }

    return json({ ok: false, error: "Route nicht gefunden" }, 404, origin);
  },
};
