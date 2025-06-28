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

interface ManageAssetsMapProps {
  assets: Asset[];
  currentAsset: Asset | null;
  onAssetsChange: (assets: Asset[]) => void;
  onAssetSelect: (asset: Asset) => void;
}

export default function ManageAssetsMap({ 
  assets, 
  currentAsset, 
  onAssetsChange, 
  onAssetSelect 
}: ManageAssetsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
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
    
    const updatedAssets = [...assets, newAsset];
    onAssetsChange(updatedAssets);
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

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new MapLibreMap({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`,
      center: [lng, lat],
      zoom: zoom,
    });

    // Add click event to open dialog
    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
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
        </div>
      `);

      const isSelected = currentAsset?.id === asset.id;
      const marker = new Marker({
        color: isSelected ? '#ef4444' : asset.color, // Red if selected, blue otherwise
        draggable: true,
      })
        .setLngLat([asset.lng, asset.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Handle marker click to select asset
      marker.getElement().addEventListener('click', () => {
        onAssetSelect(asset);
      });

      // Update asset position when dragged
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const updatedAssets = assets.map(a => 
          a.id === asset.id 
            ? { ...a, lng: lngLat.lng, lat: lngLat.lat }
            : a
        );
        onAssetsChange(updatedAssets);
      });

      return marker;
    });

    setMarkerInstances(newMarkerInstances);

    // Cleanup function
    return () => {
      newMarkerInstances.forEach(marker => marker.remove());
    };
  }, [assets, currentAsset]);

  return (
    <div className="flex-1 relative">
      <div ref={mapContainer} className="absolute bottom-0 inset-0" />

      {/* Add Asset Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Asset</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
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