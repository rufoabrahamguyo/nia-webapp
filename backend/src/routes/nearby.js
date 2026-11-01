import { Router } from "express";
import { nearestPlaces } from "../nearby.js";

const router = Router();

router.get("/", async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    res.status(400).json({ error: "invalid_location" });
    return;
  }

  try {
    const places = await nearestPlaces(lat, lon);
    res.set("Cache-Control", "no-store");
    res.json(places);
  } catch {
    res.status(502).json({ error: "nearby_unavailable" });
  }
});

export default router;
