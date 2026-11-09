import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PIN = {
  hospital: "#0e4d45",
  clinic: "#0e4d45",
  police: "#1b2a4a",
};

function distanceLabel(meters, text) {
  if (meters < 1000) {
    const value = String(Math.max(50, Math.round(meters / 50) * 50));
    return text.awayM.replace("{n}", value);
  }
  const km = meters / 1000;
  const value = km < 10 ? km.toFixed(1) : String(Math.round(km));
  return text.awayKm.replace("{n}", value);
}

function phoneHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function popupText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function withIds(list) {
  return list.map((place, index) => ({
    ...place,
    id: `${place.kind}:${place.lat}:${place.lon}:${index}`,
  }));
}

function pinStyle(kind, selected) {
  return {
    radius: selected ? 11 : 8,
    color: selected ? "#f0c014" : "#ffffff",
    weight: selected ? 3 : 2,
    fillColor: PIN[kind] || PIN.hospital,
    fillOpacity: 1,
  };
}

function createMap(node) {
  if (node._leaflet_id) node._leaflet_id = undefined;
  return L.map(node, { scrollWheelZoom: false });
}

function NearbyMap({ hospitals, police, here, selectedId, onSelect, youLabel, mapLabel }) {
  const nodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || mapRef.current) return undefined;

    let map;
    try {
      map = createMap(node);
    } catch {
      return undefined;
    }
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;
    const timer = window.setTimeout(() => map.invalidateSize(), 0);
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(node);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      markersRef.current = new Map();
      mapRef.current = null;
      try {
        map.remove();
      } catch {
        node._leaflet_id = undefined;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    for (const marker of markersRef.current.values()) marker.remove();
    const markers = new Map();
    const points = [];

    function addPlace(place) {
      const marker = L.circleMarker([place.lat, place.lon], pinStyle(place.kind, false))
        .addTo(map)
        .bindPopup(popupText(place.name));
      marker.niaKind = place.kind;
      marker.on("click", () => onSelect(place.id));
      markers.set(place.id, marker);
      points.push([place.lat, place.lon]);
    }

    hospitals.forEach(addPlace);
    police.forEach(addPlace);

    if (here) {
      const you = L.circleMarker([here.lat, here.lon], {
        radius: 7,
        color: "#1b2a4a",
        weight: 2,
        fillColor: "#f0c014",
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup(popupText(youLabel));
      markers.set("here", you);
      points.push([here.lat, here.lon]);
    }

    markersRef.current = markers;
    if (points.length > 0) {
      map.invalidateSize();
      map.fitBounds(points, { padding: [28, 28], maxZoom: 15 });
    }

    return () => {
      for (const marker of markers.values()) marker.remove();
      markersRef.current = new Map();
    };
  }, [hospitals, police, here, youLabel, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    let chosen = null;
    for (const [id, marker] of markersRef.current) {
      if (id === "here") continue;
      marker.setStyle(pinStyle(marker.niaKind, id === selectedId));
      if (id === selectedId) chosen = marker;
    }
    if (!chosen) return undefined;
    chosen.openPopup();
    map.panTo(chosen.getLatLng(), { animate: true });
    return undefined;
  }, [selectedId]);

  return <div ref={nodeRef} className="nearby-map" role="region" aria-label={mapLabel} />;
}

function PlaceRow({ place, text, selected, onSelect }) {
  const title = place.name || text[place.kind] || text.hospital;
  return (
    <article className={`nearby-place${selected ? " is-selected" : ""}`}>
      <button type="button" className="nearby-place-main" aria-pressed={selected} onClick={() => onSelect(place.id)}>
        <h3>{title}</h3>
        {place.address ? <p>{place.address}</p> : null}
        <p>{distanceLabel(place.distanceMeters, text)}</p>
      </button>
      <div className="nearby-place-actions">
        {place.phone ? (
          <a href={phoneHref(place.phone)}>
            {text.call} {place.phone}
          </a>
        ) : null}
        <a className="nearby-directions" href={place.maps} target="_blank" rel="noreferrer">
          {text.directions}
        </a>
      </div>
    </article>
  );
}

function PlaceGroup({ label, places, empty, text, selectedId, onSelect }) {
  return (
    <section>
      <h3 className="nearby-group">{label}</h3>
      {places.length > 0 ? (
        <div className="nearby-group-list">
          {places.map((place) => (
            <PlaceRow key={place.id} place={place} text={text} selected={place.id === selectedId} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <p className="nearby-missing">{empty}</p>
      )}
    </section>
  );
}

export default function NearbyPlaces({ text }) {
  const copy = text.nearby;
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [places, setPlaces] = useState(null);
  const [here, setHere] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  async function findNearby() {
    if (!navigator.geolocation) {
      setPlaces(null);
      setHere(null);
      setSelectedId(null);
      setStatus("error");
      setMessage(copy.unavailable);
      return;
    }

    setPlaces(null);
    setHere(null);
    setSelectedId(null);
    setStatus("locating");
    setMessage(copy.searching);

    let position;
    try {
      position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });
    } catch (error) {
      setStatus("error");
      setMessage(error?.code === 1 ? copy.denied : copy.failed);
      return;
    }

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
    });

    try {
      const response = await fetch(`/api/nearby?${params}`);
      if (!response.ok) throw new Error("nearby_failed");
      const data = await response.json();
      const hospitals = withIds(Array.isArray(data.hospitals) ? data.hospitals : []);
      const police = withIds(Array.isArray(data.police) ? data.police : []);
      if (hospitals.length === 0 && police.length === 0) {
        setPlaces(null);
        setStatus("error");
        setMessage(copy.empty);
        return;
      }
      setHere({ lat, lon });
      setPlaces({ hospitals, police });
      setStatus("ready");
      setMessage("");
    } catch {
      setPlaces(null);
      setHere(null);
      setStatus("error");
      setMessage(copy.failed);
    }
  }

  const careLabel = places?.hospitals[0]?.kind === "clinic" ? copy.clinics : copy.hospitals;

  return (
    <section className="nearby" aria-labelledby="nearby-title">
      <h2 id="nearby-title">{copy.title}</h2>
      <p>{copy.lede}</p>
      <button type="button" className="button button-accent" onClick={findNearby} disabled={status === "locating"}>
        {status === "ready" || status === "error" ? copy.again : copy.button}
      </button>
      <p className="fine" role="status">
        {message}
      </p>
      {places ? (
        <div className="nearby-panel">
          <div className="nearby-layout">
            <NearbyMap
              hospitals={places.hospitals}
              police={places.police}
              here={here}
              selectedId={selectedId}
              onSelect={setSelectedId}
              youLabel={copy.youAreHere}
              mapLabel={copy.title}
            />
            <div className="nearby-results">
              <PlaceGroup
                label={careLabel}
                places={places.hospitals}
                empty={copy.missingHospital}
                text={copy}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <PlaceGroup
                label={copy.stations}
                places={places.police}
                empty={copy.missingPolice}
                text={copy}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
          </div>
        </div>
      ) : null}
      <p className="fine">{copy.source}</p>
    </section>
  );
}
