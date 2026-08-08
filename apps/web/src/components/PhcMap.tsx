"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for leaflet markers in Next.js
import L from "leaflet";

// A quick fix for default icon missing in leaflet when imported via webpack/nextjs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function PhcMap() {
  // Patna coordinates
  const position: [number, number] = [25.5941, 85.1376];
  const markers = [
    { id: 1, pos: [25.5941, 85.1376] as [number, number], name: "High Risk - Ramesh (Diabetes)" },
    { id: 2, pos: [25.6, 85.15] as [number, number], name: "High Risk - Sunita (Hypertension)" },
    { id: 3, pos: [25.58, 85.12] as [number, number], name: "Medium Risk - Anil" },
  ];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
      <MapContainer center={position} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.pos}>
            <Popup>{marker.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
