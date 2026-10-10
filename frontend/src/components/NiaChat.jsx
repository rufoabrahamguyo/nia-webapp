import { useEffect, useState } from "react";
import { requestAuth } from "../auth.js";

function formatWhen(value, language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "sw" ? "sw-KE" : "en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StoryList({ stories, copy, language, pending, confirmId, setConfirmId, onDelete, onComment }) {
  return (
    <div className="chat-list">
      {stories.map((story) => (
        <article className="story-card chat-story" key={story.id}>
          <p className="record-when">
            <span>{story.authorName}</span>
            <span>{formatWhen(story.createdAt, language)}</span>
            {story.status === "pending" ? <span className="chat-status">{copy.waiting}</span> : null}
            {story.status === "hidden" ? <span className="chat-status">{copy.hidden}</span> : null}
          </p>
          <p className="record-body">{story.body}</p>
          {story.mine ? (
            <div className="record-actions">
              {confirmId === story.id ? (
                <>
                  <span>{copy.deleteAsk}</span>
                  <button type="button" className="next-link" onClick={() => onDelete(story.id)} disabled={pending}>
                    {copy.delete}
                  </button>
                  <button type="button" className="next-link" onClick={() => setConfirmId(null)}>
                    {copy.cancel}
                  </button>
                </>
              ) : (
                <button type="button" className="next-link" onClick={() => setConfirmId(story.id)}>
                  {copy.delete}
                </button>
              )}
            </div>
          ) : null}
          {story.comments?.length ? (
            <ul className="chat-comments">
              {story.comments.map((comment) => (
                <li key={comment.id}>
                  <p className="record-when">
                    <span>{comment.authorName}</span>
                    {comment.status === "pending" ? <span className="chat-status">{copy.waiting}</span> : null}
                    {comment.status === "hidden" ? <span className="chat-status">{copy.hidden}</span> : null}
                  </p>
                  <p>{comment.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {story.status === "allowed" ? (
            <CommentForm copy={copy} pending={pending} onSubmit={(body) => onComment(story.id, body)} />
          ) : null}
        </article>
      ))}
    </div>
  );
}

function CommentForm({ copy, pending, onSubmit }) {
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const ok = await onSubmit(body);
    if (ok) {
      setBody("");
      setSent(true);
    }
  }

  return (
    <form className="chat-comment-form" onSubmit={submit}>
      <label className="auth-field">
        <span>{copy.commentLabel}</span>
        <textarea
          required
          maxLength={1000}
          rows={3}
          value={body}
          placeholder={copy.commentPlaceholder}
          onChange={(event) => {
            setBody(event.target.value);
            setSent(false);
          }}
        />
      </label>
      {sent ? <p className="account-saved">{copy.commentSent}</p> : null}
      <button type="submit" className="button button-secondary" disabled={pending}>
        {copy.commentSubmit}
      </button>
    </form>
  );
}

export default function NiaChat({ text, user, language, onOpen }) {
  const copy = text.chat;
  const [stories, setStories] = useState([]);
  const [mine, setMine] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const error = errorCode ? copy.errors[errorCode] || copy.errors.request_failed : "";

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    requestAuth("/api/chat/stories")
      .then((data) => {
        if (cancelled) return;
        setStories(data.stories || []);
        setMine(data.mine || []);
        setHasMore(Boolean(data.hasMore));
      })
      .catch((caught) => {
        if (!cancelled) setErrorCode(caught.code || "request_failed");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function submitStory(event) {
    event.preventDefault();
    setErrorCode("");
    setSaved(false);
    setPending(true);
    try {
      const story = await requestAuth("/api/chat/stories", { body });
      setMine((list) => [story, ...list]);
      setBody("");
      setSaved(true);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function removeStory(id) {
    setErrorCode("");
    setPending(true);
    try {
      await requestAuth(`/api/chat/stories/${id}`, null, "DELETE");
      setStories((list) => list.filter((story) => story.id !== id));
      setMine((list) => list.filter((story) => story.id !== id));
      setConfirmId(null);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function addComment(id, commentBody) {
    setErrorCode("");
    setPending(true);
    try {
      const comment = await requestAuth(`/api/chat/stories/${id}/comments`, { body: commentBody });
      const attach = (story) => (story.id === id ? { ...story, comments: [...(story.comments || []), comment] } : story);
      setStories((list) => list.map(attach));
      setMine((list) => list.map(attach));
      return true;
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function loadEarlier() {
    const last = stories[stories.length - 1];
    if (!last) return;
    setPending(true);
    try {
      const data = await requestAuth(`/api/chat/stories?before=${encodeURIComponent(last.createdAt)}`);
      setStories((list) => [...list, ...(data.stories || [])]);
      setHasMore(Boolean(data.hasMore));
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="page page-chat">
      <header className="page-hero">
        <div className="page-hero-copy">
          <h1 id="screen-title">{copy.title}</h1>
          <p className="lede">{copy.lede}</p>
        </div>
      </header>
      <div className="page-band">
        <p className="fine">{copy.privateNote}</p>
        {!user ? (
          <div className="record-gate">
            <p>{copy.signIn}</p>
            <button type="button" className="button button-accent" onClick={() => onOpen("login")}>
              {text.logIn}
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={submitStory}>
              <label className="auth-field record-field">
                <span>{copy.storyLabel}</span>
                <textarea
                  required
                  maxLength={4000}
                  rows={6}
                  value={body}
                  placeholder={copy.storyPlaceholder}
                  onChange={(event) => {
                    setBody(event.target.value);
                    setSaved(false);
                  }}
                />
              </label>
              {error ? (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              ) : null}
              {saved ? <p className="account-saved">{copy.submitted}</p> : null}
              <button type="submit" className="button button-accent" disabled={pending}>
                {pending ? copy.submitting : copy.submit}
              </button>
            </form>
            {mine.length > 0 ? (
              <section className="chat-mine" aria-labelledby="chat-mine-title">
                <h2 id="chat-mine-title">{copy.yours}</h2>
                <StoryList
                  stories={mine}
                  copy={copy}
                  language={language}
                  pending={pending}
                  confirmId={confirmId}
                  setConfirmId={setConfirmId}
                  onDelete={removeStory}
                  onComment={addComment}
                />
              </section>
            ) : null}
            {stories.length > 0 ? (
              <StoryList
                stories={stories}
                copy={copy}
                language={language}
                pending={pending}
                confirmId={confirmId}
                setConfirmId={setConfirmId}
                onDelete={removeStory}
                onComment={addComment}
              />
            ) : (
              <p className="record-empty">{copy.empty}</p>
            )}
            {hasMore ? (
              <button type="button" className="button button-secondary" onClick={loadEarlier} disabled={pending}>
                {copy.earlier}
              </button>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
