import { useState } from "react";

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

function PlaceCard({ place, text }) {
  const title = place.name || text[place.kind] || text.hospital;
  return (
    <article className="line-card">
      <h3>{title}</h3>
      <p>{text[place.kind]}</p>
      <p className="line-meta">{distanceLabel(place.distanceMeters, text)}</p>
      {place.address ? <p className="line-meta">{place.address}</p> : null}
      <div className="line-actions">
        {place.phone ? (
          <a href={phoneHref(place.phone)}>
            {text.call} {place.phone}
          </a>
        ) : null}
        <a href={place.maps} target="_blank" rel="noreferrer">
          {text.directions}
        </a>
      </div>
    </article>
  );
}

export default function NearbyPlaces({ text }) {
  const copy = text.nearby;
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [places, setPlaces] = useState(null);

  async function findNearby() {
    if (!navigator.geolocation) {
      setPlaces(null);
      setStatus("error");
      setMessage(copy.unavailable);
      return;
    }

    setPlaces(null);
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

    const params = new URLSearchParams({
      lat: String(position.coords.latitude),
      lon: String(position.coords.longitude),
    });

    try {
      const response = await fetch(`/api/nearby?${params}`);
      if (!response.ok) throw new Error("nearby_failed");
      const data = await response.json();
      if (!data.hospital && !data.police) {
        setPlaces(null);
        setStatus("error");
        setMessage(copy.empty);
        return;
      }
      setPlaces(data);
      setStatus("ready");
      setMessage("");
    } catch {
      setPlaces(null);
      setStatus("error");
      setMessage(copy.failed);
    }
  }

  return (
    <section className="nearby" aria-labelledby="nearby-title">
      <h2 id="nearby-title">{copy.title}</h2>
      <p>{copy.lede}</p>
      <button type="button" className="button button-primary" onClick={findNearby} disabled={status === "locating"}>
        {status === "ready" || status === "error" ? copy.again : copy.button}
      </button>
      <p className="fine" role="status">
        {message}
      </p>
      {places ? (
        <div className="line-list nearby-list">
          {places.hospital ? <PlaceCard place={places.hospital} text={copy} /> : <p>{copy.missingHospital}</p>}
          {places.police ? <PlaceCard place={places.police} text={copy} /> : <p>{copy.missingPolice}</p>}
        </div>
      ) : null}
      <p className="fine">{copy.source}</p>
    </section>
  );
}
