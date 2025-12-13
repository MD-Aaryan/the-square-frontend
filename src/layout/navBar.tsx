import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "../assets/same logo with white.png";
import { useAuth } from "../context/authContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/offers", label: "Offers" },
    { href: "/menu", label: "Menu" },
    { href: "#gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];
  const { token } = useAuth();

  return (
    <div>
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-[#F4F1DE]/90 border-b border-[#A3B18A] shadow-sm transition-all font-[Poppins]">
        <div className="container mx-auto flex justify-between items-center px-6 py-3">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <img
              src={logo}
              alt="The Square Café Logo"
              className="h-10 w-auto object-contain"
              width={40}
              height={40}
              loading="eager"
              decoding="sync"
            />
            <span className="text-lg font-semibold text-[#2E4638] tracking-wide">
              The Square
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[#2E4638] hover:text-[#E07A5F] text-sm font-medium transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
            {token && (
              <a
                href="/staff/dashboard"
                className="ml-4 bg-[#2E4638] text-white px-4 py-2 rounded-md font-medium hover:bg-[#1f3028] transition-all"
              >
                Staff Dashboard
              </a>
            )}
            <a
              href="/login"
              className="ml-2 bg-[#E07A5F] text-white px-2 py-2 rounded-md font-medium hover:bg-[#cf6953] transition-all"
            >
              login
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-[#2E4638] hover:text-[#E07A5F]"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#F4F1DE] border-t border-[#A3B18A]">
            <div className="flex flex-col px-6 py-3 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[#2E4638] font-medium hover:text-[#E07A5F] transition-colors"
                >
                  {link.label}
                </a>
              ))}
              {token && (
                <a
                  href="/staff/dashboard"
                  className="text-[#2E4638] font-medium hover:text-[#E07A5F] transition-colors"
                >
                  Staff Dashboard
                </a>
              )}
              <a
                href="/login"
                className="mt-2 bg-[#E07A5F] text-white px-2 py-2 rounded-md font-medium hover:bg-[#cf6953] transition-all"
              >
                login
              </a>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
