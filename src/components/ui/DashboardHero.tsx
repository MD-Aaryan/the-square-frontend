import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import heroImg from "../../assets/homeimg.png";
import GradientText from "../gradient";

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 50]); // parallax effect
  const [enableParallax, setEnableParallax] = useState(false);

  // Defer parallax animation until after initial paint
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => setEnableParallax(true));
    } else {
      setTimeout(() => setEnableParallax(true), 500);
    }
  }, []);

  return (
    <section className="relative h-screen flex items-center bg-cover bg-center px-6 md:px-16 overflow-hidden">
      {/* Parallax background - disabled initially for faster LCP */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url(${heroImg})`,
          y: enableParallax ? y : 0, // Only apply parallax after page load
        }}
      />

      {/* Gradient black overlay for readability */}
      <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-left">
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#FAF6ED] leading-tight "
        >
          <br />
          Welcome to
          {/* <span className="text-[#D26A3C]">The Square Café</span> */}
          <span>
            <GradientText className="bg-transparent items-center pl-0 ml-0">
              The Square Café
            </GradientText>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 text-base sm:text-lg md:text-lg text-[#FAF6ED]/90"
        >
          Fresh food, warm drinks, and a friendly atmosphere.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 sm:mt-8 flex gap-4 flex-wrap"
        >
          <a
            href="#reservation"
            className="inline-block  text-white font-semibold px-8 sm:px-10 py-3 rounded-full border-4 border-[#ffffff] shadow-lg hover:bg-[#A7B49E]/50 transition-all duration-300"
          >
            View Our Menu
          </a>
          <a
            href="#reservation"
            className="inline-block bg-[#D26A3C] text-white font-semibold px-8 sm:px-10 py-3 rounded-full shadow-lg hover:bg-[#A7B49E] transition-all duration-300"
          >
            Reserve a Table
          </a>
        </motion.div>
      </div>
    </section>
  );
}
