export function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

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

  Promise.race([logout, wait]).then(() => {
    window.location.replace("/neutral.html");
  });
}
