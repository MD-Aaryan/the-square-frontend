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
  Loader,
  X,
  RotateCw,
  ZoomIn,
} from "lucide-react";
import API from "../../api/axiosInstance";

interface MenuItem {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  bestseller: boolean;
  validTill: string;
  imageFile?: File;
  previewUrl?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  categoryId?: string;
  validTill?: string;
  image?: string;
  submit?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function MenuUpload() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [formData, setFormData] = useState<MenuItem>({
    title: "",
    description: "",
    price: 0,
    categoryId: 0,
    bestseller: false,
    validTill: "",
    imageFile: undefined,
    previewUrl: undefined,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotate, setCropRotate] = useState(0);
  const [tempPreview, setTempPreview] = useState<string>("");

  // Load token and fetch categories on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (storedToken) {
      setToken(storedToken);
    }
    fetchCategories();
  }, []);

  // Reset success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchCategories = async () => {
    try {
      const response = await API.get("/menu/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Fallback categories if API fails
      setCategories([
        { id: 1, name: "Coffee" },
        { id: 2, name: "Food" },
        { id: 3, name: "Desserts" },
        { id: 4, name: "Drinks" },
      ]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Menu item title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.categoryId === 0) {
      newErrors.categoryId = "Please select a category";
    }

    if (!formData.imageFile) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors({
          ...errors,
          image: "Please select a valid image file",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          image: "Image size must be less than 5MB",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setTempPreview(preview);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors({
          ...errors,
          image: undefined,
        });
      }
    }
  };

  const applyCrop = async () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageRef.current;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    canvas.width = 400;
    canvas.height = Math.round(canvas.width / aspectRatio);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((cropRotate * Math.PI) / 180);
    ctx.scale(cropZoom, cropZoom);
    ctx.drawImage(
      img,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
          });
          setFormData({
            ...formData,
            imageFile: file,
            previewUrl: canvas.toDataURL(),
          });
        }
        setShowCropModal(false);
        setCropZoom(1);
        setCropRotate(0);
        setTempPreview("");
      },
      "image/jpeg",
      0.95
    );
  };

  const cancelCrop = () => {
    setShowCropModal(false);
    setCropZoom(1);
    setCropRotate(0);
    setTempPreview("");
    const fileInput = document.getElementById("imageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setErrors({
        ...errors,
        submit: "Please fix the errors above",
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("categoryId", formData.categoryId.toString());
      formDataToSend.append("bestseller", formData.bestseller.toString());
      if (formData.validTill) {
        formDataToSend.append(
          "validTill",
          new Date(formData.validTill).toISOString()
        );
      }
      if (formData.imageFile) {
        formDataToSend.append("file", formData.imageFile);
      }

      await API.post("/menu/create", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      setSuccess(true);
      setSuccessMessage(`"${formData.title}" added to menu successfully!`);

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: 0,
        categoryId: 0,
        bestseller: false,
        validTill: "",
        imageFile: undefined,
        previewUrl: undefined,
      });

      // Reset file input
      const fileInput = document.getElementById(
        "imageInput"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors({
        ...errors,
        submit: error.response?.data?.message || "Failed to upload menu item",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Crop Modal */}
        {showCropModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-700">
              <h2 className="text-white text-xl font-bold mb-4">Crop Image</h2>

              {/* Image Preview */}
              <div className="relative bg-slate-800 rounded-lg overflow-hidden mb-4 h-64">
                <img
                  ref={imageRef}
                  src={tempPreview}
                  alt="crop"
                  className="w-full h-full object-contain"
                  style={{
                    transform: `scale(${cropZoom}) rotate(${cropRotate}deg)`,
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
                    <ZoomIn className="w-4 h-4" /> Zoom: {cropZoom.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-slate-300 text-sm flex items-center gap-2 mb-2">
                    <RotateCw className="w-4 h-4" /> Rotate: {cropRotate}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={cropRotate}
                    onChange={(e) => setCropRotate(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelCrop}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={applyCrop}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Crop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-linear-to-r from-amber-500 to-orange-500 p-3 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Add Menu Item</h1>
          </div>
          <p className="text-slate-300">
            Create and upload new menu items to your café
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <Check className="w-5 h-5 text-white shrink-0" />
            <p className="text-white font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 bg-linear-to-r from-red-500 to-pink-500 rounded-xl p-4 flex items-center gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-white shrink-0" />
            <p className="text-white font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Item Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Cappuccino"
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-400 transition ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-amber-500"
                }`}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your menu item..."
                rows={3}
                className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-400 transition resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-slate-600 focus:ring-amber-500"
                }`}
              />
              <p className="text-slate-400 text-xs mt-1">
                {formData.description.length}/500 characters
              </p>
              {errors.description && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white placeholder-slate-400 transition ${
                    errors.price
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-amber-500"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Category Select */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg focus:outline-none focus:ring-2 text-white transition ${
                    errors.categoryId
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-600 focus:ring-amber-500"
                  }`}
                >
                  <option value="0">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.categoryId}
                  </p>
                )}
              </div>
            </div>

            {/* Valid Till and Bestseller Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Valid Till */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Valid Till (Optional)
                </label>
                <input
                  type="date"
                  name="validTill"
                  value={formData.validTill}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-white transition"
                />
              </div>

              {/* Bestseller Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer mt-7">
                  <input
                    type="checkbox"
                    name="bestseller"
                    checked={formData.bestseller}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded bg-slate-700/50 border border-slate-600 cursor-pointer accent-amber-500"
                  />
                  <span className="text-white font-medium">
                    Mark as Bestseller
                  </span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-white mb-4">
                Image Upload *
              </label>

              {/* Preview */}
              {formData.previewUrl ? (
                <div className="relative mb-4 rounded-xl overflow-hidden border-2 border-amber-500/50 bg-slate-700/50 p-2">
                  <img
                    src={formData.previewUrl}
                    alt="Preview"
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        imageFile: undefined,
                        previewUrl: undefined,
                      });
                      const fileInput = document.getElementById(
                        "imageInput"
                      ) as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                    }}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full transition shadow-lg transform hover:scale-110"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-600 hover:border-amber-500 rounded-lg p-8 text-center transition cursor-pointer group">
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="imageInput" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="bg-amber-500/10 p-4 rounded-lg group-hover:bg-amber-500/20 transition">
                        <Upload className="w-8 h-8 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          Click to upload image
                        </p>
                        <p className="text-slate-400 text-sm">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {errors.image && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.image}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Adding to Menu...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Menu Item
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-300 text-sm">
            <span className="font-semibold text-amber-400">Note:</span> Menu
            items require a title, price, category, and image. You can add
            description and valid till date optionally. Images are automatically
            uploaded to Cloudinary.
          </p>
        </div>
      </div>
    </div>
  );
}
