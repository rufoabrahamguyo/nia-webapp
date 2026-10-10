import { useEffect, useState } from "react";
import { requestAuth } from "../auth.js";

const FILTERS = ["pending", "allowed", "hidden"];

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminChat({ text, onError }) {
  const [status, setStatus] = useState("pending");
  const [stories, setStories] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    requestAuth(`/api/admin/chat?status=${status}`)
      .then((data) => {
        if (cancelled) return;
        setStories(data.stories || []);
        setHasMore(Boolean(data.hasMore));
      })
      .catch((caught) => onError(caught.code || "request_failed"));
    return () => {
      cancelled = true;
    };
  }, [status, onError]);

  async function setStoryStatus(id, next) {
    setPending(true);
    onError("");
    try {
      await requestAuth(`/api/admin/chat/stories/${id}`, { status: next });
      setStories((list) => list.filter((story) => story.id !== id));
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function setCommentStatus(storyId, commentId, next) {
    setPending(true);
    onError("");
    try {
      await requestAuth(`/api/admin/chat/comments/${commentId}`, { status: next });
      setStories((list) => list.map((story) => (
        story.id === storyId
          ? { ...story, comments: story.comments.map((comment) => (comment.id === commentId ? { ...comment, status: next } : comment)) }
          : story
      )));
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function loadEarlier() {
    const last = stories[stories.length - 1];
    if (!last) return;
    setPending(true);
    try {
      const data = await requestAuth(`/api/admin/chat?status=${status}&before=${encodeURIComponent(last.createdAt)}`);
      setStories((list) => [...list, ...(data.stories || [])]);
      setHasMore(Boolean(data.hasMore));
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  const labels = { pending: text.waiting, allowed: text.allowed, hidden: text.hiddenMark };

  return (
    <div>
      <div className="admin-tabs">
        {FILTERS.map((item) => (
          <button key={item} type="button" aria-pressed={status === item} onClick={() => setStatus(item)}>
            {labels[item]}
          </button>
        ))}
      </div>
      {stories.length === 0 ? <p className="record-empty">{text.empty}</p> : null}
      <div className="chat-list">
        {stories.map((story) => (
          <article className="story-card chat-story" key={story.id}>
            <p className="record-when">
              <span>{text.story}</span>
              <span>{story.authorName}</span>
              <span>{formatWhen(story.createdAt)}</span>
            </p>
            <p className="record-body">{story.body}</p>
            <div className="record-actions">
              {story.status !== "allowed" ? (
                <button type="button" className="button button-accent" disabled={pending} onClick={() => setStoryStatus(story.id, "allowed")}>{text.allow}</button>
              ) : null}
              {story.status !== "hidden" ? (
                <button type="button" className="button button-secondary" disabled={pending} onClick={() => setStoryStatus(story.id, "hidden")}>{text.hide}</button>
              ) : null}
            </div>
            {story.comments?.map((comment) => (
              <div className="chat-comments" key={comment.id}>
                <p className="record-when">
                  <span>{text.comment}</span>
                  <span>{comment.authorName}</span>
                  <span>{labels[comment.status] || comment.status}</span>
                </p>
                <p>{comment.body}</p>
                <div className="record-actions">
                  {comment.status !== "allowed" ? (
                    <button type="button" className="next-link" disabled={pending} onClick={() => setCommentStatus(story.id, comment.id, "allowed")}>{text.allow}</button>
                  ) : null}
                  {comment.status !== "hidden" ? (
                    <button type="button" className="next-link" disabled={pending} onClick={() => setCommentStatus(story.id, comment.id, "hidden")}>{text.hide}</button>
                  ) : null}
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
      {hasMore ? (
        <button type="button" className="button button-secondary" onClick={loadEarlier} disabled={pending}>{text.earlier}</button>
      ) : null}
    </div>
  );
}
