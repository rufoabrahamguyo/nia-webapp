import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const STATE_COOKIE = "nia_google_state";
const PENDING_COOKIE = "nia_google_pending";
const TEN_MINUTES = 10 * 60 * 1000;

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function frontendOrigin() {
  return (process.env.FRONTEND_ORIGIN || "http://localhost:5173").replace(/\/$/, "");
}

export function redirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `${frontendOrigin()}/api/auth/google/callback`;
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function client() {
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, redirectUri());
}

export function beginGoogle(res) {
  const state = crypto.randomBytes(32).toString("hex");
  const token = jwt.sign({ purpose: "google-state", state }, process.env.JWT_SECRET, { expiresIn: "10m" });
  res.cookie(STATE_COOKIE, token, cookieOptions(TEN_MINUTES));
  return client().generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email"],
    state,
    prompt: "select_account",
  });
}

export function readGoogleState(req) {
  const token = req.cookies?.[STATE_COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== "google-state") return null;
    return payload.state || null;
  } catch {
    return null;
  }
}

export function clearGoogleState(res) {
  res.clearCookie(STATE_COOKIE, cookieOptions(0));
}

export async function verifyGoogleCode(code) {
  const google = client();
  const { tokens } = await google.getToken(code);
  if (!tokens.id_token) return null;
  const ticket = await google.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = String(payload?.email || "").trim().toLowerCase();
  const googleId = String(payload?.sub || "");
  if (!email || !googleId || payload.email_verified !== true) return null;
  return { email, googleId };
}

export function saveGooglePending(res, pending) {
  const token = jwt.sign({ purpose: "google-pending", ...pending }, process.env.JWT_SECRET, { expiresIn: "10m" });
  res.cookie(PENDING_COOKIE, token, cookieOptions(TEN_MINUTES));
}

export function readGooglePending(req) {
  const token = req.cookies?.[PENDING_COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== "google-pending" || !payload.email || !payload.googleId) return null;
    return { email: payload.email, googleId: payload.googleId };
  } catch {
    return null;
  }
}

export function clearGooglePending(res) {
  res.clearCookie(PENDING_COOKIE, cookieOptions(0));
}
