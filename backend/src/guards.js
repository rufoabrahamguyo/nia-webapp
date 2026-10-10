import User from "./models/User.js";
import { clearAdminSession, clearSession, readAdminId, readUserId } from "./auth.js";

function sendError(res, status, error) {
  res.status(status).json({ error });
}

export async function requireVisitor(req, res) {
  const userId = readUserId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  const user = await User.findById(userId).select("_id role username");
  if (!user || user.role === "admin") {
    clearSession(res);
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  return user;
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
