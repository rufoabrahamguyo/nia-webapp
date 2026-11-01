const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const RADII = [4000, 15000, 50000, 120000];

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

async function closest(lat, lon, amenity) {
  for (const radius of RADII) {
    const places = await searchAmenity(lat, lon, amenity, radius);
    let best = null;
    for (const place of places) {
      const next = toPlace(place, lat, lon, amenity);
      if (next && (!best || next.distanceMeters < best.distanceMeters)) best = next;
    }
    if (best) return best;
  }
  return null;
}

export async function nearestPlaces(lat, lon) {
  const hospital = (await closest(lat, lon, "hospital")) || (await closest(lat, lon, "clinic"));
  const police = await closest(lat, lon, "police");
  return { hospital, police };
}
