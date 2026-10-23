export const AVATAR_IDS = ["cat", "dog", "fox", "bear", "panda", "owl", "rabbit", "lion"];

export function avatarId(value) {
  return AVATAR_IDS.includes(value) ? value : "";
}

export function randomAvatar() {
  return AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)];
}

export function avatarForKey(value) {
  const text = String(value || "");
  let sum = 0;
  for (let index = 0; index < text.length; index += 1) sum += text.charCodeAt(index);
  return AVATAR_IDS[sum % AVATAR_IDS.length];
}
