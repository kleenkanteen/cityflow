"use client";

import React, { useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Asset {
  id: string;
  name: string;
  description: string;
  lng: number;
  lat: number;
  color: string;
}

interface Log {
  id: string;
  type: string;
  description: string;
  technician: string;
  date: string;
  assetId: string;
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
  const [logs, setLogs] = useState<Log[]>([]);
  const [newLog, setNewLog] = useState({
    type: "",
    description: "",
    technician: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    lng: "",
    lat: "",
  });
  // Tabs state: 'edit' | 'addLog' | 'logs'
  const [activeTab, setActiveTab] = useState<"edit" | "addLog" | "logs">(
    "edit"
  );

  // Filter assets based on search query (case-insensitive)
  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter logs for current asset
  const currentAssetLogs = logs.filter(
    (log) => log.assetId === assetToEdit?.id
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
    setNewLog({ type: "", description: "", technician: "" });
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

  function handleAddLog() {
    if (
      !newLog.type ||
      !newLog.description ||
      !newLog.technician ||
      !assetToEdit
    )
      return;

    const log: Log = {
      id: Date.now().toString(),
      type: newLog.type,
      description: newLog.description,
      technician: newLog.technician,
      date: new Date().toLocaleDateString(),
      assetId: assetToEdit.id,
    };

    setLogs([...logs, log]);
    setNewLog({ type: "", description: "", technician: "" });
    toast.success("Log added successfully!");
  }

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full max-h-full space-y-3">
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
            {filteredAssets.map((asset: Asset) => (
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
      <Dialog
        open={editAssetDialog}
        onClose={() => setEditAssetDialog(false)}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <DialogBackdrop className="fixed inset-0 bg-black/30" />

        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Asset Details
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Manage and view details about this asset.
              </p>
            </div>

            <Tabs
              defaultValue="edit"
              className="mt-4 space-y-4"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "edit" | "addLog" | "logs")
              }
            >
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="addLog">Add Log</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={editFormData.name}
                      className="col-span-3"
                      onChange={(e) =>
                        handleEditInputChange("name", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={editFormData.description}
                      className="col-span-3"
                      rows={3}
                      onChange={(e) =>
                        handleEditInputChange("description", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="longitude" className="text-right">
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={editFormData.lng}
                      className="col-span-3"
                      onChange={(e) =>
                        handleEditInputChange("lng", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="latitude" className="text-right">
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={editFormData.lat}
                      className="col-span-3"
                      onChange={(e) =>
                        handleEditInputChange("lat", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    type="submit"
                    onClick={handleUpdateAsset}
                    disabled={!editFormData.name.trim() || isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Save changes"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="addLog">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="log-type" className="text-right">
                      Log Type *
                    </Label>
                    <Input
                      id="log-type"
                      placeholder="Enter log type"
                      value={newLog.type}
                      className="col-span-3"
                      onChange={(e) =>
                        setNewLog((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="log-description" className="text-right">
                      Description *
                    </Label>
                    <Textarea
                      id="log-description"
                      placeholder="Enter log description"
                      rows={4}
                      value={newLog.description}
                      className="col-span-3"
                      onChange={(e) =>
                        setNewLog((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="log-technician" className="text-right">
                      Technician *
                    </Label>
                    <Input
                      id="log-technician"
                      placeholder="Enter technician name"
                      value={newLog.technician}
                      className="col-span-3"
                      onChange={(e) =>
                        setNewLog((prev) => ({
                          ...prev,
                          technician: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("logs")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLog}
                    disabled={
                      !newLog.type || !newLog.description || !newLog.technician
                    }
                  >
                    Add Log
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="logs">
                <div className="my-4 h-72 space-y-3 overflow-y-auto rounded-md border p-1">
                  {currentAssetLogs.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No logs found for this asset.
                    </div>
                  ) : (
                    currentAssetLogs.map((log) => (
                      <Card key={log.id} className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
                              {log.type}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {log.date}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            by {log.technician}
                          </span>
                        </div>
                        <p className="break-words text-sm leading-relaxed">
                          {log.description}
                        </p>
                      </Card>
                    ))
                  )}
                </div>
                <div className="flex flex-shrink-0 justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("addLog")}
                  >
                    Add New Log
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("edit")}
                  >
                    Back
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteAssetDialog}
        onClose={() => setDeleteAssetDialog(false)}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Delete Asset
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this asset? This action cannot
                be undone.
              </p>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
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
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
