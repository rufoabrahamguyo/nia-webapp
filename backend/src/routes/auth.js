import { Router } from "express";
import Comment from "../models/Comment.js";
import Reaction from "../models/Reaction.js";
import Record from "../models/Record.js";
import Report from "../models/Report.js";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { avatarId, randomAvatar } from "../avatars.js";
import { generateUsername, normalizeUsername, usernameError } from "../username.js";
import {
  clearAdminSession,
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
      const { avatar: requested, ...rest } = fields;
      const user = await User.create({
        ...rest,
        avatar: avatarId(requested) || randomAvatar(),
        username: nextName,
        usernameKind,
        role: "visitor",
        hasPassword: Boolean(rest.passwordHash),
      });
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
  const result = await createAccount({ email, passwordHash, avatar: req.body?.avatar }, usernameKind, req.body?.username);
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
  if (!user?.passwordHash || !matches || user.role === "admin") {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  if (user.deactivatedAt) {
    await User.updateOne({ _id: user._id }, { $unset: { deactivatedAt: 1 } });
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
  if (byGoogle?.role === "admin") {
    redirectHome(res, { auth_error: "google_failed" });
    return;
  }
  if (byGoogle) {
    if (byGoogle.deactivatedAt) {
      await User.updateOne({ _id: byGoogle._id }, { $unset: { deactivatedAt: 1 } });
    }
    signSession(res, byGoogle._id);
    redirectHome(res);
    return;
  }

  const byEmail = await User.findOne({ email: identity.email });
  if (byEmail?.role === "admin") {
    redirectHome(res, { auth_error: "google_failed" });
    return;
  }
  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== identity.googleId) {
      redirectHome(res, { auth_error: "google_failed" });
      return;
    }
    byEmail.googleId = identity.googleId;
    await byEmail.save();
    if (byEmail.deactivatedAt) {
      await User.updateOne({ _id: byEmail._id }, { $unset: { deactivatedAt: 1 } });
    }
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
    { email: pending.email, googleId: pending.googleId, avatar: req.body?.avatar },
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

router.post("/avatar", async (req, res) => {
  const userId = readUserId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  const avatar = avatarId(req.body?.avatar);
  if (!avatar) {
    sendError(res, 400, "avatar_invalid");
    return;
  }
  const user = await User.findById(userId);
  if (!user || user.role === "admin" || user.deactivatedAt) {
    clearSession(res);
    sendError(res, 401, user?.deactivatedAt ? "account_inactive" : "invalid_credentials");
    return;
  }
  user.avatar = avatar;
  await user.save();
  res.json(publicUser(user));
});

router.post("/username", async (req, res) => {
  const userId = readUserId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return;
  }
  const user = await User.findById(userId);
  if (!user || user.role === "admin" || user.deactivatedAt) {
    clearSession(res);
    sendError(res, 401, user?.deactivatedAt ? "account_inactive" : "invalid_credentials");
    return;
  }

  const usernameKind = req.body?.usernameKind === "chosen" ? "chosen" : "anonymous";
  if (usernameKind === "anonymous") {
    if (user.usernameKind === "anonymous") {
      res.json(publicUser(user));
      return;
    }
    for (let attempt = 0; attempt < 8; attempt += 1) {
      user.username = generateUsername();
      user.usernameKind = "anonymous";
      try {
        await user.save();
        res.json(publicUser(user));
        return;
      } catch (error) {
        if (error?.code !== 11000) throw error;
      }
    }
    sendError(res, 400, "account_unavailable");
    return;
  }

  const username = normalizeUsername(req.body?.username);
  const problem = usernameError(username);
  if (problem) {
    sendError(res, 400, problem);
    return;
  }

  user.username = username;
  user.usernameKind = "chosen";
  try {
    await user.save();
  } catch (error) {
    if (error?.code === 11000) {
      sendError(res, 400, "username_taken");
      return;
    }
    throw error;
  }
  res.json(publicUser(user));
});

async function loadOwner(req, res) {
  const userId = readUserId(req);
  if (!userId) {
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  const user = await User.findById(userId).select("+passwordHash");
  if (!user || user.role === "admin") {
    clearSession(res);
    sendError(res, 401, "invalid_credentials");
    return null;
  }
  if (user.deactivatedAt) {
    clearSession(res);
    sendError(res, 401, "account_inactive");
    return null;
  }
  return user;
}

async function passwordOk(user, password) {
  if (!user.passwordHash) return true;
  const given = String(password || "");
  if (!given) return false;
  return passwordMatches(given, user.passwordHash);
}

async function removeUserContent(userId) {
  const stories = await Story.find({ userId }).select("_id");
  const storyIds = stories.map((story) => story._id);
  const comments = await Comment.find({
    $or: [{ userId }, { storyId: { $in: storyIds } }],
  }).select("_id");
  const commentIds = comments.map((comment) => comment._id);
  await Comment.deleteMany({ $or: [{ userId }, { storyId: { $in: storyIds } }] });
  await Story.deleteMany({ userId });
  const targets = [
    { userId },
    { targetType: "story", targetId: { $in: storyIds } },
    { targetType: "comment", targetId: { $in: commentIds } },
  ];
  await Report.deleteMany({ $or: targets });
  await Reaction.deleteMany({ $or: targets });
  await Record.deleteMany({ userId });
}

router.post("/deactivate", async (req, res) => {
  const user = await loadOwner(req, res);
  if (!user) return;
  if (!(await passwordOk(user, req.body?.password))) {
    sendError(res, 401, "password_wrong");
    return;
  }
  await User.updateOne({ _id: user._id }, { $set: { deactivatedAt: new Date() } });
  clearSession(res);
  res.json({ ok: true });
});

router.post("/delete", async (req, res) => {
  const user = await loadOwner(req, res);
  if (!user) return;
  if (!(await passwordOk(user, req.body?.password))) {
    sendError(res, 401, "password_wrong");
    return;
  }
  await removeUserContent(user._id);
  await User.deleteOne({ _id: user._id });
  clearSession(res);
  res.json({ ok: true });
});

router.post("/logout", (_req, res) => {
  clearSession(res);
  clearAdminSession(res);
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
  if (!user || user.role === "admin" || user.deactivatedAt) {
    clearSession(res);
    sendError(res, 401, user?.deactivatedAt ? "account_inactive" : "invalid_credentials");
    return;
  }
  res.json(publicUser(user));
});

export default router;
