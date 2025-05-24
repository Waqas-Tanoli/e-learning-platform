"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaBookOpen,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserCircle,
  FaSignOutAlt,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import Cookies from "js-cookie";
import axios from "axios";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    price: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetchCourses();
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        "pagination[page]": 1,
        "pagination[pageSize]": 5,
        "populate[thumbnail]": true,
        publicationState: "live",
      };

      if (searchTerm) params["filters[title][$containsi]"] = searchTerm;
      if (filters.category) params["filters[category][$eq]"] = filters.category;
      if (filters.level) params["filters[level][$eq]"] = filters.level;
      if (filters.price === "isFree") params["filters[isFree][$eq]"] = true;
      if (filters.price === "paid") params["filters[isFree][$eq]"] = false;

      const response = await axios.get("http://localhost:1337/api/courses", {
        params,
      });

      setSearchResults(response.data.data);
      setShowSearchResults(true);
      console.log(response);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to fetch courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      const queryParams = new URLSearchParams();
      queryParams.set("search", searchTerm);

      if (filters.category) queryParams.set("category", filters.category);
      if (filters.level) queryParams.set("level", filters.level);
      if (filters.price) queryParams.set("price", filters.price);

      router.push(`/courses?${queryParams.toString()}`);
      setShowSearchResults(false);
      setSearchTerm("");
    }
  };

  const handleViewAllResults = () => {
    const queryParams = new URLSearchParams();
    queryParams.set("search", searchTerm);

    if (filters.category) queryParams.set("category", filters.category);
    if (filters.level) queryParams.set("level", filters.level);
    if (filters.price) queryParams.set("price", filters.price);

    router.push(`/courses?${queryParams.toString()}`);
    setShowSearchResults(false);
    setSearchTerm("");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    Cookies.remove("user");
    Cookies.remove("jwt");
    Cookies.remove("userId");
    Cookies.remove("token");
    setUser(null);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.refresh();
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      level: "",
      price: "",
    });
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
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm && setShowSearchResults(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchResults(false), 200)
                  }
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-purple-500"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                </button>
              </form>

              {/* Filter Dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 px-4 z-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                      >
                        <option value="">All Categories</option>
                        <option value="web-development">Web Development</option>
                        <option value="data-science">Data Science</option>
                        <option value="business">Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={filters.level}
                        onChange={(e) =>
                          setFilters({ ...filters, level: e.target.value })
                        }
                      >
                        <option value="">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={filters.price}
                        onChange={(e) =>
                          setFilters({ ...filters, price: e.target.value })
                        }
                      >
                        <option value="">All Prices</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 mt-1 w-full bg-white rounded-lg shadow-lg py-2 z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchTerm("");
                      }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                        {course.thumbnail?.url && (
                          <img
                            src={`${
                              process.env.NEXT_PUBLIC_STRAPI_URL ||
                              "http://localhost:1337"
                            }${course.thumbnail.url}`}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-course.jpg";
                            }}
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {course?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {course.isFree ? "Free" : "Paid"}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleViewAllResults}
                    className="block text-center text-sm font-medium text-purple-600 px-4 py-2 hover:bg-purple-50 w-full"
                  >
                    View all results ({searchResults.length})
                  </button>
                </div>
              )}
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
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm && setShowSearchResults(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchResults(false), 200)
                  }
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </form>

              {/* Mobile Filter Button */}
              <button
                className="absolute right-3 top-3 text-gray-400 hover:text-purple-500"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
              </button>

              {/* Mobile Filter Panel */}
              {showFilters && (
                <div className="mt-2 bg-white rounded-lg shadow-lg py-2 px-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Filters</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={clearFilters}
                        className="text-xs text-purple-600 hover:underline"
                      >
                        Clear all
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                      >
                        <option value="">All Categories</option>
                        <option value="web-development">Web Development</option>
                        <option value="data-science">Data Science</option>
                        <option value="business">Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={filters.level}
                        onChange={(e) =>
                          setFilters({ ...filters, level: e.target.value })
                        }
                      >
                        <option value="">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={filters.price}
                        onChange={(e) =>
                          setFilters({ ...filters, price: e.target.value })
                        }
                      >
                        <option value="">All Prices</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="mt-1 bg-white rounded-lg shadow-lg py-2 max-h-60 overflow-y-auto">
                  {searchResults.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchTerm("");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                        {course.thumbnail?.url && (
                          <img
                            src={`${
                              process.env.NEXT_PUBLIC_STRAPI_URL ||
                              "http://localhost:1337"
                            }${course.thumbnail.url}`}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-course.jpg";
                            }}
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {course?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {courser?.isFree ? "isFree" : "Paid"}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleViewAllResults}
                    className="block text-center text-sm font-medium text-purple-600 px-4 py-2 hover:bg-purple-50 w-full"
                  >
                    View all results ({searchResults.length})
                  </button>
                </div>
              )}
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
