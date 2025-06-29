"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MessageSquare, User, Mail, MapPin, FileText, Upload, CheckCircle, ArrowLeft, Image } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateComplaintRequest } from "@/src/types/complaint";
import { uploadComplaintImage } from "@/src/lib/supabase";
import Link from "next/link";

const formSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(5, "Please provide a specific location"),
    image: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function SubmitComplaintPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            description: "",
            location: "",
        },
    });

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleRemoveImage() {
        setImageFile(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    async function handleSubmit(data: FormData) {
        setIsLoading(true);
        try {
            let imageUrl: string | undefined;

            // Upload image if provided
            if (imageFile) {
                const { url, error } = await uploadComplaintImage(imageFile);
                if (error) {
                    console.error('Error uploading image:', error);
                    // Continue without image rather than failing
                } else {
                    imageUrl = url || undefined;
                }
            }

            const requestData: CreateComplaintRequest = {
                name: data.name || undefined,
                email: data.email || undefined,
                description: data.description,
                location: data.location,
                imageUrl,
            };

            const response = await fetch("/api/complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit complaint");
            }

            setIsSubmitted(true);
        } catch (error) {
            console.error("Error submitting complaint:", error);
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
                                Complaint Submitted!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your complaint has been submitted successfully. Our team will review it and take appropriate action.
                                {form.getValues("email") && " You'll receive email notifications about the progress."}
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        form.reset();
                                        setImageFile(null);
                                        setImagePreview(null);
                                    }}
                                    className="w-full"
                                >
                                    Submit Another Complaint
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
                                    <MessageSquare className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-3xl font-bold text-gray-900">
                                        Submit a Complaint
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 mt-1">
                                        Report an issue in your community and we'll address it
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
                            Complaint Details
                        </CardTitle>
                        <CardDescription>
                            Fill out the form below to report an issue. Description and location are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(handleSubmit)}
                                className="space-y-6"
                            >
                                {/* Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Your Name (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Your Email (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your email address"
                                                    type="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <p className="text-sm text-gray-500">
                                                You will get notifications for the job here if provided
                                            </p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Description *
                                            </FormLabel>
                                            <FormControl>
                                                <textarea
                                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    placeholder="Describe the issue in detail..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Location */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Location *
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter the specific location (e.g., 123 Main St, near the park)"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        <Image className="h-4 w-4" />
                                        Photo (Optional)
                                    </label>
                                    
                                    {!imagePreview ? (
                                        <div className="flex items-center justify-center w-full">
                                            <label
                                                htmlFor="image-upload"
                                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> a photo
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                                                </div>
                                                <input
                                                    id="image-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={handleRemoveImage}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isLoading
                                            ? "Submitting Complaint..."
                                            : "Submit Complaint"}
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
                                Your complaint will be reviewed by our team
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                We'll investigate and take appropriate action
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                You'll receive updates if you provided an email
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}