export const CONSENT_VERSION = "1.0";

export function consentIsCurrent(user) {
  return user?.consentVersion === CONSENT_VERSION && Boolean(user.consentSignedAt);
}
