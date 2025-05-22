"use client";

import axiosClient from "@/app/_utils/axiosClient";
import Cookies from "js-cookie";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InstructorSignUp = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user
      const registerRes = await axiosClient.post("/auth/local/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      const { jwt, user } = registerRes.data;

      // Update user role to instructor
      await axiosClient.put(
        `/users/${user.id}`,
        {
          isInstructor: true,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      // Set cookies
      Cookies.set("jwt", jwt, { expires: 7 });
      Cookies.set("user", JSON.stringify({ ...user, isInstructor: true }), {
        expires: 7,
      });

      toast.success("Instructor registration successful!");

      setTimeout(() => {
        router.push("/login");
      }, 1500);

      setFormData({
        username: "",
        email: "",
        password: "",
      });
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message ||
          "Error registering instructor. Please try again."
      );
      console.error("Error registering instructor:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#A96EFF] to-[#5932A7] p-6">
      <div className="w-full max-w-md bg-[#F5E8FF] rounded-lg shadow-xl p-8 border border-[#A96EFF]">
        <h2 className="text-4xl font-bold text-center mb-8 text-[#5932A7]">
          Register as Instructor
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            {
              id: "username",
              label: "Username",
              placeholder: "Choose a username",
            },
            {
              id: "email",
              label: "Email Address",
              type: "email",
              placeholder: "Your email",
            },
            {
              id: "password",
              label: "Password",
              type: "password",
              placeholder: "Your password",
            },
          ].map((field) => (
            <div className="flex flex-col" key={field.id}>
              <label
                htmlFor={field.id}
                className="text-sm font-medium text-[#3E2069] mb-1"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                type={field.type || "text"}
                name={field.id}
                placeholder={field.placeholder}
                className="p-3 border-2 border-[#A96EFF] rounded-lg bg-white text-[#3E2069] placeholder-[#B68AC5] focus:ring-2 focus:ring-[#A96EFF] focus:outline-none"
                value={formData[field.id]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-[#A96EFF] to-[#7B4FA2] text-white font-semibold shadow-lg hover:opacity-90 focus:ring-4 focus:ring-[#A96EFF] focus:outline-none"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register as Instructor"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-[#3E2069]">
          Already have an account?{" "}
          <a
            href="/Login"
            className="text-[#A96EFF] hover:underline font-medium"
          >
            Login here
          </a>
        </p>

        <ToastContainer />
      </div>
    </div>
  );
};

export default InstructorSignUp;
