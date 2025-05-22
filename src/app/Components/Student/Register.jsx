"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signUpUser } from "@/app/api/auth";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { success, user, error } = await signUpUser(formData);

    if (success) {
      toast.success("Registration successful!");
      router.push("/login");

      setFormData({
        username: "",
        email: "",
        password: "",
      });
    } else {
      toast.error("Error registering user. Please try again.");
      console.error("Registration error:", error);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#A96EFF] to-[#5932A7] p-6">
      <div className="w-full max-w-2xl bg-[#F5E8FF] rounded-lg shadow-xl p-8 border border-[#A96EFF]">
        <h2 className="text-4xl font-bold text-center mb-8 text-[#5932A7]">
          Register Your Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            {
              id: "username",
              label: "Username",
              placeholder: "Enter your username",
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default SignUp;
