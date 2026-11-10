import { useEffect, useRef, useState } from "react";
import { requestAuth } from "../auth.js";
import { mentionsCrisis } from "../crisis.js";
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

function localeOf(language) {
  return language === "sw" ? "sw-KE" : "en-KE";
}

function formatWhen(value, language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeOf(language), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function noteParts(body) {
  const text = String(body || "").replace(/\r\n/g, "\n").trim();
  if (!text) return { title: "", rest: "" };
  const firstBreak = text.indexOf("\n");
  const first = (firstBreak === -1 ? text : text.slice(0, firstBreak)).trim();
  const rest = firstBreak === -1 ? "" : text.slice(firstBreak + 1).trim();
  if (first.length > 72) return { title: `${first.slice(0, 72).trim()}…`, rest: text };
  return { title: first, rest };
}

function shortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function longDate(value, language) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeOf(language), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function monthDay(value, language) {
  return new Intl.DateTimeFormat(localeOf(language), { day: "numeric", month: "long" }).format(value);
}

function monthTitle(value, language) {
  return new Intl.DateTimeFormat(localeOf(language), { month: "long", year: "numeric" }).format(value);
}

function weekdayLabels(language) {
  const format = new Intl.DateTimeFormat(localeOf(language), { weekday: "narrow" });
  return Array.from({ length: 7 }, (_, index) => format.format(new Date(2024, 0, 7 + index)));
}

function monthCells(monthDate) {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const startPad = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let index = 0; index < startPad; index += 1) {
    cells.push({ day: new Date(year, monthIndex, 1 - (startPad - index)), outside: true });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day: new Date(year, monthIndex, day), outside: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].day;
    cells.push({ day: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), outside: true });
  }
  return cells;
}

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function unlockHeaders(token) {
  return token ? { "X-Record-Unlock": token } : undefined;
}

