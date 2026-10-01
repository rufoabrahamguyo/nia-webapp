const adjectives = ["quiet", "calm", "steady", "gentle", "clear", "kind", "soft", "brave", "still", "warm"];
const nouns = ["river", "cedar", "harbor", "meadow", "pebble", "olive", "willow", "dawn", "stone", "light"];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function generateUsername() {
  const suffix = 100 + Math.floor(Math.random() * 900);
  return `${pick(adjectives)}-${pick(nouns)}-${suffix}`;
}

export function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

export function usernameError(value) {
  if (!value) return "username_required";
  if (value.length < 3 || value.length > 20) return "username_invalid";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return "username_invalid";
  if (value.includes("@") || /^\d+$/.test(value) || /\d{8,}/.test(value)) return "username_invalid";
  return null;
}
