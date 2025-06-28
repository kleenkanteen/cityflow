"use client";

import React from 'react';
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
import { MoreHorizontal, Search, Check, X } from 'lucide-react';
import { EquipmentRequest } from '@/src/types/request';
import { DenyRequestDialog } from './deny-request-dialog';

interface RequestsTableProps {
  requests: EquipmentRequest[];
  onRequestUpdated: () => void;
}

export function RequestsTable({ requests, onRequestUpdated }: RequestsTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [denyingRequest, setDenyingRequest] = React.useState<EquipmentRequest | null>(null);

  const filteredRequests = React.useMemo(() => {
    if (!searchTerm) return requests;
    
    return requests.filter(
      (request) =>
        request.requestorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.inventoryItemName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  async function handleApproveRequest(id: string) {
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve request');
      }

      onRequestUpdated();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Search requests"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requestor Email</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <CardDescription>
                    {searchTerm ? 'No requests found matching your search.' : 'No equipment requests found.'}
                  </CardDescription>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.requestorEmail}</TableCell>
                  <TableCell>{request.inventoryItemName}</TableCell>
                  <TableCell className="text-right">{request.quantity}</TableCell>
                  <TableCell>{formatDate(request.startDate)}</TableCell>
                  <TableCell>{formatDate(request.endDate)}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    {request.status === 'pending' ? (
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
                          <DropdownMenuItem
                            onClick={() => handleApproveRequest(request.id)}
                            className="flex items-center gap-2 text-green-600"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDenyingRequest(request)}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <X className="h-4 w-4" />
                            Deny
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-gray-400 text-sm">No actions</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {denyingRequest && (
        <DenyRequestDialog
          request={denyingRequest}
          open={!!denyingRequest}
          onOpenChange={(open) => !open && setDenyingRequest(null)}
          onRequestUpdated={() => {
            setDenyingRequest(null);
            onRequestUpdated();
          }}
        />
      )}
    </div>
  );
}