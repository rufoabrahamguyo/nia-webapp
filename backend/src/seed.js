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
    sms: "022 116 116",
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
    numbers: ["0711 400 506", "0800 721 100"],
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
  {
    group: "now",
    sort: 54,
    name: { en: "GBV helpline, men", sw: "Simu ya GBV, wanaume" },
    who: { en: "Toll-free", sw: "Simu ya bure" },
    hours: { en: "24 hours", sw: "Saa 24" },
    free: true,
    numbers: ["1196"],
  },
  {
    group: "now",
    sort: 58,
    name: { en: "Kenya Red Cross", sw: "Kenya Red Cross" },
    who: { en: "Toll-free", sw: "Simu ya bure" },
    hours: { en: "24 hours", sw: "Saa 24" },
    free: true,
    numbers: ["1199"],
  },
  {
    group: "org",
    sort: 140,
    name: { en: "Mater Hospital", sw: "Mater Hospital" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0726 856 853", "0735 108 402"],
  },
  {
    group: "org",
    sort: 150,
    name: { en: "LOCO Hospital (Railways)", sw: "LOCO Hospital (Railways)" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0726 856 853"],
  },
  {
    group: "org",
    sort: 160,
    name: { en: "Casino Center (Nairobi)", sw: "Casino Center (Nairobi)" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    hours: { en: "Check with the centre", sw: "Uliza kituo" },
    free: false,
    numbers: ["0726 856 853"],
  },
  {
    group: "org",
    sort: 170,
    name: { en: "Ngara Hospital (Park Road)", sw: "Ngara Hospital (Park Road)" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0726 856 853"],
  },
  {
    group: "org",
    sort: 180,
    name: { en: "Kangemi Hospital", sw: "Kangemi Hospital" },
    who: { en: "Testing services · ISHTAR MSM", sw: "Huduma za upimaji · ISHTAR MSM" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0726 856 853"],
  },
  {
    group: "org",
    sort: 190,
    name: { en: "Gender Affirming Care", sw: "Huduma ya uthibitisho wa jinsia" },
    who: { en: "ISHTAR MSM", sw: "ISHTAR MSM" },
    hours: { en: "Check with the service", sw: "Uliza huduma" },
    free: false,
    numbers: ["0726 856 853"],
  },
  {
    group: "org",
    sort: 200,
    name: { en: "GVRC Nairobi", sw: "GVRC Nairobi" },
    who: { en: "NGLHRC", sw: "NGLHRC" },
    hours: { en: "Check with the centre", sw: "Uliza kituo" },
    free: false,
    numbers: ["0709 667 130", "+254 110 922 255"],
  },
  {
    group: "org",
    sort: 210,
    name: { en: "Trailer Park, Busia", sw: "Trailer Park, Busia" },
    who: { en: "OUTSTAR", sw: "OUTSTAR" },
    hours: { en: "Check with the service", sw: "Uliza huduma" },
    free: false,
    numbers: ["+254 700 251 672"],
  },
  {
    group: "org",
    sort: 220,
    name: { en: "Mathare Hospital", sw: "Mathare Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0768 971 143", "0780 503 231"],
  },
  {
    group: "org",
    sort: 230,
    name: { en: "Ngara Methadone Clinic", sw: "Ngara Methadone Clinic" },
    who: { en: "Methadone clinic", sw: "Kliniki ya methadone" },
    hours: { en: "Check with the clinic", sw: "Uliza kliniki" },
    free: false,
    numbers: ["0780 505 694"],
  },
  {
    group: "org",
    sort: 240,
    name: { en: "Karuri Health", sw: "Karuri Health" },
    who: { en: "Health centre", sw: "Kituo cha afya" },
    hours: { en: "Check with the centre", sw: "Uliza kituo" },
    free: false,
    numbers: ["0793 268 681"],
  },
  {
    group: "org",
    sort: 250,
    name: { en: "Mama Lucy Kibaki Hospital", sw: "Mama Lucy Kibaki Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0732 985 031"],
  },
  {
    group: "org",
    sort: 260,
    name: { en: "Mbagathi Sub County Hospital", sw: "Mbagathi Sub County Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0721 311 808"],
  },
  {
    group: "org",
    sort: 270,
    name: { en: "Coptic Hospital", sw: "Coptic Hospital" },
    who: { en: "Hospital", sw: "Hospitali" },
    hours: { en: "Check with the hospital", sw: "Uliza hospitali" },
    free: false,
    numbers: ["0735 777 058"],
  },
  {
    group: "org",
    sort: 280,
    name: { en: "Gender Violence Recovery Center", sw: "Gender Violence Recovery Center" },
    who: { en: "Recovery centre", sw: "Kituo cha nafuu" },
    hours: { en: "Check with the centre", sw: "Uliza kituo" },
    free: false,
    numbers: ["0719 638 006"],
  },
  {
    group: "org",
    sort: 290,
    name: { en: "Jinsiangu", sw: "Jinsiangu" },
    who: { en: "Toll-free helpline", sw: "Simu ya bure" },
    hours: { en: "Check with Jinsiangu", sw: "Uliza Jinsiangu" },
    free: true,
    numbers: ["0800 720 955"],
  },
  {
    group: "org",
    sort: 300,
    name: { en: "CREAW", sw: "CREAW" },
    who: { en: "Rights education", sw: "Elimu ya haki" },
    hours: { en: "Check with CREAW", sw: "Uliza CREAW" },
    free: false,
    numbers: ["020 386 1016", "0720 357 664"],
  },
  {
    group: "org",
    sort: 310,
    name: { en: "Q-Initiative", sw: "Q-Initiative" },
    who: { en: "Support", sw: "Msaada" },
    hours: { en: "Check with Q-Initiative", sw: "Uliza Q-Initiative" },
    free: false,
    numbers: ["0715 847 056"],
  },
  {
    group: "org",
    sort: 320,
    name: { en: "GALCK", sw: "GALCK" },
    who: { en: "Support", sw: "Msaada" },
    hours: { en: "Check with GALCK", sw: "Uliza GALCK" },
    free: false,
    numbers: ["0758 950 322", "0795 095 956", "0717 580 245"],
  },
  {
    group: "org",
    sort: 330,
    name: { en: "ISHTAR", sw: "ISHTAR" },
    who: { en: "Counselling", sw: "Ushauri" },
    hours: { en: "Check with ISHTAR", sw: "Uliza ISHTAR" },
    free: false,
    numbers: ["0726 812 498"],
  },
  {
    group: "org",
    sort: 340,
    name: { en: "Wangu Kanja Foundation", sw: "Wangu Kanja Foundation" },
    who: { en: "Text Help to 21094", sw: "Tuma Help kwenda 21094" },
    hours: { en: "Check with the foundation", sw: "Uliza shirika" },
    free: false,
    numbers: ["+254 722 790 404", "+254 774 746 699"],
    sms: "21094",
  },
  {
    group: "org",
    sort: 350,
    name: { en: "Centre for Domestic Training and Development", sw: "Centre for Domestic Training and Development" },
    who: { en: "Support", sw: "Msaada" },
    hours: { en: "Check with the centre", sw: "Uliza kituo" },
    free: false,
    numbers: ["+254 20 608 085", "+254 725 377 819"],
  },
  {
    group: "org",
    sort: 360,
    name: { en: "Kenya Women Wellness and Children Center", sw: "Kenya Women Wellness and Children Center" },
    who: { en: "Support", sw: "Msaada" },
    hours: { en: "Check with the centre", sw: "Uliza kituo" },
    free: false,
    numbers: ["0730 976 000"],
  },
  {
    group: "org",
    sort: 370,
    name: { en: "NGLHRC", sw: "NGLHRC" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    hours: { en: "Check with NGLHRC", sw: "Uliza NGLHRC" },
    free: false,
    numbers: ["0700 010 743", "0700 010 637", "0700 010 574"],
  },
  {
    group: "org",
    sort: 380,
    name: { en: "BHESP", sw: "BHESP" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    hours: { en: "Check with BHESP", sw: "Uliza BHESP" },
    free: false,
    numbers: ["0742 444 781"],
  },
  {
    group: "org",
    sort: 390,
    name: { en: "Trans Alliance", sw: "Trans Alliance" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    hours: { en: "Check with Trans Alliance", sw: "Uliza Trans Alliance" },
    free: false,
    numbers: ["0710 632 755"],
  },
  {
    group: "org",
    sort: 400,
    name: { en: "Legal Resources Foundation", sw: "Legal Resources Foundation" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    hours: { en: "Check with the foundation", sw: "Uliza shirika" },
    free: false,
    numbers: ["0724 244 849", "0722 209 822"],
  },
  {
    group: "org",
    sort: 410,
    name: { en: "Kituo Cha Sheria", sw: "Kituo Cha Sheria" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    hours: { en: "Check with Kituo Cha Sheria", sw: "Uliza Kituo Cha Sheria" },
    free: false,
    numbers: ["0784 651 635"],
  },
  {
    group: "org",
    sort: 420,
    name: { en: "Defenders Coalition", sw: "Defenders Coalition" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    hours: { en: "Check with Defenders Coalition", sw: "Uliza Defenders Coalition" },
    free: false,
    numbers: ["+254 716 200 100", "0719 423 558"],
  },
  {
    group: "org",
    sort: 430,
    name: { en: "Office of the Director of Public Prosecutions", sw: "Office of the Director of Public Prosecutions" },
    who: { en: "Toll-free", sw: "Simu ya bure" },
    hours: { en: "Check with the office", sw: "Uliza ofisi" },
    free: true,
    numbers: ["0800 723 377"],
  },
  {
    group: "org",
    sort: 440,
    name: { en: "FIDA Kenya", sw: "FIDA Kenya" },
    who: { en: "Legal aid", sw: "Msaada wa kisheria" },
    hours: { en: "Check with FIDA Kenya", sw: "Uliza FIDA Kenya" },
    free: true,
    numbers: ["0722 509 760", "0800 720 501"],
  },
  {
    group: "org",
    sort: 450,
    name: { en: "Kenya Human Rights Commission", sw: "Kenya Human Rights Commission" },
    who: { en: "Human rights", sw: "Haki za binadamu" },
    hours: { en: "Check with the commission", sw: "Uliza tume" },
    free: false,
    numbers: ["020 204 4545", "020 387 4998"],
  },
  {
    group: "org",
    sort: 460,
    name: { en: "National Council for Children Services", sw: "National Council for Children Services" },
    who: { en: "Children's services", sw: "Huduma za watoto" },
    hours: { en: "Check with the council", sw: "Uliza baraza" },
    free: true,
    numbers: ["0800 221 0080"],
  },
];

export async function seedHelplines() {
  await Helpline.updateMany(
    { "name.en": "Utumishi" },
    { $set: { "name.en": "Police", "name.sw": "Polisi" } },
  );
  const lastChecked = new Date();
  const count = await Helpline.estimatedDocumentCount();
  if (count === 0) {
    await Helpline.insertMany(DIRECTORY.map((entry) => ({ ...entry, lastChecked, hidden: false })));
    return;
  }

  const existing = await Helpline.find({}, { "name.en": 1 }).lean();
  const names = new Set(existing.map((entry) => entry.name?.en));
  const missing = DIRECTORY.filter((entry) => !names.has(entry.name.en));
  if (missing.length > 0) {
    await Helpline.insertMany(missing.map((entry) => ({ ...entry, lastChecked, hidden: false })));
  }

  await Helpline.updateOne(
    { "name.en": "Child Helpline", $or: [{ sms: "" }, { sms: { $exists: false } }] },
    { $set: { sms: "022 116 116" } },
  );
  await Helpline.updateOne(
    { "name.en": "MSF", numbers: { $nin: ["0800 721 100"] } },
    { $addToSet: { numbers: "0800 721 100" } },
  );
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

export async function ensureSupport() {
  const email = String(process.env.SUPPORT_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.SUPPORT_PASSWORD || "");
  if (!email || password.length < 8) {
    console.log("Support account not seeded. Set SUPPORT_EMAIL and SUPPORT_PASSWORD.");
    return;
  }

  const existing = await User.findOne({ email }).select("+passwordHash");
  const passwordHash = await hashPassword(password);
  if (!existing) {
    let username = "nia-support";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        await User.create({
          email,
          passwordHash,
          username,
          usernameKind: "chosen",
          role: "support",
          hasPassword: true,
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

  if (existing.role !== "support") {
    console.log("SUPPORT_EMAIL belongs to another account. The support account was not created.");
    return;
  }

  existing.passwordHash = passwordHash;
  existing.hasPassword = true;
  await existing.save();
}
