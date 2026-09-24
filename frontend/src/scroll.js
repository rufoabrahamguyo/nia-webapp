export function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

export function leaveSite() {
  window.location.replace("/neutral.html");
}
