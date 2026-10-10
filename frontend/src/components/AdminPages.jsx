import { useEffect, useState } from "react";
import { requestAuth } from "../auth.js";
import copy from "../copy.js";
import { draftToPayload, screenToDraft, storedToDraft } from "../pages.js";

const LINKS = ["", "helplines", "learn", "rights", "document", "complicated"];

function draftsFor(pages, pageKey) {
  const page = pages?.[pageKey];
  if (page) return { en: storedToDraft(page.en), sw: storedToDraft(page.sw) };
  return {
    en: screenToDraft(copy.en.screens[pageKey]),
    sw: screenToDraft(copy.sw.screens[pageKey]),
  };
}

function blankSection() {
  return { title: "", body: "", pointsText: "", actionId: "", actionAnchor: "", actionLabel: "" };
}

function SectionFields({ text, section, onChange, onRemove }) {
  return (
    <fieldset className="admin-section">
      <legend>{text.section}</legend>
      <label className="auth-field">
        <span>{text.pageTitle}</span>
        <input value={section.title} onChange={(event) => onChange({ ...section, title: event.target.value })} />
      </label>
      <label className="auth-field">
        <span>{text.intro}</span>
        <textarea rows={4} value={section.body} onChange={(event) => onChange({ ...section, body: event.target.value })} />
      </label>
      <label className="auth-field">
        <span>{text.points}</span>
        <textarea rows={4} value={section.pointsText} onChange={(event) => onChange({ ...section, pointsText: event.target.value })} />
      </label>
      <p className="fine">{text.pointsHint}</p>
      <label className="auth-field">
        <span>{text.linkTo}</span>
        <select value={section.actionId} onChange={(event) => onChange({ ...section, actionId: event.target.value })}>
          {LINKS.map((id) => (
            <option key={id || "none"} value={id}>{id || text.none}</option>
          ))}
        </select>
      </label>
      {section.actionId ? (
        <>
          <label className="auth-field">
            <span>{text.linkLabel}</span>
            <input value={section.actionLabel} onChange={(event) => onChange({ ...section, actionLabel: event.target.value })} />
          </label>
          <label className="auth-field">
            <span>{text.linkAnchor}</span>
            <input value={section.actionAnchor} onChange={(event) => onChange({ ...section, actionAnchor: event.target.value })} />
          </label>
        </>
      ) : null}
      <button type="button" className="next-link" onClick={onRemove}>{text.remove}</button>
    </fieldset>
  );
}

function LocaleFields({ text, locale, showGuide, onChange }) {
  function updateSection(listKey, index, next) {
    const list = locale[listKey].map((section, item) => (item === index ? next : section));
    onChange({ ...locale, [listKey]: list });
  }

  return (
    <div>
      <label className="auth-field">
        <span>{text.pageTitle}</span>
        <input required value={locale.title} onChange={(event) => onChange({ ...locale, title: event.target.value })} />
      </label>
      <label className="auth-field">
        <span>{text.intro}</span>
        <textarea required rows={4} value={locale.body} onChange={(event) => onChange({ ...locale, body: event.target.value })} />
      </label>
      <label className="auth-field">
        <span>{text.sectionsTitle}</span>
        <input value={locale.sectionsTitle} onChange={(event) => onChange({ ...locale, sectionsTitle: event.target.value })} />
      </label>
      <label className="auth-field">
        <span>{text.sectionsLede}</span>
        <textarea rows={3} value={locale.sectionsLede} onChange={(event) => onChange({ ...locale, sectionsLede: event.target.value })} />
      </label>
      {locale.sections.map((section, index) => (
        <SectionFields
          key={`section-${index}`}
          text={text}
          section={section}
          onChange={(next) => updateSection("sections", index, next)}
          onRemove={() => onChange({ ...locale, sections: locale.sections.filter((_, item) => item !== index) })}
        />
      ))}
      <button type="button" className="button button-secondary" onClick={() => onChange({ ...locale, sections: [...locale.sections, blankSection()] })}>
        {text.addSection}
      </button>
      {showGuide ? (
        <div className="admin-guide">
          <h3>{text.guide}</h3>
          <label className="auth-field">
            <span>{text.guideTitle}</span>
            <input value={locale.guideTitle} onChange={(event) => onChange({ ...locale, guideTitle: event.target.value })} />
          </label>
          <label className="auth-field">
            <span>{text.guideLede}</span>
            <textarea rows={3} value={locale.guideLede} onChange={(event) => onChange({ ...locale, guideLede: event.target.value })} />
          </label>
          {locale.guideSections.map((section, index) => (
            <SectionFields
              key={`guide-${index}`}
              text={text}
              section={section}
              onChange={(next) => updateSection("guideSections", index, next)}
              onRemove={() => onChange({ ...locale, guideSections: locale.guideSections.filter((_, item) => item !== index) })}
            />
          ))}
          <button type="button" className="button button-secondary" onClick={() => onChange({ ...locale, guideSections: [...locale.guideSections, blankSection()] })}>
            {text.addSection}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminPages({ text, onError }) {
  const [key, setKey] = useState("learn");
  const [stored, setStored] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [locale, setLocale] = useState("en");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    requestAuth("/api/admin/pages")
      .then((data) => {
        if (cancelled) return;
        const pages = data.pages || { learn: null, rights: null };
        setStored(pages);
        setDrafts(draftsFor(pages, "learn"));
      })
      .catch((caught) => onError(caught.code || "request_failed"));
    return () => {
      cancelled = true;
    };
  }, [onError]);

  function choose(nextKey) {
    setKey(nextKey);
    setSaved(false);
    if (stored) setDrafts(draftsFor(stored, nextKey));
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);
    setSaved(false);
    onError("");
    try {
      const page = await requestAuth(`/api/admin/pages/${key}`, {
        en: draftToPayload(drafts.en),
        sw: draftToPayload(drafts.sw),
      }, "PUT");
      const pages = { ...(stored || {}), [key]: page };
      setStored(pages);
      setDrafts(draftsFor(pages, key));
      setSaved(true);
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={save}>
      <div className="admin-tabs">
        <button type="button" aria-pressed={key === "learn"} onClick={() => choose("learn")}>{text.learn}</button>
        <button type="button" aria-pressed={key === "rights"} onClick={() => choose("rights")}>{text.rights}</button>
      </div>
      <div className="admin-tabs">
        <button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>{text.english}</button>
        <button type="button" aria-pressed={locale === "sw"} onClick={() => setLocale("sw")}>{text.kiswahili}</button>
      </div>
      {drafts ? (
        <LocaleFields
          text={text}
          locale={drafts[locale]}
          showGuide={key === "learn"}
          onChange={(next) => {
            setDrafts((current) => ({ ...current, [locale]: next }));
            setSaved(false);
          }}
        />
      ) : null}
      {saved ? <p className="account-saved">{text.saved}</p> : null}
      <button type="submit" className="button button-accent" disabled={pending || !drafts}>{text.save}</button>
    </form>
  );
}
