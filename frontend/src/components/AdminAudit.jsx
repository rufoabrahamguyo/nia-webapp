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

export default function AdminAudit({ text, language, onError }) {
  const [entries, setEntries] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    requestAuth("/api/admin/audit")
      .then((data) => {
        if (cancelled) return;
        setEntries(data.entries || []);
        setHasMore(Boolean(data.hasMore));
      })
      .catch((caught) => onError(caught.code || "request_failed"));
    return () => {
      cancelled = true;
    };
  }, [onError]);

  async function loadEarlier() {
    const last = entries[entries.length - 1];
    if (!last) return;
    setPending(true);
    try {
      const data = await requestAuth(`/api/admin/audit?before=${encodeURIComponent(last.createdAt)}`);
      setEntries((list) => [...list, ...(data.entries || [])]);
      setHasMore(Boolean(data.hasMore));
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {entries.length === 0 ? <p className="record-empty">{text.empty}</p> : null}
      <ul className="admin-list">
        {entries.map((entry) => (
          <li className="admin-audit" key={entry.id}>
            <p>{entry.summary}</p>
            <p className="line-meta">
              {entry.actorEmail} · {formatWhen(entry.createdAt, language)}
            </p>
          </li>
        ))}
      </ul>
      {hasMore ? (
        <button type="button" className="button button-secondary" onClick={loadEarlier} disabled={pending}>{text.earlier}</button>
      ) : null}
    </div>
  );
}
