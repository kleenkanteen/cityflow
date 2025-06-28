"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin } from "lucide-react";

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
  currentAsset: Asset | null;
  onAssetSelect: (asset: Asset) => void;
  onAssetDelete: (assetId: string) => void;
}

export default function AssetsSidebar({ 
  assets, 
  currentAsset, 
  onAssetSelect, 
  onAssetDelete 
}: AssetsSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
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
                className={`bg-gray-50 rounded-lg p-4 border transition-all cursor-pointer ${
                  currentAsset?.id === asset.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onAssetSelect(asset)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onAssetDelete(asset.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 ml-2 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}