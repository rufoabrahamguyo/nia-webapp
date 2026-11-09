const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const RADII = [4000, 15000, 50000, 120000];
const CARE_LIMIT = 6;
const POLICE_LIMIT = 5;

let lastRequestAt = 0;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function distanceMeters(fromLat, fromLon, toLat, toLon) {
  const earth = 6371000;
  const lat = ((toLat - fromLat) * Math.PI) / 180;
  const lon = ((toLon - fromLon) * Math.PI) / 180;
  const a =
    Math.sin(lat / 2) ** 2 +
    Math.cos((fromLat * Math.PI) / 180) * Math.cos((toLat * Math.PI) / 180) * Math.sin(lon / 2) ** 2;
  return Math.round(2 * earth * Math.asin(Math.min(1, Math.sqrt(a))));
}

function viewbox(lat, lon, radiusMeters) {
  const latDelta = radiusMeters / 111320;
  const lonDelta = radiusMeters / (111320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  return [lon - lonDelta, lat + latDelta, lon + lonDelta, lat - latDelta].join(",");
}

function addressOf(address = {}) {
  const city = address.city || address.town || address.village || "";
  return [address.road, address.suburb, city].filter(Boolean).join(", ");
}

function phoneOf(place) {
  const raw = place.extratags?.phone || place.extratags?.["contact:phone"] || "";
  const phone = String(raw).split(";")[0].trim();
  return phone.replace(/[^\d+]/g, "").length >= 3 ? phone : "";
}

function toPlace(place, fromLat, fromLon, kind) {
  if (place?.type !== kind || !place.name) return null;
  const lat = Number(place.lat);
  const lon = Number(place.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const maps = new URLSearchParams({
    api: "1",
    origin: `${fromLat.toFixed(6)},${fromLon.toFixed(6)}`,
    destination: `${lat.toFixed(6)},${lon.toFixed(6)}`,
  });
  return {
    name: place.name,
    kind,
    lat: Number(lat.toFixed(6)),
    lon: Number(lon.toFixed(6)),
    distanceMeters: distanceMeters(fromLat, fromLon, lat, lon),
    address: addressOf(place.address),
    phone: phoneOf(place),
    maps: `https://www.google.com/maps/dir/?${maps}`,
  };
}

async function searchAmenity(lat, lon, amenity, radiusMeters) {
  const wait = 1100 - (Date.now() - lastRequestAt);
  if (lastRequestAt && wait > 0) await delay(wait);

  const params = new URLSearchParams({
    format: "jsonv2",
    amenity,
    limit: "40",
    addressdetails: "1",
    extratags: "1",
    viewbox: viewbox(lat, lon, radiusMeters),
    bounded: "1",
  });
  lastRequestAt = Date.now();
  const response = await fetch(`${NOMINATIM}?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "nia-webapp/nearby",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("nominatim_status");
  const places = await response.json();
  if (!Array.isArray(places)) throw new Error("nominatim_shape");
  return places;
}

function placeKey(raw, place) {
  if (raw.osm_type && raw.osm_id) return `${raw.osm_type}:${raw.osm_id}`;
  return `${place.name.toLowerCase()}:${place.lat.toFixed(4)}:${place.lon.toFixed(4)}`;
}

async function nearbyList(lat, lon, amenity, limit) {
  const seen = new Map();
  for (const radius of RADII) {
    const places = await searchAmenity(lat, lon, amenity, radius);
    for (const place of places) {
      const next = toPlace(place, lat, lon, amenity);
      if (!next || next.distanceMeters > radius) continue;
      const key = placeKey(place, next);
      const prev = seen.get(key);
      if (!prev || next.distanceMeters < prev.distanceMeters) seen.set(key, next);
    }
    const list = [...seen.values()].sort((a, b) => a.distanceMeters - b.distanceMeters);
    if (list.length >= limit || (list.length > 0 && radius >= 15000)) return list.slice(0, limit);
  }
  return [...seen.values()].sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, limit);
}

export async function nearestPlaces(lat, lon) {
  const hospitals = await nearbyList(lat, lon, "hospital", CARE_LIMIT);
  const care = hospitals.length > 0 ? hospitals : await nearbyList(lat, lon, "clinic", CARE_LIMIT);
  const police = await nearbyList(lat, lon, "police", POLICE_LIMIT);
  return { hospitals: care, police };
}
