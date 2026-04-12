import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animation from "../assets/Chart.json";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    const data = { name, phone, email, password };

    // ⭐ Save full user data
    localStorage.setItem("user", JSON.stringify(data));

    // ⭐ After signup → go to LOGIN page
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE - FORM */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Create Account</h1>

          <form onSubmit={handleSignup} className="space-y-5">

            <input
              type="text"
              placeholder="Enter Full Name"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400"
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Enter Phone Number"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400"
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Enter Email"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Create Password"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="w-full bg-green-600 text-white py-3 rounded-xl text-lg hover:bg-green-700 transition">
              Sign Up
            </button>
          </form>

          <p className="text-center mt-4">
            Already have an account?{" "}
            <span
              className="text-green-600 cursor-pointer font-semibold"
              onClick={() => navigate("/")}
            >
              Login
            </span>
          </p>
        </div>

        {/* RIGHT SIDE - LOTTIE */}
        <div className="hidden md:flex items-center justify-center p-6 bg-green-50 rounded-r-3xl">
          <Lottie animationData={animation} loop={true} className="w-80" />
        </div>

      </div>
    </div>
  );
}