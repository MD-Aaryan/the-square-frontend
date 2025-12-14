import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader, Camera, Type } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { generateDeviceFingerprint } from "../../utils/deviceFingerprint";
import jsQR from "jsqr";

interface QRScannerProps {
  onRewardRedeemed?: (reward: any) => void;
}

export const StaffQRScanner: React.FC<QRScannerProps> = ({
  onRewardRedeemed,
}) => {
  const [rewardId, setRewardId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"manual" | "camera">("manual");
  const [cameraActive, setCameraActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputMode]);

  useEffect(() => {
    if (cameraActive && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [cameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.log("Video play error:", err);
          setError("Could not start video playback. Try refreshing the page.");
        });
      }
    } catch (err) {
      setError("Unable to access camera. Check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    const tracks = (videoRef.current?.srcObject as MediaStream)?.getTracks();
    tracks?.forEach((track) => track.stop());
  };

  const captureAndDetectQR = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setLoading(true);
      setError("");

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Camera not ready");
        return;
      }

      // Set canvas size to match video
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;

      // Draw current frame to canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Get image data to detect QR codes using jsQR
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

      if (qrCode) {
        // QR code successfully decoded!
        console.log("QR Code detected:", qrCode.data);
        handleScan(qrCode.data);
      } else {
        setError(
          "No QR code detected. Make sure QR code is visible and well-lit."
        );
      }
    } catch (err) {
      setError("Failed to capture frame. Try again.");
      console.error("Capture error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (scannedData: string) => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      let id = scannedData;
      try {
        const parsed = JSON.parse(scannedData);
        id = parsed.rewardId;
      } catch {
        // Not JSON, use as-is
      }

      const deviceFingerprint = await generateDeviceFingerprint();

      const response = await axiosInstance.post("/rewards/redeem", {
        rewardId: id,
        deviceFingerprint,
      });

      setResult({
        success: true,
        discount: response.data.discount,
        message: response.data.message,
      });

      onRewardRedeemed?.(response.data);
      setRewardId("");
      setCameraActive(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to redeem reward");
      setResult({
        success: false,
        message: err.response?.data?.message || "Scan failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rewardId.trim()) {
      handleScan(rewardId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-6 border-2 border-amber-200">
      {!result ? (
        <>
          {/* Title & Mode Toggle */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Scan Customer Reward
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setInputMode("manual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  inputMode === "manual"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Type className="w-4 h-4" />
                Manual Entry
              </button>
              <button
                onClick={() => setInputMode("camera")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  inputMode === "camera"
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Camera className="w-4 h-4" />
                Camera Scan
              </button>
            </div>
          </div>

          {/* Camera Mode */}
          {inputMode === "camera" ? (
            <div className="mb-6">
              {!cameraActive ? (
                <div className="text-center py-8">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Click below to activate camera and scan QR codes
                  </p>
                  <button
                    onClick={() => setCameraActive(true)}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <Camera className="w-4 h-4" />
                    Start Camera
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-300">
                    <video
                      ref={videoRef}
                      className="w-full h-96 object-cover"
                      playsInline
                      autoPlay
                    />
                    <div className="absolute inset-0 border-4 border-green-500 opacity-50 pointer-events-none rounded-lg"></div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={captureAndDetectQR}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {loading && <Loader className="w-4 h-4 animate-spin" />}
                      {loading ? "Detecting..." : "Detect QR"}
                    </button>
                    <button
                      onClick={() => setCameraActive(false)}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Stop
                    </button>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 font-semibold mb-1">
                      📱 How to Use:
                    </p>
                    <p className="text-xs text-blue-600">
                      1. Ask customer to open their email with QR code
                      <br />
                      2. Hold their phone in front of camera
                      <br />
                      3. Click "Detect QR" to recognize pattern
                      <br />
                      4. Type the reward code manually
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual Mode */
            <form onSubmit={handleManualSubmit} className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reward Code
              </label>
              <input
                ref={inputRef}
                type="text"
                value={rewardId}
                onChange={(e) => setRewardId(e.target.value)}
                placeholder="CAFE-2025-ABC123"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 text-lg font-mono uppercase"
                disabled={loading}
                autoCapitalize="characters"
              />
              <button
                type="submit"
                disabled={loading || !rewardId.trim()}
                className="w-full mt-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-4 h-4 animate-spin" />}
                {loading ? "Processing..." : "Verify Reward"}
              </button>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-sm text-blue-700">
            <p className="font-semibold mb-1">💡 Tip:</p>
            <p>
              {inputMode === "camera"
                ? "Position the QR code in the camera frame for best results"
                : "Ask customer to show their phone with the QR code or reward code"}
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Result Card */}
          <div className="text-center">
            {result.success ? (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Success!
                </h3>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 mb-2">Discount Applied:</p>
                  <p className="text-4xl font-bold text-green-600">
                    {result.discount}%
                  </p>
                </div>
                <p className="text-gray-700 mb-6">{result.message}</p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-red-600 mb-2">
                  Invalid Reward
                </h3>
                <p className="text-gray-700 mb-6">{result.message}</p>
              </>
            )}

            <button
              onClick={() => {
                setResult(null);
                setRewardId("");
                setError("");
                setCameraActive(false);
                inputRef.current?.focus();
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Scan Next Customer
            </button>
          </div>
        </>
      )}
    </div>
  );
};
