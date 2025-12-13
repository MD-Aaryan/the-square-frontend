import React, { useState } from "react";
import { MapPin, Star, ExternalLink } from "lucide-react";

interface ReviewCTAProps {
  onReviewComplete?: () => void;
}

export const ReviewCTA: React.FC<ReviewCTAProps> = ({ onReviewComplete }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenMaps = () => {
    setIsOpening(true);
    // Open Google Maps with café location
    const mapsURL =
      "https://www.google.com/maps/place/The+Square/@26.4586401,87.276599,17z/data=!3m1!4b1!4m6!3m5!1s0x39ef75eb42371f45:0x56b6d081b132f99d!8m2!3d26.4586354!4d87.2814699!16s%2Fg%2F11yjxc_n12?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D";
    window.open(mapsURL, "_blank");

    // Call completion callback after a short delay
    setTimeout(() => {
      onReviewComplete?.();
      setIsOpening(false);
    }, 500);
  };

  return (
    <section className="py-16 bg-linear-to-b from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Share Your Experience
            </h2>
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Leave a review on Google Maps and get an instant surprise discount!
            We'd love to hear what you think about your visit.
          </p>
        </div>

        {/* Maps Embed + CTA Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Google Maps Embed */}
          <div className="rounded-lg overflow-hidden shadow-lg h-96 bg-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3571.909828250427!2d87.28146989999999!3d26.4586354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef75eb42371f45%3A0x56b6d081b132f99d!2sThe%20Square!5e0!3m2!1sen!2snp!4v1765633698919!5m2!1sen!2snp"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
            />
          </div>

          {/* CTA Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-amber-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                How it Works
              </h3>
              <p className="text-gray-600">
                It takes just 30 seconds to leave a review and get your reward!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Click below to open Google Maps
                  </p>
                  <p className="text-sm text-gray-600">Opens in a new tab</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Share your honest feedback
                  </p>
                  <p className="text-sm text-gray-600">
                    1-5 stars and a quick comment
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Come back here to claim your reward
                  </p>
                  <p className="text-sm text-gray-600">
                    Get your instant discount code
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenMaps}
              disabled={isOpening}
              className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <MapPin className="w-5 h-5" />
              {isOpening
                ? "Opening Google Maps..."
                : "Open Google Maps Reviews"}
              <ExternalLink className="w-4 h-4" />
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              ✓ No account needed • ✓ Takes 30 seconds • ✓ Instant discount code
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
