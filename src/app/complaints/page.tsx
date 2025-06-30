"use client";

import { useState, useEffect, useMemo } from 'react';
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
import { isDateInMonthYear } from '@/src/lib/utils';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reviewed' | 'to_review'>('all');

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

  useEffect(() => {
    fetchComplaints();
  }, []);

  function handleRefresh() {
    fetchComplaints();
  }

  const filteredComplaints = useMemo(() => {
    switch (filter) {
      case 'reviewed':
        return complaints.filter(complaint => complaint.reviewed);
      case 'to_review':
        return complaints.filter(complaint => !complaint.reviewed);
      default:
        return complaints;
    }
  }, [complaints, filter]);

  // Current month/year
  const now = new Date();
  const currentMonth = 5; // June (0-indexed)
  const currentYear = 2025;

  // Stats logic
  const totalComplaints = complaints.filter(c => isDateInMonthYear(c.createdAt, currentMonth, currentYear)).length;
  const toReviewCount = complaints.filter(c => c.reviewed === false).length;
  const reviewedCount = complaints.filter(c => c.reviewed === true).length;


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

        {/* Stats for this month */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stats for this month</h2>
        </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Complaints this month */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    Total Complaints
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-600">
                    {totalComplaints}
                  </CardTitle>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* To Review (reviewed === false, all time) */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-sm font-medium text-gray-600">
                    To Review
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-gray-600">
                    {toReviewCount}
                  </CardTitle>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviewed */}
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