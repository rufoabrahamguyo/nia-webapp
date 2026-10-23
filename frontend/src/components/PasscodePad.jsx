import { useEffect, useRef, useState } from "react";
import ButtonIcon from "./ButtonIcon.jsx";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

function BackspaceIcon() {
  return (
    <svg className="passcode-backspace" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8.2 5.5h10.3a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5H8.2L3 12l5.2-6.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M11 9.5l5 5M16 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function PasscodePad({
  title,
  hint,
  error,
  attempt,
  pending,
  enteredLabel,
  backspaceLabel,
  cancelLabel,
  onFilled,
  onCancel,
}) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const digitsRef = useRef("");
  const sentRef = useRef(false);

  useEffect(() => {
    if (!error) return undefined;
    digitsRef.current = "";
    sentRef.current = false;
    setDigits("");
    setShake(true);
    const timer = setTimeout(() => setShake(false), 450);
    return () => clearTimeout(timer);
  }, [error, attempt]);

  function push(digit) {
    if (pending || sentRef.current || digitsRef.current.length >= 4) return;
    const next = `${digitsRef.current}${digit}`;
    digitsRef.current = next;
    setDigits(next);
    if (next.length === 4) {
      sentRef.current = true;
      onFilled(next);
    }
  }

  function backspace() {
    if (pending || sentRef.current) return;
    const next = digitsRef.current.slice(0, -1);
    digitsRef.current = next;
    setDigits(next);
  }

  useEffect(() => {
    function onKey(event) {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        push(event.key);
      } else if (event.key === "Backspace") {
        event.preventDefault();
        backspace();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="passcode-pad" role="group" aria-labelledby="passcode-title">
      <h2 id="passcode-title" className="passcode-title">
        {title}
      </h2>
      <p className="passcode-hint">{hint}</p>
      <div className={`passcode-dots${shake ? " is-wrong" : ""}`} aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={index < digits.length ? "passcode-dot is-filled" : "passcode-dot"} />
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {enteredLabel} {digits.length}
      </p>
      {error ? (
        <p className="auth-error passcode-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="passcode-keys">
        {KEYS.map((key) => (
          <button key={key} type="button" className="passcode-key" disabled={pending} onClick={() => push(key)}>
            {key}
          </button>
        ))}
        <span className="passcode-spacer" aria-hidden="true" />
        <button type="button" className="passcode-key" disabled={pending} onClick={() => push("0")}>
          0
        </button>
        <button type="button" className="passcode-key passcode-key-quiet" disabled={pending} aria-label={backspaceLabel} onClick={backspace}>
          <BackspaceIcon />
        </button>
      </div>
      {onCancel ? (
        <button type="button" className="button button-secondary button-icon passcode-cancel" onClick={onCancel} disabled={pending}>
          <ButtonIcon name="close" />
          {cancelLabel}
        </button>
      ) : null}
    </div>
  );
}
