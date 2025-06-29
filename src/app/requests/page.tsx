"use client";

import React from 'react';
import { FileText, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestsTable } from '@/src/components/requests/requests-table';
import { EquipmentRequest } from '@/src/types/request';
import Link from 'next/link';

export default function RequestsPage() {
  const [requests, setRequests] = React.useState<EquipmentRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  async function fetchRequests() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/requests');
      if (!response.ok) {
        throw new Error('Failed to fetch equipment requests');
      }
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching equipment requests:', error);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchRequests();
  }, []);

  function handleRefresh() {
    fetchRequests();
  }

  // Helper: check if date is in current month/year
  const isThisMonth = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getFullYear() === 2025 && d.getMonth() === 5; // June is 5 (0-indexed)
  };

  const requestsThisMonth = requests.filter(req => req.startDate && isThisMonth(req.startDate));
  const totalThisMonth = requestsThisMonth.length;
  const approvedCount = requestsThisMonth.filter(req => req.status === 'approved').length;
  const deniedCount = requestsThisMonth.filter(req => req.status === 'denied').length;
  const pendingCount = requests.filter(req => req.status === 'pending').length; // unchanged, per user request

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/inventory">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inventory
                  </Button>
                </Link>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Equipment Requests
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Review and manage equipment requests from staff
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
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Total Requests this month
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {totalThisMonth}
                  </CardTitle>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Pending
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600">
                    {pendingCount}
                  </CardTitle>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Approved Requests this month
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {approvedCount}
                  </CardTitle>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Denied Requests this month
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-red-600">
                    {deniedCount}
                  </CardTitle>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              All Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <CardDescription className="ml-2 text-gray-600">
                  Loading requests...
                </CardDescription>
              </div>
            ) : (
              <RequestsTable
                requests={requests}
                onRequestUpdated={fetchRequests}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}