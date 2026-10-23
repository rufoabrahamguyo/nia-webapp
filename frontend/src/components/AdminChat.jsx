import { useEffect, useState } from "react";
import { requestAuth } from "../auth.js";

const FILTERS = ["review", "allowed", "hidden"];

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function reasonFor(item, text) {
  if (item.holdReason === "contact") return text.heldContact;
  if (item.holdReason === "blocked_word") return text.heldWord;
  if (item.holdReason === "reports" || (item.needsReview && item.reportCount > 0)) {
    return `${text.reported}${item.reportCount ? ` (${item.reportCount})` : ""}`;
  }
  if (item.status === "pending") return text.waiting;
  return "";
}

function needsQueue(story) {
  if (story.status === "hidden") return false;
  if (story.status === "pending" || story.needsReview) return true;
  return (story.comments || []).some((comment) => comment.status === "pending" || comment.needsReview);
}

export default function AdminChat({ text, onError }) {
  const [status, setStatus] = useState("review");
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

  function keep(list) {
    if (status === "review") return list.filter(needsQueue);
    if (status === "allowed") return list.filter((story) => story.status === "allowed");
    return list.filter((story) => story.status === "hidden");
  }

  async function setStoryStatus(id, next) {
    setPending(true);
    onError("");
    try {
      const data = await requestAuth(`/api/admin/chat/stories/${id}`, { status: next });
      setStories((list) => keep(list.map((story) => (story.id === id ? { ...story, ...data } : story))));
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
      const data = await requestAuth(`/api/admin/chat/comments/${commentId}`, { status: next });
      setStories((list) => keep(list.map((story) => (
        story.id === storyId
          ? { ...story, comments: story.comments.map((comment) => (comment.id === commentId ? { ...comment, ...data } : comment)) }
          : story
      ))));
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  async function loadEarlier() {
    const last = stories[stories.length - 1];
    if (!last) return;
    const cursor = status === "review" ? last.queueAt || last.createdAt : last.createdAt;
    setPending(true);
    try {
      const data = await requestAuth(`/api/admin/chat?status=${status}&before=${encodeURIComponent(cursor)}`);
      setStories((list) => [...list, ...(data.stories || [])]);
      setHasMore(Boolean(data.hasMore));
    } catch (caught) {
      onError(caught.code || "request_failed");
    } finally {
      setPending(false);
    }
  }

  const labels = { review: text.review, allowed: text.allowed, hidden: text.hiddenMark };

  return (
    <div>
      <div className="admin-tabs">
        {FILTERS.map((item) => (
          <button key={item} type="button" aria-pressed={status === item} onClick={() => setStatus(item)}>
            {labels[item]}
          </button>
        ))}
      </div>
      {stories.length === 0 ? <p className="record-empty">{status === "review" ? text.emptyReview : text.empty}</p> : null}
      <div className="chat-list">
        {stories.map((story) => {
          const storyReason = reasonFor(story, text);
          return (
            <article className="story-card chat-story" key={story.id}>
              <p className="record-when">
                <span>{text.story}</span>
                <span>{story.authorName}</span>
                <span>{formatWhen(story.createdAt)}</span>
              </p>
              {storyReason ? <p className="chat-status">{storyReason}</p> : null}
              <p className="record-body">{story.body}</p>
              <div className="record-actions">
                {story.status !== "allowed" || story.needsReview ? (
                  <button type="button" className="button button-accent" disabled={pending} onClick={() => setStoryStatus(story.id, "allowed")}>{text.allow}</button>
                ) : null}
                {story.status !== "hidden" ? (
                  <button type="button" className="button button-secondary" disabled={pending} onClick={() => setStoryStatus(story.id, "hidden")}>{text.hide}</button>
                ) : null}
              </div>
              {story.comments?.map((comment) => {
                const commentReason = reasonFor(comment, text);
                return (
                  <div className="chat-comments" key={comment.id}>
                    <p className="record-when">
                      <span>{text.comment}</span>
                      <span>{comment.authorName}</span>
                      <span>{formatWhen(comment.createdAt)}</span>
                    </p>
                    {commentReason ? <p className="chat-status">{commentReason}</p> : null}
                    <p>{comment.body}</p>
                    <div className="record-actions">
                      {comment.status !== "allowed" || comment.needsReview ? (
                        <button type="button" className="next-link" disabled={pending} onClick={() => setCommentStatus(story.id, comment.id, "allowed")}>{text.allow}</button>
                      ) : null}
                      {comment.status !== "hidden" ? (
                        <button type="button" className="next-link" disabled={pending} onClick={() => setCommentStatus(story.id, comment.id, "hidden")}>{text.hide}</button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </article>
          );
        })}
      </div>
      {hasMore ? (
        <button type="button" className="button button-secondary" onClick={loadEarlier} disabled={pending}>{text.earlier}</button>
      ) : null}
    </div>
  );
}
