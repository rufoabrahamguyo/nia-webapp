export default function Footer({ text, onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <p className="footer-name">Nia</p>
            <p className="footer-tagline">{text.footerTagline}</p>
            <p className="footer-about">{text.footerAbout}</p>
          </div>

          <nav aria-label={text.footerNavLabel}>
            <p className="footer-heading">{text.footerExplore}</p>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => onNavigate("home")}>
                  {text.footerHome}
                </button>
              </li>
              {text.nav.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => onNavigate(item.id)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="footer-heading">{text.footerHelp}</p>
            <ul className="footer-lines">
              {text.quickLines.map((line) => (
                <li className="footer-line" key={line.label}>
                  <span>{line.label}</span>
                  <span className="footer-numbers">
                    {line.numbers.map((number) => (
                      <a key={number} href={`tel:${number}`}>
                        {number}
                      </a>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <p>{text.footer}</p>
          <p>{text.decision}</p>
          <p>{text.helpNote}</p>
        </div>
      </div>
    </footer>
  );
}
