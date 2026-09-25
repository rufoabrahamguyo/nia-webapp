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
          <p className="screen-index">05</p>
          <h1 id="helplines-title">{text.helplinesTitle}</h1>
          <p className="lede">{text.helplinesLine}</p>
        </div>
      </header>

      <div className="page-band">
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
