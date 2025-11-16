"use client";

import { useMemo, useState, useEffect } from "react";
import content from "../content/content.json";

function Pill({ children, as = "button", disabled = false, onClick, ariaLabel }) {
  const Tag = as;
  return (
    <Tag
      aria-label={ariaLabel}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={`pill ${disabled ? "is-disabled select-none" : ""}`}
    >
      {children}
    </Tag>
  );
}

function Modal({ open, title, children, onClose, wide = false }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />
      <div
        className={`relative max-h-[85vh] overflow-auto rounded-2xl bg-surface text-on-surface p-6 w-[92vw] ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function DynamicField({ field }) {
  const common = "w-full rounded-lg border border-zinc-300 px-3 py-2";
  const label = (
    <label className="block text-sm font-medium text-zinc-700 mb-1" htmlFor={field.name}>
      {field.label}
      {field.required ? <span className="text-red-600"> *</span> : null}
    </label>
  );
  if (field.type === "select") {
    return (
      <div>
        {label}
        <select id={field.name} name={field.name} required={field.required} className={common}>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div>
        {label}
        <textarea id={field.name} name={field.name} rows={4} className={common} />
      </div>
    );
  }
  return (
    <div>
      {label}
      <input
        id={field.name}
        name={field.name}
        type={field.type || "text"}
        required={field.required}
        min={field.min}
        max={field.max}
        step={field.step}
        className={common}
      />
    </div>
  );
}

function OpenGoogleMaps() {
  const dest = encodeURIComponent(
    (content.modals.map.destination || "").toString()
  );
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = encodeURIComponent(
          `${pos.coords.latitude},${pos.coords.longitude}`
        );
        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
        window.open(url, "_blank", "noopener");
      },
      () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
        window.open(url, "_blank", "noopener");
      },
      { maximumAge: 600000, timeout: 5000 }
    );
  } else {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    window.open(url, "_blank", "noopener");
  }
}

export default function WeddingPage() {
  const [open, setOpen] = useState(null); // 'rsvp' | 'map' | 'bank'
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', message: string }
  const [toast, setToast] = useState(null); // { message, x, y }

  // Configurable duración del toast (en milisegundos)
  const TOAST_DURATION = 600;

  // Auto-ocultar el toast luego del tiempo configurado
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_DURATION);
    return () => clearTimeout(t);
  }, [toast]);

  const brandStyles = useMemo(
    () => ({
      fontFamily: content.typography.primaryFont,
    }),
    []
  );

  const normalizeHeroImageSrc = () => {
    const raw = content.hero?.image?.src || "";
    if (!raw) return "";
    if (raw.startsWith("@/")) {
      const withoutAlias = raw.replace(/^@\/+/, "");
      if (withoutAlias.startsWith("assets/images/")) {
        return `/images/${withoutAlias.replace("assets/images/", "")}`;
      }
      return `/${withoutAlias}`;
    }
    return raw;
  };

  const heroImageSrc = normalizeHeroImageSrc();
  const heroImageAlt = content.hero?.image?.alt || "Imagen principal";
  const cuandoYDonde = content.hero?.cuandoYdonde || {};
  const bendicion = content.hero?.bendicion;  
  const fechaLine = cuandoYDonde.fecha + ", " + cuandoYDonde.hora;
  const lugarLine = cuandoYDonde.lugar;
  const localidadLine = cuandoYDonde.localidad;
  const bendicionTexto = bendicion.text;
  const bendicionHora = bendicion.hora;
  const invite = content.hero?.invite;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 bg-primary text-on-primary"
      style={brandStyles}
    >
      <main className="mx-auto flex w-full max-w-xl sm:max-w-2xl flex-col items-center text-center">
        <div className="titulo1">“{content.hero.tag}”</div>

        <div className="titulo2">
          <div className="titulo2-text">“{content.hero.title}”</div>
        </div>

        <div className="imagen">
          {heroImageSrc ? (
            <img src={heroImageSrc} alt={heroImageAlt} className="imagen-foto" />
          ) : null}
        </div>

        <div className="cuandoYdonde space-y-1">
          <div className="cuandoYdonde-fecha">{fechaLine}</div>
          <div className="cuandoYdonde-lugar-localidad">
            <span className="cuandoYdonde-lugar">{lugarLine}</span>
            <span className="cuandoYdonde-localidad">{localidadLine}</span>
          </div>
        </div>

        <div className="bendicion space-y-1">
          <div className="bendicion-descripcion">“{bendicionTexto}”</div>
          <div className="bendicion-hora">{bendicionHora}</div>
        </div>
        <div className="invitacion">
          “{invite}”
        </div>

        <div className="asistencia">
          <Pill onClick={() => setOpen("rsvp")} ariaLabel={content.buttons.rsvp}>
            {content.buttons.rsvp}
          </Pill>
        </div>

        <div className="vestimenta space-y-1">
          <div className="vestimenta-titulo">
            {content.buttons.dressTitle}
          </div>
          <div className="vestimenta-valor">
            {content.buttons.dressValue}
          </div>
        </div>

        <div className="mapa">
          <div className="mapa-text">“{content.hero.mapNote}”</div>
          <Pill onClick={() => OpenGoogleMaps()} ariaLabel={content.buttons.map}>
            {content.buttons.map}
          </Pill>
        </div>

        <div className="regalo">
          <div className="regalo-text">“{content.hero.giftNote}”</div>
          <Pill onClick={() => setOpen("bank")} ariaLabel={content.buttons.bank}>
            {content.buttons.bank}
          </Pill>
        </div>
      </main>

      {/* RSVP Modal */}
      <Modal open={open === "rsvp"} onClose={() => setOpen(null)} title={content.modals.rsvp.title}>
        <p className="text-sm text-zinc-700 mb-4">{content.modals.rsvp.intro}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            const payload = {
              nombre: (fd.get("nombre") || "").toString(),
              email: (fd.get("email") || "").toString(),
              asistencia: (fd.get("asistencia") || "").toString(),
              acompanantes: fd.get("acompanantes")
                ? Number(fd.get("acompanantes"))
                : "",
              notas: (fd.get("notas") || "").toString(),
            };
            try {
              setSubmitting(true);
              const res = await fetch("/api/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (!res.ok) throw new Error("Error al enviar confirmación");
              form.reset();
              setOpen(null);
              setResult({
                type: "success",
                message: "¡Registramos tu confirmación correctamente!",
              });
            } catch (err) {
              console.error(err);
              setResult({
                type: "error",
                message:
                  "No pudimos registrar tu confirmación. Intentá más tarde.",
              });
            } finally {
              setSubmitting(false);
            }
          }}
          className="grid gap-4"
        >
          <fieldset disabled={submitting} className="grid gap-4 contents">
            {content.modals.rsvp.fields.map((f) => (
              <DynamicField key={f.name} field={f} />
            ))}
          </fieldset>
          <div className="flex justify-end">
            <button type="submit" className="btn px-5 py-2 flex items-center gap-2 disabled:opacity-70" disabled={submitting}>
              {submitting ? (
                <>
                  <span
                    aria-hidden
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"
                  />
                  Enviando...
                </>
              ) : (
                content.modals.rsvp.submit
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Result Modal */}
      <Modal
        open={!!result}
        onClose={() => setResult(null)}
        title={result?.type === "success" ? "Confirmación registrada" : result?.type === "error" ? "Hubo un problema" : ""}
      >
        {result ? (
          <div className="flex items-start gap-3 text-zinc-800">
            {result.type === "success" ? (
              <svg className="mt-0.5 h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
            ) : (
              <svg className="mt-0.5 h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            )}
            <div className="flex-1">
              <p>{result.message}</p>
              <div className="mt-4 flex justify-end">
                <button className="btn px-4 py-2" onClick={() => setResult(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Toast: pequeño aviso de copiado */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed z-[60] pointer-events-none rounded-lg bg-black/80 text-white px-3 py-2 text-sm shadow-lg"
          style={{ left: toast.x, top: toast.y, transform: "translate(-50%, -140%)" }}
        >
          {toast.message}
        </div>
      ) : null}

      {/* Map Modal */}
      <Modal open={open === "map"} onClose={() => setOpen(null)} 
        title={content.modals.map.title} 
        wide>
        {/* <p className="text-sm text-zinc-700 mb-3">{content.modals.map.note}</p> */}
        <div className="map-embed rounded-lg border overflow-hidden">
          <iframe
            src={content.modals.map.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="btn px-4 py-2"
            onClick={() => {
              OpenGoogleMaps();
            }}
          >
            Cómo llegar
          </button>
        </div>
      </Modal>

      {/* Bank Modal */}
      <Modal open={open === "bank"} onClose={() => setOpen(null)} title={content.modals.bank.title}>
        <div className="grid gap-3 text-zinc-800">
          <p>{content.modals.bank.text}</p>
          <div className="rounded-lg bg-zinc-100 p-3">
            <div><strong>Banco:</strong> {content.modals.bank.bankName}</div>
            <div><strong>{"Titular:"}</strong> {content.modals.bank.holder}</div>
            <div className="copy-row"><strong>CBU:</strong> <span id="cbu" className="copy-text">{content.modals.bank.cbu}</span>
              <button
                className="icon-btn"
                title="Copiar"
                aria-label="Copiar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  try {
                    navigator.clipboard.writeText(content.modals.bank.cbu);
                    setToast({ message: "CBU copiado", x: rect.left + rect.width / 2, y: rect.top });
                  } catch (_) {
                    setToast({ message: "No se pudo copiar", x: rect.left + rect.width / 2, y: rect.top });
                  }
                }}
              >
                <svg className="copy-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1z"/>
                  <path d="M20 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z"/>
                </svg>
              </button>
            </div>
            <div className="copy-row"><strong>Alias:</strong> <span className="copy-text">{content.modals.bank.alias}</span>
              <button
                className="icon-btn"
                title="Copiar"
                aria-label="Copiar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  try {
                    navigator.clipboard.writeText(content.modals.bank.alias);
                    setToast({ message: "Alias copiado", x: rect.left + rect.width / 2, y: rect.top });
                  } catch (_) {
                    setToast({ message: "No se pudo copiar", x: rect.left + rect.width / 2, y: rect.top });
                  }
                }}
              >
                <svg className="copy-svg" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1z"/>
                  <path d="M20 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
