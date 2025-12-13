import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Upload,
  Menu,
  Mail,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { StaffQRScanner } from "../components/ui/StaffQRScanner";
import OfferUpload from "../components/ui/OfferUpload";
import MenuUpload from "../components/ui/MenuUpload";
import { ContactMessages } from "../components/ui/ContactMessages";
import { useAuth } from "../context/authContext";

export const StaffDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "stats" | "scanner" | "offers" | "menu" | "messages"
  >("stats");

  useEffect(() => {
    // Check if user is authenticated
    if (!token && !localStorage.getItem("token")) {
      setError("Please login first to view statistics");
      setLoading(false);
      return;
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/rewards/stats/summary");
      setStats(response.data);
    } catch (error: any) {
      // Handle different error types
      if (error.response?.status === 401) {
        setError("Your session expired. Please login again.");
        // Clear token and redirect to login
        localStorage.removeItem("token");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view statistics");
      } else if (!error.response) {
        setError("Network error. Is the backend running?");
      } else {
        const errorMsg =
          error.response?.data?.message ||
          error.message ||
          "Failed to load statistics";
        setError(errorMsg);
      }
      console.error("Failed to fetch stats:", error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Staff Dashboard
          </h1>
          <p className="text-gray-600">
            Manage customer rewards and scan redemptions
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              activeTab === "stats"
                ? "bg-amber-500 text-white shadow-lg"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </div>
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              activeTab === "scanner"
                ? "bg-amber-500 text-white shadow-lg"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Scan Rewards
            </div>
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              activeTab === "offers"
                ? "bg-amber-500 text-white shadow-lg"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Offers
            </div>
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              activeTab === "menu"
                ? "bg-amber-500 text-white shadow-lg"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              Upload Menu
            </div>
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              activeTab === "messages"
                ? "bg-amber-500 text-white shadow-lg"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Messages
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === "stats" && (
          <div>
            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="inline-block animate-spin">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full" />
                </div>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Rewards */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">
                        Total Rewards
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats.total}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-amber-500" />
                  </div>
                </div>

                {/* Redeemed */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">
                        Redeemed
                      </p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {stats.redeemed}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.redemptionRate} rate
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                {/* Pending */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">
                        Pending
                      </p>
                      <p className="text-3xl font-bold text-blue-600 mt-2">
                        {stats.pending}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                {/* Expired */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">
                        Expired
                      </p>
                      <p className="text-3xl font-bold text-red-600 mt-2">
                        {stats.expired}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-red-600 mb-4">
                  <p className="font-semibold text-lg">
                    Error Loading Statistics
                  </p>
                  <p className="text-sm mt-2">{error}</p>
                </div>
                <button
                  onClick={fetchStats}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-600">
                No statistics available
              </div>
            )}
          </div>
        )}

        {activeTab === "scanner" && (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <StaffQRScanner
                onRewardRedeemed={() => {
                  // Refresh stats
                  setTimeout(fetchStats, 1000);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <OfferUpload />
          </div>
        )}

        {activeTab === "menu" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <MenuUpload />
          </div>
        )}

        {activeTab === "messages" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <ContactMessages />
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
