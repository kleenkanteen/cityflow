"use client";

import React, { useState } from "react";
import AssetsSidebar from "@/src/lib/components/assets-sidebar";
import { Map as MapLibreMap } from "maplibre-gl";
import ManageAssetsMap, {
  MapInfo,
} from "@/src/lib/components/manage-assets-map";

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

  function handleAssetsChange(newAssets: Asset[]) {
    setAssets(newAssets);
  }

  return (
    <div className="flex w-full h-screen">
      <div className="w-1/5 h-full">
        <AssetsSidebar
          assets={assets}
          onAssetsChange={handleAssetsChange}
        />
      </div>
      <div className="w-4/5 h-full">
        <ManageAssetsMap
          onInit={(map) => setMap(map)}
          onMove={(info) => setMapInfo(info)}
          assets={assets}
          onAssetsChange={handleAssetsChange}
        />
      </div>
    </div>
  );
}