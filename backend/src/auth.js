import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE = "nia_session";
const ADMIN_COOKIE = "nia_admin";
const WEEK = 7 * 24 * 60 * 60 * 1000;
const ADMIN_SESSION = 12 * 60 * 60 * 1000;

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function cookieOptions(maxAge) {
  return { ...cookieBase(), maxAge };
}

function readToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}

export function requireSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
}

export function publicUser(user) {
  return {
    username: user.username,
    usernameKind: user.usernameKind,
    email: user.email,
  };
}

export function signSession(res, userId) {
  const token = jwt.sign({ sub: String(userId), kind: "visitor" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE, token, cookieOptions(WEEK));
}

export function clearSession(res) {
  res.clearCookie(COOKIE, cookieBase());
}

export function readUserId(req) {
  const payload = readToken(req.cookies?.[COOKIE]);
  if (!payload || payload.kind === "admin") return null;
  return payload.sub || null;
}

export function signAdminSession(res, userId) {
  const token = jwt.sign({ sub: String(userId), kind: "admin" }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.cookie(ADMIN_COOKIE, token, cookieOptions(ADMIN_SESSION));
}

export function clearAdminSession(res) {
  res.clearCookie(ADMIN_COOKIE, cookieBase());
}

export function readAdminId(req) {
  const payload = readToken(req.cookies?.[ADMIN_COOKIE]);
  if (!payload || payload.kind !== "admin") return null;
  return payload.sub || null;
}

const dummyHash = bcrypt.hashSync("nia-unused-password", 12);

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function unusedPasswordHash() {
  return dummyHash;
}

export async function passwordMatches(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
