import { useCallback, useEffect, useState } from "react";
import { requestAuth } from "../auth.js";
import adminCopy from "../adminCopy.js";
import AdminAudit from "./AdminAudit.jsx";
import AdminChat from "./AdminChat.jsx";
import AdminHelplines from "./AdminHelplines.jsx";
import AdminPages from "./AdminPages.jsx";

const TABS = ["helplines", "pages", "chat", "audit"];

export default function AdminApp() {
  const [language, setLanguage] = useState("en");
  const [admin, setAdmin] = useState(undefined);
  const [tab, setTab] = useState("helplines");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const text = adminCopy[language];
  const onError = useCallback((code) => setErrorCode(code), []);
  const error = errorCode ? text.errors[errorCode] || text.errors.request_failed : "";

  useEffect(() => {
    let cancelled = false;
    requestAuth("/api/admin/me")
      .then((next) => {
        if (!cancelled) setAdmin(next);
      })
      .catch(() => {
        if (!cancelled) setAdmin(null);
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
      const next = await requestAuth("/api/admin/login", { email, password });
      setAdmin(next);
      setPassword("");
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    try {
      await requestAuth("/api/admin/logout", {});
    } catch {
      // Leave the admin screen even if the request fails.
    }
    setAdmin(null);
  }

  const languageSwitch = (
    <div className="lang" role="group" aria-label="Language">
      <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
      <span aria-hidden="true">/</span>
      <button type="button" aria-pressed={language === "sw"} onClick={() => setLanguage("sw")}>SW</button>
    </div>
  );

  if (admin) {
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
            {tab === "helplines" ? <AdminHelplines text={text} onError={onError} /> : null}
            {tab === "pages" ? <AdminPages text={text} onError={onError} /> : null}
            {tab === "chat" ? <AdminChat text={text} onError={onError} /> : null}
            {tab === "audit" ? <AdminAudit text={text} language={language} onError={onError} /> : null}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell" lang={language === "sw" ? "sw" : "en"}>
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
      <main className="admin-main" id="content">
        {admin === undefined ? null : (
          <form className="auth-form admin-login" onSubmit={login}>
            <h1>{text.loginTitle}</h1>
            <p className="auth-line">{text.loginLine}</p>
            <label className="auth-field">
              <span>{text.email}</span>
              <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="auth-field">
              <span>{text.password}</span>
              <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error ? <p className="auth-error" role="alert">{error}</p> : null}
            <button type="submit" className="button button-accent auth-submit" disabled={pending}>
              {pending ? text.submitting : text.submit}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
