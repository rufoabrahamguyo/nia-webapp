import { Router } from "express";
import Helpline from "../models/Helpline.js";

const router = Router();

router.get("/", async (_req, res) => {
  const helplines = await Helpline.find({ hidden: false }).sort({ sort: 1, "name.en": 1 }).limit(100);
  res.set("Cache-Control", "no-store");
  res.json({
    helplines: helplines.map((entry) => ({
      id: String(entry._id),
      group: entry.group,
      name: entry.name,
      who: entry.who,
      hours: entry.hours,
      free: entry.free,
      numbers: entry.numbers,
      sms: entry.sms || "",
      whatsapp: entry.whatsapp || "",
      site: entry.siteHref ? { label: entry.siteLabel, href: entry.siteHref } : null,
    })),
  });
});

export default router;
