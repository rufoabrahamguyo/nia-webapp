const PHRASES = [
  "kill myself",
  "killing myself",
  "want to die",
  "wanted to die",
  "wanting to die",
  "wanna die",
  "end my life",
  "ending my life",
  "suicidal",
  "suicide",
  "don't want to live",
  "do not want to live",
  "dont want to live",
  "kms",
  "kujiua",
  "najiua",
  "nataka kufa",
  "sitaki kuishi",
];

const NEGATED_BEFORE =
  /(?:^|[^a-z])(?:do not|don't|dont|did not|didn't|didnt|never|not|sitaki|siku|siwezi|si)\s+(?:\S+\s+){0,3}$/i;

function patternFor(phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}(?=[^a-z]|$)`, "gi");
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'");
}

export function mentionsCrisis(value) {
  const text = normalize(value);
  return PHRASES.some((phrase) => {
    const pattern = patternFor(phrase);
    let match = pattern.exec(text);
    while (match) {
      const index = match.index + match[1].length;
      const before = text.slice(Math.max(0, index - 48), index);
      if (!NEGATED_BEFORE.test(before)) return true;
      match = pattern.exec(text);
    }
    return false;
  });
}
