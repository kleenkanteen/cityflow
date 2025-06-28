"use client";

import React from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddItemDialog } from '@/src/components/inventory/add-item-dialog';
import { InventoryTable } from '@/src/components/inventory/inventory-table';
import { InventoryItem } from '@/src/types/inventory';

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  async function fetchItems() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchItems();
  }, []);

  function handleRefresh() {
    fetchItems();
  }

  const lowStockCount = items.filter(item => item.quantity <= 5).length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Inventory Management
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Track and manage your inventory items
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <AddItemDialog onItemAdded={fetchItems} />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Total Items
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {items.length}
                  </CardTitle>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Total Quantity
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {totalQuantity}
                  </CardTitle>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Low Stock Items
                  </CardDescription>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {lowStockCount}
                    </CardTitle>
                    {lowStockCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Alert
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <CardDescription className="ml-2 text-gray-600">
                  Loading inventory...
                </CardDescription>
              </div>
            ) : (
              <InventoryTable
                items={items}
                onItemUpdated={fetchItems}
                onItemDeleted={fetchItems}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}