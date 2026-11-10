import { useEffect, useId, useRef, useState } from "react";
import { requestAuth } from "../auth.js";

const PENDING_KEY = "nia-consent-prompt";

export function markConsentPending() {
  sessionStorage.setItem(PENDING_KEY, "1");
}

export function consentPromptPending() {
  return sessionStorage.getItem(PENDING_KEY) === "1";
}

export function clearConsentPending() {
  sessionStorage.removeItem(PENDING_KEY);
}

function reachedEnd(node) {
  return node.scrollHeight <= node.clientHeight + 8 || node.scrollTop + node.clientHeight >= node.scrollHeight - 8;
}

export default function ConsentDialog({ text, onClose, onSigned, onAgree }) {
  const copy = text.consent;
  const titleId = useId();
  const docRef = useRef(null);
  const [read, setRead] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    const node = docRef.current;
    if (node && reachedEnd(node)) setRead(true);
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function accept(event) {
    event.preventDefault();
    if (!agreed) return;
    setError("");
    setStatus("saving");
    try {
      if (onAgree) {
        await onAgree();
        return;
      }
      const next = await requestAuth("/api/auth/consent", { agreed: true });
      clearConsentPending();
      setStatus("ready");
      onSigned(next);
    } catch (err) {
      setStatus("ready");
      setError(copy.errors[err.code] || copy.errors.request_failed);
    }
  }

  return (
    <div className="consent-layer">
      <button type="button" className="consent-backdrop" aria-label={copy.later} onClick={onClose} />
      <div className="consent-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId}>{copy.title}</h2>
        <p className="lede">{copy.lede}</p>
        <div
          className="consent-doc"
          ref={docRef}
          tabIndex={0}
          onScroll={(event) => {
            if (reachedEnd(event.currentTarget)) setRead(true);
          }}
        >
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
        <form onSubmit={accept}>
          {read ? null : <p className="fine">{copy.scrollHint}</p>}
          <label className="consent-agree">
            <input
              type="checkbox"
              checked={agreed}
              disabled={!read || status === "saving"}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>{copy.agreeLabel}</span>
          </label>
          {error ? (
            <p className="fine consent-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="consent-actions">
            <button type="button" className="button button-secondary" onClick={onClose}>
              {copy.later}
            </button>
            <button type="submit" className="button button-accent" disabled={!agreed || status === "saving"}>
              {status === "saving" ? copy.accepting : copy.accept}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
