"use client";

import React, { useState } from "react";
import AssetsSidebar from "@/src/lib/components/assets-sidebar";
import { Map as MapLibreMap } from "maplibre-gl";
import { Settings, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import ManageAssetsMap with SSR disabled to prevent CSS extraction issues
const ManageAssetsMap = dynamic(
  () => import("@/src/lib/components/manage-assets-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    ),
  }
);

interface Asset {
  id: string;
  name: string;
  description: string;
  lng: number;
  lat: number;
  color: string;
}

export interface MapInfo {
  zoom: number;
  center: [number, number];
}

export default function ManagePage() {
  const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  function handleAssetsChange(newAssets: Asset[]) {
    setAssets(newAssets);
  }

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Header - Fixed at top */}
      <div className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
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
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">
                    Click anywhere on the map to add new assets • Select assets
                    to highlight them
                  </p>
                </div>
              </div>
            </div>

            {/* Asset counter */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {assets.length}
                </p>
                <p className="text-xs text-gray-500">Total Assets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex w-full flex-1">
        <div className="w-1/4 h-full">
          <AssetsSidebar
            assets={assets}
            onAssetsChange={handleAssetsChange}
          />
        </div>
        <div className="w-3/4 h-full">
          <ManageAssetsMap
            onInit={(map) => setMap(map)}
            onMove={(info) => setMapInfo(info)}
            assets={assets}
            onAssetsChange={handleAssetsChange}
          />
        </div>
      </div>
    </div>
  );
}