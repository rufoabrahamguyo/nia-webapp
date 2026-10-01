import { useEffect, useRef, useState } from "react";
import { requestAuth } from "../auth.js";

function downloadNotes(records, copy, language) {
  const parts = [...records].reverse().map((record) => {
    const when = formatWhen(record.updatedAt, language);
    const mark = record.edited ? `\n${copy.edited}` : "";
    return `${when}${mark}\n\n${record.body}`;
  });
  const text = `\uFEFF${copy.downloadHeading}\n\n${parts.join("\n\n---\n\n")}\n`;
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = copy.downloadName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatWhen(value, language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "sw" ? "sw-KE" : "en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function PrivateRecord({ user, text, language, onOpen }) {
  const copy = text.record;
  const fieldRef = useRef(null);
  const [records, setRecords] = useState([]);
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(Boolean(user));
  const [errorCode, setErrorCode] = useState("");
  const [saved, setSaved] = useState(false);
  const error = errorCode ? copy.errors[errorCode] || copy.errors.request_failed : "";

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    requestAuth("/api/records")
      .then((data) => {
        if (!cancelled) setRecords(data.records || []);
      })
      .catch((caught) => {
        if (!cancelled) setErrorCode(caught.code || "request_failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="record-gate">
        <p>{copy.signIn}</p>
        <button type="button" className="button button-accent" onClick={() => onOpen("login")}>
          {text.logIn}
        </button>
      </div>
    );
  }

  function startEdit(record) {
    setEditingId(record.id);
    setBody(record.body);
    setSaved(false);
    setConfirmId(null);
    setErrorCode("");
    fieldRef.current?.focus();
  }

  function cancelEdit() {
    setEditingId(null);
    setBody("");
    setSaved(false);
    setErrorCode("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    setErrorCode("");
    setSaved(false);
    setPending(true);
    try {
      if (editingId) {
        const next = await requestAuth("/api/records", { body, edited: true });
        setRecords((list) => [next, ...list]);
        setEditingId(null);
      } else {
        const next = await requestAuth("/api/records", { body });
        setRecords((list) => [next, ...list]);
      }
      setBody("");
      setSaved(true);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function remove(id) {
    setErrorCode("");
    setPending(true);
    try {
      await requestAuth(`/api/records/${id}`, null, "DELETE");
      setRecords((list) => list.filter((item) => item.id !== id));
      if (editingId === id) cancelEdit();
      setConfirmId(null);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="record-writer">
      <form onSubmit={onSubmit}>
        <label className="auth-field record-field">
          <span>{editingId ? copy.editTitle : copy.title}</span>
          <textarea
            ref={fieldRef}
            name="record"
            required
            maxLength={20000}
            rows={8}
            value={body}
            placeholder={copy.placeholder}
            onChange={(event) => {
              setBody(event.target.value);
              setSaved(false);
            }}
          />
        </label>
        <p className="fine record-hint">{editingId ? copy.editHint : copy.hint}</p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="account-saved" role="status">
            {copy.saved}
          </p>
        ) : null}
        <div className="record-actions">
          <button type="submit" className="button button-accent" disabled={pending}>
            {pending ? copy.saving : editingId ? copy.update : copy.save}
          </button>
          {editingId ? (
            <button type="button" className="button button-secondary" onClick={cancelEdit} disabled={pending}>
              {copy.cancel}
            </button>
          ) : null}
        </div>
      </form>

      {records.length > 0 ? (
        <div className="record-export">
          <button type="button" className="button button-secondary" onClick={() => downloadNotes(records, copy, language)}>
            {copy.download}
          </button>
          <p className="fine">{copy.downloadNote}</p>
        </div>
      ) : null}

      {records.length > 0 ? (
        <ul className="record-list">
          {records.map((record) => (
            <li className="story-card" key={record.id}>
              <p className="record-when">
                {formatWhen(record.updatedAt, language)}
                {record.edited ? <span className="record-edited">{copy.edited}</span> : null}
              </p>
              <p className="record-body">{record.body}</p>
              <div className="record-actions">
                <button type="button" className="next-link" onClick={() => startEdit(record)}>
                  {copy.edit}
                </button>
                {confirmId === record.id ? (
                  <>
                    <span>{copy.deleteAsk}</span>
                    <button type="button" className="next-link" onClick={() => remove(record.id)} disabled={pending}>
                      {copy.remove}
                    </button>
                    <button type="button" className="next-link" onClick={() => setConfirmId(null)}>
                      {copy.cancel}
                    </button>
                  </>
                ) : (
                  <button type="button" className="next-link" onClick={() => setConfirmId(record.id)}>
                    {copy.remove}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {!loading && !errorCode && records.length === 0 ? <p className="record-empty">{copy.empty}</p> : null}
    </div>
  );
}
