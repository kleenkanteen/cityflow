"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Plus, Edit, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
  isAddingAsset: boolean;
  onToggleAddingAsset: () => void;
}

export default function AssetsSidebar({
  assets,
  onAssetsChange,
  isAddingAsset,
  onToggleAddingAsset,
}: AssetsSidebarProps) {
  const [deleteAssetDialog, setDeleteAssetDialog] = useState(false);
  const [editAssetDialog, setEditAssetDialog] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    lng: "",
    lat: "",
  });

  // Filter assets based on search query (case-insensitive)
  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleDeleteClick(assetId: string) {
    setDeleteAssetDialog(true);
    setAssetToDelete(assetId);
  }

  function handleEditClick(asset: Asset) {
    setAssetToEdit(asset);
    setEditFormData({
      name: asset.name,
      description: asset.description || "",
      lng: asset.lng.toString(),
      lat: asset.lat.toString(),
    });
    setEditAssetDialog(true);
  }

  function handleEditInputChange(field: string, value: string) {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleUpdateAsset() {
    if (!assetToEdit || !editFormData.name.trim()) return;

    setIsUpdating(true);

    try {
      const updatedAssetData = {
        name: editFormData.name,
        description: editFormData.description,
        lng: parseFloat(editFormData.lng),
        lat: parseFloat(editFormData.lat),
        color: assetToEdit.color,
      };

      const response = await fetch(`/api/assets/${assetToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAssetData),
      });

      if (response.status === 200) {
        // Success - update local state and show success toast
        const updatedAssets = assets.map((asset) =>
          asset.id === assetToEdit.id
            ? { ...asset, ...updatedAssetData }
            : asset
        );
        onAssetsChange(updatedAssets);
        toast.success("Asset updated successfully!");
        setEditAssetDialog(false);
        setAssetToEdit(null);
      } else {
        // Error - show error toast
        toast.error("Failed to update asset. Try again later.");
      }
    } catch (error) {
      console.error("Error updating asset:", error);
      toast.error("Failed to update asset. Try again later.");
    } finally {
      setIsUpdating(false);
    }
  }

  function handleCancelEdit() {
    setAssetToEdit(null);
    setEditAssetDialog(false);
    setEditFormData({ name: "", description: "", lng: "", lat: "" });
  }

  async function handleConfirmDelete() {
    if (!assetToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/assets/${assetToDelete}`, {
        method: "DELETE",
      });

      if (response.status === 200) {
        // Success - remove from local state and show success toast
        const updatedAssets = assets.filter(
          (asset) => asset.id !== assetToDelete
        );
        onAssetsChange(updatedAssets);
        toast.success("Asset deleted successfully!");
        setAssetToDelete(null);
        setDeleteAssetDialog(false);
      } else {
        // Error - show error toast
        toast.error("Failed to delete asset. Try again later.");
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset. Try again later.");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancelDelete() {
    setAssetToDelete(null);
    setDeleteAssetDialog(false);
  }

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full max-h-full overflow-hidden space-y-3">
      {/* Add Asset Button - Fixed at top */}
      <div className="px-3 py-3 flex-shrink-0 mb-3">
        <Button
          onClick={onToggleAddingAsset}
          variant={isAddingAsset ? "destructive" : "primary"}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isAddingAsset ? "Cancel Adding" : "Add Asset"}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-3flex-shrink-0">
        <Input
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2">
            {filteredAssets.length} of {assets.length} assets found
          </p>
        )}
      </div>

      {/* Assets List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-2 min-h-0">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {searchQuery
                ? `No assets found matching "${searchQuery}"`
                : "No assets yet. Click on the map to add your first asset."}
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-lg px-2 py-4 border border-gray-200 hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sm font-semibold text-gray-900 truncate">
                      {asset.name.length > 30
                        ? `${asset.name.substring(0, 30)}...`
                        : asset.name}
                    </h3>
                    {asset.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {asset.description.length > 40
                          ? `${asset.description.substring(0, 40)}...`
                          : asset.description}
                      </p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <Button
                      onClick={() => handleEditClick(asset)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isUpdating || isDeleting}
                    >
                      <Edit className="h-4 w-4" color="#3b82f6" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(asset.id)}
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isDeleting || isUpdating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Asset Dialog */}
      <Dialog open={editAssetDialog} onOpenChange={setEditAssetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Asset Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter asset name"
                value={editFormData.name}
                onChange={(e) => handleEditInputChange("name", e.target.value)}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter asset description (optional)"
                value={editFormData.description}
                onChange={(e) =>
                  handleEditInputChange("description", e.target.value)
                }
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={editFormData.lng}
                  onChange={(e) => handleEditInputChange("lng", e.target.value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={editFormData.lat}
                  onChange={(e) => handleEditInputChange("lat", e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Close
            </Button>
            <Button
              onClick={handleUpdateAsset}
              disabled={!editFormData.name.trim() || isUpdating}
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteAssetDialog} onOpenChange={setDeleteAssetDialog}>
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
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
