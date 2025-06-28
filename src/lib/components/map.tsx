"use client";

import React, { useRef, useEffect, useState } from "react";
import { Marker, Map as MapLibreMap, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface CustomMarker {
  id: string;
  lng: number;
  lat: number;
  title: string;
  description?: string;
  color: string;
}

export default function Map() {
  const mapContainer = useRef<any>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [markers, setMarkers] = useState<CustomMarker[]>([]);
  const [markerInstances, setMarkerInstances] = useState<Marker[]>([]);
  
  const lng = -104.6922;
  const lat = 40.3764;
  const zoom = 14;

  // Add a new marker
  const addMarker = (lng: number, lat: number) => {
    const newMarker: CustomMarker = {
      id: `marker-${Date.now()}`,
      lng,
      lat,
      title: `Marker ${markers.length + 1}`,
      description: `Custom marker at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      color: '#ff0000'
    };
    
    setMarkers(prev => [...prev, newMarker]);
  };

  // Remove a marker
  const removeMarker = (markerId: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== markerId));
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new MapLibreMap({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    // Add click event to place markers
    map.current.on('click', (e) => {
      addMarker(e.lngLat.lng, e.lngLat.lat);
    });

    // Add initial marker
    addMarker(lng, lat);
  }, []);

  // Update markers when markers state changes
  useEffect(() => {
    if (!map.current) return;

    // Remove all existing marker instances
    markerInstances.forEach(marker => marker.remove());
    
    // Create new marker instances
    const newMarkerInstances = markers.map(markerData => {
      const popup = new Popup({ 
        className: "custom-popup",
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="color: black; padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: bold;">${markerData.title}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px;">${markerData.description || ''}</p>
          <button 
            onclick="window.removeMarker('${markerData.id}')" 
            style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;"
          >
            Remove
          </button>
        </div>
      `);

      const marker = new Marker({
        color: markerData.color,
        draggable: true,
      })
        .setLngLat([markerData.lng, markerData.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Update marker position when dragged
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setMarkers(prev => prev.map(m => 
          m.id === markerData.id 
            ? { ...m, lng: lngLat.lng, lat: lngLat.lat }
            : m
        ));
      });

      return marker;
    });

    setMarkerInstances(newMarkerInstances);

    // Make removeMarker function available globally for popup buttons
    (window as any).removeMarker = removeMarker;

    // Cleanup function
    return () => {
      newMarkerInstances.forEach(marker => marker.remove());
    };
  }, [markers]);

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-2">Map Controls</h3>
        <p className="text-sm text-gray-600 mb-3">
          Click anywhere on the map to place a marker
        </p>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-black">Total Markers:</span> {markers.length}
          </div>
          <button
            onClick={() => setMarkers([])}
            className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
            disabled={markers.length === 0}
          >
            Clear All Markers
          </button>
        </div>
      </div>

      {/* Marker List */}
      {markers.length > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-80 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-2">Markers</h3>
          <div className="space-y-2">
            {markers.map((marker) => (
              <div key={marker.id} className="border border-gray-200 rounded p-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{marker.title}</h4>
                    <p className="text-xs text-gray-500">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMarker(marker.id)}
                    className="text-red-500 hover:text-red-700 text-xs ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="absolute w-full h-full z-10" />
    </div>
  );
}