import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE = "nia_session";
const WEEK = 7 * 24 * 60 * 60 * 1000;

export function requireSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }
}

export function publicUser(user) {
  return {
    username: user.username,
    usernameKind: user.usernameKind,
  };
}

export function signSession(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK,
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function readUserId(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.sub || null;
  } catch {
    return null;
  }
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
