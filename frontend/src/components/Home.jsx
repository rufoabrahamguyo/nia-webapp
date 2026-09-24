export default function Home({ text, onOpen }) {
  return (
    <div className="home">
      <section className="hero-home" aria-labelledby="banner-title">
        <div className="hero-copy">
          <p className="eyebrow">{text.eyebrow}</p>
          <h1 id="banner-title">{text.heroTitle}</h1>
          <p className="lede">{text.heroLine}</p>
          <button type="button" className="button button-accent" onClick={() => onOpen("helplines")}>
            {text.ctaReach}
          </button>
        </div>
        <div className="channel" aria-hidden="true">
          <svg className="channel-lines" viewBox="0 0 520 460">
            <path d="M118 108 C190 120, 210 180, 250 214" />
            <path d="M400 118 C340 150, 310 180, 276 214" />
            <path d="M168 352 C190 300, 220 260, 248 236" />
          </svg>
          <div className="channel-center">
            <strong>{text.channelNumber}</strong>
            <span>{text.channelCaption}</span>
          </div>
          {text.channels.map((item, index) => (
            <figure className={`orbit orbit-${index}`} key={item.label}>
              <img src={item.image} alt="" />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="i-want" aria-labelledby="i-want-title">
        <h2 id="i-want-title">{text.iWantTitle}</h2>
        <ul className="want-list">
          {text.paths.map((path) => (
            <li key={path.id}>
              <button type="button" className="want-row" onClick={() => onOpen(path.id)}>
                <span>
                  <span className="path-title">{path.title}</span>
                  <span className="path-line">{path.line}</span>
                </span>
                <span className="want-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title">{text.howTitle}</h2>
        <p className="how-line">{text.howLine}</p>
        <ul className="how-list">
          {text.how.map((item) => (
            <li key={item.id}>
              <button type="button" className="photo-card" onClick={() => onOpen(item.id)}>
                <img src={item.image} alt="" />
                <span className="photo-copy">
                  <span className="path-title">{item.title}</span>
                  <span className="path-line">{item.line}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
