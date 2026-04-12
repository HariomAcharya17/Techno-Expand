import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animation from "../assets/login.json";  // ⭐ Add animation file inside src/assets

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      setErr("User not found. Please sign up first.");
      return;
    }

    if (savedUser.email === email && savedUser.password === password) {
      navigate("/dashboard");
    } else {
      setErr("Incorrect email or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE - FORM */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">Welcome Back</h1>

          {err && (
            <p className="text-red-500 mb-3 text-center font-medium">{err}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Enter Email"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg hover:bg-blue-700 transition">
              Login
            </button>
          </form>

          <p className="text-center mt-4">
            New user?{" "}
            <span
              className="text-blue-600 cursor-pointer font-semibold"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>

        {/* RIGHT SIDE - LOTTIE */}
        <div className="hidden md:flex items-center justify-center p-6 bg-blue-50 rounded-r-3xl">
          <Lottie animationData={animation} loop={true} className="w-80" />
        </div>
      </div>
    </div>
  );
}