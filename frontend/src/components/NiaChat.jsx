import { useEffect, useState } from "react";
import { requestAuth } from "../auth.js";
import { AnimalFace } from "../avatars.jsx";

const REACTIONS = [
  { id: "care", glyph: "💛" },
  { id: "thanks", glyph: "🙏" },
  { id: "strength", glyph: "💪" },
  { id: "hope", glyph: "🌱" },
];

function FlagIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3.5v17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 4.5h11.2L14.6 9l2.6 4.5H6z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function ReportFlag({ id, reported, copy, pending, confirmId, setConfirmId, onReport }) {
  const open = confirmId === id;
  return (
    <>
      <button
        type="button"
        className={reported ? "chat-flag is-reported" : "chat-flag"}
        aria-label={reported ? copy.reported : copy.report}
        aria-pressed={reported || open}
        disabled={pending || reported}
        onClick={() => setConfirmId(open ? null : id)}
      >
        <FlagIcon filled={reported || open} />
      </button>
      {open ? (
        <span className="chat-report-ask">
          <span>{copy.reportAsk}</span>
          <button type="button" className="chat-flag is-reported" aria-label={copy.report} onClick={onReport} disabled={pending}>
            <FlagIcon filled />
          </button>
          <button type="button" className="next-link" onClick={() => setConfirmId(null)}>
            {copy.cancel}
          </button>
        </span>
      ) : null}
    </>
  );
}

