"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Plus, Edit } from "lucide-react";
import * as Dialogs from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

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
  title: string;
  type: string;
  description: string;
  technician: string;
  createdAt: string;
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
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [newLog, setNewLog] = useState({
    title: "",
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
  // Sheet state for asset management
  const [isAssetSheetOpen, setIsAssetSheetOpen] = useState(false);

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

  async function handleEditClick(asset: Asset) {
    console.log("Edit button clicked, opening sheet for asset:", asset.name);
    setAssetToEdit(asset);
    setEditFormData({
      name: asset.name,
      description: asset.description || "",
      lng: asset.lng.toString(),
      lat: asset.lat.toString(),
    });
    setIsAssetSheetOpen(true);
    setActiveTab("edit");
    
    // Fetch logs for this asset
    await fetchLogsForAsset(asset.id);
    console.log("Sheet opened");
  }

  async function fetchLogsForAsset(assetId: string) {
    try {
      const response = await fetch(`/api/logs?assetId=${assetId}`);
      
      if (response.ok) {
        const fetchedLogs = await response.json();
        
        // Format logs for display - mapping existing log table structure to our UI
        const formattedLogs: Log[] = fetchedLogs.map((log: any) => ({
          id: log.id,
          title: log.title,
          type: log.jobType,
          description: log.description,
          technician: log.technician,
          createdAt: new Date(log.createdAt).toLocaleDateString(),
          assetId: log.assetId,
        }));
        
        setLogs(formattedLogs);
      } else {
        console.error("Failed to fetch logs");
        setLogs([]);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
    }
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
    setIsAssetSheetOpen(false);
    setEditFormData({ name: "", description: "", lng: "", lat: "" });
    setNewLog({ title: "", type: "", description: "", technician: "" });
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

  async function handleAddLog() {
    if (
      !newLog.title ||
      !newLog.type ||
      !newLog.description ||
      !newLog.technician ||
      !assetToEdit
    )
      return;

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newLog.title,
          type: newLog.type,
          description: newLog.description,
          technician: newLog.technician,
          assetId: assetToEdit.id,
        }),
      });

      if (response.ok) {
        const { log: createdLog } = await response.json();
        
        // Add the new log to the local state - mapping from log table structure
        const formattedLog: Log = {
          id: createdLog.id,
          title: createdLog.title,
          type: createdLog.jobType,
          description: createdLog.description,
          technician: createdLog.technician,
          createdAt: createdLog.createdAt, 
          assetId: createdLog.assetId,
        };

        setLogs([...logs, formattedLog]);
        setNewLog({ title: "", type: "", description: "", technician: "" });
        toast.success("Log added successfully!");
      } else {
        const error = await response.json();
        toast.error("Failed to add log: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding log:", error);
      toast.error("Failed to add log. Please try again.");
    }
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

      {/* Delete Confirmation Dialog */}
      <Dialogs.Root
        open={deleteAssetDialog}
        onOpenChange={setDeleteAssetDialog}
      >
        <Dialogs.Portal>
          <Dialogs.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialogs.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
              <Dialogs.Title className="text-lg font-semibold leading-none tracking-tight">
                Delete Asset
              </Dialogs.Title>
              <Dialogs.Description className="text-sm text-muted-foreground">
                Are you sure you want to delete this asset? This action cannot be
                undone.
              </Dialogs.Description>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Dialogs.Close asChild>
                <Button
                  variant="outline"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </Dialogs.Close>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Dialogs.Content>
        </Dialogs.Portal>
      </Dialogs.Root>

      {/* Asset Management Sheet */}
      <Sheet open={isAssetSheetOpen} onOpenChange={setIsAssetSheetOpen}>
        <SheetContent side="left" className="max-w-7xl h-screen">
          <SheetHeader>
            <SheetTitle>Asset Management</SheetTitle>
            <SheetDescription>
              Manage details and logs for {assetToEdit?.name || "this asset"}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 flex flex-col flex-1 space-y-4">
            <Tabs
              defaultValue="edit"
              className="space-y-4"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "edit" | "addLog" | "logs")
              }
            >
              <TabsList className="flex justify-between">
                <TabsTrigger value="edit">Edit Asset</TabsTrigger>
                <TabsTrigger value="addLog">Add Log</TabsTrigger>
                <TabsTrigger value="logs">View Logs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit">
                <div className="rounded-lg border p-6">
                  <h3 className="mb-4 font-medium text-lg">Edit Asset Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        value={editFormData.name}
                        className="mt-1"
                        onChange={(e) =>
                          handleEditInputChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={editFormData.description}
                        className="mt-1"
                        rows={3}
                        onChange={(e) =>
                          handleEditInputChange("description", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="longitude" className="text-sm font-medium">
                          Longitude *
                        </Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={editFormData.lng}
                          className="mt-1"
                          onChange={(e) =>
                            handleEditInputChange("lng", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="latitude" className="text-sm font-medium">
                          Latitude *
                        </Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={editFormData.lat}
                          className="mt-1"
                          onChange={(e) =>
                            handleEditInputChange("lat", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateAsset}
                        disabled={!editFormData.name.trim() || isUpdating}
                      >
                        {isUpdating ? "Updating..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="addLog">
                <div className="rounded-lg border p-6">
                  <h3 className="mb-4 font-medium text-lg">Add New Log</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="log-title" className="text-sm font-medium">
                        Title *
                      </Label>
                      <Input
                        id="log-title"
                        placeholder="Enter log title"
                        value={newLog.title}
                        className="mt-1"
                        onChange={(e) =>
                          setNewLog((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="log-type" className="text-sm font-medium">
                        Log Type *
                      </Label>
                      <Select
                        value={newLog.type.substring(0,1).toUpperCase() + newLog.type.substring(1)}
                        onValueChange={(value) =>
                          setNewLog((prev) => ({
                            ...prev,
                            type: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select log type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="upgrade">Upgrade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="log-description" className="text-sm font-medium">
                        Description *
                      </Label>
                      <Textarea
                        id="log-description"
                        placeholder="Enter log description"
                        rows={4}
                        value={newLog.description}
                        className="mt-1"
                        onChange={(e) =>
                          setNewLog((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="log-technician" className="text-sm font-medium">
                        Technician/Supervisor *
                      </Label>
                      <Input
                        id="log-technician"
                        placeholder="Enter technician name"
                        value={newLog.technician}
                        className="mt-1"
                        onChange={(e) =>
                          setNewLog((prev) => ({
                            ...prev,
                            technician: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("logs")}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddLog}
                        disabled={
                          !newLog.title ||
                          !newLog.type ||
                          !newLog.description ||
                          !newLog.technician
                        }
                      >
                        Add Log
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="logs">
                <div className="rounded-lg border p-6">
                  <h3 className="mb-4 font-medium text-lg">
                    Asset Logs ({currentAssetLogs.length})
                  </h3>
                  <div className="max-h-[500px] space-y-3 overflow-y-auto">
                    {currentAssetLogs.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground">
                        <p>No logs found for this asset.</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setActiveTab("addLog")}
                        >
                          Add First Log
                        </Button>
                      </div>
                    ) : (
                      currentAssetLogs.map((log: Log) => (
                        <Card key={log.id} className="p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-primary/10 pr-2 py-1 text-sm font-semibold text-primary">
                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              by {log.technician}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-2">{log.title}</h4>
                          <p className="break-words text-sm leading-relaxed">
                            {log.description}
                          </p>
                        </Card>
                      ))
                    )}
                  </div>
                  {currentAssetLogs.length > 0 && (
                    <div className="flex justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("addLog")}
                      >
                        Add New Log
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
