import HelpGuide from "./HelpGuide.jsx";

function NextLink({ screen, onOpen }) {
  return (
    <button type="button" className="next-link" onClick={() => onOpen(screen.next)}>
      {screen.nextLabel}
      <span aria-hidden="true"> →</span>
    </button>
  );
}

function layoutFor(id) {
  if (id === "rights") return "options";
  if (id === "document") return "record";
  return "topics";
}

export default function Screen({ id, screen, onOpen }) {
  const hasSections = Boolean(screen.sections);
  const hasGuide = Boolean(screen.guide);

  return (
    <article className={`page page-${id}`}>
      <header className="page-hero">
        <div className="page-hero-copy">
          <p className="screen-index">{screen.index}</p>
          <h1 id="screen-title">{screen.title}</h1>
          <p className="lede">{screen.body}</p>
        </div>
      </header>

      {hasSections ? (
        <section className="page-band" aria-labelledby="section-title">
          <div className="page-band-intro">
            <h2 id="section-title">{screen.sectionsTitle}</h2>
            <p>{screen.sectionsLede}</p>
          </div>
          <HelpGuide sections={screen.sections} layout={layoutFor(id)} onOpen={onOpen} />
          {hasGuide ? null : <NextLink screen={screen} onOpen={onOpen} />}
        </section>
      ) : null}

      {hasGuide ? (
        <>
          <section className="page-hero page-hero-guide" aria-labelledby="guide-title">
            <div className="page-hero-copy">
              <h2 id="guide-title">{screen.guide.title}</h2>
              <p className="lede">{screen.guide.lede}</p>
            </div>
          </section>
          <section className="page-band">
            <HelpGuide sections={screen.guide.sections} layout="guide" onOpen={onOpen} />
            <NextLink screen={screen} onOpen={onOpen} />
          </section>
        </>
      ) : null}

      {!hasSections && !hasGuide ? (
        <section className="page-band">
          <NextLink screen={screen} onOpen={onOpen} />
        </section>
      ) : null}
    </article>
  );
}
