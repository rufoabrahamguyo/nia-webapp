import HelpGuide from "./HelpGuide.jsx";
import VideoFrame from "./VideoFrame.jsx";
import PrivateRecord from "./PrivateRecord.jsx";
import Scripts from "./Scripts.jsx";

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

export default function Screen({ id, screen, text, user, language, onOpen }) {
  const hasSections = Boolean(screen.sections);
  const hasGuide = Boolean(screen.guide);
  const sections = screen.sections?.filter((section) => !(section.guestOnly && user));
  const heroBody = user && screen.bodySignedIn ? screen.bodySignedIn : screen.body;

  return (
    <article className={`page page-${id}`}>
      <header className="page-hero">
        <div className="page-hero-copy">
          <h1 id="screen-title">{screen.title}</h1>
          <p className="lede">{heroBody}</p>
        </div>
      </header>

      {hasSections ? (
        <section className="page-band" aria-labelledby="section-title">
          {id === "learn" ? (
            <div className="help-video-wrap">
              <VideoFrame
                className="recognise-video"
                src="/videos/recognise-it.mp4"
                poster="/images/recognise-poster.png"
                label={screen.title}
                playLabel={text.referralVideoPlay}
                fallback={text.referralVideoFallback}
              />
            </div>
          ) : null}
          <div className="page-band-intro">
            <h2 id="section-title">{screen.sectionsTitle}</h2>
            <p>{screen.sectionsLede}</p>
          </div>
          {id === "document" ? (
            <PrivateRecord user={user} text={text} language={language} onOpen={onOpen} />
          ) : null}
          <HelpGuide sections={sections} layout={layoutFor(id)} onOpen={onOpen} />
          {screen.scripts ? <Scripts key={language} scripts={screen.scripts} /> : null}
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
            {id === "learn" ? (
              <div className="help-video-wrap">
                <VideoFrame
                  src="/videos/how-to-help-someone.mp4"
                  poster="/images/help-someone-poster.png"
                  label={screen.guide.title}
                  playLabel={text.referralVideoPlay}
                  fallback={text.referralVideoFallback}
                />
              </div>
            ) : null}
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