function Reactions({ items, labels, pending, onReact }) {
  return (
    <div className="chat-react" role="group" aria-label={labels.group}>
      {REACTIONS.map((item) => {
        const found = (items || []).find((entry) => entry.emoji === item.id);
        return (
          <button
            key={item.id}
            type="button"
            className="chat-emoji"
            aria-pressed={Boolean(found?.mine)}
            aria-label={labels[item.id]}
            disabled={pending}
            onClick={() => onReact(item.id)}
          >
            <span aria-hidden="true">{item.glyph}</span>
            {found?.count ? <span>{found.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function Author({ name, avatar, when, status }) {
  return (
    <p className="record-when chat-author">
      <span className="chat-face"><AnimalFace id={avatar} /></span>
      <span>{name}</span>
      {when ? <span>{when}</span> : null}
      {status}
    </p>
  );
}

function formatWhen(value, language) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "sw" ? "sw-KE" : "en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StoryList({ stories, copy, language, pending, confirmId, setConfirmId, onDelete, onComment, onReport, onReportComment, onReact, onReactComment }) {
  return (
    <div className="chat-list">
      {stories.map((story) => (
        <article className="story-card chat-story" key={story.id}>
          <Author
            name={story.authorName}
            avatar={story.authorAvatar}
            when={formatWhen(story.createdAt, language)}
            status={
              <>
                {story.status === "pending" ? <span className="chat-status">{copy.waiting}</span> : null}
                {story.status === "hidden" ? <span className="chat-status">{copy.hidden}</span> : null}
              </>
            }
          />
          <p className="record-body">{story.body}</p>
          {story.status === "allowed" || story.mine ? (
            <div className="chat-tools">
              {story.status === "allowed" ? (
                <Reactions items={story.reactions} labels={copy.reactions} pending={pending} onReact={(emoji) => onReact(story.id, emoji)} />
              ) : null}
              {story.mine ? (
                confirmId === story.id ? (
                  <span className="chat-report-ask">
                    <span>{copy.deleteAsk}</span>
                    <button type="button" className="next-link" onClick={() => onDelete(story.id)} disabled={pending}>
                      {copy.delete}
                    </button>
                    <button type="button" className="next-link" onClick={() => setConfirmId(null)}>
                      {copy.cancel}
                    </button>
                  </span>
                ) : (
                  <button type="button" className="next-link" onClick={() => setConfirmId(story.id)}>
                    {copy.delete}
                  </button>
                )
              ) : (
                <ReportFlag
                  id={`s:${story.id}`}
                  reported={story.reported}
                  copy={copy}
                  pending={pending}
                  confirmId={confirmId}
                  setConfirmId={setConfirmId}
                  onReport={() => onReport(story.id)}
                />
              )}
            </div>
          ) : null}
          {story.comments?.length ? (
            <ul className="chat-comments">
              {story.comments.map((comment) => (
                <li key={comment.id}>
                  <Author
                    name={comment.authorName}
                    avatar={comment.authorAvatar}
                    when=""
                    status={
                      <>
                        {comment.status === "pending" ? <span className="chat-status">{copy.waiting}</span> : null}
                        {comment.status === "hidden" ? <span className="chat-status">{copy.hidden}</span> : null}
                      </>
                    }
                  />
                  <p>{comment.body}</p>
                  {comment.status === "allowed" ? (
                    <div className="chat-tools">
                      <Reactions
                        items={comment.reactions}
                        labels={copy.reactions}
                        pending={pending}
                        onReact={(emoji) => onReactComment(story.id, comment.id, emoji)}
                      />
                      {!comment.mine ? (
                        <ReportFlag
                          id={`c:${comment.id}`}
                          reported={comment.reported}
                          copy={copy}
                          pending={pending}
                          confirmId={confirmId}
                          setConfirmId={setConfirmId}
                          onReport={() => onReportComment(story.id, comment.id)}
                        />
                      ) : null}
                    </div>
                  ) : null}
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
  const [notice, setNotice] = useState("");

  async function submit(event) {
    event.preventDefault();
    const result = await onSubmit(body);
    if (result) {
      setBody("");
      setNotice(result.status === "pending" ? copy.commentHeld : copy.commentSent);
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
            setNotice("");
          }}
        />
      </label>
      {notice ? <p className="account-saved">{notice}</p> : null}
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
      if (story.status === "allowed") setStories((list) => [story, ...list]);
      else setMine((list) => [story, ...list]);
      setBody("");
      setSaved(story.status === "pending" ? "held" : "posted");
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
      return comment;
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
      return false;
    } finally {
      setPending(false);
    }
  }

  function applyReport(list, storyId, commentId, status) {
    return list.flatMap((story) => {
      if (story.id !== storyId) return [story];
      if (!commentId) {
        if (status !== "allowed") return [];
        return [{ ...story, reported: true }];
      }
      const comments = (story.comments || []).flatMap((comment) => {
        if (comment.id !== commentId) return [comment];
        if (status !== "allowed") return [];
        return [{ ...comment, reported: true }];
      });
      return [{ ...story, comments }];
    });
  }

  async function reportStory(id) {
    setErrorCode("");
    setPending(true);
    try {
      const data = await requestAuth(`/api/chat/stories/${id}/report`, {});
      setStories((list) => applyReport(list, id, null, data.status));
      setConfirmId(null);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function reportComment(storyId, commentId) {
    setErrorCode("");
    setPending(true);
    try {
      const data = await requestAuth(`/api/chat/comments/${commentId}/report`, {});
      const mark = (list) => applyReport(list, storyId, commentId, data.status);
      setStories(mark);
      setMine(mark);
      setConfirmId(null);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function reactTo(kind, storyId, commentId, emoji) {
    setErrorCode("");
    setPending(true);
    try {
      const path = kind === "story" ? `/api/chat/stories/${storyId}/react` : `/api/chat/comments/${commentId}/react`;
      const data = await requestAuth(path, { emoji });
      const apply = (list) => list.map((story) => {
        if (story.id !== storyId) return story;
        if (kind === "story") return { ...story, reactions: data.reactions };
        return {
          ...story,
          comments: (story.comments || []).map((comment) => (
            comment.id === commentId ? { ...comment, reactions: data.reactions } : comment
          )),
        };
      });
      setStories(apply);
      setMine(apply);
    } catch (caught) {
      setErrorCode(caught.code || "request_failed");
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
              {saved === "posted" ? <p className="account-saved">{copy.submitted}</p> : null}
              {saved === "held" ? <p className="account-saved">{copy.submittedHeld}</p> : null}
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
                  onReport={reportStory}
                  onReportComment={reportComment}
                  onReact={(id, emoji) => reactTo("story", id, null, emoji)}
                  onReactComment={(storyId, commentId, emoji) => reactTo("comment", storyId, commentId, emoji)}
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
                onReport={reportStory}
                onReportComment={reportComment}
                onReact={(id, emoji) => reactTo("story", id, null, emoji)}
                onReactComment={(storyId, commentId, emoji) => reactTo("comment", storyId, commentId, emoji)}
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
