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
    <div className="bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
      {/* Sidebar Header */}
      <div className="px-6 py-5 border-t border-gray-50 bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
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
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center mt-8">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-blue-600 bg-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No assets yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Click anywhere on the map to add your first asset and start managing your infrastructure.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`group relative bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  currentAsset?.id === asset.id
                    ? "border-blue-200 bg-blue-50/50 shadow-sm ring-1 ring-blue-100"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                }`}
                onClick={() => onAssetSelect(asset)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: asset.color }}
                        />
                        <h3 className="font-medium text-gray-900 truncate text-sm">
                          {asset.name}
                        </h3>
                      </div>
                      
                      {asset.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                          {asset.description}
                        </p>
                      )}
                      
                      <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span className="font-mono">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 ml-3 flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {assets.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
          <p className="text-xs text-gray-500 text-center">
            Click an asset to highlight it on the map
          </p>
        </div>
      )}
    </div>
  );
}