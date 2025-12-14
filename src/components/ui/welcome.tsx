import { useState } from "react";
import aboutImg from "../../assets/landingimg.png";

export default function WelcomeSection() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section
      id="about"
      className="relative bg-[#F4F1DE] px-6 md:px-16 py-16 flex flex-col md:flex-row items-center gap-10"
    >
      {/* Image on left */}
      <div className="w-full md:w-1/2 rounded-lg overflow-hidden shadow-lg bg-gray-200">
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div
            className="w-full h-96 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 bg-size-[200%_100%] animate-pulse"
            style={{ minHeight: "384px" }}
          />
        )}
        <img
          src={aboutImg}
          alt="The Square Restaurant Interior"
          width={600}
          height={400}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* Text content on right */}
      <div className="w-full md:w-1/2">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2E5D50] mb-4">
          Welcome to The Square
        </h1>
        <p className="text-[#2E4638] text-lg mb-6">
          At The Square, we serve fresh, delicious meals in a warm and cozy
          atmosphere. Whether you're here for a hearty meal or a relaxing coffee
          break, every visit is a delightful experience.
        </p>
        <a
          href="/menu"
          className="inline-block bg-[#D26A3C] text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-[#A7B49E] transition-all duration-300"
        >
          Explore Our Menu
        </a>
      </div>
    </section>
  );
}
