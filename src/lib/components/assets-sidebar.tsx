"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Asset {
  id: string;
  name: string;
  description: string;
  lng: number;
  lat: number;
  color: string;
}

interface AssetsSidebarProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
}

export default function AssetsSidebar({
  assets,
  onAssetsChange,
}: AssetsSidebarProps) {
  const [deleteAssetDialog, setDeleteAssetDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  function handleDeleteClick(assetId: string) {
    setDeleteAssetDialog(true);
    setAssetToDelete(assetId);
  }

  function handleConfirmDelete() {
    if (assetToDelete) {
      const updatedAssets = assets.filter(asset => asset.id !== assetToDelete);
      onAssetsChange(updatedAssets);
      setAssetToDelete(null);
    }
    setDeleteAssetDialog(false);
  }

  function handleCancelDelete() {
    setAssetToDelete(null);
    setDeleteAssetDialog(false);
  }

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Assets ({assets.length})
        </h2>
        {assets.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Click on an asset to view details
          </p>
        )}
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto p-4">
        {assets.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              No assets yet. Click on the map to add your first asset.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg px-4 py-4 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {asset.name}
                    </h3>
                    {asset.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {asset.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteClick(asset.id)}
                    variant="destructive"
                    size="sm"
                    className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteAssetDialog} onOpenChange={setDeleteAssetDialog}>
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