const FACES = {
  cat: (
    <>
      <circle cx="32" cy="32" r="32" fill="#f6d7b0" />
      <path d="M14 30 20 12l10 16z" fill="#e7b48a" />
      <path d="M50 30 44 12 34 28z" fill="#e7b48a" />
      <path d="M17 27 22 16l6 11z" fill="#f0c014" />
      <path d="M47 27 42 16l-6 11z" fill="#f0c014" />
      <circle cx="24" cy="34" r="3.2" fill="#1b2a4a" />
      <circle cx="40" cy="34" r="3.2" fill="#1b2a4a" />
      <path d="M32 39 28.5 45h7z" fill="#c46a6a" />
    </>
  ),
  dog: (
    <>
      <circle cx="32" cy="32" r="32" fill="#f3c98b" />
      <ellipse cx="14" cy="36" rx="8" ry="12" fill="#c4844a" />
      <ellipse cx="50" cy="36" rx="8" ry="12" fill="#c4844a" />
      <circle cx="32" cy="34" r="16" fill="#f3c98b" />
      <ellipse cx="32" cy="42" rx="8" ry="6" fill="#fff6e8" />
      <circle cx="25" cy="32" r="2.8" fill="#1b2a4a" />
      <circle cx="39" cy="32" r="2.8" fill="#1b2a4a" />
      <ellipse cx="32" cy="39" rx="3" ry="2.2" fill="#1b2a4a" />
    </>
  ),
  fox: (
    <>
      <circle cx="32" cy="32" r="32" fill="#e07a3d" />
      <path d="M14 32 21 12l10 16z" fill="#c45a28" />
      <path d="M50 32 43 12 33 28z" fill="#c45a28" />
      <ellipse cx="32" cy="42" rx="11" ry="8" fill="#fff6e8" />
      <circle cx="24" cy="32" r="3" fill="#1b2a4a" />
      <circle cx="40" cy="32" r="3" fill="#1b2a4a" />
      <ellipse cx="32" cy="39" rx="2.4" ry="1.8" fill="#1b2a4a" />
    </>
  ),
  bear: (
    <>
      <circle cx="32" cy="32" r="32" fill="#8d5a3c" />
      <circle cx="16" cy="18" r="8" fill="#6e432c" />
      <circle cx="48" cy="18" r="8" fill="#6e432c" />
      <circle cx="32" cy="36" r="16" fill="#a56b48" />
      <ellipse cx="32" cy="42" rx="8" ry="6" fill="#f0d2b4" />
      <circle cx="26" cy="33" r="2.6" fill="#1b2a4a" />
      <circle cx="38" cy="33" r="2.6" fill="#1b2a4a" />
      <ellipse cx="32" cy="40" rx="2.8" ry="2" fill="#1b2a4a" />
    </>
  ),
  panda: (
    <>
      <circle cx="32" cy="32" r="32" fill="#f7f4ef" />
      <circle cx="16" cy="18" r="8" fill="#1b2a4a" />
      <circle cx="48" cy="18" r="8" fill="#1b2a4a" />
      <ellipse cx="23" cy="34" rx="7" ry="8" fill="#1b2a4a" />
      <ellipse cx="41" cy="34" rx="7" ry="8" fill="#1b2a4a" />
      <circle cx="24" cy="34" r="2.4" fill="#fff" />
      <circle cx="42" cy="34" r="2.4" fill="#fff" />
      <circle cx="24.4" cy="34.2" r="1.2" fill="#1b2a4a" />
      <circle cx="42.4" cy="34.2" r="1.2" fill="#1b2a4a" />
      <ellipse cx="32" cy="44" rx="3" ry="2" fill="#1b2a4a" />
    </>
  ),
  owl: (
    <>
      <circle cx="32" cy="32" r="32" fill="#0e4d45" />
      <circle cx="22" cy="32" r="10" fill="#f7f4ef" />
      <circle cx="42" cy="32" r="10" fill="#f7f4ef" />
      <circle cx="22" cy="32" r="4" fill="#f0c014" />
      <circle cx="42" cy="32" r="4" fill="#f0c014" />
      <circle cx="22" cy="32" r="2" fill="#1b2a4a" />
      <circle cx="42" cy="32" r="2" fill="#1b2a4a" />
      <path d="M32 38 28 44h8z" fill="#f0c014" />
    </>
  ),
  rabbit: (
    <>
      <circle cx="32" cy="32" r="32" fill="#f4efe6" />
      <ellipse cx="24" cy="20" rx="5" ry="11" fill="#f7f4ef" />
      <ellipse cx="40" cy="20" rx="5" ry="11" fill="#f7f4ef" />
      <ellipse cx="24" cy="20" rx="2.4" ry="7" fill="#f0b6c2" />
      <ellipse cx="40" cy="20" rx="2.4" ry="7" fill="#f0b6c2" />
      <circle cx="32" cy="38" r="14" fill="#f7f4ef" />
      <circle cx="27" cy="36" r="2.2" fill="#1b2a4a" />
      <circle cx="37" cy="36" r="2.2" fill="#1b2a4a" />
      <path d="M32 40 29.4 44h5.2z" fill="#f0b6c2" />
    </>
  ),
  lion: (
    <>
      <circle cx="32" cy="32" r="32" fill="#f0c014" />
      <circle cx="32" cy="34" r="15" fill="#f3c98b" />
      <circle cx="26" cy="32" r="2.4" fill="#1b2a4a" />
      <circle cx="38" cy="32" r="2.4" fill="#1b2a4a" />
      <ellipse cx="32" cy="38" rx="3" ry="2.2" fill="#c4844a" />
    </>
  ),
};

export const AVATAR_IDS = ["cat", "dog", "fox", "bear", "panda", "owl", "rabbit", "lion"];

export function AnimalFace({ id }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      {FACES[id] || FACES.cat}
    </svg>
  );
}

export function AvatarPicker({ legend, labels, value, onChange }) {
  return (
    <fieldset className="avatar-picker">
      <legend>{legend}</legend>
      <div className="avatar-grid">
        {AVATAR_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className="avatar-option"
            aria-pressed={value === id}
            aria-label={labels[id]}
            onClick={() => onChange(id)}
          >
            <AnimalFace id={id} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}
