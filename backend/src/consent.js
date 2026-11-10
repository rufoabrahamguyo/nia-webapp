export const CONSENT_VERSION = "2";

const PREFIX = "data:image/png;base64,";

export function readSignature(value) {
  const signature = String(value || "").trim();
  if (!signature.startsWith(PREFIX)) return null;
  const body = signature.slice(PREFIX.length);
  if (body.length < 80 || body.length > 120000) return null;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(body)) return null;
  return signature;
}

export function consentIsCurrent(user) {
  return user?.consentVersion === CONSENT_VERSION && Boolean(user.consentSignedAt);
}
