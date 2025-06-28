"use client";

import React, { useState } from "react";
import AssetsSidebar from "@/src/lib/components/assets-sidebar";
import ManageAssetsMap from "@/src/lib/components/manage-assets-map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Asset {
  id: string;
  name: string;
  description: string;
  lng: number;
  lat: number;
  color: string;
}

export default function ManagePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  function handleAssetsChange(newAssets: Asset[]) {
    setAssets(newAssets);
    // If current asset was deleted, clear selection
    if (currentAsset && !newAssets.find(a => a.id === currentAsset.id)) {
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
      const updatedAssets = assets.filter(asset => asset.id !== assetToDelete);
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Manage Assets</h1>
        <p className="text-sm text-gray-600 mt-1">
          Click anywhere on the map to add new assets. Drag markers to reposition them.
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AssetsSidebar
          assets={assets}
          currentAsset={currentAsset}
          onAssetSelect={handleAssetSelect}
          onAssetDelete={handleAssetDelete}
        />

        {/* Map */}
        <ManageAssetsMap
          assets={assets}
          currentAsset={currentAsset}
          onAssetsChange={handleAssetsChange}
          onAssetSelect={handleAssetSelect}
        />
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