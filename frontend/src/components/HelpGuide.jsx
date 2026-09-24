export default function HelpGuide({ guide, onOpen, headingId = "guide-title" }) {
  return (
    <article className="guide" aria-labelledby={headingId}>
      <h2 id={headingId}>{guide.title}</h2>
      <p className="lede">{guide.lede}</p>
      {guide.sections.map((section) => (
        <section className="guide-block" key={section.title}>
          <h3>{section.title}</h3>
          <p>{section.body}</p>
          {section.points ? (
            <ul className="guide-list">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          {section.examples ? (
            <ul className="guide-list guide-examples">
              {section.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          ) : null}
          {section.action ? (
            <button type="button" className="next-link" onClick={() => onOpen(section.action.id)}>
              {section.action.label}
              <span aria-hidden="true"> →</span>
            </button>
          ) : null}
        </section>
      ))}
    </article>
  );
}
