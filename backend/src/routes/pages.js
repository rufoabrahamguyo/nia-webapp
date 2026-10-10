import { Router } from "express";
import { localeJson } from "../content.js";
import Page from "../models/Page.js";

const router = Router();

router.get("/", async (_req, res) => {
  const pages = await Page.find({ key: { $in: ["learn", "rights"] } });
  const body = {};
  for (const page of pages) {
    body[page.key] = { en: localeJson(page.en), sw: localeJson(page.sw) };
  }
  res.set("Cache-Control", "no-store");
  res.json({ pages: body });
});

export default router;
