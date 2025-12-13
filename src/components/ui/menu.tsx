import { useState, useEffect } from "react";
import { Search, Trash2, Loader } from "lucide-react";
import { motion } from "framer-motion";
import API from "../../api/axiosInstance";
import { useAuth } from "../../context/authContext";
import {
  optimizeImageUrl,
  generateSrcSet,
} from "../../utils/imageOptimization";

interface MenuItem {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  bestseller: boolean;
  category: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

export default function MenuSection() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [displayCount, setDisplayCount] = useState(6); // Start with 6 for faster LCP
  const { token } = useAuth();

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes] = await Promise.all([
        API.get("/menu"),
        API.get("/menu/categories"),
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number) => {
    if (!token) {
      alert("Not authorized");
      return;
    }

    if (!confirm("Delete this item?")) return;

    try {
      setDeleting(id);
      await API.delete(`/menu/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === 0 || item.category.id === activeCategory;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Paginate items - only show what's needed
  const paginatedItems = filteredItems.slice(0, displayCount);

  // Load more items on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
        setDisplayCount((prev) =>
          Math.min(prev + ITEMS_PER_PAGE, filteredItems.length)
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredItems.length]);

  return (
    <main className="py-16 bg-[#FAF6ED]" id="menu">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-[#2E5D50] mb-6">Our Menu</h2>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-3 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search menu items..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white shadow-sm border border-gray-200 focus:outline-none focus:border-[#2E5D50]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search menu items"
          />
        </div>

        {/* Category Filter */}
        <div
          className="flex gap-3 overflow-x-auto pb-4 no-scrollbar"
          role="group"
          aria-label="Filter by category"
        >
          <button
            onClick={() => setActiveCategory(0)}
            aria-label="Show all menu items"
            className={`px-5 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap
              ${
                activeCategory === 0
                  ? "bg-[#2E5D50] text-white border-[#2E5D50]"
                  : "bg-white text-[#2E5D50] border-[#2E5D50] hover:bg-[#E0E8E4]"
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-label={`Filter by ${cat.name}`}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap
                ${
                  activeCategory === cat.id
                    ? "bg-[#2E5D50] text-white border-[#2E5D50]"
                    : "bg-white text-[#2E5D50] border-[#2E5D50] hover:bg-[#E0E8E4]"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md h-full flex flex-col"
              >
                {/* Skeleton Image */}
                <div
                  className="h-48 w-full bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse"
                  style={{ minHeight: "192px" }}
                />

                {/* Skeleton Content */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="h-5 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-full" />
                  <div className="h-4 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-5/6" />

                  {/* Skeleton Footer */}
                  <div className="mt-auto pt-3 border-t border-gray-200 flex justify-between">
                    <div className="h-6 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded-full w-20" />
                    <div className="h-6 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-gray-500 text-lg text-center py-8">
            No items found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 auto-rows-max">
              {paginatedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group flex flex-col h-full"
                >
                  {/* Image Container with Delete Button */}
                  <div className="relative overflow-hidden bg-gray-200 h-48">
                    {/* Skeleton Loader */}
                    {!loadedImages.has(item.id) && (
                      <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse" />
                    )}

                    <picture>
                      <source
                        srcSet={generateSrcSet(item.imageUrl, 400, 300)}
                        type="image/webp"
                      />
                      <img
                        src={optimizeImageUrl(item.imageUrl, {
                          width: 400,
                          height: 300,
                        })}
                        srcSet={generateSrcSet(item.imageUrl, 400, 300)}
                        alt={item.title}
                        width={400}
                        height={300}
                        sizes="(max-width: 640px) 300px, (max-width: 1024px) 360px, 400px"
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          loadedImages.has(item.id)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                        onLoad={() => handleImageLoad(item.id)}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>

                    {/* Delete Button - Always Visible */}
                    {token && (
                      <motion.button
                        onClick={() => deleteItem(item.id)}
                        disabled={deleting === item.id}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg disabled:bg-gray-400 flex items-center justify-center"
                        title="Delete item"
                        aria-label={`Delete ${item.title}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {deleting === item.id ? (
                          <Loader
                            className="w-5 h-5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <Trash2 className="w-5 h-5" aria-hidden="true" />
                        )}
                      </motion.button>
                    )}

                    {/* Bestseller Badge */}
                    {item.bestseller && (
                      <motion.div
                        className="absolute top-3 left-3 bg-[#D26A3C] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Bestseller
                      </motion.div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#4B3B32] line-clamp-2 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Category and Price Footer */}
                    <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                      <span className="text-xs font-semibold text-[#2E5D50] bg-[#E0E8E4] px-2.5 py-1 rounded-full">
                        {item.category.name}
                      </span>
                      <span className="text-xl font-bold text-[#D26A3C]">
                        Rs.{item.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Indicator */}
            {displayCount < filteredItems.length && (
              <motion.div
                className="flex justify-center items-center py-8 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <p className="text-sm">
                    Showing {displayCount} of {filteredItems.length} items
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
