import { useEffect, useRef, useState } from "react";
import { requestAuth } from "../auth.js";
import ButtonIcon from "./ButtonIcon.jsx";
import PasscodePad from "./PasscodePad.jsx";

const PAD_GATES = new Set(["locked", "choose", "confirm", "current", "fresh", "fresh-confirm", "remove"]);

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

function unlockHeaders(token) {
  return token ? { "X-Record-Unlock": token } : undefined;
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
  const [notice, setNotice] = useState("");
  const [gate, setGate] = useState(user ? "loading" : "signed-out");
  const [hasPasscode, setHasPasscode] = useState(false);
  const [token, setToken] = useState("");
  const [draft, setDraft] = useState("");
  const [nextCode, setNextCode] = useState("");
  const [attempt, setAttempt] = useState(0);
  const error = errorCode ? copy.errors[errorCode] || copy.errors.request_failed : "";

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    requestAuth("/api/records/status")
      .then(async (data) => {
        if (cancelled) return;
        const enabled = Boolean(data.passcode);
        setHasPasscode(enabled);
        if (enabled) {
          setGate("locked");
          return;
        }
        const notes = await requestAuth("/api/records");
        if (cancelled) return;
        setRecords(notes.records || []);
        setGate("open");
      })
      .catch((caught) => {
        if (cancelled) return;
        if (caught.code === "record_locked") {
          setHasPasscode(true);
          setGate("locked");
          return;
        }
        setErrorCode(caught.code || "request_failed");
        setGate("open");
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

  function fail(caught) {
    const code = caught.code || "request_failed";
    setErrorCode(code);
    setAttempt((value) => value + 1);
    if (code === "record_locked") {
      setToken("");
      setGate("locked");
    }
    if (code === "passcode_wrong" && (gate === "fresh-confirm" || gate === "confirm")) {
      setDraft("");
      setNextCode("");
      setGate(gate === "confirm" ? "choose" : "current");
    }
  }

  async function loadNotes(unlockToken) {
    const data = await requestAuth("/api/records", null, "GET", unlockHeaders(unlockToken));
    setRecords(data.records || []);
  }

  function leavePad() {
    setDraft("");
    setNextCode("");
    setErrorCode("");
    setGate("open");
  }

  async function onPasscode(code) {
    if (gate === "choose") {
      setDraft(code);
      setErrorCode("");
      setGate("confirm");
      return;
    }
    if (gate === "fresh") {
      setNextCode(code);
      setErrorCode("");
      setGate("fresh-confirm");
      return;
    }
    if (gate === "confirm" && code !== draft) {
      setDraft("");
      setErrorCode("passcode_mismatch");
      setAttempt((value) => value + 1);
      setGate("choose");
      return;
    }
    if (gate === "fresh-confirm" && code !== nextCode) {
      setNextCode("");
      setErrorCode("passcode_mismatch");
      setAttempt((value) => value + 1);
      setGate("fresh");
      return;
    }

    setErrorCode("");
    setPending(true);
    try {
      if (gate === "locked" || gate === "current" || gate === "remove") {
        const data = await requestAuth("/api/records/unlock", { passcode: code });
        setToken(data.token);
        if (gate === "locked") {
          await loadNotes(data.token);
          setHasPasscode(true);
          setGate("open");
        } else if (gate === "remove") {
          setDraft(code);
          setGate("remove-ask");
        } else {
          setDraft(code);
          setGate("fresh");
        }
        return;
      }
      if (gate === "confirm") {
        const data = await requestAuth("/api/records/passcode", { passcode: code });
        setToken(data.token);
        setHasPasscode(true);
        setDraft("");
        setNotice("saved");
        setGate("open");
        return;
      }
      if (gate === "fresh-confirm") {
        const data = await requestAuth("/api/records/passcode", { passcode: code, current: draft });
        setToken(data.token);
        setDraft("");
        setNextCode("");
        setNotice("saved");
        setGate("open");
      }
    } catch (caught) {
      fail(caught);
    } finally {
      setPending(false);
    }
  }

  async function removePasscode() {
    setErrorCode("");
    setPending(true);
    try {
      await requestAuth("/api/records/passcode", { passcode: draft }, "DELETE");
      setToken("");
      setDraft("");
      setHasPasscode(false);
      setNotice("removed");
      setGate("open");
    } catch (caught) {
      fail(caught);
      setGate("remove");
    } finally {
      setPending(false);
    }
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
    setNotice("");
    setPending(true);
    try {
      const next = editingId
        ? await requestAuth("/api/records", { body, edited: true }, "POST", unlockHeaders(token))
        : await requestAuth("/api/records", { body }, "POST", unlockHeaders(token));
      setRecords((list) => [next, ...list]);
      setEditingId(null);
      setBody("");
      setSaved(true);
    } catch (caught) {
      fail(caught);
    } finally {
      setPending(false);
    }
  }

  async function remove(id) {
    setErrorCode("");
    setPending(true);
    try {
      await requestAuth(`/api/records/${id}`, null, "DELETE", unlockHeaders(token));
      setRecords((list) => list.filter((item) => item.id !== id));
      if (editingId === id) cancelEdit();
      setConfirmId(null);
    } catch (caught) {
      fail(caught);
    } finally {
      setPending(false);
    }
  }

  const padCopy = {
    locked: [copy.enterTitle, copy.enterHint],
    choose: [copy.chooseTitle, copy.chooseHint],
    confirm: [copy.confirmTitle, copy.confirmHint],
    current: [copy.currentTitle, copy.enterHint],
    fresh: [copy.newTitle, copy.chooseHint],
    "fresh-confirm": [copy.confirmTitle, copy.confirmHint],
    remove: [copy.removeTitle, copy.enterHint],
  };

  if (gate === "loading" || gate === "signed-out") return null;

  if (gate === "remove-ask") {
    return (
      <div className="passcode-pad">
        <h2 className="passcode-title">{copy.removeAsk}</h2>
        <p className="passcode-hint">{copy.removeHint}</p>
        {error ? (
          <p className="auth-error passcode-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="record-actions passcode-ask">
          <button type="button" className="button button-accent button-icon" onClick={removePasscode} disabled={pending}>
            <ButtonIcon name="unlock" />
            {copy.removeYes}
          </button>
          <button type="button" className="button button-secondary button-icon" onClick={leavePad} disabled={pending}>
            <ButtonIcon name="close" />
            {copy.cancel}
          </button>
        </div>
      </div>
    );
  }

  if (PAD_GATES.has(gate)) {
    const [title, hint] = padCopy[gate];
    return (
      <PasscodePad
        key={gate}
        title={title}
        hint={hint}
        error={error}
        attempt={attempt}
        pending={pending}
        enteredLabel={copy.entered}
        backspaceLabel={copy.backspace}
        cancelLabel={gate === "choose" || gate === "confirm" ? copy.notNow : copy.cancel}
        onFilled={onPasscode}
        onCancel={gate === "locked" ? undefined : leavePad}
      />
    );
  }

  return (
    <div className="record-writer">
      <div className="record-passcode">
        {hasPasscode ? (
          <div className="record-actions">
            <button type="button" className="button button-secondary button-icon" onClick={() => { setErrorCode(""); setNotice(""); setGate("current"); }}>
              <ButtonIcon name="key" />
              {copy.changePasscode}
            </button>
            <button type="button" className="button button-secondary button-icon" onClick={() => { setErrorCode(""); setNotice(""); setGate("remove"); }}>
              <ButtonIcon name="unlock" />
              {copy.removePasscode}
            </button>
          </div>
        ) : (
          <button type="button" className="button button-secondary button-icon" onClick={() => { setErrorCode(""); setNotice(""); setGate("choose"); }}>
            <ButtonIcon name="lock" />
            {copy.addPasscode}
          </button>
        )}
        <p className="fine">{copy.passcodeOptional}</p>
        {notice === "saved" ? (
          <p className="account-saved" role="status">
            {copy.passcodeSaved}
          </p>
        ) : null}
        {notice === "removed" ? (
          <p className="account-saved" role="status">
            {copy.passcodeRemoved}
          </p>
        ) : null}
      </div>
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
            <button type="button" className="button button-secondary button-icon" onClick={cancelEdit} disabled={pending}>
              <ButtonIcon name="close" />
              {copy.cancel}
            </button>
          ) : null}
        </div>
      </form>

      {records.length > 0 ? (
        <div className="record-export">
          <button type="button" className="button button-secondary button-icon" onClick={() => downloadNotes(records, copy, language)}>
            <ButtonIcon name="download" />
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
                <button type="button" className="button button-secondary button-small button-icon" onClick={() => startEdit(record)}>
                  <ButtonIcon name="pencil" />
                  {copy.edit}
                </button>
                {confirmId === record.id ? (
                  <>
                    <span>{copy.deleteAsk}</span>
                    <button type="button" className="button button-help button-small button-icon" onClick={() => remove(record.id)} disabled={pending}>
                      <ButtonIcon name="trash" />
                      {copy.remove}
                    </button>
                    <button type="button" className="button button-secondary button-small button-icon" onClick={() => setConfirmId(null)}>
                      <ButtonIcon name="close" />
                      {copy.cancel}
                    </button>
                  </>
                ) : (
                  <button type="button" className="button button-secondary button-small button-icon" onClick={() => setConfirmId(record.id)}>
                    <ButtonIcon name="trash" />
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
