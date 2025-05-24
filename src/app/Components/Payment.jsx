"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import {
  FaCreditCard,
  FaCalendarAlt,
  FaLock,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaBookOpen,
  FaShoppingCart,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import { BsShieldLock, BsCreditCard2Back } from "react-icons/bs";
import { RiVisaLine, RiMastercardFill } from "react-icons/ri";

const PaymentPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;

  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const fetchCourseData = async () => {
    try {
      const jwt = Cookies.get("jwt");

      // Fetch course data
      const courseRes = await fetch(
        `http://localhost:1337/api/courses?filters[id][$eq]=${courseId}&populate=*`,
        {
          headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        }
      );

      if (!courseRes.ok)
        throw new Error(`Failed to fetch course: ${courseRes.status}`);

      const courseData = await courseRes.json();
      console.log("Course data from API:", courseData);

      if (!courseData.data || courseData.data.length === 0) {
        throw new Error("Course not found");
      }

      // Extract attributes from the nested structure
      const raw = courseData.data[0];
      const attributes = raw;
      setCourse(attributes);

      // Fetch user enrollment status if logged in
      if (jwt) {
        try {
          // First get the user ID
          const userRes = await fetch(
            "http://localhost:1337/api/users/me?populate=*",
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          );

          if (!userRes.ok) throw new Error("Failed to fetch user data");

          const userData = await userRes.json();
          setUser(userData);

          // Then check if user is enrolled in this course
          const enrollmentRes = await fetch(
            `http://localhost:1337/api/enrolled-courses?filters[users_permissions_users][id][$eq]=${userData.id}&filters[courses][id][$eq]=${courseId}`
          );

          if (!enrollmentRes.ok) throw new Error("Failed to check enrollment");

          const enrollmentData = await enrollmentRes.json();
          const enrolled = enrollmentData.data.length > 0;
          setIsEnrolled(enrolled);
        } catch (err) {
          console.error("Error fetching user enrollment:", err);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!courseId) {
        throw new Error("Course ID is missing");
      }

      if (isEnrolled) {
        throw new Error("You are already enrolled in this course");
      }

      const jwt = Cookies.get("jwt");
      if (!jwt) {
        throw new Error("You need to be logged in to make a payment");
      }

      // Simple validation
      if (!formData.cardNumber || !formData.expiry || !formData.cvv) {
        throw new Error("Please fill all payment details");
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Randomly fail 10% of the time to simulate declines
      const isSuccess = Math.random() > 0.1;

      // Generate fake reference
      const reference = `MOCK-${Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase()}`;

      if (isSuccess) {
        // Create payment record in Strapi
        const paymentResponse = await fetch(
          "http://localhost:1337/api/payments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              data: {
                amount: course.price,
                PaymentStatus: "succeeded",
                reference,
                course: courseId,
                users_permissions_users: user.id,
              },
            }),
          }
        );

        if (!paymentResponse.ok) {
          console.log(Error);
          throw new Error("Failed to record payment");
        }

        // Enroll user in the course
        const enrollmentResponse = await fetch(
          "http://localhost:1337/api/enrolled-courses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              data: {
                users_permissions_users: user.id,
                courses: course.documentId,
                enrolledAt: new Date().toISOString(),
                payment_reference: reference,
              },
            }),
          }
        );

        if (!enrollmentResponse.ok) {
          throw new Error("Failed to enroll in course");
        }

        setIsEnrolled(true);
      }

      setPaymentResult({
        success: isSuccess,
        reference,
        amount: course?.price,
        timestamp: new Date().toLocaleString(),
        courseId,
      });

      if (!isSuccess) {
        throw new Error("Payment declined by bank (simulated)");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollNow = () => {
    router.push(`/learning/${courseId}`);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-6 text-red-600">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Course Already Purchased</h2>
        <p className="mb-6">You are already enrolled in this course.</p>
        <button
          onClick={handleEnrollNow}
          className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Access Course Now
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 bg-white rounded-xl shadow-sm md:shadow-lg mt-10 md:mt-20">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-50 rounded-full mb-3">
          <BsShieldLock className="text-blue-600 text-xl md:text-2xl" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Payment for <span className="text-blue-600">{course?.title}</span>
        </h2>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Secure 256-bit SSL encrypted payment
        </p>
      </div>

      {!paymentResult ? (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Order Summary */}
          <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <FaShoppingCart className="text-blue-600 text-sm" />
              <h3 className="font-medium text-blue-800 text-sm md:text-base">
                Order Summary
              </h3>
            </div>
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-gray-600">Course:</span>
              <span className="font-medium truncate max-w-[180px]">
                {course?.title}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-gray-600">Amount:</span>
              <span className="text-lg md:text-xl font-bold text-blue-600">
                ${course?.price}
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-3 md:space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FaCreditCard className="text-gray-400 text-xs" />
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="4242 4242 4242 4242"
                  pattern="[0-9\s]{13,19}"
                  required
                  className="w-full pl-9 pr-3 py-2 md:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <FaCreditCard className="absolute left-3 top-2.5 md:top-3.5 text-gray-400 text-sm" />
                <div className="absolute right-3 top-2.5 md:top-3.5 flex gap-1">
                  <RiVisaLine className="text-gray-400 text-lg" />
                  <RiMastercardFill className="text-gray-400 text-lg" />
                </div>
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FaCalendarAlt className="text-gray-400 text-xs" />
                  Expiry
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    pattern="\d{2}/\d{2}"
                    required
                    className="w-full pl-9 pr-3 py-2 md:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <FaCalendarAlt className="absolute left-3 top-2.5 md:top-3.5 text-gray-400 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FaLock className="text-gray-400 text-xs" />
                  CVV
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="•••"
                    pattern="\d{3}"
                    required
                    className="w-full pl-9 pr-3 py-2 md:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <FaLock className="absolute left-3 top-2.5 md:top-3.5 text-gray-400 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2 text-xs md:text-sm text-red-700 bg-red-50 rounded-lg flex items-center gap-2">
              <FaTimesCircle className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 md:py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-sm"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <FaLock className="text-sm" /> Pay ${course?.price}
              </>
            )}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <FaShieldAlt className="text-green-500" />
            <span>Payments are secure and encrypted</span>
          </div>

          {/* Test Payment Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-700 text-xs md:text-sm mb-2 flex items-center gap-1">
              <HiOutlineReceiptRefund className="text-gray-500" />
              Test Payment Information
            </h4>
            <ul className="text-xs md:text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                Use any 16-digit card number
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                Future date for expiry (MM/YY)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                Any 3-digit CVV
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                Random 10% failure rate (simulated)
              </li>
            </ul>
          </div>
        </form>
      ) : (
        /* Payment Result Section */
        <div className="text-center space-y-4 md:space-y-6">
          <div
            className={`p-4 md:p-6 rounded-lg border ${
              paymentResult.success
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="text-4xl md:text-5xl mb-3">
              {paymentResult.success ? (
                <FaCheckCircle className="mx-auto text-green-500" />
              ) : (
                <FaTimesCircle className="mx-auto text-red-500" />
              )}
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-1">
              {paymentResult.success ? "Payment Successful!" : "Payment Failed"}
            </h3>
            <div className="text-xs md:text-sm space-y-1 mt-3">
              <p className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{paymentResult.reference}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${paymentResult.amount}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{paymentResult.timestamp}</span>
              </p>
            </div>
          </div>

          {paymentResult.success ? (
            <>
              <button
                onClick={handleEnrollNow}
                className="w-full py-2.5 md:py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <FaBookOpen /> Access Course Now
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 md:py-3 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <FaArrowLeft /> Return to Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPaymentResult(null)}
                className="w-full py-2.5 md:py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <BsCreditCard2Back /> Try Payment Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 md:py-3 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <FaArrowLeft /> Return to Dashboard
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
