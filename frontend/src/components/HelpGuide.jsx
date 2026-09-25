export default function HelpGuide({ sections, layout = "topics", onOpen }) {
  return (
    <div className={`story-grid story-grid-${layout}`}>
      {sections.map((section) => (
        <article className="story-card" key={section.title}>
          <h3>{section.title}</h3>
          {section.body ? <p>{section.body}</p> : null}
          {section.points ? (
            <ul className={layout === "record" ? "record-points" : "guide-list"}>
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
        </article>
      ))}
    </div>
  );
}
