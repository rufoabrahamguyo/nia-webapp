import HelpGuide from "./HelpGuide.jsx";
import { TileArt } from "./Visuals.jsx";

function NextLink({ screen, onOpen }) {
  return (
    <button type="button" className="next-link" onClick={() => onOpen(screen.next)}>
      {screen.nextLabel}
      <span aria-hidden="true"> →</span>
    </button>
  );
}

export default function Screen({ id, screen, onOpen }) {
  const hasMore = Boolean(screen.guide || screen.sections);

  return (
    <>
      <section className="screen" aria-labelledby="screen-title">
        <div className="screen-copy">
          <p className="screen-index">{screen.index}</p>
          <h1 id="screen-title">{screen.title}</h1>
          <p className="lede">{screen.body}</p>
          {hasMore ? null : <NextLink screen={screen} onOpen={onOpen} />}
        </div>
        <div className={`screen-art screen-art-${id}`}>
          <TileArt id={id} />
        </div>
      </section>
      {screen.sections ? (
        <HelpGuide
          guide={{
            title: screen.sectionsTitle,
            lede: screen.sectionsLede,
            sections: screen.sections,
          }}
          onOpen={onOpen}
          headingId="section-title"
        />
      ) : null}
      {screen.guide ? <HelpGuide guide={screen.guide} onOpen={onOpen} headingId="guide-title" /> : null}
      {hasMore ? <NextLink screen={screen} onOpen={onOpen} /> : null}
    </>
  );
}
