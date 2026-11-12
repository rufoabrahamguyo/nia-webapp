import { useEffect, useId, useRef, useState } from "react";
import { requestAuth } from "../auth.js";
import { AvatarPicker } from "../avatars.jsx";
import ButtonIcon from "./ButtonIcon.jsx";
import PasswordField from "./PasswordField.jsx";
import ReportForm from "./ReportForm.jsx";

export default function Account({ mode, text, user, onNavigate, onUser, onLogout }) {
  const account = text.account;
  const auth = text.auth;
  const isSettings = mode === "settings";
  const isSupport = mode === "support";
  const [usernameKind, setUsernameKind] = useState(user.usernameKind === "chosen" ? "chosen" : "anonymous");
  const [username, setUsername] = useState(user.usernameKind === "chosen" ? user.username : "");
  const [errorCode, setErrorCode] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const error = errorCode ? auth.errors[errorCode] || auth.errors.request_failed : "";

  const [avatarPending, setAvatarPending] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutTitleId = useId();
  const stayRef = useRef(null);

  useEffect(() => {
    if (!logoutOpen) return;
    stayRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setLogoutOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [logoutOpen]);

  async function chooseAvatar(avatar) {
    if (avatar === user.avatar || avatarPending) return;
    setErrorCode("");
    setAvatarPending(true);
    try {
      const next = await requestAuth("/api/auth/avatar", { avatar });
      onUser(next);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setAvatarPending(false);
    }
  }

  function cancelClose() {
    setConfirm("");
    setAccountPassword("");
    setErrorCode("");
  }

  async function closeAccount(event) {
    event.preventDefault();
    setErrorCode("");
    setPending(true);
    try {
      const body = user.hasPassword ? { password: accountPassword } : {};
      await requestAuth(confirm === "delete" ? "/api/auth/delete" : "/api/auth/deactivate", body);
      onLogout();
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

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
    <section className="account-dash" aria-labelledby="account-title">
      <aside className="account-side">
        <nav aria-label={text.accountMenu}>
          <button
            type="button"
            className="nav-button"
            aria-current={mode === "profile" ? "page" : undefined}
            onClick={() => onNavigate("profile")}
          >
            {text.profile}
          </button>
          <button
            type="button"
            className="nav-button"
            aria-current={isSettings ? "page" : undefined}
            onClick={() => onNavigate("settings")}
          >
            {text.settings}
          </button>
          <button
            type="button"
            className="nav-button"
            aria-current={isSupport ? "page" : undefined}
            onClick={() => onNavigate("support")}
          >
            {account.support}
          </button>
          <button type="button" className="nav-button account-logout" onClick={() => setLogoutOpen(true)}>
            {text.logOut}
          </button>
        </nav>
      </aside>
      <div className="account-main">
        <div className="auth-form">
        {isSettings ? (
          <>
          <form onSubmit={onSubmit}>
            <h1 id="account-title">{account.settingsTitle}</h1>
            <p className="auth-line">{account.settingsLine}</p>
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

            {error && !confirm && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            {saved && (
              <p className="account-saved" role="status">
                {account.saved}
              </p>
            )}

            <div className="account-actions">
              <button type="submit" className="button button-accent" disabled={pending}>
                {pending ? auth.submitting : account.save}
              </button>
              <button type="button" className="button button-secondary button-icon" onClick={() => onNavigate("profile")}>
                <ButtonIcon name="back" />
                {account.openProfile}
              </button>
            </div>
          </form>
          <div className="account-danger">
            <h2>{account.accountTitle}</h2>
            <p className="auth-line">{account.accountLine}</p>
            {confirm ? (
              <form onSubmit={closeAccount}>
                <p>{confirm === "delete" ? account.deleteAsk : account.deactivateAsk}</p>
                {user.hasPassword ? (
                  <PasswordField
                    label={auth.password}
                    name="account-password"
                    autoComplete="current-password"
                    value={accountPassword}
                    placeholder={auth.passwordPlaceholder}
                    onChange={(event) => setAccountPassword(event.target.value)}
                    showLabel={auth.showPassword}
                    hideLabel={auth.hidePassword}
                  />
                ) : null}
                {error ? (
                  <p className="auth-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <div className="account-actions">
                  <button
                    type="submit"
                    className={confirm === "delete" ? "button button-help button-icon" : "button button-secondary button-icon"}
                    disabled={pending}
                  >
                    <ButtonIcon name={confirm === "delete" ? "trash" : "pause"} />
                    {pending ? auth.submitting : confirm === "delete" ? account.deleteYes : account.deactivateYes}
                  </button>
                  <button type="button" className="button button-secondary button-icon" onClick={cancelClose} disabled={pending}>
                    <ButtonIcon name="close" />
                    {account.cancel}
                  </button>
                </div>
              </form>
            ) : (
              <div className="account-actions">
                <button type="button" className="button button-secondary button-icon" onClick={() => { setErrorCode(""); setConfirm("deactivate"); }}>
                  <ButtonIcon name="pause" />
                  {account.deactivate}
                </button>
                <button type="button" className="button button-help button-icon" onClick={() => { setErrorCode(""); setConfirm("delete"); }}>
                  <ButtonIcon name="trash" />
                  {account.delete}
                </button>
              </div>
            )}
          </div>
          </>
        ) : isSupport ? (
          <ReportForm
            tone="page"
            copy={text.support}
            user={user}
            titleId="account-title"
            onSignIn={() => onNavigate("login")}
            onConsent={() => onNavigate("consent")}
          />
        ) : (
          <>
            <h1 id="account-title" className="account-username">{user.username}</h1>
            <p className="auth-line">
              {user.usernameKind === "chosen" ? account.profileChosen : account.profileAnonymous}
            </p>
            <AvatarPicker
              legend={text.faces.legend}
              labels={text.faces}
              value={user.avatar || "cat"}
              onChange={chooseAvatar}
            />
            {error ? <p className="auth-error" role="alert">{error}</p> : null}
          </>
        )}
        </div>
      </div>
      {logoutOpen ? (
        <div className="logout-layer">
          <button type="button" className="logout-backdrop" aria-label={text.logoutStay} onClick={() => setLogoutOpen(false)} />
          <div className="logout-dialog" role="dialog" aria-modal="true" aria-labelledby={logoutTitleId}>
            <h2 id={logoutTitleId}>{text.logoutTitle}</h2>
            <p>{text.logoutLine}</p>
            <div className="logout-actions">
              <button ref={stayRef} type="button" className="button button-accent" onClick={() => setLogoutOpen(false)}>
                {text.logoutStay}
              </button>
              <button type="button" className="button button-secondary" onClick={onLogout}>
                {text.logoutConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
