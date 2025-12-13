import React, { useState, useEffect } from "react";
import QRCode from "qrcode.react";
import { Copy, CheckCircle, Clock, AlertCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

interface RewardDisplayProps {
  rewardId: string;
  onClose?: () => void;
}

export const RewardDisplay: React.FC<RewardDisplayProps> = ({
  rewardId,
  onClose,
}) => {
  const [reward, setReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReward();
  }, [rewardId]);

  const fetchReward = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/rewards/${rewardId}`);
      setReward(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reward");
      setReward(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rewardId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">{error}</p>
            <p className="text-sm text-red-700 mt-1">
              Please try generating a new reward.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(reward?.expiresAt);
  const daysLeft = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-sm mx-auto bg-linear-to-b from-amber-50 to-white rounded-xl shadow-xl p-8 border-2 border-amber-200">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Congratulations!</h3>
        <p className="text-gray-600 mt-2">You've earned a special discount</p>
      </div>

      {/* Discount Badge */}
      <div className="text-center mb-8">
        <div className="inline-block bg-linear-to-r from-amber-400 to-amber-600 rounded-lg px-6 py-3 mb-4">
          <p className="text-4xl font-bold text-white">{reward?.discount}%</p>
          <p className="text-amber-100 text-sm">Instant Discount</p>
        </div>
        <p className="text-sm text-gray-600">Valid on your next visit</p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-lg mb-8 flex justify-center border-2 border-gray-200">
        <QRCode
          value={JSON.stringify({ rewardId, discount: reward?.discount })}
          size={180}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#1f2937"
        />
      </div>

      {/* Reward Code */}
      <div className="mb-6">
        <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
          Reward Code
        </p>
        <div className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <code className="flex-1 font-mono font-bold text-gray-900 text-sm break-all">
            {rewardId}
          </code>
          <button
            onClick={handleCopyCode}
            className={`shrink-0 p-2 rounded transition-colors ${
              copied
                ? "bg-green-100 text-green-600"
                : "bg-gray-200 hover:bg-gray-300 text-gray-600"
            }`}
            title="Copy code"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {copied ? "✓ Copied!" : "Click to copy"}
        </p>
      </div>

      {/* Expiry Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">
              Valid for {daysLeft} days
            </p>
            <p className="text-blue-700 text-xs">
              Expires: {expiresAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
          How to use:
        </p>
        <ol className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="font-bold text-amber-600 shrink-0">1.</span>
            <span>Screenshot this QR code</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-600 shrink-0">2.</span>
            <span>Present at café checkout</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-600 shrink-0">3.</span>
            <span>Staff scans to apply discount</span>
          </li>
        </ol>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-600 mb-4">
          Thank you for your review! 🙏
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
