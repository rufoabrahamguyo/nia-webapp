import User from "./models/User.js";
import { clearAdminSession, clearSession, clearSupportSession, readAdminId, readSupportId, readUserId } from "./auth.js";
import { consentIsCurrent } from "./consent.js";

function sendError(res, status, error) {
  res.status(status).json({ error });
}

export async function requireVisitor(req, res) {
  const userId = readUserId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  const user = await User.findById(userId).select("_id role username avatar deactivatedAt consentVersion consentSignedAt");
  if (!user || user.role !== "visitor" || user.deactivatedAt) {
    clearSession(res);
    sendError(res, 401, user?.deactivatedAt ? "account_inactive" : "invalid_credentials");
    return null;
  }
  return user;
}

export function requireConsent(res, user) {
  if (consentIsCurrent(user)) return true;
  sendError(res, 403, "consent_required");
  return false;
}

export async function requireAdmin(req, res) {
  const userId = readAdminId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  const user = await User.findById(userId).select("_id role email username");
  if (!user || user.role !== "admin") {
    clearAdminSession(res);
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  return user;
}

export async function requireSupport(req, res) {
  const userId = readSupportId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  const user = await User.findById(userId).select("_id role email username");
  if (!user || user.role !== "support") {
    clearSupportSession(res);
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  return user;
}
