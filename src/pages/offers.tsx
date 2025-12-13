import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Tag } from "lucide-react";
import API from "../api/axiosInstance";
import {
  optimizeImageUrl,
  generateSrcSet,
} from "../utils/imageOptimization";

interface Card {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  validTill: string | null;
}

interface Offer {
  mainTitle: string;
  cards: Card[];
}

const getDaysUntilExpiry = (validTill: string | null): number | null => {
  if (!validTill) return null;
  const expiryDate = new Date(validTill);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
};

export default function AllOffersPage() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await API.get("/offers?includeExpired=true");
        const data = res.data;

        if (data && data.mainTitle && Array.isArray(data.cards)) {
          setOffer({
            mainTitle: data.mainTitle,
            cards: data.cards,
          });
        } else if (Array.isArray(data)) {
          setOffer({
            mainTitle: "All Offers",
            cards: data,
          });
        } else {
          setOffer(null);
        }
      } catch (err: any) {
        setError(err?.message ?? "Failed to fetch offers");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, []);

  if (loading)
    return (
      <motion.div
        className="bg-linear-to-b from-white to-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-1/2 mx-auto mb-6" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md"
              >
                <div className="w-full h-56 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );

  if (!offer || offer.cards.length === 0)
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl text-gray-600 font-semibold">
            No offers available
          </p>
        </div>
      </div>
    );

  return (
    <section className="bg-linear-to-b from-white to-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <h1 className="text-5xl sm:text-6xl font-black bg-linear-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
              {offer.mainTitle || "All Offers"}
            </h1>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>

          <motion.p
            className="text-xl text-gray-600 font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover {offer.cards.length} amazing deals on our finest selections
          </motion.p>
        </motion.div>

        {/* Cards Grid - All offers */}
        <motion.div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {offer.cards.map((card, index) => {
            const daysLeft = getDaysUntilExpiry(card.validTill);
            return (
              <motion.div
                key={card.id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 8) * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col hover:scale-105 transform">
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-48 bg-gray-100">
                    {!loadedImages.has(card.id) && (
                      <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                    )}

                    {card.imageUrl ? (
                      <picture>
                        <source
                          srcSet={generateSrcSet(card.imageUrl)}
                          type="image/webp"
                        />
                        <img
                          src={optimizeImageUrl(card.imageUrl)}
                          srcSet={generateSrcSet(card.imageUrl)}
                          alt={card.title}
                          width={500}
                          height={400}
                          sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                            loadedImages.has(card.id)
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                          onLoad={() => handleImageLoad(card.id)}
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}

                    {/* Hot Badge */}
                    <div className="absolute top-3 right-3 bg-linear-to-r from-orange-500 to-red-600 text-white px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 shadow-lg">
                      <Flame className="w-3 h-3" /> HOT
                    </div>

                    {/* Days Left */}
                    {daysLeft !== null && (
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {daysLeft} days
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {card.title}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                      <Clock className="w-3 h-3" />
                      <span>
                        {card.validTill
                          ? `Till ${new Date(
                              card.validTill
                            ).toLocaleDateString()}`
                          : "No expiry"}
                      </span>
                    </div>

                    <div className="grow" />

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm font-medium">
                          Price
                        </span>
                        <span className="text-2xl font-black bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                          रु{card.price}
                        </span>
                      </div>
                    </div>

                    <motion.button
                      className="w-full mt-3 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Tag className="w-4 h-4" /> Claim
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Count */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 font-medium">
            Showing{" "}
            <span className="text-2xl font-bold text-orange-600">
              {offer.cards.length}
            </span>{" "}
            amazing offers
          </p>
        </motion.div>
      </div>
    </section>
  );
}
