import { useState } from "react";

export default function Scripts({ scripts }) {
  const [drafts, setDrafts] = useState(() => Object.fromEntries(scripts.items.map((item) => [item.id, item.body])));
  const [copied, setCopied] = useState("");
  const [failed, setFailed] = useState("");

  async function copyText(id) {
    const value = drafts[id] || "";
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setFailed("");
      return;
    } catch {
      // The browser blocked the clipboard. Select the words so they can still be copied.
    }

    const field = document.getElementById(`script-${id}`);
    field?.focus();
    field?.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    setCopied(ok ? id : "");
    setFailed(ok ? "" : id);
  }

  return (
    <div className="scripts" id="words-you-can-use">
      <h2 id="scripts-title">{scripts.title}</h2>
      <p>{scripts.lede}</p>
      <div className="script-list">
        {scripts.items.map((item) => (
          <article className="story-card" key={item.id}>
            <label className="script-field">
              <span>{item.title}</span>
              <textarea
                id={`script-${item.id}`}
                rows={4}
                value={drafts[item.id]}
                onChange={(event) => {
                  setDrafts((current) => ({ ...current, [item.id]: event.target.value }));
                  setCopied("");
                  setFailed("");
                }}
              />
            </label>
            <div className="record-actions">
              <button type="button" className="button button-secondary" onClick={() => copyText(item.id)}>
                {scripts.copy}
              </button>
              {copied === item.id ? (
                <p className="account-saved" role="status">
                  {scripts.copied}
                </p>
              ) : null}
              {failed === item.id ? (
                <p className="auth-error" role="alert">
                  {scripts.copyFailed}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
