const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE = /(?:\d[\s().-]*){10,}/;
const KENYAN = /(?:^|\D)(?:\+?254|0)[17]\d{8}(?!\d)/;

// Insults, slurs, and threats. Words about harassment or asking for help are left out
// so a genuine story is not held for using them.
const BLOCKED = [
  "slut",
  "whore",
  "bitch",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "kuma",
  "malaya",
  "mshenzi",
  "kill yourself",
  "kill you",
  "kys",
];

function blockedPattern(word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i");
}

const BLOCKED_PATTERNS = BLOCKED.map(blockedPattern);

export function holdReasonFor(value) {
  const text = String(value || "");
  const compact = text.replace(/[\s().-]/g, "");
  if (EMAIL.test(text) || PHONE.test(text) || KENYAN.test(compact)) return "contact";
  const lower = text.toLowerCase();
  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(lower))) return "blocked_word";
  return "";
}

export function moderationFields(body) {
  const holdReason = holdReasonFor(body);
  const held = Boolean(holdReason);
  return {
    status: held ? "pending" : "allowed",
    needsReview: held,
    holdReason,
    reportCount: 0,
    reviewedReportCount: 0,
    queueAt: held ? new Date() : undefined,
  };
}
