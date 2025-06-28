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
          <div className="flex flex-col items-center justify-center py-16 px-6 mt-8 text-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-blue-600 bg-white"/>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No assets yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Click anywhere on the map to add your first asset and start managing your infrastructure.
            </p>
          </div>
        ) : (
          <div className="flex flex-col overflow-y-auto p-4 space-y-4 pb-8">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
                  currentAsset?.id === asset.id
                    ? "border-blue-300 bg-blue-50/50 shadow-sm ring-1 ring-blue-200/50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onAssetSelect(asset)}
              >
                {/* Color indicator */}
                <div
                  className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                  style={{ backgroundColor: asset.color }}
                />

                {/* Asset Header */}
                <div className="flex items-start justify-between mb-3 px-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 px-2">{asset.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{asset.description}</p>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          onAssetDelete(asset.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Location Info */}
                <div className="flex items-center justify-between pl-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-mono text-xs">
                        {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                  >
                    asset
                  </Badge>
                </div>

                {/* Selection indicator */}
                {currentAsset?.id === asset.id && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-blue-300/30 pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {assets.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-500 text-center font-medium">Click an asset to highlight it on the map</p>
        </div>
      )}
    </div>
  )
}
