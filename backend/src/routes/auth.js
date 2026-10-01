import { Router } from "express";
import User from "../models/User.js";
import { generateUsername, normalizeUsername, usernameError } from "../username.js";
import {
  clearSession,
  hashPassword,
  passwordMatches,
  publicUser,
  readUserId,
  signSession,
  unusedPasswordHash,
} from "../auth.js";
import {
  beginGoogle,
  clearGooglePending,
  clearGoogleState,
  frontendOrigin,
  googleConfigured,
  readGooglePending,
  readGoogleState,
  saveGooglePending,
  verifyGoogleCode,
} from "../google.js";

const router = Router();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendError(res, status, error) {
  res.status(status).json({ error });
}

function redirectHome(res, query) {
  const target = new URL(frontendOrigin());
  if (query) {
    for (const [key, value] of Object.entries(query)) target.searchParams.set(key, value);
  }
  res.redirect(target.toString());
}

async function createAccount(fields, usernameKind, chosenName) {
  let username = null;
  if (usernameKind === "chosen") {
    username = normalizeUsername(chosenName);
    const problem = usernameError(username);
    if (problem) return { error: problem };
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const nextName = usernameKind === "anonymous" ? generateUsername() : username;
    try {
      const user = await User.create({ ...fields, username: nextName, usernameKind });
      return { user };
    } catch (error) {
      if (error?.code !== 11000) throw error;
      if (error.keyPattern?.email || error.keyPattern?.googleId) return { error: "account_unavailable" };
      if (usernameKind === "chosen") return { error: "username_taken" };
    }
  }

  return { error: "account_unavailable" };
}

router.post("/signup", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const usernameKind = req.body?.usernameKind === "chosen" ? "chosen" : "anonymous";

  if (!EMAIL.test(email) || email.length > 254) {
    sendError(res, 400, "invalid_email");
    return;
  }
  if (password.length < 8 || password.length > 128) {
    sendError(res, 400, "password_short");
    return;
  }

  const passwordHash = await hashPassword(password);
  const result = await createAccount({ email, passwordHash }, usernameKind, req.body?.username);
  if (result.error) {
    sendError(res, 400, result.error);
    return;
  }
  signSession(res, result.user._id);
  res.status(201).json(publicUser(result.user));
});

router.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const user = await User.findOne({ email }).select("+passwordHash");
  const matches = await passwordMatches(password, user?.passwordHash || unusedPasswordHash());
  if (!user?.passwordHash || !matches) {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  signSession(res, user._id);
  res.json(publicUser(user));
});

router.get("/google", (req, res) => {
  if (!googleConfigured()) {
    redirectHome(res, { auth_error: "google_unavailable" });
    return;
  }
  res.redirect(beginGoogle(res));
});

router.get("/google/callback", async (req, res) => {
  const returnedState = String(req.query.state || "");
  const expectedState = readGoogleState(req);
  clearGoogleState(res);

  if (req.query.error || !req.query.code || !expectedState || returnedState !== expectedState) {
    redirectHome(res, { auth_error: req.query.error === "access_denied" ? "google_denied" : "google_failed" });
    return;
  }

  let identity;
  try {
    identity = await verifyGoogleCode(String(req.query.code));
  } catch {
    redirectHome(res, { auth_error: "google_failed" });
    return;
  }
  if (!identity) {
    redirectHome(res, { auth_error: "google_unverified" });
    return;
  }

  const byGoogle = await User.findOne({ googleId: identity.googleId });
  if (byGoogle) {
    signSession(res, byGoogle._id);
    redirectHome(res);
    return;
  }

  const byEmail = await User.findOne({ email: identity.email });
  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== identity.googleId) {
      redirectHome(res, { auth_error: "google_failed" });
      return;
    }
    byEmail.googleId = identity.googleId;
    await byEmail.save();
    signSession(res, byEmail._id);
    redirectHome(res);
    return;
  }

  saveGooglePending(res, identity);
  redirectHome(res, { google: "finish" });
});

router.post("/google/complete", async (req, res) => {
  const pending = readGooglePending(req);
  if (!pending) {
    sendError(res, 401, "google_expired");
    return;
  }

  const usernameKind = req.body?.usernameKind === "chosen" ? "chosen" : "anonymous";
  const result = await createAccount(
    { email: pending.email, googleId: pending.googleId },
    usernameKind,
    req.body?.username,
  );
  if (result.error) {
    sendError(res, 400, result.error);
    return;
  }

  clearGooglePending(res);
  signSession(res, result.user._id);
  res.status(201).json(publicUser(result.user));
});

router.post("/logout", (_req, res) => {
  clearSession(res);
  clearGooglePending(res);
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const userId = readUserId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  const user = await User.findById(userId);
  if (!user) {
    clearSession(res);
    sendError(res, 401, "invalid_credentials");
    return;
  }
  res.json(publicUser(user));
});

export default router;
