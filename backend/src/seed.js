import { hashPassword } from "./auth.js";
import { generateUsername } from "./username.js";
import Helpline from "./models/Helpline.js";
import User from "./models/User.js";

const DIRECTORY = [
  {
    group: "now",
    sort: 10,
    name: { en: "Police", sw: "Polisi" },
    who: { en: "Emergency", sw: "Dharura" },
    hours: { en: "24 hours", sw: "Saa 24" },
    free: true,
    numbers: ["999", "112"],
  },
  {
    group: "now",
    sort: 20,
    name: { en: "GBV helpline", sw: "Simu ya GBV" },
    who: { en: "National line", sw: "Nambari ya kitaifa" },
    hours: { en: "24 hours", sw: "Saa 24" },
    free: true,
    numbers: ["1195"],
  },
  {
    group: "now",
    sort: 30,
    name: { en: "Counselling", sw: "Ushauri" },
    who: { en: "one2one hotline", sw: "Simu ya one2one" },
    hours: { en: "Check with one2one", sw: "Uliza one2one" },
    free: true,
    numbers: ["1190"],
    siteLabel: "one2onekenya.org",
    siteHref: "https://one2onekenya.org",
  },
  {
    group: "now",
    sort: 40,
    name: { en: "Child Helpline", sw: "Simu ya watoto" },
    who: { en: "Under 18", sw: "Chini ya miaka 18" },
    hours: { en: "24 hours", sw: "Saa 24" },
    free: true,
    numbers: ["116"],
    whatsapp: "https://wa.me/254722116116",
    siteLabel: "childlinekenya.co.ke",
    siteHref: "https://childlinekenya.co.ke",
  },
  {
    group: "now",
    sort: 50,
    name: { en: "UNHCR", sw: "UNHCR" },
    who: { en: "Help line", sw: "Simu ya msaada" },
    hours: { en: "Check the UNHCR page", sw: "Angalia ukurasa wa UNHCR" },
    free: true,
    numbers: ["1517"],
    siteLabel: "help.unhcr.org/kenya",
    siteHref: "https://help.unhcr.org/kenya/",
  },
  {
    group: "org",
    sort: 60,
    name: { en: "COVAW", sw: "COVAW" },
    who: { en: "Women", sw: "Wanawake" },
    hours: { en: "24 hours", sw: "Saa 24" },
    free: true,
    numbers: ["0800 720 553"],
    sms: "0722 594 794",
    whatsapp: "https://wa.me/254722594794",
    siteLabel: "covaw.or.ke",
    siteHref: "https://covaw.or.ke",
  },
  {
    group: "org",
    sort: 70,
    name: { en: "AMANI Counselling", sw: "AMANI Counselling" },
    who: { en: "Telecounselling", sw: "Ushauri kwa simu" },
    hours: { en: "Check with AMANI", sw: "Uliza AMANI" },
    free: true,
    numbers: ["0800 720 600"],
  },
  {
    group: "org",
    sort: 80,
    name: { en: "LVCT", sw: "LVCT" },
    who: { en: "Counselling", sw: "Ushauri" },
    hours: { en: "Check with LVCT", sw: "Uliza LVCT" },
    free: true,
    numbers: ["0800 720 121"],
  },
  {
    group: "org",
    sort: 90,
    name: { en: "MSF", sw: "MSF" },
    who: { en: "Medical hotline", sw: "Simu ya matibabu" },
    hours: { en: "Check with MSF", sw: "Uliza MSF" },
    free: false,
    numbers: ["0711 400 506"],
  },
  {
    group: "org",
    sort: 100,
    name: { en: "HIAS", sw: "HIAS" },
    who: { en: "Support for survivors", sw: "Msaada kwa walionusurika" },
    hours: { en: "Check with HIAS", sw: "Uliza HIAS" },
    free: false,
    numbers: ["0770 451 236", "0777 784 009"],
  },
  {
    group: "org",
    sort: 110,
    name: { en: "NCCK", sw: "NCCK" },
    who: { en: "Health coordination", sw: "Uratibu wa afya" },
    hours: { en: "Check with NCCK", sw: "Uliza NCCK" },
    free: false,
    numbers: ["0704 873 342"],
  },
  {
    group: "org",
    sort: 120,
    name: { en: "Center for Victims of Torture", sw: "Center for Victims of Torture" },
    who: { en: "Psychosocial support", sw: "Msaada wa kisaikolojia" },
    hours: { en: "Check with the centre", sw: "Uliza kituo" },
    free: false,
    numbers: ["0790 781 359"],
  },
  {
    group: "org",
    sort: 130,
    name: { en: "Befrienders Kenya", sw: "Befrienders Kenya" },
    who: { en: "If you are thinking about suicide", sw: "Ukiwa na mawazo ya kujiua" },
    hours: { en: "Check with Befrienders", sw: "Uliza Befrienders" },
    free: false,
    numbers: ["0722 178 177"],
    whatsapp: "https://wa.me/254722178177",
  },
];

export async function seedHelplines() {
  await Helpline.updateMany(
    { "name.en": "Utumishi" },
    { $set: { "name.en": "Police", "name.sw": "Polisi" } },
  );
  const count = await Helpline.estimatedDocumentCount();
  if (count > 0) return;
  const lastChecked = new Date();
  await Helpline.insertMany(DIRECTORY.map((entry) => ({ ...entry, lastChecked, hidden: false })));
}

export async function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  if (!email || password.length < 8) {
    console.log("Admin account not seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD.");
    return;
  }

  const existing = await User.findOne({ email }).select("+passwordHash");
  const passwordHash = await hashPassword(password);
  if (!existing) {
    let username = "nia-admin";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await User.create({
          email,
          passwordHash,
          username,
          usernameKind: "chosen",
          role: "admin",
        });
        return;
      } catch (error) {
        if (error?.code !== 11000) throw error;
        if (error.keyPattern?.email) return;
        username = generateUsername();
      }
    }
    return;
  }

  if (existing.role !== "admin") {
    console.log("ADMIN_EMAIL belongs to a visitor account. The administrator was not created.");
    return;
  }

  existing.passwordHash = passwordHash;
  await existing.save();
}
