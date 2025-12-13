import { lazy, Suspense, useState } from "react";
import HeroSection from "../components/ui/DashboardHero";
import Footer from "../components/ui/footer";
import WelcomeSection from "../components/ui/welcome";
import { ReviewCTA } from "../components/ui/ReviewCTA";
import { ReviewCheckModal } from "../components/ui/ReviewCheckModal";
import { RewardDisplay } from "../components/ui/RewardDisplay";
import { OffersLoadingSkeleton } from "../components/ui/OfferSkeleton";

const Offer = lazy(() => import("../components/ui/offers"));

function Home() {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [generatedRewardId, setGeneratedRewardId] = useState<string>("");

  return (
    <div>
      <HeroSection />
      <WelcomeSection />
      <Suspense fallback={<OffersLoadingSkeleton />}>
        <Offer />
      </Suspense>

      {/* Review Section */}
      <ReviewCTA onReviewComplete={() => setShowReviewModal(true)} />

      {/* Review Check Modal */}
      <ReviewCheckModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onRewardGenerated={(rewardId) => setGeneratedRewardId(rewardId)}
      />

      {/* Reward Display */}
      {generatedRewardId && (
        <div className="py-16 bg-linear-to-b from-white to-gray-50">
          <RewardDisplay
            rewardId={generatedRewardId}
            onClose={() => setGeneratedRewardId("")}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Home;
