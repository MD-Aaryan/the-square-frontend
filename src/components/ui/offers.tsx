// src/components/ui/OfferDisplay.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Tag } from "lucide-react";
import API from "../../api/axiosInstance";
import {
  optimizeImageUrl,
  generateSrcSet,
} from "../../utils/imageOptimization";

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

export default function OfferDisplay() {
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
        // Add 8-second timeout to prevent LCP delays
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await API.get("/offers?includeExpired=true", {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = res.data;

        if (data && data.mainTitle && Array.isArray(data.cards)) {
          setOffer({
            mainTitle: data.mainTitle,
            cards: data.cards,
          });
        } else if (Array.isArray(data)) {
          // if API directly returns an array of offers
          setOffer({
            mainTitle: "Available Offers",
            cards: data,
          });
        } else {
          setOffer(null);
        }
      } catch (err: any) {
        // Show graceful error message but don't block page
        if (err.name === "AbortError") {
          setError("Offers loading (slow connection)");
        } else {
          setError(err?.message ?? "Failed to fetch offers");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, []);

  if (loading)
    return (
      <motion.div
        className="bg-linear-to-b from-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="h-12 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-1/2 mx-auto mb-6" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-md"
              >
                <div
                  className="w-full h-56 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse"
                  style={{ minHeight: "224px" }}
                />
                <div className="p-6">
                  <div className="h-6 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-3/4 mb-3" />
                  <div className="h-4 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (!offer || offer.cards.length === 0)
    return <p className="text-center py-10">No offers available</p>;

  return (
    <section className="bg-linear-to-b from-white to-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-orange-500" />
            <h2 className="text-5xl sm:text-6xl font-black bg-linear-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent">
              {offer.mainTitle || "Hot Offers"}
            </h2>
            <Flame className="w-8 h-8 text-orange-500" />
          </div>

          <motion.p
            className="text-xl text-gray-600 font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover amazing deals on our finest selections. Limited time
            offers!
          </motion.p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {offer.cards.slice(0, 3).map((card, index) => {
            const daysLeft = getDaysUntilExpiry(card.validTill);
            return (
              <motion.div
                key={card.id}
                className="group h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col hover:scale-105 transform">
                  {/* Image Container */}
                  <div className="relative overflow-hidden h-56 bg-gray-100">
                    {/* Skeleton Loader */}
                    {!loadedImages.has(card.id) && (
                      <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse" />
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
                          fetchPriority="high"
                        />
                      </picture>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>No image</span>
                      </div>
                    )}

                    {/* Hot Badge */}
                    <div className="absolute top-4 right-4 bg-linear-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1 shadow-lg">
                      <Flame className="w-4 h-4" /> HOT
                    </div>

                    {/* Days Left Badge */}
                    {daysLeft !== null && (
                      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {daysLeft} days left
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col grow">
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {card.title}
                    </h3>

                    {/* Expiry */}
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <Clock className="w-4 h-4" />
                      <span>
                        {card.validTill
                          ? `Valid till ${new Date(
                              card.validTill
                            ).toLocaleDateString()}`
                          : "No expiry"}
                      </span>
                    </div>

                    {/* Spacer */}
                    <div className="grow" />

                    {/* Price Section */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Price</span>
                        <span className="text-3xl font-black bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                          रु{card.price}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      className="w-full mt-4 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Tag className="w-5 h-5" />
                      Claim Offer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-gray-600 mb-4">
            🎉 Hurry! These offers are limited in time
          </p>
          <motion.a
            href="/offers"
            className="inline-block px-8 py-4 bg-linear-to-r from-orange-500 to-red-600 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All Offers →
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
