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

function readyToAgree(node) {
  const panels = [...node.querySelectorAll("details")];
  return panels.length > 0 && panels.every((panel) => panel.open) && reachedEnd(node);
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
    if (node && readyToAgree(node)) setRead(true);
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
            if (readyToAgree(event.currentTarget)) setRead(true);
          }}
        >
          {copy.documents.map((document) => (
            <details
              key={document.title}
              className="consent-policy"
              open
              onToggle={(event) => {
                const node = event.currentTarget.parentElement;
                if (node && readyToAgree(node)) setRead(true);
              }}
            >
              <summary>
                <span className="consent-policy-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M12 3.2 22 20.5H2L12 3.2z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M12 9.2v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="17.2" r="0.9" fill="currentColor" />
                  </svg>
                </span>
                <span>{document.title}</span>
              </summary>
              <div className="consent-policy-body">
                {document.sections.map((section) => (
                  <section key={section.heading}>
                    <h3>{section.heading}</h3>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </section>
                ))}
              </div>
            </details>
          ))}
          <p className="consent-version">{copy.versionNote}</p>
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
