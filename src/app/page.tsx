import React from "react";
import {
  MapPin,
  Wrench,
  Package,
  MessageSquare,
  Bot,
  Calendar,
  CheckCircle,
  Users,
  ArrowRight,
  Play,
  Star,
  Shield,
  DollarSign,
  Clock,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CityFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#case-studies"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Case Studies
              </a>
              <Link href="/login">
                <button className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2">
                  Log In
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Powerful Asset Management.
              <span className="text-blue-600 block">
                Built for Cities That Can't Break the Bank.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track assets, manage repairs, log complaints, and stay organized —
              all in one intuitive platform designed specifically for public
              works departments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Get Started</span>
                </button>
              </Link>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Watch How It Works</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stop juggling multiple systems. CityFlow brings all your asset
              management needs together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Interactive Map */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Interactive Map Interface
              </h3>
              <p className="text-gray-600 mb-4">
                See assets like streetlights, water lines, and roads in
                customizable map layers. Drop pins, inspect field jobs, and link
                repairs to assets instantly.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Visual asset tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Custom map layers
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Field job integration
                </li>
              </ul>
            </div>

            {/* Repair & Maintenance */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Wrench className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Repair & Maintenance Logs
              </h3>
              <p className="text-gray-600 mb-4">
                Click an asset and add a repair log instantly. Track job types,
                inventory used, and complete maintenance history with photos and
                notes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  One-click repair logging
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Photo documentation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Historical tracking
                </li>
              </ul>
            </div>

            {/* Inventory Management */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Inventory Management
              </h3>
              <p className="text-gray-600 mb-4">
                Avoid surprise stockouts. Track hydrant meters, valves, and
                more. Borrowing request system for contractors with expected
                return dates.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time stock levels
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Contractor borrowing system
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automatic reorder alerts
                </li>
              </ul>
            </div>

            {/* Resident Complaints */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Resident Complaint System
              </h3>
              <p className="text-gray-600 mb-4">
                Let residents drop a pin, attach media, and submit issues. Teams
                get notified, assign work, and automatically notify residents
                when complete.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Citizen portal
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Auto notifications
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Media attachments
                </li>
              </ul>
            </div>

            {/* AI Assistant */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Bot className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Built-in AI Assistant
              </h3>
              <p className="text-gray-600 mb-4">
                Coming soon: An AI receptionist that helps answer calls, explain
                ticket statuses, and create new tickets automatically.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  24/7 call handling
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automatic ticket creation
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Status updates
                </li>
              </ul>
            </div>

            {/* Team Collaboration */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="bg-teal-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Team Collaboration
              </h3>
              <p className="text-gray-600 mb-4">
                Keep everyone on the same page with role-based access, team
                assignments, and real-time updates across all departments.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Role-based permissions
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time updates
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Department integration
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Not CityWorks or Brightly?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We built CityFlow because existing solutions are either too
              expensive or too complicated for most cities.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                    CityFlow
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    CityWorks
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    Brightly
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">Starting Price</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">
                      $299/month
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    $2,000+/month
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    $1,500+/month
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">Setup Time</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">
                      1-2 weeks
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    6+ months
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    3-6 months
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">Training Required</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-green-600 font-semibold">
                      Minimal
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    Extensive
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    Moderate
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 flex items-center">
                    <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">Citizen Portal</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600">Add-on cost</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600">Limited</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl text-white font-medium mb-8">
            "insert testimonial here..."
          </blockquote>
          <div className="text-blue-100">
            <p className="font-semibold">Mike Johnson</p>
            <p>Public Works Director, City of Evans</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built by people who listened.
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            See why cities like Evans are searching for something better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Get Started</span>
              </button>
            </Link>
            <button className="border-2 border-gray-400 text-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-800 hover:border-gray-300 transition-all flex items-center justify-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>View Case Study</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">CityFlow</span>
            </div>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 CityFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
