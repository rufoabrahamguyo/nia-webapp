const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export default function ButtonIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "pencil" ? (
        <>
          <path {...stroke} d="M4 16.5V20h3.5L18.8 8.7l-3.5-3.5L4 16.5z" />
          <path {...stroke} d="M13.6 6.9l3.5 3.5" />
        </>
      ) : null}
      {name === "back" ? <path {...stroke} d="M15 5l-7 7 7 7M8 12h12" /> : null}
      {name === "pause" ? <path {...stroke} strokeWidth="2.2" d="M8 5v14M16 5v14" /> : null}
      {name === "trash" ? (
        <>
          <path {...stroke} d="M5 8h14" />
          <path {...stroke} d="M9 8V6h6v2" />
          <path {...stroke} d="M7 8l1 11h8l1-11" />
        </>
      ) : null}
      {name === "lock" ? (
        <>
          <rect {...stroke} x="5" y="11" width="14" height="9" rx="1.5" />
          <path {...stroke} d="M8 11V8a4 4 0 0 1 8 0v3" />
        </>
      ) : null}
      {name === "key" ? (
        <>
          <circle {...stroke} cx="8" cy="14" r="3.2" />
          <path {...stroke} d="M11 14h9l-2 2M17 14v2" />
        </>
      ) : null}
      {name === "unlock" ? (
        <>
          <rect {...stroke} x="5" y="11" width="14" height="9" rx="1.5" />
          <path {...stroke} d="M8 11V8a4 4 0 0 1 7.5-2" />
        </>
      ) : null}
      {name === "download" ? (
        <>
          <path {...stroke} d="M12 4v10" />
          <path {...stroke} d="M8 10l4 4 4-4" />
          <path {...stroke} d="M5 19h14" />
        </>
      ) : null}
      {name === "close" ? <path {...stroke} d="M7 7l10 10M17 7L7 17" /> : null}
    </svg>
  );
}
