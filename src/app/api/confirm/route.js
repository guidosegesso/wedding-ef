import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Proxy RSVP submissions to Google Apps Script and append a local log
export async function POST(req) {
  try {
    const data = await req.json();

    // Map frontend fields -> Google Sheet expected keys
    const payload = {
      nombre: data?.nombre ?? "",
      email: data?.email ?? "",
      vasAPoderVenir: data?.asistencia ?? "",
      cantidadAcompanantes: String(
        typeof data?.acompanantes === "number" || typeof data?.acompanantes === "string"
          ? data.acompanantes
          : ""
      ),
      comentarios: data?.notas ?? "",
    };

    const url =
      "https://script.google.com/macros/s/AKfycbyyNhBfZm-_Hr4cruZipNdndq8UcMbu8exuxrNTaoxbqdX4ishv-yW9NE_kmCP0AoQ/exec";

    const gsResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const gsText = await gsResponse.text().catch(() => "");

    // Append to local file (best-effort; non-fatal on failure)
    try {
      const logLine = JSON.stringify({ timestamp: new Date().toISOString(), ...payload }) + "\n";
      const filePath = path.join(process.cwd(), "confirmaciones.txt");
      fs.appendFileSync(filePath, logLine, { encoding: "utf8" });
    } catch (logErr) {
      console.error("RSVP log append failed:", logErr);
    }

    return NextResponse.json(
      { ok: true, forwarded: gsResponse.ok, googleResponse: gsText },
      { status: gsResponse.ok ? 200 : 502 }
    );
  } catch (err) {
    console.error("RSVP handler error:", err);
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}

