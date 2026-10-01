import { useState } from "react";
import { requestAuth } from "../auth.js";

export default function Account({ mode, text, user, onNavigate, onUser }) {
  const account = text.account;
  const auth = text.auth;
  const isSettings = mode === "settings";
  const [usernameKind, setUsernameKind] = useState(user.usernameKind === "chosen" ? "chosen" : "anonymous");
  const [username, setUsername] = useState(user.usernameKind === "chosen" ? user.username : "");
  const [errorCode, setErrorCode] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const error = errorCode ? auth.errors[errorCode] || auth.errors.request_failed : "";

  async function onSubmit(event) {
    event.preventDefault();
    setErrorCode("");
    setSaved(false);
    setPending(true);
    try {
      const body = { usernameKind };
      if (usernameKind === "chosen") body.username = username;
      const next = await requestAuth("/api/auth/username", body);
      onUser(next);
      setSaved(true);
      if (next.usernameKind === "chosen") setUsername(next.username);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-panel" aria-labelledby="account-title">
      <div className="auth-form">
        <h1 id="account-title">{isSettings ? account.settingsTitle : account.profileTitle}</h1>
        <p className="auth-line">{isSettings ? account.settingsLine : account.profileLine}</p>

        {isSettings ? (
          <form onSubmit={onSubmit}>
            <fieldset className="auth-choice">
              <legend>{auth.nameChoice}</legend>
              <label>
                <input
                  type="radio"
                  name="usernameKind"
                  value="anonymous"
                  checked={usernameKind === "anonymous"}
                  onChange={() => {
                    setUsernameKind("anonymous");
                    setSaved(false);
                  }}
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
                  onChange={() => {
                    setUsernameKind("chosen");
                    setSaved(false);
                  }}
                />
                <span>
                  <strong>{auth.chosen}</strong>
                  <span>{auth.chosenHint}</span>
                </span>
              </label>
            </fieldset>

            {usernameKind === "chosen" && (
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
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setSaved(false);
                  }}
                />
              </label>
            )}

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            {saved && (
              <p className="account-saved" role="status">
                {account.saved}
              </p>
            )}

            <button type="submit" className="button button-accent auth-submit" disabled={pending}>
              {pending ? auth.submitting : account.save}
            </button>
            <p className="auth-switch">
              <button type="button" className="next-link" onClick={() => onNavigate("profile")}>
                {account.openProfile}
              </button>
            </p>
          </form>
        ) : (
          <>
            <dl className="account-facts">
              <div>
                <dt>{account.username}</dt>
                <dd>{user.username}</dd>
              </div>
              {user.email && (
                <div>
                  <dt>{account.email}</dt>
                  <dd>{user.email}</dd>
                </div>
              )}
            </dl>
            <p className="auth-line">
              {user.usernameKind === "chosen" ? account.profileChosen : account.profileAnonymous}
            </p>
            <p className="auth-switch">
              <button type="button" className="next-link" onClick={() => onNavigate("settings")}>
                {account.openSettings}
              </button>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
