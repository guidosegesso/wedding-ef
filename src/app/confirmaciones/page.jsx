import ClientTable from "./ClientTable";

export const dynamic = "force-dynamic";

async function fetchFromAppsScript() {
  const base = process.env.GOOGLE_APPS_SCRIPT_READ_URL;
  if (!base) throw new Error("Missing GOOGLE_APPS_SCRIPT_READ_URL");
  const key = process.env.GOOGLE_APPS_SCRIPT_READ_KEY;
  const url = key ? `${base}${base.includes("?") ? "&" : "?"}key=${encodeURIComponent(key)}` : base;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Apps Script fetch failed");
  const rows = await res.json();
  // Expecting an array of objects with our fields; do a light normalize
  return (Array.isArray(rows) ? rows : []).map((r) => ({
    timestamp: r.timestamp || r.Timestamp || r.fecha || r.Fecha || "",
    nombre: r.nombre || r.Nombre || r["Nombre y apellido"] || "",
    email: r.email || r.Email || "",
    vasAPoderVenir: r.vasAPoderVenir || r.Asistencia || r.asistencia || "",
    cantidadAcompanantes: r.cantidadAcompanantes ?? r["Cantidad de acompañantes"] ?? r.acompanantes ?? "",
    comentarios: r.comentarios ?? r.Comentarios ?? r.notas ?? "",
  })).reverse();
}

async function fetchFromGoogleSheet() {
  const sheetId = process.env.GOOGLE_SHEET_ID || "14lELOMpTOphl16EGLZu1RQ9hCtkl7JXNa6GMj2ohoYI"; // fallback: sample id
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
  const res = await fetch(base, { cache: "no-store" });
  if (!res.ok) throw new Error("Google Sheet fetch failed");
  const text = await res.text();
  const jsonText = text.replace(/^.*setResponse\(/, "").replace(/\);\s*$/, "");
  const data = JSON.parse(jsonText);
  const cols = (data?.table?.cols || []).map((c) => c?.label || c?.id || "");
  const rawRows = data?.table?.rows || [];
  const rows = rawRows.map((r) => {
    const obj = {};
    (r?.c || []).forEach((cell, idx) => {
      const key = cols[idx] || `col${idx}`;
      obj[key] = cell && typeof cell.v !== "undefined" && cell.v !== null ? cell.v : "";
    });
    return obj;
  });
  // normalize keys to what the UI expects
  const normalized = rows.map((r) => ({
    timestamp: r.timestamp || r.Timestamp || r.fecha || r.Fecha || "",
    nombre: r.nombre || r.Nombre || r["Nombre y apellido"] || "",
    email: r.email || r.Email || "",
    vasAPoderVenir: r.vasAPoderVenir || r.Asistencia || r.asistencia || "",
    cantidadAcompanantes: r.cantidadAcompanantes ?? r["Cantidad de acompañantes"] ?? r.acompanantes ?? "",
    comentarios: r.comentarios ?? r.Comentarios ?? r.notas ?? "",
  }));
  return normalized.reverse(); // newest first
}

export default async function Page() {
  let rows = [];
  try {
    // 1) Apps Script JSON (preferred)
    rows = await fetchFromAppsScript();
    console.log("/confirmaciones: usando Apps Script JSON", { count: rows.length, url: process.env.GOOGLE_APPS_SCRIPT_READ_URL ? "set" : "missing" });
  } catch (e1) {
    console.error("/confirmaciones: fallo Apps Script JSON", e1);
    try {
      // 2) Public Google Sheet (gviz) fallback
      rows = await fetchFromGoogleSheet();
      console.log("/confirmaciones: usando Google Sheet (gviz)", { count: rows.length, sheetId: process.env.GOOGLE_SHEET_ID || "unset" });
    } catch (e2) {
      console.error("/confirmaciones: fallo Google Sheet (gviz)", e2);
      // 3) Sin datos disponibles
      rows = [];
      console.log("/confirmaciones: sin datos (Apps Script y gviz fallaron)");
    }
  }
  return (
    <div className="min-h-screen w-full px-4 py-8">
      <main className="mx-auto w-full max-w-5xl">
        <ClientTable rows={rows} />
      </main>
    </div>
  );
}
