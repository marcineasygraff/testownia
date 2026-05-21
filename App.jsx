import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// FIX IKON
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const BASE = {
  lat: 49.864685,
  lon: 19.354651,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState("");
  const [haslo, setHaslo] = useState("");

  const [adres, setAdres] = useState("");
  const [geo, setGeo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const zaloguj = () => {
    if (login === "admin" && haslo === "1234") {
      setUser({ login });
    } else {
      alert("Błędny login");
    }
  };

  const pobierzGeo = async (q) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}`
      );
      const d = await r.json();
      if (!d?.length) return null;

      return { lat: +d[0].lat, lon: +d[0].lon };
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!adres) {
      setGeo(null);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      setError("");

      const res = await pobierzGeo(adres);

      if (!res) {
        setError("Nie znaleziono adresu");
        setGeo(null);
      } else {
        setGeo(res);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(t);
  }, [adres]);

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>Login</h2>

          <input
            style={styles.input}
            placeholder="Login"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Hasło"
            value={haslo}
            onChange={(e) => setHaslo(e.target.value)}
          />

          <button style={styles.button} onClick={zaloguj}>
            Zaloguj
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>Serwis Robotów + mapa</h1>

      <input
        style={styles.input}
        placeholder="Adres klienta"
        value={adres}
        onChange={(e) => setAdres(e.target.value)}
      />

      {loading && <p>Ładowanie...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {geo ? (
        <div style={{ height: 400, marginTop: 20 }}>
          <MapContainer
            center={[geo.lat, geo.lon]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={[BASE.lat, BASE.lon]}>
              <Popup>Baza</Popup>
            </Marker>

            <Marker position={[geo.lat, geo.lon]}>
              <Popup>Klient</Popup>
            </Marker>
          </MapContainer>
        </div>
      ) : (
        <p>Wpisz adres żeby zobaczyć mapę</p>
      )}
    </div>
  );
}

// CSS OFFLINE (ZERO Tailwind dependency)
const styles = {
  page: {
    minHeight: "100vh",
    padding: 20,
    background: "#0f172a",
    color: "white",
    fontFamily: "Arial",
  },
  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },
  card: {
    width: 300,
    padding: 20,
    background: "#1e293b",
    borderRadius: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
  },
  button: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    background: "#2563eb",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};
