"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, MapPin, Package, MoreHorizontal } from "lucide-react"

interface Asset {
  id: string
  name: string
  description: string
  lng: number
  lat: number
  color: string
}

interface AssetsSidebarProps {
  assets: Asset[]
  currentAsset: Asset | null
  onAssetSelect: (asset: Asset) => void
  onAssetDelete: (assetId: string) => void
}

export default function AssetsSidebar({ assets, currentAsset, onAssetSelect, onAssetDelete }: AssetsSidebarProps) {
  function handleAssetClick(asset: Asset, e: React.MouseEvent) {
    // Only select asset if not clicking on dropdown trigger
    const target = e.target as HTMLElement;
    const isDropdownTrigger = target.closest('[data-dropdown-trigger]');
    
    if (!isDropdownTrigger) {
      onAssetSelect(asset);
    }
  }

  function handleDeleteClick(assetId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onAssetDelete(assetId);
  }

  return (
    <div className="bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="px-6 py-6 border-b border-gray-50">
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
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No assets yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Click anywhere on the map to add your first asset and start managing your infrastructure.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`group relative bg-white border rounded-xl px-4 py-2 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                  currentAsset?.id === asset.id
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-gray-100"
                }`}
                onClick={(e) => handleAssetClick(asset, e)}
              >
                {/* Asset Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate mb-2">{asset.name}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{asset.description}</p>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        onClick={(e) => handleDeleteClick(asset.id, e)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Location Info */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-xs">
                      {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs bg-gray-50 text-gray-600 hover:bg-gray-100">
                    asset
                  </Badge>
                </div>

                {/* Subtle hover indicator */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-blue-100 transition-all duration-200 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {assets.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500 text-center">Click an asset to highlight it on the map</p>
        </div>
      )}
    </div>
  )
}