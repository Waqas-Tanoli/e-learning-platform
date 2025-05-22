"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaUserGraduate,
  FaSpinner,
  FaPlayCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const Courses = () => {
  const router = useRouter();
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
  const [categories, setCategories] = useState([]);

  // Extract plain text from Strapi rich text description
  const parseDescription = (description) => {
    if (!description) return "";
    if (typeof description === "string") return description;

    try {
      return description
        .map((item) => item.children?.map((child) => child.text).join("") || "")
        .join("\n");
    } catch {
      return "";
    }
  };

  // Fetch courses from Strapi API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        "pagination[page]": pagination.page,
        "pagination[pageSize]": pagination.pageSize,
        "populate[thumbnail]": true,
        publicationState: "live",
      };

      if (searchTerm) params["filters[title][$containsi]"] = searchTerm;
      if (filters.category) params["filters[category][$eq]"] = filters.category;
      if (filters.level) params["filters[Level][$eq]"] = filters.level;
      if (filters.price === "free") params["filters[isFree][$eq]"] = true;
      if (filters.price === "paid") params["filters[isFree][$eq]"] = false;

      const response = await axios.get("http://localhost:1337/api/courses", {
        params,
      });

      setCourses(response.data.data);
      console.log("Fetched Courses from courses component", response.data.data);
      setPagination({
        ...pagination,
        pageCount: response.data.meta.pagination.pageCount,
        total: response.data.meta.pagination.total,
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to fetch courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  //   // Fetch categories from Strapi
  //   const fetchCategories = async () => {
  //     try {
  //       const response = await axios.get(`http://localhost:1337/api/categories`, {
  //         params: {
  //           "fields[0]": "category",
  //           groupBy: "category",
  //         },
  //       });

  //       const uniqueCategories = [
  //         ...new Set(
  //           response.data.data.map((course) => course.attributes.category)
  //         ),
  //       ].filter(Boolean);

  //       setCategories(uniqueCategories);
  //     } catch (err) {
  //       console.error("Error fetching categories:", err);
  //     }
  //   };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchCourses();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      level: "",
      price: "",
    });
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatPrice = (course) => {
    if (course.attributes.isFree) return "Free";
    if (course.attributes.discountedPrice) {
      return (
        <>
          <span className="text-gray-400 line-through mr-2">
            ${course.attributes.price}
          </span>
          <span className="font-bold text-purple-600">
            ${course.attributes.discountedPrice}
          </span>
        </>
      );
    }
    return course.attributes.price ? `$${course.attributes.price}` : "Free";
  };

  useEffect(() => {
    fetchCourses();
    // fetchCategories();
  }, [pagination.page, searchTerm, filters]);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-12">
            All Courses
          </h1>
          <p className="text-gray-600">Browse our complete course catalog</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    value={filters.level}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <select
                    name="price"
                    value={filters.price}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Prices</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-purple-600" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="text-red-500">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48">
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
                    <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      {course.category || "Uncategorized"}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-900">
                        {course.title}
                      </h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="font-medium">
                          {course.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {course.shortDescription || "No description available"}
                    </p>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-gray-500 text-sm">
                        <FaUserGraduate className="mr-1" />
                        <span>{course.students || "0"} students</span>
                      </div>
                      <div className="text-right">
                        {course.isFree ? "Free" : `$${course.price || "0"}`}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{course.Level || "Level not set"}</span>
                      <span>{course.durationHours || "0"} hours</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pageCount > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: pagination.pageCount },
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                      className={`px-3 py-1 rounded-md ${
                        pagination.page === pageNum
                          ? "bg-purple-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.pageCount}
                    className="px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* No results */}
            {courses.length === 0 && !loading && (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-purple-600 hover:text-purple-700"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Courses;
