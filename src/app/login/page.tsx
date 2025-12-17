"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/userSlice";
import Cookies from "js-cookie";
import logo from "@/assets/logos/Social-golf-logo.png";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        Cookies.set("token", data.token, { expires: 7 });
        dispatch(setUser(data.user));
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Toaster position="top-right" />
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>
      <div className="circle circle-3"></div>
      <div className="circle circle-4"></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="relative z-10 rounded-2xl bg-white bg-opacity-90 p-8 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col justify-center items-center">
              <Image src={logo} alt="Logo" width={100} height={100} className="rounded-lg  mb-4" />
              <h1 className="inline-block text-2xl  font-bold bg-gradient-to-r from-gray-500 to-blue-600 bg-clip-text text-transparent">
                Login Now
              </h1>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit} >
              <div>
                <input
                   type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                 type="submit"
                            disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition duration-200 hover:bg-blue-700"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="flex justify-between mt-2">

            <p className="text-center text-sm text-gray-600">
              Not a member?{" "}
              <a href="/register" className="font-medium text-blue-600 hover:underline">
                Sign up now
              </a>
            </p>
            <a href="#" className="font-medium text-blue-600 hover:underline">
                Forgot password ?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
