"use client";

import { useMemo, useState } from "react";

export default function ClientTable({ rows }) {
  const [qName, setQName] = useState("");
  const [qEmail, setQEmail] = useState("");

  const filtered = useMemo(() => {
    const name = qName.trim().toLowerCase();
    const mail = qEmail.trim().toLowerCase();
    if (!name && !mail) return rows;
    return rows.filter((r) => {
      const rn = (r?.nombre || "").toLowerCase();
      const re = (r?.email || "").toLowerCase();
      const okName = name ? rn.includes(name) : true;
      const okMail = mail ? re.includes(mail) : true;
      return okName && okMail;
    });
  }, [rows, qName, qEmail]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold leading-tight">Confirmaciones</h1>
        <p className="text-sm text-zinc-600 mt-1">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
          {filtered.length !== rows.length ? (
            <>
              {" "}
              <span className="text-zinc-400">(de {rows.length})</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="rounded-2xl bg-surface text-on-surface shadow p-4 sm:p-6 border border-zinc-200/70">
        {/* Filtros */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1" htmlFor="f-nombre">
              Buscar por nombre
            </label>
            <input
              id="f-nombre"
              type="text"
              value={qName}
              onChange={(e) => setQName(e.target.value)}
              placeholder="Ej: Juan, María…"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1" htmlFor="f-email">
              Buscar por email
            </label>
            <input
              id="f-email"
              type="email"
              value={qEmail}
              onChange={(e) => setQEmail(e.target.value)}
              placeholder="Ej: ejemplo@correo.com"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Tabla / vacío */}
        {rows.length === 0 ? (
          <div className="py-12 text-center text-zinc-600">
            <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12h6" />
              </svg>
            </div>
            No hay confirmaciones registradas todavía.
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-zinc-600">
            No hay resultados para los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-700 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Fecha</th>
                  <th className="px-3 py-2 text-left font-medium">Nombre</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Asistencia</th>
                  <th className="px-3 py-2 text-left font-medium">Acompañantes</th>
                  <th className="px-3 py-2 text-left font-medium">Comentarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filtered.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-zinc-50 hover:bg-zinc-100/60">
                    <td className="px-3 py-2 whitespace-nowrap text-zinc-700">
                      {r.timestamp ? new Date(r.timestamp).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : ""}
                    </td>
                    <td className="px-3 py-2 font-medium text-zinc-900">{r.nombre || ""}</td>
                    <td className="px-3 py-2 text-zinc-700">{r.email || ""}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">
                        {r.vasAPoderVenir || r.asistencia || ""}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center tabular-nums">{r.cantidadAcompanantes ?? r.acompanantes ?? ""}</td>
                    <td className="px-3 py-2 text-zinc-700 break-words">{r.comentarios ?? r.notas ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

