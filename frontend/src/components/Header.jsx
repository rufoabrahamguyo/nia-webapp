import { leaveSite } from "../scroll.js";

export default function Header({ language, text, view, onLanguage, onNavigate, onHelp }) {
  return (
    <header className="site-header">
      <a className="skip-link" href="#content">
        {text.skip}
      </a>
      <div className="help-bar">
        <div className="help-bar-inner">
          <p className="help-bar-call">
            <span>{text.helpBar}</span>
            <a href="tel:1195">1195</a>
          </p>
          <div className="help-bar-actions">
            <button type="button" className="bar-button bar-button-help" onClick={onHelp}>
              {text.help}
            </button>
            <button type="button" className="bar-button" onClick={leaveSite}>
              {text.exit}
            </button>
          </div>
        </div>
      </div>
      <div className="header-inner">
        <button type="button" className="brand" onClick={() => onNavigate("home")}>
          Nia
          <span className="visually-hidden"> home</span>
        </button>

        <nav className="site-nav" aria-label="Primary">
          {text.nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-button"
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="lang" role="group" aria-label="Language">
          <button type="button" aria-pressed={language === "en"} onClick={() => onLanguage("en")}>
            EN
          </button>
          <span aria-hidden="true">/</span>
          <button type="button" aria-pressed={language === "sw"} onClick={() => onLanguage("sw")}>
            SW
          </button>
        </div>
      </div>
    </header>
  );
}
