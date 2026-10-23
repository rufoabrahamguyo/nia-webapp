import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../src/db.js";
import User from "../src/models/User.js";

const TARGET = 50;

const PEOPLE = [
  ["Wanjiku", "Kamau"],
  ["Achieng", "Otieno"],
  ["Brian", "Kipchoge"],
  ["Fatuma", "Hassan"],
  ["Mwangi", "Njoroge"],
  ["Akinyi", "Omondi"],
  ["Cherono", "Kiptoo"],
  ["Njeri", "Waweru"],
  ["Baraka", "Mwangi"],
  ["Halima", "Abdi"],
  ["Kamau", "Gitau"],
  ["Atieno", "Odhiambo"],
  ["Chebet", "Ruto"],
  ["Muthoni", "Kariuki"],
  ["Yusuf", "Mohamed"],
  ["Nyambura", "Maina"],
  ["Ochieng", "Owino"],
  ["Jepkemoi", "Langat"],
  ["Amina", "Bakari"],
  ["Kimani", "Ndungu"],
  ["Adhiambo", "Owuor"],
  ["Kiptoo", "Cheruiyot"],
  ["Wangari", "Mugo"],
  ["Zainab", "Omar"],
  ["Mutiso", "Musyoka"],
  ["Awino", "Okello"],
  ["Chepngetich", "Kosgei"],
  ["Wairimu", "Githinji"],
  ["Hassan", "Ali"],
  ["Nyokabi", "Karanja"],
  ["Onyango", "Juma"],
  ["Jerop", "Tanui"],
  ["Neema", "Juma"],
  ["Kariuki", "Macharia"],
  ["Awuor", "Were"],
  ["Kiprono", "Bett"],
  ["Wambui", "Ngugi"],
  ["Salma", "Noor"],
  ["Mutua", "Nzioka"],
  ["Anyango", "Opiyo"],
  ["Chelimo", "Kiplagat"],
  ["Njoki", "Irungu"],
  ["Abdullahi", "Farah"],
  ["Wanjiru", "Mwangi"],
  ["Odongo", "Auma"],
  ["Jelagat", "Sang"],
  ["Rehema", "Said"],
  ["Githinji", "Warui"],
  ["Akoth", "Onyango"],
  ["Koech", "Cherono"],
];

const ADJECTIVES = ["quiet", "calm", "steady", "gentle", "clear", "kind", "soft", "brave", "still", "warm"];
const NOUNS = ["river", "cedar", "harbor", "meadow", "pebble", "olive", "willow", "dawn", "stone", "light"];
const DOMAINS = ["gmail.com", "gmail.com", "gmail.com", "yahoo.com", "outlook.com"];

function emailFor(first, last, index) {
  const local = `${first}.${last}`.toLowerCase();
  return `${local}@${DOMAINS[index % DOMAINS.length]}`;
}

function usernameFor(index) {
  const adjective = ADJECTIVES[index % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(index / ADJECTIVES.length) % NOUNS.length];
  return `${adjective}-${noun}-${410 + index}`;
}

function createdAtFor(index, total) {
  const start = Date.UTC(2026, 5, 3, 8, 0, 0);
  const end = Date.UTC(2026, 9, 10, 16, 0, 0);
  const span = end - start;
  const when = new Date(start + Math.floor((index / Math.max(total - 1, 1)) * span));
  when.setUTCHours(7 + ((index * 3) % 13), (index * 17) % 60, (index * 11) % 60, 0);
  return when;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

await connectDb(uri);

const existing = await User.countDocuments();
const needed = Math.max(0, TARGET - existing);

if (needed === 0) {
  console.log(`Users table already has ${existing} accounts. Nothing added.`);
  await mongoose.disconnect();
  process.exit(0);
}

const takenEmails = new Set((await User.find().select("email")).map((user) => user.email));
const takenNames = new Set((await User.find().select("username")).map((user) => user.username));
const docs = [];

for (let index = 0; index < PEOPLE.length && docs.length < needed; index += 1) {
  const [first, last] = PEOPLE[index];
  const email = emailFor(first, last, index);
  const username = usernameFor(index);
  if (takenEmails.has(email) || takenNames.has(username)) continue;
  docs.push({
    email,
    username,
    usernameKind: "anonymous",
    role: "visitor",
    createdAt: createdAtFor(index, needed),
  });
}

for (const doc of docs) {
  doc.passwordHash = await bcrypt.hash("NiaVisit50", 12);
}

await User.insertMany(docs);
const total = await User.countDocuments();
const visitors = await User.countDocuments({ role: "visitor" });
console.log(`Added ${docs.length} visitor accounts. Users table now has ${total} rows (${visitors} visitors).`);

await mongoose.disconnect();