function CrisisHelp({ copy, onOpen, urgent, quiet }) {
  if (!urgent && !quiet) return null;
  if (!urgent) {
    return (
      <p className="diary-care">
        {copy.careLine} <a href="tel:0722178177">{copy.careCall}</a>
      </p>
    );
  }
  return (
    <aside className="diary-crisis" role="note">
      <p>{copy.crisisLead}</p>
      <div className="diary-crisis-links">
        <a href="tel:0722178177">{copy.crisisBefrienders}</a>
        <a href="https://wa.me/254722178177" target="_blank" rel="noreferrer">
          {copy.crisisWhatsApp}
        </a>
        <a href="tel:1190">{copy.crisisCounsel}</a>
        <a href="tel:999">{copy.crisisCall999}</a>
        <a href="tel:112">{copy.crisisCall112}</a>
        <a href="tel:116">{copy.crisisChild}</a>
        <button type="button" onClick={() => onOpen("helplines")}>
          {copy.crisisMore}
        </button>
      </div>
      <p className="diary-crisis-note">{copy.crisisDanger}</p>
    </aside>
  );
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
  const [pane, setPane] = useState("calendar");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [passcodeOpen, setPasscodeOpen] = useState(false);
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

  useEffect(() => {
    if (selectedId && records.some((record) => record.id === selectedId)) return;
    const newest = records[0];
    if (!newest?.id) return;
    const when = new Date(newest.updatedAt);
    setSelectedId(newest.id);
    if (Number.isNaN(when.getTime())) return;
    setSelectedDay(when);
    setMonth(startOfMonth(when));
  }, [records, selectedId]);

  useEffect(() => {
    if (pane !== "write" || gate !== "open") return;
    fieldRef.current?.focus({ preventScroll: true });
  }, [pane, editingId, gate]);

  if (!user) {
    return (
      <div className="diary diary-solo">
        <section className="diary-card diary-solo-card">
          <h2 className="diary-kicker">{copy.diary}</h2>
          <p className="diary-empty-copy">{copy.signIn}</p>
          <button type="button" className="diary-submit" onClick={() => onOpen("login")}>
            {text.logIn}
          </button>
        </section>
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
    setPasscodeOpen(false);
    setPane("write");
  }

  function focusDay(day, openNote) {
    setSelectedDay(day);
    setMonth(startOfMonth(day));
    if (!openNote) return;
    const matches = records.filter((record) => sameDay(new Date(record.updatedAt), day));
    if (!matches[0]) return;
    setSelectedId(matches[0].id);
    setConfirmId(null);
    setSaved(false);
    setPane("entry");
  }

  function openRecord(record) {
    const when = new Date(record.updatedAt);
    setSelectedId(record.id);
    setConfirmId(null);
    setSaved(false);
    if (!Number.isNaN(when.getTime())) {
      setSelectedDay(when);
      setMonth(startOfMonth(when));
    }
    setPane("entry");
  }

  function openWrite() {
    setEditingId(null);
    setBody("");
    setSaved(false);
    setErrorCode("");
    setPasscodeOpen(false);
    setPane("write");
  }

  function closeWrite() {
    setEditingId(null);
    setBody("");
    setSaved(false);
    setErrorCode("");
    setPasscodeOpen(false);
    setPane(selectedId ? "entry" : "calendar");
  }

  function openPasscode(nextGate) {
    setErrorCode("");
    setNotice("");
    setPasscodeOpen(false);
    setGate(nextGate);
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
      setSelectedId(next.id);
      const when = new Date(next.updatedAt);
      if (!Number.isNaN(when.getTime())) {
        setSelectedDay(when);
        setMonth(startOfMonth(when));
      }
      setPasscodeOpen(false);
      setPane("entry");
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
      if (selectedId === id) setSelectedId(null);
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

  const selected = records.find((record) => record.id === selectedId) || null;
  const selectedParts = selected ? noteParts(selected.body) : null;
  const recent = showAll ? records : records.slice(0, 2);
  const notedDays = new Set(
    records.map((record) => {
      const when = new Date(record.updatedAt);
      return Number.isNaN(when.getTime()) ? "" : `${when.getFullYear()}-${when.getMonth()}-${when.getDate()}`;
    }),
  );
  const today = new Date();

  return (
    <div className="diary" data-pane={pane}>
      {error ? (
        <p className="auth-error diary-tray-error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="diary-card diary-calendar" aria-labelledby="diary-calendar-title">
        <h2 id="diary-calendar-title" className="diary-kicker diary-kicker-solo">{copy.calendar}</h2>
        <button type="button" className="diary-today" onClick={() => focusDay(new Date(), false)}>
          {copy.today}: {monthDay(today, language)}
        </button>
        <div className="diary-month">
          <button type="button" className="diary-icon" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label={copy.prevMonth}>
            ‹
          </button>
          <span>{monthTitle(month, language)}</span>
          <button type="button" className="diary-icon" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label={copy.nextMonth}>
            ›
          </button>
        </div>
        <div className="diary-grid">
          {weekdayLabels(language).map((label, index) => (
            <span className="diary-dow" key={`${label}-${index}`}>{label}</span>
          ))}
          {monthCells(month).map(({ day, outside }) => {
            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const selectedDayMatch = sameDay(day, selectedDay);
            return (
              <button
                type="button"
                key={key}
                className={`diary-day${outside ? " is-out" : ""}${selectedDayMatch ? " is-selected" : ""}${sameDay(day, today) ? " is-today" : ""}${notedDays.has(key) ? " has-note" : ""}`}
                aria-pressed={selectedDayMatch}
                aria-label={longDate(day, language)}
                onClick={() => focusDay(day, true)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        <div className="diary-recent">
          <div className="diary-recent-head">
            <h3>{copy.recent}</h3>
            {records.length > 2 ? (
              <button type="button" className="diary-see" onClick={() => setShowAll((value) => !value)}>
                {showAll ? copy.seeLess : copy.seeAll}
              </button>
            ) : null}
          </div>
          {recent.length > 0 ? (
            <ul className="diary-recent-list">
              {recent.map((record) => (
                <li key={record.id}>
                  <button
                    type="button"
                    className={`diary-recent-card${record.id === selectedId ? " is-selected" : ""}`}
                    onClick={() => openRecord(record)}
                  >
                    <span className="diary-recent-date">{shortDate(record.updatedAt)}</span>
                    <span className="diary-recent-title">{noteParts(record.body).title}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="diary-quiet-copy">{loading ? "" : copy.empty}</p>
          )}
        </div>
        <nav className="diary-dock" aria-label={copy.calendar}>
          <button type="button" className="diary-dock-btn is-on" aria-current="page">
            <CalendarGlyph />
            {copy.calendar}
          </button>
          <button type="button" className="diary-dock-btn" onClick={openWrite}>
            <ButtonIcon name="pencil" />
            {copy.write}
          </button>
        </nav>
      </section>

      <section className="diary-card diary-entry" aria-labelledby="diary-entry-title">
        <header className="diary-top">
          <div className="diary-back-slot">
            <button type="button" className="diary-icon diary-back" onClick={() => setPane("calendar")} aria-label={copy.back}>
              <ButtonIcon name="back" />
            </button>
          </div>
          <h2 id="diary-entry-title" className="diary-kicker">{copy.diary}</h2>
          <div className="diary-top-end">
            <button type="button" className="diary-text diary-only-narrow" onClick={openWrite}>{copy.write}</button>
          </div>
        </header>
        {selected && selectedParts ? (
          <div className="diary-entry-main">
            <CrisisHelp copy={copy} onOpen={onOpen} urgent={mentionsCrisis(selected.body)} />
            <p className="diary-when">{longDate(selected.updatedAt, language)}</p>
            <h3 className="diary-title">{selectedParts.title}</h3>
            {selected.edited ? <span className="diary-edited">{copy.edited}</span> : null}
            {selectedParts.rest ? <p className="diary-body">{selectedParts.rest}</p> : null}
            {saved ? (
              <p className="account-saved diary-saved" role="status">
                {copy.saved}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="diary-empty">
            <p>{loading ? "" : copy.empty}</p>
            <button type="button" className="diary-submit diary-only-narrow" onClick={openWrite}>{copy.write}</button>
          </div>
        )}
        {selected ? (
          <div className="diary-entry-tools">
            <button type="button" className="diary-icon" onClick={() => startEdit(selected)} aria-label={copy.edit}>
              <ButtonIcon name="pencil" />
            </button>
            {confirmId === selected.id ? (
              <div className="diary-confirm">
                <p>{copy.deleteAsk}</p>
                <button type="button" className="diary-danger" onClick={() => remove(selected.id)} disabled={pending}>
                  {copy.remove}
                </button>
                <button type="button" className="diary-quiet" onClick={() => setConfirmId(null)}>
                  {copy.cancel}
                </button>
              </div>
            ) : (
              <button type="button" className="diary-icon" onClick={() => setConfirmId(selected.id)} aria-label={copy.remove}>
                <ButtonIcon name="trash" />
              </button>
            )}
            <button type="button" className="diary-quiet" onClick={() => downloadNotes(records, copy, language)}>
              <ButtonIcon name="download" />
              {copy.download}
            </button>
            <p className="fine diary-download-note">{copy.downloadNote}</p>
          </div>
        ) : null}
      </section>

      <section className="diary-card diary-write" aria-labelledby="diary-write-title">
        <header className="diary-top">
          <div className="diary-back-slot" />
          <h2 id="diary-write-title" className="diary-kicker">{editingId ? copy.editTitle : copy.write}</h2>
          <div className="diary-top-actions">
            <button
              type="button"
              className="diary-icon"
              aria-expanded={passcodeOpen}
              aria-label={hasPasscode ? copy.changePasscode : copy.addPasscode}
              onClick={() => setPasscodeOpen((open) => !open)}
            >
              <ButtonIcon name={hasPasscode ? "key" : "lock"} />
            </button>
            <button type="button" className="diary-icon" onClick={closeWrite} aria-label={copy.close}>
              <ButtonIcon name="close" />
            </button>
          </div>
        </header>
        {passcodeOpen ? (
          <div className="diary-passcode" role="group" aria-label={copy.passcodeMenu}>
            {hasPasscode ? (
              <>
                <button type="button" className="diary-menu-item" onClick={() => openPasscode("current")}>
                  {copy.changePasscode}
                </button>
                <button type="button" className="diary-menu-item" onClick={() => openPasscode("remove")}>
                  {copy.removePasscode}
                </button>
              </>
            ) : (
              <button type="button" className="diary-menu-item" onClick={() => openPasscode("choose")}>
                {copy.addPasscode}
              </button>
            )}
            <p className="fine">{copy.passcodeOptional}</p>
          </div>
        ) : null}
        {notice === "saved" ? (
          <p className="account-saved diary-saved" role="status">
            {copy.passcodeSaved}
          </p>
        ) : null}
        {notice === "removed" ? (
          <p className="account-saved diary-saved" role="status">
            {copy.passcodeRemoved}
          </p>
        ) : null}
        <form onSubmit={onSubmit}>
          <div className="diary-care-slot" aria-live="polite">
            <CrisisHelp copy={copy} onOpen={onOpen} urgent={mentionsCrisis(body)} quiet />
          </div>
          <label className="diary-field">
            <span>{editingId ? copy.editTitle : copy.title}</span>
            <textarea
              ref={fieldRef}
              name="record"
              required
              maxLength={20000}
              value={body}
              placeholder={copy.placeholder}
              autoComplete="off"
              onChange={(event) => {
                setBody(event.target.value);
                setSaved(false);
              }}
            />
          </label>
          <p className="diary-hint">{editingId ? copy.editHint : copy.hint}</p>
          <div className="diary-form-foot">
            {editingId ? (
              <button type="button" className="diary-quiet" onClick={closeWrite} disabled={pending}>
                {copy.cancel}
              </button>
            ) : null}
            <button type="submit" className="diary-submit" disabled={pending}>
              {pending ? copy.saving : editingId ? copy.update : copy.save}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
