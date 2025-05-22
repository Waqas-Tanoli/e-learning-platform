"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaBookOpen,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import Cookies from "js-cookie";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    price: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 9,
    pageCount: 1,
    total: 0,
  });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Get user data from cookies
    const userData = Cookies.get("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("jwt");
    Cookies.remove("userId");
    Cookies.remove("token");
    setUser(null);

    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    // Refresh the page
    router.refresh();
  };

  const navLinks = [
    { name: "Courses", href: "/courses", icon: <FaBookOpen /> },
    { name: "For Students", href: "/students", icon: <FaUserGraduate /> },
    {
      name: "For Instructors",
      href: "/instructors",
      icon: <FaChalkboardTeacher />,
    },
  ];

  const userDropdownLinks = [
    { name: "View Profile", href: "/profile", icon: <FaUserCircle /> },
    { name: "All Courses", href: "/courses", icon: <FaBookOpen /> },
  ];

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-2" : "bg-white/90 py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">EL</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              EduLearn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center space-x-2 font-medium transition-colors ${
                  pathname === link.href
                    ? "text-purple-600"
                    : "text-gray-700 hover:text-purple-500"
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          {/* Search and Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            {!user ? (
              <div className="flex space-x-3">
                <Link
                  href="/instructorSignUp"
                  className="px-4 py-2 rounded-lg font-medium text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Teach on EduLearn
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaUserCircle className="text-purple-600 text-xl" />
                  </div>
                  <span className="font-medium text-gray-700">
                    {user.name || "My Account"}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50">
                    {userDropdownLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <span className="mr-3">{link.icon}</span>
                        {link.name}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    >
                      <span className="mr-3">
                        <FaSignOutAlt />
                      </span>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                    pathname === link.href
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </nav>

            {!user ? (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link
                  href="/instructorSignUp"
                  className="px-4 py-2 rounded-lg font-medium text-center text-indigo-600 border border-indigo-600 hover:bg-indigo-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Become an Instructor
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg font-medium text-center text-purple-600 hover:bg-purple-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg font-medium text-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaUserCircle className="text-purple-600 text-xl" />
                  </div>
                  <span className="font-medium">
                    {user.name || "My Account"}
                  </span>
                </div>
                {userDropdownLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                >
                  <span className="text-lg">
                    <FaSignOutAlt />
                  </span>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
