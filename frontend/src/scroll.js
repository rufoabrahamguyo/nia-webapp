export function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

const ORDINARY_SITES = [
  "https://www.google.com/",
  "https://www.wikipedia.org/",
  "https://www.bbc.com/weather",
  "https://www.youtube.com/",
];

export function leaveSite() {
  const logout = fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    keepalive: true,
  }).catch(() => {});

  const wait = new Promise((resolve) => {
    setTimeout(resolve, 700);
  });
  const destination = ORDINARY_SITES[Math.floor(Math.random() * ORDINARY_SITES.length)];

  Promise.race([logout, wait]).then(() => {
    window.location.replace(destination);
  });
}
