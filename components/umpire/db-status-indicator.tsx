"use client";

import { useMatchStore } from "@/lib/stores/match-store";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Database status indicator - fixed position, non-disruptive
 * Shows green/yellow/red dot with timestamp
 */
export function DBStatusIndicator() {
  const { dbSaveStatus } = useMatchStore();
  const [showDetails, setShowDetails] = useState(false);

  if (!dbSaveStatus) return null;

  const getStatusColor = () => {
    switch (dbSaveStatus.status) {
      case "success":
        return "bg-green-500";
      case "saving":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = () => {
    switch (dbSaveStatus.status) {
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-white" />;
      case "saving":
        return <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />;
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-white" />;
      default:
        return null;
    }
  };

  const getTimeSince = () => {
    if (!dbSaveStatus.timestamp) return "";
    const seconds = Math.floor((Date.now() - dbSaveStatus.timestamp) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div
      className="relative inline-flex items-center gap-2 px-3 py-2 rounded-full shadow-lg cursor-pointer transition-all hover:scale-105"
      style={{
        backgroundColor: dbSaveStatus.status === "error" ? "#fef2f2" : "#f9fafb",
        border: `2px solid ${dbSaveStatus.status === "error" ? "#dc2626" : dbSaveStatus.status === "success" ? "#10b981" : "#f59e0b"}`,
      }}
      onClick={() => dbSaveStatus.status === "error" && setShowDetails(!showDetails)}
    >
      {/* Status Dot with Icon */}
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getStatusColor()}`}>
        {getStatusIcon()}
      </div>

      {/* Status Text */}
      <div className="text-xs font-semibold whitespace-nowrap">
        {dbSaveStatus.status === "success" && (
          <span className="text-green-700">Saved {getTimeSince()}</span>
        )}
        {dbSaveStatus.status === "saving" && (
          <span className="text-yellow-700">Saving...</span>
        )}
        {dbSaveStatus.status === "error" && (
          <span className="text-red-700">Error</span>
        )}
      </div>

      {/* Error Details Popup */}
      {showDetails && dbSaveStatus.status === "error" && dbSaveStatus.error && (
        <div
          className="absolute top-full right-0 mt-2 w-96 bg-white border-2 border-red-500 rounded-lg shadow-2xl p-4 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-red-700">Database Error</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-semibold text-gray-700">Operation:</span>
              <p className="text-gray-600">{dbSaveStatus.operation}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Error:</span>
              <p className="text-red-600">{dbSaveStatus.error}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-gray-500 text-xs">
                Error sent to Teams channel. Please notify organizer if scoring is affected.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
