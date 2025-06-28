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
  const [tileBoundaries, setTileBoundaries] = useState<boolean>(false);
  const [shards, setShards] = useState<object | null>(null);
  const [showShards, setShowShards] = useState<boolean>(false);

  //   const [assets, setAssets] = useState<Asset[]>([]);
  //   const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  //   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  //   const [assetToDelete, setAssetToDelete] = useState<string | null>(null);

  //   function handleAssetsChange(newAssets: Asset[]) {
  //     setAssets(newAssets);
  //     // If current asset was deleted, clear selection
  //     if (currentAsset && !newAssets.find((a) => a.id === currentAsset.id)) {
  //       setCurrentAsset(null);
  //     }
  //   }

  //   function handleAssetSelect(asset: Asset) {
  //     setCurrentAsset(asset);
  //   }

  //   function handleAssetDelete(assetId: string) {
  //     setAssetToDelete(assetId);
  //     setIsDeleteDialogOpen(true);
  //   }

  //   function handleConfirmDelete() {
  //     if (assetToDelete) {
  //       const updatedAssets = assets.filter(
  //         (asset) => asset.id !== assetToDelete
  //       );
  //       setAssets(updatedAssets);

  //       // Clear current asset if it was deleted
  //       if (currentAsset?.id === assetToDelete) {
  //         setCurrentAsset(null);
  //       }

  //       setAssetToDelete(null);
  //     }
  //     setIsDeleteDialogOpen(false);
  //   }

  //   function handleCancelDelete() {
  //     setAssetToDelete(null);
  //     setIsDeleteDialogOpen(false);
  //   }

  return (
    <div className="flex w-full h-screen">
      <div className="w-1/5 h-full">
        <div className="flex flex-col items-center justify-center pt-4">
          <h2 className="text-2xl font-bold">Assets</h2>
        </div>
      </div>
      <div className="w-4/5 h-full">
        <ManageAssetsMap
          onInit={(map) => setMap(map)}
          onMove={(info) => setMapInfo(info)}
        />
      </div>
    </div>
  );
}
