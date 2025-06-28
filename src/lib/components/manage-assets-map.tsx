import React, { ReactElement, useEffect, useRef, useState } from "react";
import maplibregl, { LngLat, LngLatBounds, Marker } from "maplibre-gl";
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

const STYLE = `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_API_KEY}`;

export type MapInfo = {
  bounds: LngLatBounds;
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
};

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

interface MapProps {
  children?: ReactElement | ReactElement[];
  onInit: (map: maplibregl.Map) => void;
  onMove: (info: MapInfo) => void;
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
  currentAsset: Asset | null;
}

export default function ManageAssetsMap({
  children,
  onInit,
  onMove,
  assets,
  onAssetsChange,
  currentAsset,
}: MapProps) {
  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clickLocation, setClickLocation] = useState<ClickLocation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lng: "",
    lat: "",
  });

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
    
    onAssetsChange([...assets, newAsset]);
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

  // Initialize map when component mounts
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: STYLE,
      center: [-104.692, 40.376],
      zoom: 14,
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      "top-right"
    );

    map.on("move", () =>
      onMove({
        bounds: map.getBounds(),
        center: map.getCenter(),
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      })
    );

    // Add click event listener for creating new assets
    map.on('click', handleMapClick);

    mapRef.current = map;
    onInit(map);

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when assets change
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove all existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create new markers for all assets
    const newMarkers = assets.map(asset => {
      const isSelected = currentAsset?.id === asset.id;
      const markerColor = isSelected ? '#ef4444' : asset.color; // Red if selected, otherwise asset color

      const marker = new Marker({
        color: markerColor,
        draggable: true,
      })
        .setLngLat([asset.lng, asset.lat])
        .addTo(mapRef.current!);

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

    markersRef.current = newMarkers;

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => marker.remove());
    };
  }, [assets, currentAsset]);

  return (
    <>
      <div className="flex flex-col w-full h-full" ref={mapContainerRef}>
        <div className="">{children}</div>
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
    </>
  );
}