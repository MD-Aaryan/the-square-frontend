import { Instagram, Facebook, MapPin, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#faf1dc] text-[#2E5D50] py-16 px-6 md:px-16 font-[poppins]">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-4">The Square Café</h3>
          <p className="text-gray-600">
            Your cozy corner for coffee, desserts & warm memories.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/menu"
                className="hover:text-[#D26A3C] transition-colors"
              >
                Menu
              </a>
            </li>
            <li>
              <a
                href="/offers"
                className="hover:text-[#D26A3C] transition-colors"
              >
                Offers
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-[#D26A3C] transition-colors"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/#about"
                className="hover:text-[#D26A3C] transition-colors"
              >
                About
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <MapPin size={16} />
              <a
                href="https://www.google.com/maps/place/The+Square/@26.4585702,87.2812544,19.71z/data=!4m6!3m5!1s0x39ef75eb42371f45:0x56b6d081b132f99d!8m2!3d26.4586354!4d87.2814699!16s%2Fg%2F11yjxc_n12?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Dharewa gali, Biratnagar 56613
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +977 9709022843
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> info@thesquarecafe.com
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/the_square25?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              className="hover:text-[#D26A3C] transition-colors"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61578570657606"
              className="hover:text-[#D26A3C] transition-colors"
            >
              <Facebook size={24} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mt-12 text-center text-gray-500 text-sm"
      >
        © {new Date().getFullYear()} The Square Café. All rights reserved.
      </motion.div>
    </footer>
  );
}
