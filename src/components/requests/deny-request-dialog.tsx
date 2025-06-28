"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EquipmentRequest } from '@/src/types/request';

const formSchema = z.object({
  reason: z.string().min(1, 'Denial reason is required').max(500, 'Reason must be less than 500 characters'),
});

type FormData = z.infer<typeof formSchema>;

interface DenyRequestDialogProps {
  request: EquipmentRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestUpdated: () => void;
}

export function DenyRequestDialog({ request, open, onOpenChange, onRequestUpdated }: DenyRequestDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ reason: '' });
    }
  }, [open, form]);

  async function handleSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/requests/${request.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'denied',
          denialReason: data.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deny request');
      }

      onRequestUpdated();
    } catch (error) {
      console.error('Error denying request:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deny Equipment Request</DialogTitle>
          <DialogDescription>
            Please provide a reason for denying this equipment request. The requestor will be notified via email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Request Details:</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Requestor:</strong> {request.requestorEmail}</p>
            <p><strong>Item:</strong> {request.inventoryItemName}</p>
            <p><strong>Quantity:</strong> {request.quantity}</p>
            <p><strong>Period:</strong> {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Denial</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter reason for denying this request..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? 'Denying...' : 'Deny Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}