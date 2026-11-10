import { useEffect, useId, useRef, useState } from "react";
import { AnimalFace } from "../avatars.jsx";

export default function Header({
  language,
  text,
  view,
  user,
  authReady,
  onLanguage,
  onNavigate,
  onHelp,
  onLeave,
}) {
  const headerRef = useRef(null);
  const navPanelId = useId();
  const navToggleRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false);

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

  useEffect(() => {
    setNavOpen(false);
  }, [view]);

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setNavOpen(false);
      navToggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  function navigate(next, anchor) {
    setNavOpen(false);
    onNavigate(next, anchor);
  }

  return (
    <header className="site-header" ref={headerRef}>
      <div className="help-bar">
        <div className="help-bar-inner">
          <div className="help-bar-end">
            <div className="lang" role="group" aria-label="Language">
              <button type="button" aria-pressed={language === "en"} onClick={() => onLanguage("en")}>
                EN
              </button>
              <span aria-hidden="true">/</span>
              <button type="button" aria-pressed={language === "sw"} onClick={() => onLanguage("sw")}>
                SW
              </button>
            </div>
            <button type="button" className="button button-exit help-exit" onClick={onLeave}>
              {text.exit}
            </button>
          </div>
          <p className="help-bar-call">
            <span>{text.helpBar}</span>
            <button type="button" className="bar-button bar-button-help" onClick={onHelp}>
              {text.help}
            </button>
          </p>
        </div>
      </div>
      <div className="header-inner">
        <button type="button" className="brand" aria-label="Nia home" onClick={() => navigate("home")}>
          <img src="/images/logo.png" alt="" />
        </button>

        <button
          ref={navToggleRef}
          type="button"
          className="nav-toggle"
          aria-expanded={navOpen}
          aria-controls={navPanelId}
          aria-label={navOpen ? text.menuClose : text.menu}
          onClick={() => setNavOpen((open) => !open)}
        >
          {navOpen ? <CloseIcon /> : <MenuBarsIcon />}
        </button>

        <nav id={navPanelId} className={`site-nav${navOpen ? " is-open" : ""}`} aria-label="Primary">
          {text.nav.map((item) =>
            item.id === "rights" ? (
              <RightsNav key={item.id} item={item} text={text} view={view} onNavigate={navigate} />
            ) : (
              <button
                key={item.id}
                type="button"
                className="nav-button"
                aria-current={view === item.id ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ),
          )}
        </nav>
        {authReady && (
            <div className="account-nav">
              {user ? (
                <button
                  type="button"
                  className="nav-button account-profile"
                  aria-current={view === "profile" ? "page" : undefined}
                  onClick={() => navigate("profile")}
                >
                  <span className="account-mark" aria-hidden="true">
                    <AnimalFace id={user.avatar} />
                  </span>
                  {text.profile}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="nav-button"
                    aria-current={view === "login" ? "page" : undefined}
                    onClick={() => navigate("login")}
                  >
                    {text.logIn}
                  </button>
                  <button
                    type="button"
                    className="button button-accent account-signup"
                    aria-current={view === "signup" ? "page" : undefined}
                    onClick={() => navigate("signup")}
                  >
                    {text.signUp}
                  </button>
                </>
              )}
            </div>
          )}
      </div>
    </header>
  );
}

function hoverCapable() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function RightsNav({ item, text, view, onNavigate }) {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuId = useId();
  const closeTimer = useRef(null);
  const [open, setOpen] = useState(false);

  function show() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function hide() {
    clearTimeout(closeTimer.current);
    setOpen(false);
  }

  function hideSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    setOpen(false);
  }, [view, text]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) hide();
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      hide();
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function openSection(anchor) {
    hide();
    onNavigate("rights", anchor);
  }

  function onButtonKeyDown(event) {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    show();
    requestAnimationFrame(() => {
      rootRef.current?.querySelector("[role='menuitem']")?.focus();
    });
  }

  function onItemKeyDown(event) {
    const items = [...rootRef.current.querySelectorAll("[role='menuitem']")];
    const index = items.indexOf(event.currentTarget);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    }
  }

  return (
    <div
      className="nav-menu"
      ref={rootRef}
      onMouseEnter={() => {
        if (hoverCapable()) show();
      }}
      onMouseLeave={() => {
        if (hoverCapable()) hideSoon();
      }}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget)) hide();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="nav-button"
        aria-current={view === item.id ? "page" : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => {
          if (!hoverCapable()) {
            setOpen((value) => !value);
            return;
          }
          openSection();
        }}
        onKeyDown={onButtonKeyDown}
      >
        {item.label}
        <ChevronIcon />
      </button>
      {open ? (
        <div className="nav-dropdown" id={menuId} role="menu">
          {text.rightsMenu.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="nav-item"
              role="menuitem"
              onClick={() => openSection(entry.id)}
              onKeyDown={onItemKeyDown}
            >
              {entry.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MenuBarsIcon() {
  return (
    <svg className="nav-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="nav-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="account-chevron" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.2 10 7.2l5 5" />
    </svg>
  );
}
