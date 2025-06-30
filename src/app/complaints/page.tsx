"use client";

import React from 'react';
import { MessageSquare, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComplaintsTable } from '@/src/components/complaints/complaints-table';
import { Complaint } from '@/src/types/complaint';
import Link from 'next/link';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'reviewed' | 'to_review'>('all');

  async function fetchComplaints() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/complaints');
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetchComplaints();
  }, []);

  function handleRefresh() {
    fetchComplaints();
  }

  const filteredComplaints = React.useMemo(() => {
    switch (filter) {
      case 'reviewed':
        return complaints.filter(complaint => complaint.reviewed);
      case 'to_review':
        return complaints.filter(complaint => !complaint.reviewed);
      default:
        return complaints;
    }
  }, [complaints, filter]);

  const totalComplaints = complaints.length;
  const reviewedCount = complaints.filter(c => c.reviewed).length;
  const toReviewCount = complaints.filter(c => !c.reviewed).length;
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    Customer Complaints
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Review and manage customer complaints
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Total Complaints
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {totalComplaints}
                  </CardTitle>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    To Review
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-orange-600">
                    {toReviewCount}
                  </CardTitle>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Reviewed
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {reviewedCount}
                  </CardTitle>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
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
                  <CardTitle className="text-2xl font-bold text-gray-600">
                    {pendingCount}
                  </CardTitle>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    In Progress
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-blue-600">
                    {inProgressCount}
                  </CardTitle>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Resolved
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {resolvedCount}
                  </CardTitle>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                All Complaints
              </CardTitle>
              <div className="flex items-center gap-2">
                <label htmlFor="filter-select" className="text-sm font-medium text-gray-700">
                  Filter:
                </label>
                <Select value={filter} onValueChange={(value: 'all' | 'reviewed' | 'to_review') => setFilter(value)}>
                  <SelectTrigger className="w-[180px]" id="filter-select">
                    <SelectValue placeholder="Filter complaints" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Complaints</SelectItem>
                    <SelectItem value="to_review">To Review</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                <CardDescription className="ml-2 text-gray-600">
                  Loading complaints...
                </CardDescription>
              </div>
            ) : (
              <ComplaintsTable
                complaints={filteredComplaints}
                onComplaintUpdated={fetchComplaints}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}