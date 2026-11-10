import { useEffect, useRef, useState } from "react";
import { requestAuth } from "../auth.js";

function SignaturePad({ label, onInk, padRef }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const inked = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 560;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(168 * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1b2a4a";
  }, []);

  function point(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event) {
    if (event.button != null && event.button !== 0) return;
    canvasRef.current.setPointerCapture(event.pointerId);
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const next = point(event);
    ctx.beginPath();
    ctx.moveTo(next.x, next.y);
  }

  function move(event) {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const next = point(event);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    if (!inked.current) {
      inked.current = true;
      onInk(true);
    }
  }

  function stop() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    inked.current = false;
    onInk(false);
  }

  padRef.current = {
    clear,
    dataUrl: () => canvasRef.current.toDataURL("image/png"),
  };

  return (
    <canvas
      ref={canvasRef}
      className="consent-pad"
      aria-label={label}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={stop}
      onPointerCancel={stop}
    />
  );
}

export default function Consent({ text, user, language, onNavigate, onSigned }) {
  const copy = text.consent;
  const padRef = useRef(null);
  const [hasInk, setHasInk] = useState(false);
  const [record, setRecord] = useState(null);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(user ? "loading" : "ready");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setRecord(null);
      setEditing(false);
      setStatus("ready");
      return undefined;
    }
    let cancelled = false;
    setStatus("loading");
    requestAuth("/api/auth/consent")
      .then((data) => {
        if (cancelled) return;
        setRecord(data.signed ? data : null);
        setEditing(!data.signed);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setEditing(true);
        setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function save(event) {
    event.preventDefault();
    if (!hasInk || !padRef.current) {
      setError(copy.empty);
      return;
    }
    setError("");
    setMessage("");
    setStatus("saving");
    try {
      const next = await requestAuth("/api/auth/consent", { signature: padRef.current.dataUrl() });
      const saved = await requestAuth("/api/auth/consent");
      setRecord(saved.signed ? saved : null);
      setEditing(false);
      setHasInk(false);
      setStatus("ready");
      setMessage(copy.saved);
      onSigned(next);
    } catch (err) {
      setStatus("ready");
      setError(copy.errors[err.code] || copy.errors.request_failed);
    }
  }

  const signedDate = record?.signedAt
    ? new Date(record.signedAt).toLocaleDateString(language === "sw" ? "sw" : "en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <article className="page page-consent">
      <div className="page-band">
        <h1 id="consent-title">{copy.title}</h1>
        <p className="lede">{copy.lede}</p>
        <div className="consent-doc">
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        {!user ? (
          <div className="consent-gate">
            <p>{copy.signIn}</p>
            <div className="consent-actions">
              <button type="button" className="button button-accent" onClick={() => onNavigate("login")}>
                {text.logIn}
              </button>
              <button type="button" className="button button-secondary" onClick={() => onNavigate("signup")}>
                {text.signUp}
              </button>
            </div>
          </div>
        ) : null}

        {user && record && !editing ? (
          <div className="consent-signed">
            <p>{copy.signed.replace("{date}", signedDate)}</p>
            <img src={record.signature} alt={copy.padLabel} />
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
                setHasInk(false);
              }}
            >
              {copy.again}
            </button>
          </div>
        ) : null}

        {user && editing && status !== "loading" ? (
          <form className="consent-sign" onSubmit={save}>
            <p className="consent-pad-label" id="consent-pad-label">
              {copy.padLabel}
            </p>
            <SignaturePad label={copy.padLabel} onInk={setHasInk} padRef={padRef} />
            <div className="consent-actions">
              <button type="button" className="button button-secondary" onClick={() => padRef.current?.clear()}>
                {copy.clear}
              </button>
              <button type="submit" className="button button-accent" disabled={status === "saving" || !hasInk}>
                {status === "saving" ? copy.signing : copy.sign}
              </button>
            </div>
          </form>
        ) : null}

        {error ? (
          <p className="fine consent-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="fine" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </article>
  );
}
