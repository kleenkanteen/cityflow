"use client";

import React, { useState } from "react";
import AssetsSidebar from "@/src/lib/components/assets-sidebar";
import { Map as MapLibreMap } from "maplibre-gl";
import ManageAssetsMap, {
  MapInfo,
} from "@/src/lib/components/manage-assets-map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, MapPin } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  description: string;
  lng: number;
  lat: number;
  color: string;
}

export default function ManagePage() {
  const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  function handleAssetsChange(newAssets: Asset[]) {
    setAssets(newAssets);
    // If current asset was deleted, clear selection
    if (currentAsset && !newAssets.find((a) => a.id === currentAsset.id)) {
      setCurrentAsset(null);
    }
  }

  function handleAssetSelect(asset: Asset) {
    setCurrentAsset(asset);
  }

  function handleAssetDelete(assetId: string) {
    setAssetToDelete(assetId);
    setIsDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (assetToDelete) {
      const updatedAssets = assets.filter(
        (asset) => asset.id !== assetToDelete
      );
      setAssets(updatedAssets);

      // Clear current asset if it was deleted
      if (currentAsset?.id === assetToDelete) {
        setCurrentAsset(null);
      }

      setAssetToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  }

  function handleCancelDelete() {
    setAssetToDelete(null);
    setIsDeleteDialogOpen(false);
  }

  return (
    <div className="flex w-full h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 z-10 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Manage Assets
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click anywhere on the map to add new assets • Select assets to highlight them
                  </p>
                </div>
              </div>
            </div>
            
            {/* Optional: Add action buttons here */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{assets.length}</p>
                <p className="text-xs text-gray-500">Total Assets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - with top padding for header */}
      <div className="flex w-full h-full pt-24">
        {/* Sidebar */}
        <div className="w-80 h-full">
          <AssetsSidebar
            assets={assets}
            currentAsset={currentAsset}
            onAssetSelect={handleAssetSelect}
            onAssetDelete={handleAssetDelete}
          />
        </div>

        {/* Map */}
        <div className="flex-1 h-full">
          <ManageAssetsMap
            onInit={(map) => setMap(map)}
            onMove={(info) => setMapInfo(info)}
            assets={assets}
            onAssetsChange={handleAssetsChange}
            currentAsset={currentAsset}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this asset? This action cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}