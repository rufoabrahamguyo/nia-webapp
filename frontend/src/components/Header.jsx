import { useEffect, useId, useRef, useState } from "react";

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
  onLogout,
}) {
  const headerRef = useRef(null);
  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);
  const menuId = useId();
  const dialogTitleId = useId();
  const stayRef = useRef(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

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
    if (!accountOpen) return;

    const onPointerDown = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setAccountOpen(false);
      accountButtonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  useEffect(() => {
    setAccountOpen(false);
    setConfirmLogout(false);
  }, [user]);

  useEffect(() => {
    if (!confirmLogout) return;
    stayRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setConfirmLogout(false);
      accountButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmLogout]);

  function openAccount(next) {
    setAccountOpen(false);
    onNavigate(next);
  }

  function askLogout() {
    setAccountOpen(false);
    setConfirmLogout(true);
  }

  function staySignedIn() {
    setConfirmLogout(false);
    accountButtonRef.current?.focus();
  }

  const initial = user?.username?.trim().charAt(0).toLocaleUpperCase() || "";

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

        <div className="header-actions">
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
          {authReady && (
            <div className="account-nav">
              {user ? (
                <div className="account-menu" ref={accountRef}>
                  <button
                    ref={accountButtonRef}
                    type="button"
                    className="account-chip"
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-controls={menuId}
                    aria-label={`${user.username}, ${text.accountMenu}`}
                    onClick={() => setAccountOpen((open) => !open)}
                  >
                    <span className="account-chip-copy">
                      <span className="account-label">{user.username}</span>
                    </span>
                    <span className="account-mark" aria-hidden="true">
                      {initial}
                    </span>
                    <ChevronIcon />
                  </button>
                  {accountOpen && (
                    <div className="account-dropdown" id={menuId} role="menu">
                      <button
                        type="button"
                        className="account-item"
                        role="menuitem"
                        aria-current={view === "profile" ? "page" : undefined}
                        onClick={() => openAccount("profile")}
                      >
                        <PersonIcon />
                        {text.profile}
                      </button>
                      <button
                        type="button"
                        className="account-item"
                        role="menuitem"
                        aria-current={view === "settings" ? "page" : undefined}
                        onClick={() => openAccount("settings")}
                      >
                        <GearIcon />
                        {text.settings}
                      </button>
                      <button
                        type="button"
                        className="account-item"
                        role="menuitem"
                        onClick={askLogout}
                      >
                        <LogoutIcon />
                        {text.logOut}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="nav-button"
                    aria-current={view === "login" ? "page" : undefined}
                    onClick={() => onNavigate("login")}
                  >
                    {text.logIn}
                  </button>
                  <button
                    type="button"
                    className="button button-accent account-signup"
                    aria-current={view === "signup" ? "page" : undefined}
                    onClick={() => onNavigate("signup")}
                  >
                    {text.signUp}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {confirmLogout && (
        <div className="logout-layer">
          <button type="button" className="logout-backdrop" aria-label={text.logoutStay} onClick={staySignedIn} />
          <div className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
            <LeaveIcon />
            <h2 id={dialogTitleId}>{text.logoutTitle}</h2>
            <p>{text.logoutLine}</p>
            <div className="logout-actions">
              <button ref={stayRef} type="button" className="button button-accent" onClick={staySignedIn}>
                {text.logoutStay}
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setConfirmLogout(false);
                  onLogout();
                }}
              >
                {text.logoutConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function PersonIcon() {
  return (
    <MenuIcon>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.6 19.2c1-3 3.2-4.5 6.4-4.5s5.4 1.5 6.4 4.5" />
    </MenuIcon>
  );
}

function GearIcon() {
  return (
    <MenuIcon>
      <path d="M10.1 3.5h3.8l.5 2.2c.5.2 1 .5 1.4.8l2.1-.9 1.9 3.2-1.6 1.6c.1.5.1 1.1 0 1.6l1.6 1.6-1.9 3.2-2.1-.9c-.4.3-.9.6-1.4.8l-.5 2.2h-3.8l-.5-2.2a5.6 5.6 0 0 1-1.4-.8l-2.1.9-1.9-3.2 1.6-1.6a5.8 5.8 0 0 1 0-1.6L4.2 8.8l1.9-3.2 2.1.9c.4-.3.9-.6 1.4-.8l.5-2.2z" />
      <circle cx="12" cy="12" r="2.3" />
    </MenuIcon>
  );
}

function LogoutIcon() {
  return (
    <MenuIcon>
      <path d="M9.2 7V6.2A1.2 1.2 0 0 1 10.4 5h7.4A1.2 1.2 0 0 1 19 6.2v11.6a1.2 1.2 0 0 1-1.2 1.2h-7.4a1.2 1.2 0 0 1-1.2-1.2V17" />
      <path d="M4 12h9.2" />
      <path d="M10.6 8.8 13.8 12l-3.2 3.2" />
    </MenuIcon>
  );
}

function LeaveIcon() {
  return (
    <svg className="logout-mark" viewBox="0 0 72 56" aria-hidden="true" fill="none">
      <rect x="6" y="8" width="34" height="40" rx="4" fill="var(--card)" stroke="currentColor" strokeWidth="2" />
      <path d="M28 8v40" stroke="currentColor" strokeWidth="2" />
      <path d="M46 28h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M58 21.5 65 28l-7 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
