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

export default function SupportDesk({ text, language, tab, onError }) {
  const [tickets, setTickets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const selected = tickets.find((ticket) => ticket.id === selectedId) || null;

  useEffect(() => {
    let cancelled = false;
    const status = tab === "closed" ? "closed" : "open";
    setLoaded(false);
    requestAuth(`/api/support/queue?status=${status}`)
      .then((data) => {
        if (cancelled) return;
        setTickets(data.tickets || []);
        setSelectedId("");
        setReply("");
      })
      .catch((caught) => {
        if (!cancelled) onError(caught.code || "request_failed");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, onError]);

  function applyTicket(next) {
    const visible = tab === "closed" ? next.status === "closed" : next.status !== "closed";
    setTickets((list) => {
      const rest = list.filter((item) => item.id !== next.id);
      return visible ? [next, ...rest] : rest;
    });
    setSelectedId(visible ? next.id : "");
    setReply("");
  }

  async function sendReply(event) {
    event.preventDefault();
    if (!selected) return;
    setPending(true);
    onError("");
    try {
      const next = await requestAuth(`/api/support/tickets/${selected.id}/reply`, { message: reply });
      applyTicket(next);
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function setStatus(status) {
    if (!selected || selected.status === status) return;
    setPending(true);
    onError("");
    try {
      const next = await requestAuth(`/api/support/tickets/${selected.id}/status`, { status });
      applyTicket(next);
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-split">
      <div>
        {loaded && tickets.length === 0 ? <p>{text.empty}</p> : null}
        <ul className="admin-list">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button
                type="button"
                className="admin-row"
                aria-current={ticket.id === selectedId ? "true" : undefined}
                onClick={() => {
                  setSelectedId(ticket.id);
                  setReply("");
                  onError("");
                }}
              >
                <span>{ticket.subject}</span>
                <span className="line-meta">{text.status[ticket.status]}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selected ? (
        <article className="support-detail">
          <h2>{selected.subject}</h2>
          <p className="ticket-meta">
            {text.categories[selected.category]} · {text.by} {selected.username} · {formatWhen(selected.createdAt, language)}
          </p>
          <p className="ticket-meta">{text.original}</p>
          <p>{selected.message}</p>
          {selected.replies?.length ? (
            <ul className="support-replies">
              {selected.replies.map((item) => (
                <li key={item.id}>
                  <p className="ticket-meta">
                    {item.role === "support" ? text.support : text.you} · {formatWhen(item.createdAt, language)}
                  </p>
                  <p>{item.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="support-status">
            {Object.entries(text.status).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="button button-secondary"
                aria-pressed={selected.status === id}
                disabled={pending || selected.status === id}
                onClick={() => setStatus(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <form className="support-form" onSubmit={sendReply}>
            <label className="auth-field">
              <span>{text.reply}</span>
              <textarea
                required
                minLength={2}
                maxLength={2000}
                rows={5}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
              />
            </label>
            <button type="submit" className="button button-accent" disabled={pending}>
              {pending ? text.sending : text.send}
            </button>
          </form>
        </article>
      ) : null}
    </div>
  );
}
