"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";

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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center mt-20">
        Payment for {course?.title}
      </h2>

      {!paymentResult ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 text-blue-800 rounded-md">
            <p className="font-medium">Course: {course?.title}</p>
            <p className="font-bold text-lg">Price: ${course?.price}</p>
            <p className="text-sm">You're paying the exact course amount</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="4242 4242 4242 4242"
              pattern="[0-9\s]{13,19}"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry (MM/YY)
              </label>
              <input
                type="text"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                placeholder="12/25"
                pattern="\d{2}/\d{2}"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                pattern="\d{3}"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : `Pay $${course?.price}`}
          </button>

          <div className="mt-6 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
            <h4 className="font-medium mb-2">Test Card Details:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use any 16-digit number for card</li>
              <li>Any future date for expiry (MM/YY)</li>
              <li>Any 3-digit number for CVV</li>
              <li>System will randomly fail 10% of payments</li>
            </ul>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <div
            className={`p-4 rounded-md ${
              paymentResult.success
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            <h3 className="text-xl font-bold mb-2">
              {paymentResult.success ? "Payment Successful!" : "Payment Failed"}
            </h3>
            <p>Reference: {paymentResult.reference}</p>
            <p>Amount: ${paymentResult.amount}</p>
            <p>Date: {paymentResult.timestamp}</p>
            {paymentResult.success && <p>Course: {course?.title}</p>}
          </div>

          {paymentResult.success ? (
            <>
              <button
                onClick={handleEnrollNow}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Access Course Now
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Return to Dashboard
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPaymentResult(null)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Payment Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Return to Dashboard
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
