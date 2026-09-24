export default function HelpLine({ text, onOpen }) {
  return (
    <section id="need-help" className="help-line" aria-label={text.help}>
      <p className="decision">{text.decision}</p>
      <dl className="phone-list">
        {text.quickLines.map((line) => (
          <div className="phone-row" key={line.label}>
            <dt>{line.label}</dt>
            <dd>
              {line.numbers.map((number) => (
                <a key={number} href={`tel:${number}`}>
                  {number}
                </a>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="fine">{text.helpNote}</p>
      <button type="button" className="next-link" onClick={() => onOpen("helplines")}>
        {text.allLines}
        <span aria-hidden="true"> →</span>
      </button>
    </section>
  );
}
