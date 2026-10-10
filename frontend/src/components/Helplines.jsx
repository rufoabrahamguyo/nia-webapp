import { useEffect, useState } from "react";
import { linesFor } from "../helplines.js";

function fromDirectory(language, group) {
  return linesFor(language, group).map((line) => ({ ...line, hours: "", free: null }));
}

function fromApi(entry, language) {
  const call = language === "sw" ? "Piga" : "Call";
  const textWord = language === "sw" ? "Ujumbe" : "Text";
  const actions = entry.numbers.map((number) => ({
    label: `${call} ${number}`,
    href: `tel:${number.replace(/[^\d+]/g, "")}`,
  }));
  if (entry.sms) {
    actions.push({ label: `${textWord} ${entry.sms}`, href: `sms:${entry.sms.replace(/[^\d+]/g, "")}` });
  }
  if (entry.whatsapp) actions.push({ label: "WhatsApp", href: entry.whatsapp });
  return {
    id: entry.id,
    name: entry.name[language] || entry.name.en,
    who: entry.who[language] || entry.who.en,
    hours: entry.hours[language] || entry.hours.en,
    free: entry.free,
    actions,
    site: entry.site,
  };
}

function LineCard({ line, text }) {
  return (
    <article className="line-card">
      <h3>{line.name}</h3>
      <p>{line.who}</p>
      {line.hours ? (
        <p className="line-meta">
          {text.hoursLabel}: {line.hours}
        </p>
      ) : null}
      {typeof line.free === "boolean" ? <p className="line-meta">{line.free ? text.freeYes : text.freeNo}</p> : null}
      <div className="line-actions">
        {line.actions.map((action) => (
          <a
            key={action.href + action.label}
            href={action.href}
            {...(action.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {action.label}
          </a>
        ))}
      </div>
      {line.site ? (
        <a className="line-site" href={line.site.href} target="_blank" rel="noreferrer">
          {line.site.label}
        </a>
      ) : null}
    </article>
  );
}

export default function Helplines({ language, text }) {
  const [remote, setRemote] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/helplines")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setRemote(data.helplines || []);
      })
      .catch(() => {
        if (!cancelled) setRemote(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const now = remote ? remote.filter((entry) => entry.group === "now").map((entry) => fromApi(entry, language)) : fromDirectory(language, "now");
  const organisations = remote
    ? remote.filter((entry) => entry.group === "org").map((entry) => fromApi(entry, language))
    : fromDirectory(language, "org");

  return (
    <article className="page page-helplines">
      <header className="page-hero">
        <div className="page-hero-copy">
          <h1 id="helplines-title">{text.helplinesTitle}</h1>
          <p className="lede">{text.helplinesLine}</p>
        </div>
      </header>

      <div className="page-band">
        <section className="urgent" id="just-happened" aria-labelledby="urgent-title">
          <h2 id="urgent-title">{text.urgent.title}</h2>
          <p>{text.urgent.lede}</p>
          <ul className="guide-list">
            {text.urgent.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
          <p className="fine">{text.urgent.lines}</p>
          <a className="button button-accent urgent-call" href="tel:1195">
            {text.urgent.call}
          </a>
        </section>

        <h2 className="group-label">{text.callNow}</h2>
        <div className="line-list">
          {now.map((line) => (
            <LineCard key={line.id || line.name} line={line} text={text} />
          ))}
        </div>

        <h2 className="group-label">{text.organisations}</h2>
        <div className="line-list">
          {organisations.map((line) => (
            <LineCard key={line.id || line.name} line={line} text={text} />
          ))}
        </div>

        <p className="fine helpline-source">
          <a href="https://help.unhcr.org/kenya/" target="_blank" rel="noreferrer">
            {text.unhcrNote}
          </a>
        </p>
      </div>
    </article>
  );
}
