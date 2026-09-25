import { useEffect, useRef } from "react";

export default function Header({ language, text, view, onLanguage, onNavigate, onHelp }) {
  const headerRef = useRef(null);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const apply = () => {
      document.documentElement.style.setProperty("--header-h", `${node.offsetHeight}px`);
    };

    const onScroll = () => {
      node.classList.toggle("is-scrolled", window.scrollY > 8);
    };

    apply();
    onScroll();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="help-bar">
        <div className="help-bar-inner">
          <div className="lang" role="group" aria-label="Language">
            <button type="button" aria-pressed={language === "en"} onClick={() => onLanguage("en")}>
              EN
            </button>
            <span aria-hidden="true">/</span>
            <button type="button" aria-pressed={language === "sw"} onClick={() => onLanguage("sw")}>
              SW
            </button>
          </div>
          <p className="help-bar-call">
            <span>{text.helpBar}</span>
            <a href="tel:1195">1195</a>
            <button type="button" className="bar-button bar-button-help" onClick={onHelp}>
              {text.help}
            </button>
          </p>
        </div>
      </div>
      <div className="header-inner">
        <button type="button" className="brand" aria-label="Nia home" onClick={() => onNavigate("home")}>
          <img src="/images/logo.png" alt="" />
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
      </div>
    </header>
  );
}
