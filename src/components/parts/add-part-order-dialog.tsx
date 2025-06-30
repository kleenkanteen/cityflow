"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { CreatePartOrderRequest, Part } from "@/src/types/parts"
import { toast } from "sonner"

const formSchema = z.object({
  partId: z.string().min(1, "Part is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  requestReason: z.string().min(1, "Request reason is required"),
  urgencyLevel: z.enum(["low", "normal", "high", "critical"]),
  assetId: z.string().optional(),
  workOrderNumber: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface AddPartOrderDialogProps {
  batchOrderId: string
  parts: Part[]
  assets: Array<{ id: string; name: string }>
  onPartOrderAdded: () => void
}

export function AddPartOrderDialog({
  batchOrderId,
  parts,
  assets,
  onPartOrderAdded,
}: AddPartOrderDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partId: "",
      quantity: 1,
      requestReason: "",
      urgencyLevel: "normal",
      assetId: "",
      workOrderNumber: "",
    },
  })

  async function handleSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const requestData = {
        batchOrderId,
        partId: data.partId,
        quantity: data.quantity,
        requestReason: data.requestReason,
        urgencyLevel: data.urgencyLevel,
        assetId: data.assetId || undefined,
        workOrderNumber: data.workOrderNumber || undefined,
      }

      const response = await fetch("/api/part-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Failed to add part to order")
      }

      form.reset()
      setOpen(false)
      onPartOrderAdded()
      toast.success("Part added to order successfully!")
    } catch (error) {
      console.error("Error adding part to order:", error)
      toast.error("Failed to add part to order")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPart = parts.find((p) => p.id === form.watch("partId"))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Part to Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Part to Order</DialogTitle>
          <DialogDescription>
            Add a part to this batch order with quantity and details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="partId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select part" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parts.map((part) => (
                        <SelectItem key={part.id} value={part.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {part.partNumber} - {part.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {part.category} | ${part.unitPrice || "N/A"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPart && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Part Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Manufacturer:</span>{" "}
                    {selectedPart.manufacturer || "N/A"}
                  </div>
                  <div>
                    <span className="text-gray-600">Unit Price:</span> $
                    {selectedPart.unitPrice || "N/A"}
                  </div>
                  <div>
                    <span className="text-gray-600">Min Order Qty:</span>{" "}
                    {selectedPart.minimumOrderQuantity}
                  </div>
                  <div>
                    <span className="text-gray-600">Lead Time:</span>{" "}
                    {selectedPart.leadTimeDays} days
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : 1
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="urgencyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requestReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this part is needed"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Asset (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No specific asset</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workOrderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order # (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter work order number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add to Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}