import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { generateDeviceFingerprint } from "../../utils/deviceFingerprint";

interface ReviewCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGenerated?: (rewardId: string) => void;
}

export const ReviewCheckModal: React.FC<ReviewCheckModalProps> = ({
  isOpen,
  onClose,
  onRewardGenerated,
}) => {
  const [step, setStep] = useState<"checking" | "success" | "error">(
    "checking"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkAndGenerateReward();
    }
  }, [isOpen]);

  const checkAndGenerateReward = async () => {
    try {
      setLoading(true);
      setStep("checking");

      const deviceFingerprint = await generateDeviceFingerprint();

      const response = await axiosInstance.post("/rewards/generate", {
        deviceFingerprint,
        userAgent: navigator.userAgent,
      });

      setStep("success");
      onRewardGenerated?.(response.data.rewardId);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Could not generate reward. Please try again."
      );
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in">
        {step === "checking" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4 animate-pulse">
              <Loader className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Processing Your Review
            </h3>
            <p className="text-gray-600 mb-6">
              Generating your exclusive discount code...
            </p>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full animate-pulse" />
              </div>
              <p className="text-xs text-gray-500">Please wait a moment</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Reward Generated!
            </h3>
            <p className="text-gray-600 mb-6">
              Your discount code is ready. Scroll down to see your QR code and
              use it on your next visit.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              View My Reward
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops!</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={checkAndGenerateReward}
                disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
