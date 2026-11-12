import { useState } from "react";
import { requestAuth } from "../auth.js";

export default function ReportForm({ copy, user, titleId, onSignIn, onConsent, onSent, tone }) {
  const [checks, setChecks] = useState([]);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const error = errorCode ? copy.errors[errorCode] || copy.errors.request_failed : "";

  function toggle(id) {
    setChecks((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function submit(event) {
    event.preventDefault();
    const chosen = copy.checks.filter((item) => checks.includes(item.id));
    const written = note.trim();
    if (!chosen.length && written.length < 10) {
      setErrorCode("invalid_ticket");
      return;
    }
    const category = chosen.length === 1 ? chosen[0].id : "other";
    const subject = (chosen.map((item) => item.label).join(", ") || copy.elseLabel).slice(0, 120);
    const message = [chosen.map((item) => item.label).join(". "), written].filter(Boolean).join("\n\n");
    setPending(true);
    setErrorCode("");
    setSent(false);
    try {
      const ticket = await requestAuth("/api/support/tickets", { category, subject, message });
      setChecks([]);
      setNote("");
      setSent(true);
      onSent?.(ticket);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  if (tone === "page") {
    return (
      <>
        <h1 id={titleId}>{copy.title}</h1>
        <p className="auth-line">{copy.lede}</p>
        <p className="auth-line">{copy.notEmergency}</p>
        {sent ? (
          <p className="account-saved" role="status">{copy.sent}</p>
        ) : (
          <form onSubmit={submit}>
            <fieldset className="auth-choice">
              <legend>{copy.askTitle}</legend>
              <p className="auth-line">{copy.askLine}</p>
              {copy.checks.map((item) => (
                <label key={item.id}>
                  <input type="checkbox" checked={checks.includes(item.id)} onChange={() => toggle(item.id)} />
                  <span>
                    <strong>{item.label}</strong>
                    <span>{item.line}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <label className="auth-field">
              <span>{copy.elseLabel}</span>
              <textarea
                rows={4}
                maxLength={2000}
                placeholder={copy.elsePlaceholder}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            {error ? <p className="auth-error" role="alert">{error}</p> : null}
            {!user ? <p className="auth-error">{copy.signIn}</p> : null}
            {user && !user.consentSigned ? <p className="auth-error">{copy.needConsent}</p> : null}
            <div className="account-actions">
              {!user ? (
                <button type="button" className="button button-accent" onClick={onSignIn}>
                  {copy.goLogin}
                </button>
              ) : !user.consentSigned ? (
                <button type="button" className="button button-accent" onClick={onConsent}>
                  {copy.goConsent}
                </button>
              ) : (
                <button type="submit" className="button button-accent" disabled={pending}>
                  {pending ? copy.sending : copy.submitReport}
                </button>
              )}
            </div>
          </form>
        )}
      </>
    );
  }

  return (
    <>
      <h2 id={titleId}>{copy.askTitle}</h2>
      <p>{copy.askLine}</p>
      {sent ? (
        <p className="report-sent" role="status">{copy.sent}</p>
      ) : (
        <form onSubmit={submit}>
          <ul className="report-checks">
            {copy.checks.map((item) => (
              <li key={item.id}>
                <label>
                  <input type="checkbox" checked={checks.includes(item.id)} onChange={() => toggle(item.id)} />
                  <span>
                    <strong>{item.label}</strong>
                    <span>{item.line}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <label className="report-else">
            <span>{copy.elseLabel}</span>
            <textarea
              rows={4}
              maxLength={2000}
              placeholder={copy.elsePlaceholder}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          {error ? <p className="report-error" role="alert">{error}</p> : null}
          {!user ? <p className="report-error">{copy.signIn}</p> : null}
          {user && !user.consentSigned ? <p className="report-error">{copy.needConsent}</p> : null}
          {!user ? (
            <button type="button" className="button button-accent report-submit" onClick={onSignIn}>
              {copy.goLogin}
            </button>
          ) : !user.consentSigned ? (
            <button type="button" className="button button-accent report-submit" onClick={onConsent}>
              {copy.goConsent}
            </button>
          ) : (
            <button type="submit" className="button button-accent report-submit" disabled={pending}>
              {pending ? copy.sending : copy.submitReport}
            </button>
          )}
        </form>
      )}
    </>
  );
}
