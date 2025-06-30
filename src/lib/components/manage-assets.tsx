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
import { Trash2 } from "lucide-react";

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

export default function ManageAssets() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [markerInstances, setMarkerInstances] = useState<Marker[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [clickLocation, setClickLocation] = useState<ClickLocation | null>(
    null
  );
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
      color: "#3b82f6", // Blue color for assets
    };

    setAssets((prev) => [...prev, newAsset]);
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

  // Handle delete confirmation
  function handleDeleteClick(assetId: string) {
    setAssetToDelete(assetId);
    setIsDeleteDialogOpen(true);
  }

  // Confirm deletion
  function handleConfirmDelete() {
    if (assetToDelete) {
      setAssets((prev) => prev.filter((asset) => asset.id !== assetToDelete));
      setAssetToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  }

  // Cancel deletion
  function handleCancelDelete() {
    setAssetToDelete(null);
    setIsDeleteDialogOpen(false);
  }

  // Remove an asset (for popup buttons)
  function removeAsset(assetId: string) {
    handleDeleteClick(assetId);
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
    map.current.on("click", handleMapClick);

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
    markerInstances.forEach((marker) => marker.remove());

    // Create new marker instances
    const newMarkerInstances = assets.map((asset) => {
      const popup = new Popup({
        className: "custom-popup",
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
        <div style="color: black; padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${asset.name}</h3>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${asset.description || "No description"}</p>
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
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setAssets((prev) =>
          prev.map((a) =>
            a.id === asset.id ? { ...a, lng: lngLat.lng, lat: lngLat.lat } : a
          )
        );
      });

      return marker;
    });

    setMarkerInstances(newMarkerInstances);

    // Make removeAsset function available globally for popup buttons
    (window as any).removeAsset = removeAsset;

    // Cleanup function
    return () => {
      newMarkerInstances.forEach((marker) => marker.remove());
    };
  }, [assets]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Assets</h1>
        <p className="text-sm text-gray-600 mt-1">
          Click anywhere on the map to add new assets. Drag markers to
          reposition them.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Compact Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Assets ({assets.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {assets.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No assets yet</p>
              </div>
            ) : (
              <div className="p-2">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {asset.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDeleteClick(asset.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 ml-2 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="absolute w-full h-screen border border-red-500">
          <div
            ref={mapContainer}
            className="relative border-2 border-red-500"
          />
        </div>
      </div>

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
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter asset description (optional)"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
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
                  onChange={(e) => handleInputChange("lng", e.target.value)}
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
                  onChange={(e) => handleInputChange("lat", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset} disabled={!formData.name.trim()}>
              Add Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this asset? This action cannot be
              undone.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
