"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { FiUser, FiBook, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const userRes = await axios.get(
          `http://localhost:1337/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser({
          username: userRes.data.username,
          userId: userRes.data.id,
          createdAt: userRes.data.createdAt,
        });

        const response = await axios.get(
          `http://localhost:1337/api/enrolled-courses?filters[users_permissions_users][id][$eq]=${userId}&populate[courses][populate]=*`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCourses(response.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    Cookies.remove("jwt");
    Cookies.remove("jwtToken");
    Cookies.remove("userId");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 bg-purple-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 w-32 bg-purple-200 rounded mx-auto mb-2"></div>
          <div className="h-4 w-24 bg-purple-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-purple-600 mb-2">
            Session Expired
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to view your profile
          </p>
          <Link
            href="/login"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-14">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 sm:p-8 text-white flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <FiUser className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.username}</h1>
                <p className="text-purple-100">User ID: {user?.userId}</p>
                <p className="text-purple-100">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-white text-purple-600 font-semibold rounded hover:bg-purple-100 transition cursor-pointer"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>

          {/* Enrolled Courses */}
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FiBook className="mr-2 text-purple-600" />
              My Courses
            </h2>

            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((item, index) => {
                  const course = item.courses?.[0];
                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition flex items-center space-x-4"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
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
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {course?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Instructor: {course?.instructor}
                        </p>
                        <p className="text-sm text-gray-500">
                          Readings: {course?.readings?.length || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          Assignments: {course?.assignments?.length || 0}
                        </p>
                      </div>
                      <Link
                        href={`/learning/${course?.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">
                You have not enrolled in any courses yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
