import { useState } from "react";
import { requestAuth } from "../auth.js";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export default function AuthPanel({ mode, text, onSwitch, onSuccess, initialErrorCode = "" }) {
  const auth = text.auth;
  const isSignup = mode === "signup";
  const isGoogle = mode === "google";
  const asksForName = isSignup || isGoogle;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameKind, setUsernameKind] = useState("anonymous");
  const [username, setUsername] = useState("");
  const [errorCode, setErrorCode] = useState(initialErrorCode);
  const [pending, setPending] = useState(false);
  const error = errorCode ? auth.errors[errorCode] || auth.errors.request_failed : "";

  async function onSubmit(event) {
    event.preventDefault();
    setErrorCode("");

    if (isSignup && password !== confirmPassword) {
      setErrorCode("password_mismatch");
      return;
    }

    setPending(true);
    try {
      const body = isGoogle ? { usernameKind } : { email, password };
      if (asksForName) {
        body.usernameKind = usernameKind;
        if (usernameKind === "chosen") body.username = username;
      }
      const path = isGoogle ? "/api/auth/google/complete" : isSignup ? "/api/auth/signup" : "/api/auth/login";
      const user = await requestAuth(path, body);
      onSuccess(user);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-split" aria-labelledby="auth-title">
      <div className="auth-visual">
        <p className="auth-visual-caption">{auth.visualCaption}</p>
        <p className="auth-visual-line">{auth.visualLine}</p>
      </div>
      <div className="auth-panel">
        <form className="auth-form" onSubmit={onSubmit}>
          <h1 id="auth-title">{isSignup || isGoogle ? auth.signupTitle : auth.loginTitle}</h1>
          <p className="auth-line">{isGoogle ? auth.googleNameLine : isSignup ? auth.signupLine : auth.loginLine}</p>

          {!isGoogle && (
            <a className="button auth-google" href="/api/auth/google">
              <GoogleMark />
              {auth.continueGoogle}
            </a>
          )}
          {!isGoogle && <p className="auth-or">{auth.or}</p>}

          {!isGoogle && (
          <label className="auth-field">
            <span>{auth.email}</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              placeholder={auth.emailPlaceholder}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          )}

          {!isGoogle && (
          <label className="auth-field">
            <span>{auth.password}</span>
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              placeholder={auth.passwordPlaceholder}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          )}

          {isSignup && (
            <label className="auth-field">
              <span>{auth.confirmPassword}</span>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                placeholder={auth.passwordPlaceholder}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          )}

          {asksForName && (
            <fieldset className="auth-choice">
              <legend>{auth.nameChoice}</legend>
              <label>
                <input
                  type="radio"
                  name="usernameKind"
                  value="anonymous"
                  checked={usernameKind === "anonymous"}
                  onChange={() => setUsernameKind("anonymous")}
                />
                <span>
                  <strong>{auth.anonymous}</strong>
                  <span>{auth.anonymousHint}</span>
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  name="usernameKind"
                  value="chosen"
                  checked={usernameKind === "chosen"}
                  onChange={() => setUsernameKind("chosen")}
                />
                <span>
                  <strong>{auth.chosen}</strong>
                  <span>{auth.chosenHint}</span>
                </span>
              </label>
            </fieldset>
          )}

          {asksForName && usernameKind === "chosen" && (
            <label className="auth-field">
              <span>{auth.username}</span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                minLength={3}
                maxLength={20}
                value={username}
                placeholder={auth.usernamePlaceholder}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="button button-accent auth-submit" disabled={pending}>
            {pending ? auth.submitting : isSignup || isGoogle ? auth.submitSignup : auth.submitLogin}
          </button>

          {!isGoogle && (
            <p className="auth-switch">
              <span>{isSignup ? auth.haveAccount : auth.needAccount}</span>{" "}
              <button type="button" className="next-link" onClick={onSwitch}>
                {isSignup ? text.logIn : text.signUp}
              </button>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
