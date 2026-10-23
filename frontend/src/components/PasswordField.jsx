import { useId, useState } from "react";

function EyeIcon() {
  return (
    <svg className="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.2 12S5.8 6.2 12 6.2 21.8 12 21.8 12 18.2 17.8 12 17.8 2.2 12 2.2 12z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="password-eye-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.2 8.4C4.8 10.6 7.8 13.2 12 13.2c1.2 0 2.3-.2 3.3-.6M9.2 6.5A9 9 0 0 1 12 6.2c6.2 0 9.8 5.8 9.8 5.8a16 16 0 0 1-3.1 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M4 5.2l16 13.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function PasswordField({
  label,
  name,
  autoComplete,
  value,
  placeholder,
  onChange,
  showLabel,
  hideLabel,
  minLength,
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          autoCapitalize="off"
          spellCheck="false"
          required
          minLength={minLength}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
        <button
          type="button"
          className="password-eye"
          aria-pressed={visible}
          aria-label={visible ? hideLabel : showLabel}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
