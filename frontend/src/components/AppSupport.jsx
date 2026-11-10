import { useEffect, useState } from "react";
import { requestAuth } from "../auth.js";

function formatWhen(value, language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "sw" ? "sw-KE" : "en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function TicketCard({ ticket, text, language, onFollowUp }) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const error = errorCode ? text.errors[errorCode] || text.errors.request_failed : "";

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setErrorCode("");
    try {
      const next = await requestAuth(`/api/support/tickets/${ticket.id}/follow-up`, { message: note });
      setNote("");
      onFollowUp(next);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="support-card">
      <h3>{ticket.subject}</h3>
      <p className="ticket-meta">
        {text.categories[ticket.category]} · {text.status[ticket.status]} · {formatWhen(ticket.createdAt, language)}
      </p>
      <p>{ticket.message}</p>
      {ticket.replies?.length ? (
        <ul className="support-replies">
          {ticket.replies.map((reply) => (
            <li key={reply.id}>
              <p className="ticket-meta">{reply.role === "support" ? text.supportReply : text.you} · {formatWhen(reply.createdAt, language)}</p>
              <p>{reply.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {ticket.status === "closed" ? null : (
        <form className="support-follow" onSubmit={submit}>
          <label className="auth-field">
            <span>{text.followUp}</span>
            <textarea
              required
              minLength={2}
              maxLength={2000}
              rows={3}
              placeholder={text.followUpPlaceholder}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          {error ? <p className="auth-error" role="alert">{error}</p> : null}
          <button type="submit" className="button button-secondary" disabled={pending}>
            {pending ? text.sending : text.add}
          </button>
        </form>
      )}
    </article>
  );
}

export default function AppSupport({ text, user, language, onOpen }) {
  const copy = text.support;
  const [category, setCategory] = useState("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const ready = Boolean(user?.consentSigned);
  const error = errorCode ? copy.errors[errorCode] || copy.errors.request_failed : "";

  useEffect(() => {
    if (!ready) return undefined;
    let cancelled = false;
    setLoaded(false);
    requestAuth("/api/support/tickets")
      .then((data) => {
        if (!cancelled) setTickets(data.tickets || []);
      })
      .catch((caught) => {
        if (!cancelled) setErrorCode(caught.code || "request_failed");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setErrorCode("");
    setSent(false);
    try {
      const ticket = await requestAuth("/api/support/tickets", { category, subject, message });
      setTickets((list) => [ticket, ...list]);
      setSubject("");
      setMessage("");
      setCategory("bug");
      setSent(true);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  function replaceTicket(next) {
    setTickets((list) => list.map((item) => (item.id === next.id ? next : item)));
  }

  return (
    <article className="page page-support">
      <header className="page-hero">
        <div className="page-hero-copy">
          <h1>{copy.title}</h1>
          <p className="lede">{copy.lede}</p>
        </div>
      </header>
      <section className="page-band">
        <p className="support-note">{copy.notEmergency}</p>
        {!user ? (
          <div className="support-gate">
            <p>{copy.signIn}</p>
            <button type="button" className="button button-accent" onClick={() => onOpen("login")}>
              {copy.goLogin}
            </button>
          </div>
        ) : !ready ? (
          <div className="support-gate">
            <p>{copy.needConsent}</p>
            <button type="button" className="button button-accent" onClick={() => onOpen("consent")}>
              {copy.goConsent}
            </button>
          </div>
        ) : (
          <div className="support-layout">
            <form className="support-form" onSubmit={submit}>
              <label className="auth-field">
                <span>{copy.category}</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {Object.entries(copy.categories).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="auth-field">
                <span>{copy.subject}</span>
                <input
                  required
                  minLength={3}
                  maxLength={120}
                  placeholder={copy.subjectPlaceholder}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </label>
              <label className="auth-field">
                <span>{copy.message}</span>
                <textarea
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={6}
                  placeholder={copy.messagePlaceholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </label>
              {sent ? <p className="support-sent" role="status">{copy.sent}</p> : null}
              {error ? <p className="auth-error" role="alert">{error}</p> : null}
              <button type="submit" className="button button-accent" disabled={pending}>
                {pending ? copy.sending : copy.send}
              </button>
            </form>
            <div className="support-list">
              <h2>{copy.yours}</h2>
              {loaded && tickets.length === 0 ? <p>{copy.empty}</p> : null}
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  text={copy}
                  language={language}
                  onFollowUp={replaceTicket}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
