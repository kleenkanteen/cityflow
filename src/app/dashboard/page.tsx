"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/src/lib/auth-client";
import {
  Shield,
  Package,
  MessageSquare,
  MapPin,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/login");
      } else {
        setIsLoading(false);
      }
    }
  }, [session, isPending, router]);

  if (isLoading || isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAssetManagement = session.user.role === "asset_management";
  const isFieldStaff = session.user.role === "field_staff";

  async function signOutUser() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to login page
        },
      },
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CityFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name}
              </span>
              <Button variant="outline" onClick={signOutUser}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to CityFlow
          </h1>
          <p className="text-gray-600">
            {isAssetManagement
              ? "Manage assets, inventory, and review requests from your dashboard."
              : "Submit complaints and request equipment from your dashboard."}
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div
          className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${
            isAssetManagement ? "lg:grid-cols-3" : ""
          }`}
        >
          {/* Asset Management Staff Actions */}
          {isAssetManagement && (
            <>
              <Link href="/manage">
                <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-3">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Manage Assets</CardTitle>
                        <CardDescription>
                          View and manage assets on the map
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/complaints">
                <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-purple-100 p-3">
                        <MessageSquare className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Complaints</CardTitle>
                        <CardDescription>
                          Review and manage citizen complaints
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>

            <Link href="/inventory">
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-green-100 p-3">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Inventory</CardTitle>
                    <CardDescription>
                      Manage equipment requests
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            </Link>
            </>
          )}

          {/* Field Staff Actions */}
          {isFieldStaff && (
            <>
              <Link href="/manage">
                <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-3">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Manage Assets</CardTitle>
                        <CardDescription>
                          View and manage assets on the map
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </>
          )}
        </div>

        {/* Role Badge */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Role
                  </h3>
                  <p className="text-gray-600">
                    You are logged in as{" "}
                    <span className="font-medium">
                      {isAssetManagement
                        ? "Asset Management Staff"
                        : "Field Staff"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500 capitalize">
                    {session.user.role.replace("_", " ")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
