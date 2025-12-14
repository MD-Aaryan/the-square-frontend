import {
  useState,
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
} from "react";
import {
  Upload,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  X,
  RotateCw,
  ZoomIn,
} from "lucide-react";
import API from "../../api/axiosInstance";

interface CardInput {
  title: string;
  price: number;
  validTill: string;
  imageFile?: File;
  previewUrl?: string;
}

interface FormErrors {
  mainTitle?: string;
  cards?: string[];
  submit?: string;
}

interface CropState {
  show: boolean;
  cardIndex: number | null;
  tempPreview: string;
  zoom: number;
  rotate: number;
}

export default function OfferUpload() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [mainTitle, setMainTitle] = useState("");
  const [cards, setCards] = useState<CardInput[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [cropState, setCropState] = useState<CropState>({
    show: false,
    cardIndex: null,
    tempPreview: "",
    zoom: 1,
    rotate: 0,
  });

  // Load token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!mainTitle.trim()) {
      newErrors.mainTitle = "Offer title is required";
    }

    if (cards.length === 0) {
      newErrors.submit = "Add at least one card";
      return false;
    }

    const cardErrors: string[] = [];
    cards.forEach((card, idx) => {
      if (!card.title.trim()) {
        cardErrors[idx] = "Card title required";
      } else if (!card.imageFile) {
        cardErrors[idx] = "Image required";
      } else if (card.price <= 0) {
        cardErrors[idx] = "Price must be greater than 0";
      } else if (!card.validTill) {
        cardErrors[idx] = "Valid till date required";
      }
    });

    if (cardErrors.length > 0) {
      newErrors.cards = cardErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCard = () => {
    if (cards.length >= 6) return;
    setCards([
      ...cards,
      { title: "", price: 0, validTill: "", imageFile: undefined },
    ]);
  };

  const removeCard = (index: number) => {
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
    // Clear errors for deleted card
    const newErrors = { ...errors };
    if (newErrors.cards) {
      newErrors.cards.splice(index, 1);
    }
    setErrors(newErrors);
  };

  const handleCardChange = <K extends keyof CardInput>(
    index: number,
    field: K,
    value: CardInput[K] | File
  ) => {
    const updated = [...cards];
    if (field === "imageFile" && value instanceof File) {
      // Simply assign the file without forcing crop modal
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        updated[index] = {
          ...updated[index],
          imageFile: value,
          previewUrl: preview,
        };
        setCards(updated);
      };
      reader.readAsDataURL(value);
    } else {
      updated[index][field] = value as CardInput[K];
      setCards(updated);
    }

    // Clear error for this card when user makes changes
    if (errors.cards && errors.cards.length > 0) {
      const newErrors = { ...errors };
      if (newErrors.cards) {
        newErrors.cards[index] = "";
      }
      setErrors(newErrors);
    }
  };

  const applyCropCard = () => {
    if (!canvasRef.current || !imageRef.current || cropState.cardIndex === null)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((cropState.rotate * Math.PI) / 180);
    ctx.scale(cropState.zoom, cropState.zoom);
    ctx.drawImage(imageRef.current, -canvas.width / 4, -canvas.height / 4);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });
          const updated = [...cards];
          updated[cropState.cardIndex!] = {
            ...updated[cropState.cardIndex!],
            imageFile: file,
            previewUrl: canvas.toDataURL(),
          };
          setCards(updated);
        }
        setCropState({
          show: false,
          cardIndex: null,
          tempPreview: "",
          zoom: 1,
          rotate: 0,
        });
      },
      "image/jpeg",
      0.95
    );
  };

  const cancelCropCard = () => {
    setCropState({
      show: false,
      cardIndex: null,
      tempPreview: "",
      zoom: 1,
      rotate: 0,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) return;
    if (!token) {
      setErrors({ submit: "Admin token not found. Please login again." });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("mainTitle", mainTitle);
    cards.forEach((card) => {
      if (card.imageFile) {
        formData.append("images", card.imageFile);
      }
    });
    formData.append(
      "cards",
      JSON.stringify(
        cards.map((c) => ({
          title: c.title,
          price: c.price,
          validTill: c.validTill,
        }))
      )
    );

    try {
      await API.post("/offers/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess(true);
      // Reset form
      setMainTitle("");
      setCards([]);
      setErrors({});
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to upload offer. Please try again.";
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      {/* Crop Modal */}
      {cropState.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <h2 className="text-white text-xl font-bold mb-4">Crop Image</h2>

            {/* Image Preview */}
            <div className="relative bg-slate-800 rounded-lg overflow-hidden mb-4 h-64">
              <img
                ref={imageRef}
                src={cropState.tempPreview}
                alt="crop"
                className="w-full h-full object-contain"
                style={{
                  transform: `scale(${cropState.zoom}) rotate(${cropState.rotate}deg)`,
                  transition: "transform 0.2s",
                }}
              />
            </div>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-slate-300 text-sm flex items-center gap-2 mb-2">
                  <ZoomIn className="w-4 h-4" /> Zoom:{" "}
                  {cropState.zoom.toFixed(2)}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={cropState.zoom}
                  onChange={(e) =>
                    setCropState({
                      ...cropState,
                      zoom: parseFloat(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm flex items-center gap-2 mb-2">
                  <RotateCw className="w-4 h-4" /> Rotate: {cropState.rotate}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={cropState.rotate}
                  onChange={(e) =>
                    setCropState({
                      ...cropState,
                      rotate: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelCropCard}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={applyCropCard}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Crop
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Upload className="w-8 h-8 text-orange-500" />
            Create New Offer
          </h1>
          <p className="text-slate-400">
            Add up to 6 special offers with images and pricing
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-500 bg-opacity-20 border border-emerald-500 rounded-lg">
            <p className="text-emerald-300 font-medium">
              ✓ Offer uploaded successfully!
            </p>
          </div>
        )}

        {/* Error Messages */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Title Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition">
            <label className="block text-white font-semibold mb-3">
              Offer Title *
            </label>
            <input
              type="text"
              value={mainTitle}
              onChange={(e) => {
                setMainTitle(e.target.value);
                setErrors({ ...errors, mainTitle: undefined });
              }}
              className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                errors.mainTitle ? "border-red-500" : "border-slate-600"
              }`}
              placeholder="e.g., Weekend Special Offer"
              required
            />
            {errors.mainTitle && (
              <p className="text-red-400 text-sm mt-2">{errors.mainTitle}</p>
            )}
          </div>

          {/* Cards Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg">
                Offer Cards{" "}
                <span className="text-orange-500">({cards.length}/6)</span>
              </h3>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-600 rounded-lg">
                <p className="text-slate-400">
                  No cards added yet. Click "Add Card" to start.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Card Content */}
                      <div className="flex-1 space-y-3">
                        {/* Title Input */}
                        <div>
                          <input
                            type="text"
                            placeholder="Card Title"
                            value={card.title}
                            onChange={(e) =>
                              handleCardChange(idx, "title", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                          />
                        </div>

                        {/* Price and Date Row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="number"
                              placeholder="Price (₹)"
                              value={card.price === 0 ? "" : card.price}
                              onChange={(e) =>
                                handleCardChange(
                                  idx,
                                  "price",
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value)
                                )
                              }
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                          <div>
                            <input
                              type="date"
                              value={card.validTill}
                              onChange={(e) =>
                                handleCardChange(
                                  idx,
                                  "validTill",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                              required
                            />
                          </div>
                        </div>

                        {/* Error Message */}
                        {errors.cards?.[idx] && (
                          <p className="text-red-400 text-sm">
                            {errors.cards[idx]}
                          </p>
                        )}
                      </div>

                      {/* Image Upload & Preview */}
                      <div className="shrink-0 flex flex-col items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            e.target.files &&
                            handleCardChange(
                              idx,
                              "imageFile",
                              e.target.files[0]
                            )
                          }
                          className="hidden"
                          id={`file-${idx}`}
                          required
                        />
                        <label
                          htmlFor={`file-${idx}`}
                          className="px-4 py-2 bg-slate-600 border border-slate-500 rounded cursor-pointer text-white text-sm hover:bg-slate-500 transition"
                        >
                          Choose Image
                        </label>
                        {card.previewUrl && (
                          <img
                            src={card.previewUrl}
                            alt="preview"
                            className="w-20 h-20 object-cover rounded border border-slate-500"
                          />
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeCard(idx)}
                          className="mt-2 p-2 bg-red-500 bg-opacity-20 text-red-400 rounded hover:bg-opacity-40 transition"
                          title="Delete card"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Card Button */}
            {cards.length < 6 && (
              <button
                type="button"
                onClick={addCard}
                className="mt-4 w-full py-3 bg-linear-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Card
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 font-semibold rounded-lg transition flex items-center justify-center gap-2 text-white ${
              loading
                ? "bg-slate-600 cursor-not-allowed opacity-75"
                : "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Offer
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
