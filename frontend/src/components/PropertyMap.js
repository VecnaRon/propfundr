import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const PropertyMap = ({ latitude, longitude, onLocationSelect, allowSelection = false }) => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([parseFloat(latitude), parseFloat(longitude)]);
    } else if (!allowSelection) {
      setError("No valid location data available");
    }
  }, [latitude, longitude, allowSelection]);

  const customIcon = new L.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // **New Component to Move Map Instantly**
  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      if (position) {
        map.setView(position, 15, { animate: false }); // Instantly center map
      }
    }, [position, map]);
    return null;
  };

  // Handles map clicks (Only for Owners)
  const LocationPicker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        if (onLocationSelect) onLocationSelect(lat, lng);
      },
    });
    return position ? (
      <Marker position={position} icon={customIcon}>
        <Popup>Latitude: {position[0].toFixed(5)}, Longitude: {position[1].toFixed(5)}</Popup>
      </Marker>
    ) : null;
  };

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <MapContainer
      center={position || [0, 0]}
      zoom={10}
      style={{ height: "400px", width: "100%" }}
    >
      <MapUpdater /> {/* 🔥 New Component to Center the Map Instantly */}
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {allowSelection ? <LocationPicker /> : position && (
        <Marker position={position} icon={customIcon}>
          <Popup>Latitude: {position[0].toFixed(5)}, Longitude: {position[1].toFixed(5)}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default PropertyMap;
