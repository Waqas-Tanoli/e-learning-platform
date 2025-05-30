import Cookies from "js-cookie";
import { toast } from "react-toastify";
import axiosClient from "../_utils/axiosClient";

export const signUpUser = async (formData) => {
  try {
    const registerRes = await axiosClient.post(
      "/auth/local/register",
      formData
    );

    const { jwt, user } = registerRes.data;

    Cookies.set("jwt", jwt, { expires: 7 });
    Cookies.set("user", JSON.stringify(user), { expires: 7 });

    return { success: true, user };
  } catch (error) {
    console.error("Error registering user:", error);
    return { success: false, error };
  }
};

// Login function
export const login = async (email, password) => {
  try {
    const response = await axiosClient.post("/auth/local", {
      identifier: email,
      password,
    });
    const { jwt, user } = response.data;
    Cookies.set(
      "user",
      JSON.stringify({
        id: user.id,
        username: user.username,
        isInstructor: user.isInstructor,
        email: user.email,
      }),
      { secure: true, sameSite: "Strict" }
    );

    Cookies.set("token", jwt, { expires: 30 });
    Cookies.set("userId", user.id, { expires: 30 });
    window.location.reload();
    return { user, jwt };
  } catch (error) {
    console.error("Login failed", error);
    throw new Error(
      error.response?.data?.error?.message ||
        "Login failed. Please check your credentials."
    );
  }
};

// Logout function
export const logout = () => {
  try {
    Cookies.remove("token");
    Cookies.remove("userId");
    toast.success("Logged out successfully.");

    window.location.reload();
  } catch (error) {
    console.error("Error logging out:", error.message);
    throw error;
  }
};
