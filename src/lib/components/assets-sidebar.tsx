"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin, Package } from "lucide-react";

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
  onAssetDelete,
}: AssetsSidebarProps) {
  return (
    <div className="bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="px-6 py-5 border-b border-gray-50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
            <p className="text-sm text-gray-500">{assets.length} total</p>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto">
        {assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No assets yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Click anywhere on the map to add your first asset and start managing your infrastructure.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`group relative bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  currentAsset?.id === asset.id
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-gray-100 hover:border-gray-200"
                }`}
                onClick={() => onAssetSelect(asset)}
              >
                <div className="p-4">
                  {/* Header with title and category */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {asset.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        asset
                      </span>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssetDelete(asset.id);
                        }}
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 hover:bg-red-50 h-7 w-7 p-0 flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {asset.description && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {asset.description}
                    </p>
                  )}
                  
                  {/* Location coordinates */}
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="font-mono">
                      {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {assets.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-500 text-center">
            Click an asset to highlight it on the map
          </p>
        </div>
      )}
    </div>
  );
}