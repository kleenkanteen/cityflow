"use client";

import React, { useRef, useEffect } from "react";
import { Marker, Map as MapLibreMap, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
  const mapContainer = useRef<any>(null);
  const map = useRef<MapLibreMap | null>(null);
  const lng = -104.6922;
  const lat = 40.3764;
  const zoom = 14;
  const API_KEY = process.env.MAPTILER_API_KEY as string;

  useEffect(() => {
    if (map.current) return; // stops map from initializing more than once

    map.current = new MapLibreMap({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    let popup = new Popup({ className: "bg-black" }).setHTML(
      "<h1 style='color: black'>Hello World!</h1>"
    );
    let marker = new Marker({
      color: "red",
      draggable: true,
    })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map.current);
  }, [API_KEY, lng, lat, zoom]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute w-full h-full z-10" />
    </div>
  );
}
