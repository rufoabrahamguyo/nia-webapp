import { linesFor } from "../helplines.js";

function LineCard({ line }) {
  return (
    <article className="line-card">
      <h3>{line.name}</h3>
      <p>{line.who}</p>
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
  const now = linesFor(language, "now");
  const organisations = linesFor(language, "org");

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
            <LineCard key={line.name} line={line} />
          ))}
        </div>

        <h2 className="group-label">{text.organisations}</h2>
        <div className="line-list">
          {organisations.map((line) => (
            <LineCard key={line.name} line={line} />
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
