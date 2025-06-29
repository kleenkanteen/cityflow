"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Package, User, Hash, CheckCircle, ArrowLeft, ChevronDownIcon } from "lucide-react";


import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Combobox,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from "@headlessui/react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { InventoryItem } from "@/src/types/inventory";
import Link from "next/link";

const formSchema = z.object({
    requestorEmail: z.string().email("Please enter a valid email address"),
    inventoryId: z.string().min(1, "Please select an equipment item"),
    quantity: z
        .number()
        .min(1, "Quantity must be at least 1")
        .int("Quantity must be a whole number"),
    dateRange: z
        .object({
            from: z.date({ required_error: "Start date is required" }),
            to: z.date({ required_error: "End date is required" }),
        })
        .refine((data) => data.to > data.from, {
            message: "End date must be after start date",
            path: ["to"],
        }),
});

type FormData = z.infer<typeof formSchema>;

export default function RequestEquipmentPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [startDateOpen, setStartDateOpen] = useState(false)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [endDateOpen, setEndDateOpen] = useState(false)

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            requestorEmail: "",
            inventoryId: "",
            quantity: 1,
            dateRange: undefined,
        },
    });

    useEffect(() => {
        async function fetchItems() {
            try {
                const response = await fetch("/api/inventory");
                if (!response.ok) {
                    throw new Error("Failed to fetch inventory items");
                }
                const data = await response.json();
                setItems(data);
            } catch (error) {
                console.error("Error fetching inventory items:", error);
            }
        }

        fetchItems();
    }, []);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description &&
                    item.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
        );
    }, [items, searchTerm]);

    async function handleSubmit(data: FormData) {
        setIsLoading(true);
        try {
            const selectedItem = items.find(
                (item) => item.id === data.inventoryId
            );
            if (!selectedItem) {
                throw new Error("Selected item not found");
            }

            const requestData = {
                requestorEmail: data.requestorEmail,
                inventoryId: data.inventoryId,
                inventoryItemName: selectedItem.name,
                quantity: data.quantity,
                startDate: data.dateRange.from,
                endDate: data.dateRange.to,
            };

            const response = await fetch("/api/requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit request");
            }

            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting request:", error);
        } finally {
            setIsLoading(false);
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Request Submitted!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your equipment request has been submitted
                                successfully. You'll receive an email
                                notification once it's reviewed.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        form.reset();
                                    }}
                                    className="w-full"
                                >
                                    Submit Another Request
                                </Button>
                                <Link href="/">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Back to Home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="mb-4 flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Package className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-3xl font-bold text-gray-900">
                                        Request Equipment
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 mt-1">
                                        Submit a request to rent equipment for
                                        your project
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            Equipment Rental Request
                        </CardTitle>
                        <CardDescription>
                            Fill out the form below to request equipment rental.
                            All fields are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className="space-y-6"
                            >
                                {/* Requestor Email */}
                                <FormField
                                    control={form.control}
                                    name="requestorEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Your Email Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your email address"
                                                    type="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Equipment Selection */}
                                <FormField
                                    control={form.control}
                                    name="inventoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Select Equipment
                                            </FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    as="div"
                                                >
                                                    {({ open }) => (
                                                        <div className="space-y-2">
                                                            <ComboboxInput
                                                                className="mb-2 w-full border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                                                placeholder="Search equipment..."
                                                                displayValue={(
                                                                    id: string
                                                                ) => {
                                                                    const selected =
                                                                        items.find(
                                                                            (
                                                                                item
                                                                            ) =>
                                                                                item.id ===
                                                                                id
                                                                        );
                                                                    return selected
                                                                        ? selected.name
                                                                        : "";
                                                                }}
                                                                onChange={(e) =>
                                                                    setSearchTerm(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                            <ComboboxOptions
                                                                className="z-10 w-full rounded-md bg-popover py-1 text-popover-foreground shadow-lg ring-1 ring-black/5 focus:outline-none"
                                                                static={open}
                                                            >
                                                                {isLoading &&
                                                                open ? (
                                                                    <div className="flex items-center justify-center p-3">
                                                                        <svg
                                                                            className="animate-spin h-5 w-5 text-muted-foreground"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <circle
                                                                                className="opacity-25"
                                                                                cx="12"
                                                                                cy="12"
                                                                                r="10"
                                                                                stroke="currentColor"
                                                                                strokeWidth="4"
                                                                                fill="none"
                                                                            />
                                                                            <path
                                                                                className="opacity-75"
                                                                                fill="currentColor"
                                                                                d="M4 12a8 8 0 018-8v8z"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                ) : filteredItems.length ===
                                                                  0 ? (
                                                                    <div className="p-2 text-sm text-gray-500">
                                                                        {searchTerm
                                                                            ? "No equipment found matching your search"
                                                                            : "No equipment available"}
                                                                    </div>
                                                                ) : (
                                                                    filteredItems.map(
                                                                        (
                                                                            item
                                                                        ) => (
                                                                            <ComboboxOption
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                                value={
                                                                                    item.id
                                                                                }
                                                                                className={({
                                                                                    active,
                                                                                    selected,
                                                                                }) =>
                                                                                    `cursor-pointer select-none px-4 py-2 rounded flex flex-col gap-0.5 ${
                                                                                        active
                                                                                            ? "bg-accent text-accent-foreground"
                                                                                            : ""
                                                                                    } ${
                                                                                        selected
                                                                                            ? "font-semibold"
                                                                                            : ""
                                                                                    }`
                                                                                }
                                                                            >
                                                                                <span className="font-medium">
                                                                                    {
                                                                                        item.name
                                                                                    }
                                                                                </span>
                                                                                {item.description && (
                                                                                    <span className="text-xs text-gray-500 truncate">
                                                                                        {
                                                                                            item.description
                                                                                        }
                                                                                    </span>
                                                                                )}
                                                                                <span className="text-xs text-green-600">
                                                                                    {
                                                                                        item.quantity
                                                                                    }{" "}
                                                                                    available
                                                                                </span>
                                                                            </ComboboxOption>
                                                                        )
                                                                    )
                                                                )}
                                                            </ComboboxOptions>
                                                        </div>
                                                    )}
                                                </Combobox>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Quantity */}
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Hash className="h-4 w-4" />
                                                Quantity Needed
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Enter quantity"
                                                    {...field}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            parseInt(
                                                                e.target.value,
                                                                10
                                                            )
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Start Date */}
                                <FormField
                                    control={form.control}
                                    name="dateRange.from"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col gap-3">
                                            <Label htmlFor="start-date" className="px-1">
                                                Start Date
                                            </Label>
                                            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        id="start-date"
                                                        className="w-48 justify-between font-normal"
                                                    >
                                                        {field.value
                                                            ? field.value.toLocaleDateString()
                                                            : "Select date"}
                                                        <ChevronDownIcon />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto overflow-hidden p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        captionLayout="dropdown"
                                                        onSelect={(date) => {
                                                            field.onChange(date)
                                                            setStartDate(date)
                                                            setStartDateOpen(false)
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* End Date */}
                                <FormField
                                    control={form.control}
                                    name="dateRange.to"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col gap-3">
                                            <Label htmlFor="end-date" className="px-1">
                                                End Date
                                            </Label>
                                            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        id="end-date"
                                                        className="w-48 justify-between font-normal"
                                                    >
                                                        {field.value
                                                            ? field.value.toLocaleDateString()
                                                            : "Select date"}
                                                        <ChevronDownIcon />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto overflow-hidden p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        captionLayout="dropdown"
                                                        onSelect={(date) => {
                                                            field.onChange(date)
                                                            setEndDate(date)
                                                            setEndDateOpen(false)
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoading
                                            ? "Submitting Request..."
                                            : "Submit Equipment Request"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            What happens next?
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                Your request will be reviewed by our office
                                staff
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                You'll receive an email notification with the
                                decision
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                If approved, pickup instructions will be
                                provided
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
