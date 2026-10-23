import { useEffect, useState } from "react";
import { requestAuth } from "../auth.js";

const WHO = [
  { en: "Emergency", sw: "Dharura" },
  { en: "National line", sw: "Nambari ya kitaifa" },
  { en: "one2one hotline", sw: "Simu ya one2one" },
  { en: "Under 18", sw: "Chini ya miaka 18" },
  { en: "Help line", sw: "Simu ya msaada" },
  { en: "Women", sw: "Wanawake" },
  { en: "Telecounselling", sw: "Ushauri kwa simu" },
  { en: "Counselling", sw: "Ushauri" },
  { en: "Medical hotline", sw: "Simu ya matibabu" },
  { en: "Support for survivors", sw: "Msaada kwa walionusurika" },
  { en: "Health coordination", sw: "Uratibu wa afya" },
  { en: "Psychosocial support", sw: "Msaada wa kisaikolojia" },
  { en: "If you are thinking about suicide", sw: "Ukiwa na mawazo ya kujiua" },
];

function whoKey(who) {
  return `${who?.en || ""}\n${who?.sw || ""}`;
}

function whoChoices(current) {
  if (!current?.en || WHO.some((item) => item.en === current.en && item.sw === current.sw)) return WHO;
  return [current, ...WHO];
}

function emptyForm() {
  return {
    id: "",
    group: "now",
    name: { en: "", sw: "" },
    who: { en: "", sw: "" },
    hours: { en: "", sw: "" },
    free: true,
    numbersText: "",
    sms: "",
    whatsapp: "",
    siteLabel: "",
    siteHref: "",
    hidden: false,
    lastChecked: new Date().toISOString().slice(0, 10),
    sort: 0,
  };
}

function fromEntry(entry) {
  return {
    ...emptyForm(),
    ...entry,
    numbersText: (entry.numbers || []).join("\n"),
  };
}

function Field({ label, children }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function AdminHelplines({ text, language, onError }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(null);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    requestAuth("/api/admin/helplines")
      .then((data) => {
        if (!cancelled) setList(data.helplines || []);
      })
      .catch((caught) => onError(caught.code || "request_failed"));
    return () => {
      cancelled = true;
    };
  }, [onError]);

  function setPair(key, language, value) {
    setForm((current) => ({ ...current, [key]: { ...current[key], [language]: value } }));
    setSaved(false);
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    onError("");
    const payload = {
      ...form,
      numbers: form.numbersText.split("\n").map((item) => item.trim()).filter(Boolean),
      sort: Number(form.sort),
    };
    delete payload.numbersText;
    delete payload.id;
    try {
      const savedEntry = form.id
        ? await requestAuth(`/api/admin/helplines/${form.id}`, payload, "PATCH")
        : await requestAuth("/api/admin/helplines", payload);
      setList((current) => {
        const next = current.filter((item) => item.id !== savedEntry.id);
        next.push(savedEntry);
        next.sort((a, b) => a.sort - b.sort || a.name.en.localeCompare(b.name.en));
        return next;
      });
      setForm(fromEntry(savedEntry));
      setSaved(true);
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-split">
      <div>
        <button type="button" className="button button-accent" onClick={() => { setForm(emptyForm()); setSaved(false); }}>
          {text.add}
        </button>
        <ul className="admin-list">
          {list.map((entry) => (
            <li key={entry.id}>
              <button type="button" className="admin-row" onClick={() => { setForm(fromEntry(entry)); setSaved(false); }}>
                <span>{entry.name.en}</span>
                <span className="line-meta">{entry.hidden ? text.hiddenMark : text.visible}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {form ? (
        <form className="admin-form" onSubmit={save}>
          <h2>{form.id ? text.edit : text.add}</h2>
          <Field label={text.group}>
            <select value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })}>
              <option value="now">{text.groupNow}</option>
              <option value="org">{text.groupOrg}</option>
            </select>
          </Field>
          <Field label={text.who}>
            <select
              required
              value={whoKey(form.who)}
              onChange={(event) => {
                const next = whoChoices(form.who).find((item) => whoKey(item) === event.target.value);
                setForm({ ...form, who: next ? { en: next.en, sw: next.sw } : { en: "", sw: "" } });
                setSaved(false);
              }}
            >
              <option value="">{text.whoChoose}</option>
              {whoChoices(form.who).map((item) => (
                <option key={whoKey(item)} value={whoKey(item)}>
                  {item[language] || item.en}
                </option>
              ))}
            </select>
          </Field>
          {["en", "sw"].map((locale) => (
            <fieldset key={locale} className="admin-locale">
              <legend>{locale === "en" ? text.english : text.kiswahili}</legend>
              <Field label={text.name}>
                <input required value={form.name[locale]} onChange={(event) => setPair("name", locale, event.target.value)} />
              </Field>
              <Field label={text.hours}>
                <input required value={form.hours[locale]} onChange={(event) => setPair("hours", locale, event.target.value)} />
              </Field>
            </fieldset>
          ))}
          <Field label={text.numbers}>
            <textarea required rows={4} value={form.numbersText} onChange={(event) => setForm({ ...form, numbersText: event.target.value })} />
          </Field>
          <p className="fine">{text.numbersHint}</p>
          <Field label={text.sms}>
            <input value={form.sms} onChange={(event) => setForm({ ...form, sms: event.target.value })} />
          </Field>
          <Field label={text.whatsapp}>
            <input value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} placeholder="https://" />
          </Field>
          <Field label={text.siteLabel}>
            <input value={form.siteLabel} onChange={(event) => setForm({ ...form, siteLabel: event.target.value })} />
          </Field>
          <Field label={text.siteHref}>
            <input value={form.siteHref} onChange={(event) => setForm({ ...form, siteHref: event.target.value })} placeholder="https://" />
          </Field>
          <label className="admin-check">
            <input type="checkbox" checked={form.free} onChange={(event) => setForm({ ...form, free: event.target.checked })} />
            {text.free}
          </label>
          <label className="admin-check">
            <input type="checkbox" checked={form.hidden} onChange={(event) => setForm({ ...form, hidden: event.target.checked })} />
            {text.hidden}
          </label>
          <Field label={text.lastChecked}>
            <input required type="date" value={form.lastChecked} onChange={(event) => setForm({ ...form, lastChecked: event.target.value })} />
          </Field>
          <Field label={text.sort}>
            <input required type="number" min="0" max="999" value={form.sort} onChange={(event) => setForm({ ...form, sort: event.target.value })} />
          </Field>
          {saved ? <p className="account-saved">{text.saved}</p> : null}
          <div className="record-actions">
            <button type="submit" className="button button-accent" disabled={pending}>{text.save}</button>
            <button type="button" className="button button-secondary" onClick={() => setForm(null)}>{text.cancel}</button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
