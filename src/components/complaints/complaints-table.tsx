"use client";

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CardDescription } from '@/components/ui/card';
import { MoreHorizontal, Search, Check, ExternalLink, X } from 'lucide-react';
import { Complaint } from '@/src/types/complaint';

interface ComplaintsTableProps {
  complaints: Complaint[];
  onComplaintUpdated: () => void;
}

export function ComplaintsTable({ complaints, onComplaintUpdated }: ComplaintsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComplaints = useMemo(() => {
    if (!searchTerm) return complaints;
    
    return complaints.filter(
      (complaint) =>
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (complaint.name && complaint.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (complaint.email && complaint.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [complaints, searchTerm]);

  async function handleMarkAsReviewed(id: string) {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewed: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark complaint as reviewed');
      }

      onComplaintUpdated();
    } catch (error) {
      console.error('Error marking complaint as reviewed:', error);
    }
  }

  async function handleMarkAsUnreviewed(id: string) {
    await updateReviewed(id, false);
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint status');
      }

      onComplaintUpdated();
    } catch (error) {
      console.error('Error updating complaint status:', error);
    }
  }

  async function updateReviewed(id: string, reviewed: boolean) {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint review status');
      }

      onComplaintUpdated();
    } catch (error) {
      console.error('Error updating complaint review status:', error);
    }
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-600">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-600">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Search complaints"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewed</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <CardDescription>
                    {searchTerm ? 'No complaints found matching your search.' : 'No complaints found.'}
                  </CardDescription>
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{formatDate(complaint.createdAt)}</TableCell>
                  <TableCell>{complaint.name || '-'}</TableCell>
                  <TableCell>{complaint.email || '-'}</TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="truncate" title={complaint.description}>
                      {complaint.description}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{complaint.location}</TableCell>
                  <TableCell>
                    {complaint.imageUrl ? (
                      <a
                        href={complaint.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
                      >
                        View Image
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                  <TableCell>
                    {complaint.reviewed ? (
                      <Badge variant="default" className="bg-green-600">Reviewed</Badge>
                    ) : (
                      <Badge variant="secondary">To Review</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {complaint.reviewed ? (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsUnreviewed(complaint.id)}
                            className="flex items-center gap-2 text-yellow-600"
                          >
                            <X className="h-4 w-4" />
                            Mark as Not Reviewed
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsReviewed(complaint.id)}
                            className="flex items-center gap-2 text-green-600"
                          >
                            <Check className="h-4 w-4" />
                            Mark as Reviewed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}