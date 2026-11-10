import { useCallback, useEffect, useState } from "react";
import { requestAuth } from "../auth.js";
import supportCopy from "../supportCopy.js";
import PasswordField from "./PasswordField.jsx";
import SupportDesk from "./SupportDesk.jsx";

const TABS = ["queue", "closed"];

export default function SupportApp() {
  const [language, setLanguage] = useState("en");
  const [staff, setStaff] = useState(undefined);
  const [tab, setTab] = useState("queue");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const text = supportCopy[language];
  const onError = useCallback((code) => setErrorCode(code), []);
  const error = errorCode ? text.errors[errorCode] || text.errors.request_failed : "";

  useEffect(() => {
    let cancelled = false;
    requestAuth("/api/support/me")
      .then((next) => {
        if (!cancelled) setStaff(next);
      })
      .catch(() => {
        if (!cancelled) setStaff(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(event) {
    event.preventDefault();
    setPending(true);
    setErrorCode("");
    try {
      const next = await requestAuth("/api/support/login", { email, password });
      setStaff(next);
      setPassword("");
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    try {
      await requestAuth("/api/support/logout", {});
    } catch {
      // Leave the support screen even if the request fails.
    }
    setStaff(null);
  }

  const languageSwitch = (
    <div className="lang" role="group" aria-label="Language">
      <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
      <span aria-hidden="true">/</span>
      <button type="button" aria-pressed={language === "sw"} onClick={() => setLanguage("sw")}>SW</button>
    </div>
  );

  if (staff) {
    return (
      <div className="admin-shell admin-shell-app" lang={language === "sw" ? "sw" : "en"}>
        <aside className="admin-side">
          <a className="brand" href="/" aria-label="Nia home">
            <img src="/images/logo.png" alt="" />
          </a>
          <nav aria-label={text.title}>
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                className="nav-button"
                aria-current={tab === item ? "page" : undefined}
                onClick={() => { setTab(item); setErrorCode(""); }}
              >
                {text[item]}
              </button>
            ))}
          </nav>
          <div className="admin-side-tools">
            {languageSwitch}
            <button type="button" className="nav-button admin-logout" onClick={logout}>{text.logOut}</button>
          </div>
        </aside>
        <div className="admin-stage">
          <main className="admin-main" id="content">
            <h1>{text.title}</h1>
            <p className="lede">{text.line}</p>
            {error ? <p className="auth-error" role="alert">{error}</p> : null}
            <SupportDesk text={text} language={language} tab={tab} onError={onError} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell admin-gate" lang={language === "sw" ? "sw" : "en"}>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="Nia home">
            <img src="/images/logo.png" alt="" />
          </a>
          <div className="header-actions">
            {languageSwitch}
          </div>
        </div>
      </header>
      <main id="content">
        {staff === undefined ? null : (
          <section className="auth-split" aria-labelledby="support-login-title">
            <div className="auth-visual">
              <p className="auth-visual-caption">{text.visualCaption}</p>
              <p className="auth-visual-line">{text.visualLine}</p>
            </div>
            <div className="auth-panel">
              <form className="auth-form" onSubmit={login}>
                <h1 id="support-login-title">{text.loginTitle}</h1>
                <label className="auth-field">
                  <span>{text.email}</span>
                  <input
                    required
                    type="email"
                    autoComplete="username"
                    placeholder={text.emailPlaceholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <PasswordField
                  label={text.password}
                  name="password"
                  autoComplete="current-password"
                  placeholder={text.passwordPlaceholder}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  showLabel={text.showPassword}
                  hideLabel={text.hidePassword}
                />
                {error ? <p className="auth-error" role="alert">{error}</p> : null}
                <button type="submit" className="button button-accent auth-submit" disabled={pending}>
                  {pending ? text.submitting : text.submit}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
