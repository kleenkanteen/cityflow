"use client";

import React, { useRef, useEffect, useState } from "react";
import { Marker, Map as MapLibreMap, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Asset {
  id: string;
  name: string;
  description: string;
  lng: number;
  lat: number;
  color: string;
}

interface ClickLocation {
  lng: number;
  lat: number;
}

export default function Map() {
  const mapContainer = useRef<any>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [markerInstances, setMarkerInstances] = useState<Marker[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickLocation, setClickLocation] = useState<ClickLocation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lng: "",
    lat: "",
  });
  
  const lng = -104.6922;
  const lat = 40.3764;
  const zoom = 14;

  // Handle map click to open dialog
  function handleMapClick(e: any) {
    const { lng, lat } = e.lngLat;
    setClickLocation({ lng, lat });
    setFormData({
      name: "",
      description: "",
      lng: lng.toFixed(6),
      lat: lat.toFixed(6),
    });
    setIsDialogOpen(true);
  }

  // Handle form input changes
  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }

  // Handle form submission
  function handleAddAsset() {
    if (!formData.name.trim()) return;
    
    const newAsset: Asset = {
      id: `asset-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      lng: parseFloat(formData.lng),
      lat: parseFloat(formData.lat),
      color: '#3b82f6' // Blue color for assets
    };
    
    setAssets(prev => [...prev, newAsset]);
    setIsDialogOpen(false);
    setFormData({ name: "", description: "", lng: "", lat: "" });
    setClickLocation(null);
  }

  // Handle dialog cancel
  function handleCancel() {
    setIsDialogOpen(false);
    setFormData({ name: "", description: "", lng: "", lat: "" });
    setClickLocation(null);
  }

  // Remove an asset
  function removeAsset(assetId: string) {
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
  }

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new MapLibreMap({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    // Add click event to open dialog
    map.current.on('click', handleMapClick);
  }, []);

  // Update markers when assets state changes
  useEffect(() => {
    if (!map.current) return;

    // Remove all existing marker instances
    markerInstances.forEach(marker => marker.remove());
    
    // Create new marker instances
    const newMarkerInstances = assets.map(asset => {
      const popup = new Popup({ 
        className: "custom-popup",
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="color: black; padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${asset.name}</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${asset.description || 'No description'}</p>
          <p style="margin: 0 0 12px 0; font-size: 12px; color: #888;">
            ${asset.lat.toFixed(6)}, ${asset.lng.toFixed(6)}
          </p>
          <button 
            onclick="window.removeAsset('${asset.id}')" 
            style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
          >
            Remove Asset
          </button>
        </div>
      `);

      const marker = new Marker({
        color: asset.color,
        draggable: true,
      })
        .setLngLat([asset.lng, asset.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Update asset position when dragged
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setAssets(prev => prev.map(a => 
          a.id === asset.id 
            ? { ...a, lng: lngLat.lng, lat: lngLat.lat }
            : a
        ));
      });

      return marker;
    });

    setMarkerInstances(newMarkerInstances);

    // Make removeAsset function available globally for popup buttons
    (window as any).removeAsset = removeAsset;

    // Cleanup function
    return () => {
      newMarkerInstances.forEach(marker => marker.remove());
    };
  }, [assets]);

  return (
    <div className="relative w-full h-full">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-semibold text-gray-800 mb-2">Asset Management</h3>
        <p className="text-sm text-gray-600 mb-3">
          Click anywhere on the map to add a new asset
        </p>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Total Assets:</span> {assets.length}
          </div>
          <Button
            onClick={() => setAssets([])}
            variant="destructive"
            size="sm"
            className="w-full"
            disabled={assets.length === 0}
          >
            Clear All Assets
          </Button>
        </div>
      </div>

      {/* Asset List */}
      {assets.length > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-80 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-2">Assets</h3>
          <div className="space-y-2">
            {assets.map((asset) => (
              <div key={asset.id} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{asset.name}</h4>
                    {asset.description && (
                      <p className="text-xs text-gray-600 mt-1">{asset.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeAsset(asset.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0 ml-2"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="absolute w-full h-full z-10" />

      {/* Add Asset Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                placeholder="Enter asset name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter asset description (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.lng}
                  onChange={(e) => handleInputChange('lng', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.lat}
                  onChange={(e) => handleInputChange('lat', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddAsset}
              disabled={!formData.name.trim()}
            >
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}