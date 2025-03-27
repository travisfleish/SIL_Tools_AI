"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Inter, Poppins } from 'next/font/google';

// Configure fonts
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Define API base URL - uses environment variable with fallback
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

// Categories instead of sources
const CATEGORIES = [
  { name: "All Categories", id: "" },
  { name: "Fan Intelligence", id: "Fan Intelligence", mobileName: "Fan Intel" },
  { name: "Advertising & Media", id: "Advertising & Media", mobileName: "Ad & Media" },
  { name: "Creative & Personalization", id: "Creative & Personalization", mobileName: "Creative" },
  { name: "Sponsorship & Revenue Growth", id: "Sponsorship & Revenue Growth", mobileName: "Revenue" },
  { name: "Measurement & Analytics", id: "Measurement & Analytics", mobileName: "Analytics" }
];

const FILTERS = [
  { name: "New Tools", id: "new" },
  { name: "Top Tools", id: "top" },
];

export default function Home() {
  const [tools, setTools] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("new");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Ref for the dropdown to detect clicks outside
  const dropdownRef = useRef(null);
  // Ref for header to match mobile menu height exactly
  const headerRef = useRef(null);

  // Add check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tools?event_category=${selectedCategory}&filter=${selectedFilter}`)
      .then((response) => response.json())
      .then((data) => {
        // Slice to 8 tools if more than 8 and filter is 'new'
        const processedTools = selectedFilter === 'new'
          ? data.slice(0, 8)
          : data;

        // Randomly certify one tool if desired
        if (processedTools.length > 0) {
          const certifiedIndex = Math.floor(Math.random() * processedTools.length);
          processedTools[certifiedIndex].certified = true;
        }

        setTools(processedTools);
        setCurrentSlide(0); // Reset carousel position when tools change
      })
      .catch((error) => console.error("Error fetching tools:", error));
  }, [selectedCategory, selectedFilter]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;

      if (scrollPosition >= pageHeight - 50) {
        setShowNewsletter(false); // Hide newsletter when at the bottom
      } else {
        setShowNewsletter(true); // Show newsletter when scrolling up
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.error ? data.error : "Thank you for subscribing!");

      if (!data.error) {
        setEmail("");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  // Functions to handle carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === tools.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? tools.length - 1 : prev - 1));
  };

  // Find the name of currently selected category
  const getSelectedCategoryName = () => {
    const category = CATEGORIES.find(c => c.id === selectedCategory);
    return category ? (isMobile ? category.mobileName || category.name : category.name) : "All Categories";
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col items-center relative">
    {/* Header Section with Sports Innovation Lab-inspired styling */}
    <header
      ref={headerRef}
      className="relative w-full text-white shadow-lg px-4 pt-2 pb-8 md:pt-4 md:pb-16"
      style={{
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Image and Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/SIL_bg.jpg')", // Using the SIL background image
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%)',
          zIndex: 0
        }}
      ></div>

      {/* Dark overlay to ensure text is readable */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1
        }}
      ></div>

      {/* Removed blue radial lines since they're already in the background image */}

      {/* Content container - all content must be above the background layers */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {/* Top: Logo + Hamburger + Nav */}
        <div className="flex items-center justify-between w-full mb-6 md:mb-8">
          {/* Left: Combined Logos */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs tracking-wider text-white font-semibold leading-tight text-center">
              POWERED BY:
            </span>
            <div className="flex items-center space-x-3">
              <a href="https://www.twinbrain.ai" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/logo.png"
                  alt="TwinBrain Logo"
                  width={isMobile ? 60 : 90}
                  height={isMobile ? 30 : 45}
                />
              </a>
              <span className="text-white font-bold">×</span>
              <a href="https://www.sportsinnovationlab.com" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/sil-logo.png"
                  alt="Sports Innovation Lab Logo"
                  width={isMobile ? 70 : 100}
                  height={isMobile ? 30 : 40}
                />
              </a>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex gap-6 text-sm sm:text-base text-white font-semibold">
            <a href="https://www.sportsilab.com/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Sports Innovation Lab</a>
            <a href="/submit-tool" className="hover:underline">AI Playbook</a>
            <a href="/advertise" className="hover:underline">Advertise</a>
          </nav>

          {/* Mobile Hamburger */}
          <div className="sm:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-white focus:outline-none">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Modern Styled Title Section with Reduced Padding */}
        <div className="text-center mt-4 pb-8 md:pb-12">
          <h1 className={`${inter.className} text-3xl sm:text-5xl md:text-6xl leading-tight mb-3 tracking-tight`}>
            <span className="font-normal text-white">Sports</span>
            <span className="font-bold text-white">Innovation</span>
            <span className="font-normal text-white">Lab</span>
            <span className="font-bold text-yellow-300">AI</span>
          </h1>
          <p className={`${poppins.className} hidden sm:block text-lg sm:text-xl md:text-2xl mt-2 font-light`}>
            Discover the best AI tools for sports innovation
          </p>
          <p className={`${poppins.className} text-md sm:text-lg mt-3 mb-4 text-white/90 font-light`}>
            Curated by Sports Innovation Lab & TwinBrain AI
          </p>
        </div>
      </div>

      {/* Mobile Dropdown - The menu needs to have the same styling for consistency */}
      {menuOpen && (
        <div
          className="absolute top-0 left-0 right-0 text-white z-40 px-4 shadow-md border-b border-blue-500 overflow-y-auto"
          style={{
            height: headerRef.current ? `${headerRef.current.offsetHeight}px` : '100%',
            backgroundImage: "url('/SIL_bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)'
          }}
        >
          {/* Dark overlay for mobile menu */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              zIndex: 0
            }}
          ></div>

          {/* Mobile menu content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Top Row: Logo and Close Button */}
            <div className="flex items-center justify-between pt-4 pb-2">
              <div className="flex items-center space-x-2">
                <a href="https://www.twinbrain.ai" target="_blank" rel="noopener noreferrer">
                  <Image src="/logo.png" alt="TwinBrain Logo" width={50} height={25} />
                </a>
                <span className="text-white">×</span>
                <a href="https://www.sportsinnovationlab.com" target="_blank" rel="noopener noreferrer">
                  <Image src="/sil-logo.png" alt="Sports Innovation Lab Logo" width={60} height={25} />
                </a>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-gray-200 hover:text-white text-2xl font-light"
              >
                ×
              </button>
            </div>

            {/* Nav Links Container with improved spacing */}
            <div className="flex flex-col items-center space-y-4 py-4 mt-2 pb-12">
              <h1 className={`${inter.className} text-xl font-semibold tracking-tight mb-6`}>SportsTechAI</h1>
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-center w-full max-w-xs">
                <a href="https://www.sportsilab.com/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="hover:underline text-base font-medium">Sports Innovation Lab</a>
                <a href="/submit-tool" onClick={() => setMenuOpen(false)} className="hover:underline text-base font-medium">AI Playbook</a>
                <a href="#fixed-newsletter" onClick={() => setMenuOpen(false)} className="hover:underline text-base font-medium">Newsletter</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
      {/* Replace the Category Selection section with this */}
      <section className="p-4 pt-8 flex justify-center bg-gray-100">
        <div className="inline-flex flex-wrap rounded-md shadow-sm">
          {CATEGORIES.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 text-sm font-bold
                border border-gray-300
                ${index === 0 ? "rounded-l-lg" : ""}
                ${index === CATEGORIES.length - 1 ? "rounded-r-lg" : ""}
                ${selectedCategory === category.id 
                  ? "bg-blue-600 text-white z-10" 
                  : "bg-gray-150 text-gray-900 hover:bg-gray-300"}
                ${index > 0 && "-ml-px"}
                transition
                whitespace-nowrap
              `}
            >
              {isMobile && category.mobileName ? category.mobileName : category.name}
            </button>
          ))}
        </div>
      </section>

      {/* New & Top Tools Selection - Modified to look like a toggle */}
      <section className="p-4 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm">
          {FILTERS.map((filter, index) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`
                px-4 py-2 text-sm font-medium
                ${index === 0 ? "rounded-l-lg" : ""}
                ${index === FILTERS.length - 1 ? "rounded-r-lg" : ""}
                ${selectedFilter === filter.id 
                  ? "bg-blue-600 text-white z-10" 
                  : "bg-white text-gray-900 hover:bg-gray-50"}
                border border-gray-300
                ${index > 0 && "-ml-px"}
                transition
              `}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </section>

      {/* Tools Section - Modified to use carousel on mobile */}
      <section className="p-6 w-full">
        {isMobile ? (
          // Mobile Carousel View
          <div className="relative w-full">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md"
              aria-label="Previous tool"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            {/* Carousel Item */}
            {tools.length > 0 && (
              <div className="w-full flex justify-center px-8">
                <div
                  className={`w-full p-4 border rounded-lg shadow-lg bg-white flex flex-col items-center text-center ${tools[currentSlide]?.certified ? "border-4 border-yellow-500" : ""}`}
                >
                  {tools[currentSlide]?.certified && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-yellow-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                      <span>⭐ SIL Certified!</span>
                    </div>
                  )}
                  <img
                    src={tools[currentSlide]?.screenshot_url || "/default-screenshot.png"}
                    alt={`${tools[currentSlide]?.name} Screenshot`}
                    className="w-full h-auto rounded-lg mb-4"
                  />
                  <h3 className={`${inter.className} text-lg font-bold flex items-center justify-center`}>
                    <a href={tools[currentSlide]?.source_url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {tools[currentSlide]?.name}
                    </a>
                    <ExternalLink className="ml-2 w-4 h-4 text-gray-500" />
                  </h3>
                  {/* Add category badge here */}
                  {tools[currentSlide]?.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1 mb-2">
                      {tools[currentSlide]?.category}
                    </span>
                  )}
                  <p className="text-gray-600 text-center">{tools[currentSlide]?.short_description}</p>
                </div>
              </div>
            )}

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md"
              aria-label="Next tool"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {tools.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Desktop Grid View with plain white cards and hover effect
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {tools.slice(0,8).map((tool, index) => {
              const imageUrl = tool.screenshot_url && tool.screenshot_url.trim() !== ""
                ? tool.screenshot_url
                : "/default-screenshot.png";

              return (
                <div
                  key={index}
                  className={`relative p-4 rounded-lg shadow-md bg-white flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${tool.certified ? "border-2 border-yellow-500" : "border border-gray-200"}`}
                >
                  {tool.certified && (
                    <div className="absolute -top-2 right-1/4 transform translate-x-1/2 z-10 flex items-center space-x-2 bg-yellow-500 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                      <span>⭐ SIL Certified!</span>
                    </div>
                  )}

                  <Image
                    src={imageUrl}
                    alt={`${tool.name} Screenshot`}
                    width={1280}
                    height={800}
                    className="w-full h-auto rounded-md shadow-sm mb-4"
                    unoptimized
                  />

                  <h3 className={`${inter.className} text-lg font-bold flex items-center`}>
                    <a href={tool.source_url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      {tool.name}
                    </a>
                    <ExternalLink className="ml-2 w-4 h-4 text-gray-500" />
                  </h3>
                  {/* Add category badge here */}
                  {tool.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1 mb-1">
                      {tool.category}
                    </span>
                  )}
                  <p className="text-gray-600 text-center mt-1">{tool.short_description}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Fixed Newsletter Section */}
      <section id="fixed-newsletter" className="w-full py-10 flex flex-col items-center shadow-md mt-10 px-4 sm:px-0 relative overflow-hidden">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('/Logo_BG.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        ></div>

        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8 text-center md:text-left text-white">
            <h2 className={`${inter.className} text-2xl md:text-3xl font-bold`}>
              Sports Technology Insights! 🏆
            </h2>
            <p className="mt-2 text-lg">
              <span className="font-semibold">Join industry leaders</span> receiving weekly updates on the latest sports innovation tools and trends.
            </p>
            <p className="mt-1 text-sm text-yellow-200 font-medium">
              <span className="inline-block bg-blue-800 rounded-full px-2 py-1 mr-2">⚡ EXCLUSIVE</span>
              Curated by Sports Innovation Lab & TwinBrain AI
            </p>
          </div>

          <div className="md:w-1/2 w-full">
            <form className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-6 py-3 rounded-lg text-gray-900 border-2 border-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent w-full sm:w-auto flex-grow text-base shadow-md"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition shadow-md w-full sm:w-auto whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </form>
            {message && (
              <p className="text-lg mt-2 font-medium text-center sm:text-left text-white">{message}</p>
            )}
            <p className="text-xs mt-2 text-white/80 text-center sm:text-left">
              Get insights from both Sports Innovation Lab and TwinBrain AI experts.
            </p>
          </div>
        </div>
      </section>


     {/* Floating Newsletter Section - Fixed positioning issue */}
    {showNewsletter && (
      <section
        className="hidden sm:block fixed bottom-0 w-full text-white py-6 shadow-xl z-50 overflow-hidden"
        style={{
          animation: 'slideUp 0.5s ease-out',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('/Logo_BG.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        ></div>

        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="md:w-1/2 mb-4 md:mb-0 md:pr-8">
            <h2 className={`${inter.className} text-2xl md:text-3xl font-bold`}>Sports Tech Updates! 🏆</h2>
            <p className="mt-2 text-lg">
              <span className="font-semibold">Join industry leaders</span> discovering game-changing sports tech tools weekly.
              <span className="hidden md:inline"> Stay ahead with premier sports innovation insights.</span>
            </p>
            <p className="mt-1 text-sm text-yellow-200 font-medium">
              <span className="inline-block bg-blue-800 rounded-full px-2 py-1 mr-2">⚡ EXCLUSIVE</span>
              Curated by Sports Innovation Lab & TwinBrain AI
            </p>
          </div>

          <div className="md:w-1/2">
            <form className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-6 py-3 rounded-lg text-gray-900 border-2 border-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent w-full sm:w-auto flex-grow text-base shadow-md"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition shadow-md w-full sm:w-auto whitespace-nowrap"
                style={{
                  animation: 'pulse 2s infinite',
                }}
              >
                Subscribe Now
              </button>
            </form>
            {message && (
              <p className="text-lg mt-2 font-medium text-center sm:text-left text-white">{message}</p>
            )}
            <p className="text-xs mt-2 text-white/80 text-center sm:text-left">Get insights from both Sports Innovation Lab and TwinBrain AI experts.</p>
          </div>

          <button
            onClick={() => setShowNewsletter(false)}
            className="absolute top-2 right-2 text-white hover:text-yellow-200 transition"
            aria-label="Close newsletter"
          >
            <X size={24} />
          </button>
        </div>
      </section>
    )}

      {/* Add this to your existing styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 204, 0, 0.7);
          }
          
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 204, 0, 0);
          }
          
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 204, 0, 0);
          }
        }
      `}</style>

      {/* Embedded YouTube Videos Section - Improved for mobile */}
      <div className="w-full flex flex-col items-center py-8">
        {/* Follow us Header & YouTube Link */}
        <div className="text-center mb-6 px-4">
          <h2 className={`${inter.className} text-2xl font-semibold mb-2`}>Sports Innovation Highlights</h2>
          <p className="text-gray-600">Watch the latest discussions on sports technology</p>
        </div>

        {/* YouTube Videos - Removed excessive black space on mobile */}
        <section className="w-full flex flex-wrap justify-center gap-6 px-4">
          {/* First Video - Enhanced mobile ratio */}
          <div className="w-full sm:w-4/5 aspect-video max-w-[900px]">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/ccrj9qymiUs"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Second Video - Enhanced mobile ratio */}
          <div className="w-full sm:w-4/5 aspect-video max-w-[900px]">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/NxOyVYW_8Qs"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      </div>

      {/* Updated Footer with Darker Background */}
      <footer className="w-full bg-gray-500 text-white border-t mt-10 py-8 flex flex-col items-center space-y-4">
        {/* Combined Logos */}
        <div className="flex items-center space-x-8">
          <a href="https://www.twinbrain.ai" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
            <Image src="/logo.png" alt="TwinBrain Logo" width={100} height={50} />
          </a>
          <span className="text-gray-300 font-bold text-2xl">×</span>
          <a href="https://www.sportsinnovationlab.com" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
            <Image src="/sil-logo.png" alt="Sports Innovation Lab Logo" width={120} height={50} />
          </a>
        </div>

        {/* Social Media Links */}
        <div className="flex space-x-4 mt-4">
          <a
            href="https://www.linkedin.com/company/twinbrain-ai/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn - TwinBrain AI"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="#ffffff"
            >
              <title>LinkedIn - TwinBrain AI</title>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.937v5.669H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.368-1.852 3.6 0 4.266 2.368 4.266 5.452v6.291zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.977 20.452H3.696V9h3.281v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.555C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.278V1.723C24 .771 23.2 0 22.222 0z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/sportsinnovationlab/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn - Sports Innovation Lab"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="#ffffff"
            >
              <title>LinkedIn - Sports Innovation Lab</title>
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.937v5.669H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.368-1.852 3.6 0 4.266 2.368 4.266 5.452v6.291zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.977 20.452H3.696V9h3.281v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.555C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.278V1.723C24 .771 23.2 0 22.222 0z"/>
            </svg>
          </a>
        </div>

        <p className="text-xs text-gray-300">
          &copy; {new Date().getFullYear()} | A collaboration between TwinBrain AI & Sports Innovation Lab
        </p>
      </footer>
    </div>
  );
}