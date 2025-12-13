import { useState } from "react";
import { UserIcon, Eye, EyeOff } from "lucide-react";
import API from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const HandleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      const response = await API.post("auth/login", { email, password });
      const token = response.data.token;
      localStorage.setItem("token", token);
      setToken(token);
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token received from server");
      }
      navigate("/");
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Something went wrong";
      setError("Login failed. " + msg);
    }
    setTimeout(() => {
      setError("");
    }, 3000);
  };

  return (
    // Main container with a custom background pattern and flexbox for centering. This setup is inherently responsive.
    <div className="relative w-full flex items-center justify-center font-sans overflow-hidden  min-h-screen p-4">
      {/* Login Card - More compact and shadcn-like */}
      <div className="relative w-full max-w-sm p-6 space-y-6  bg-[#faf1dc] rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg dark:shadow-zinc-900/50">
        {/* Header section with icon and title - More compact */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-2 bg-zinc-100 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
            <UserIcon className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Enter your credentials to sign in
            </p>
          </div>
        </div>
        {/* OR Divider - More subtle */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center ">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800 mb-4 " />
          </div>
          {error && (
            <p className="text-red-600 text-sm  flex items-center">{error}</p>
          )}
        </div>

        {/* Form - Shadcn style */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900 "
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white  px-3 py-5 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900  "
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="flex h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white  px-3 py-5 pr-10 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                ) : (
                  <Eye className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 h-9 px-4 py-2 w-full"
            onClick={(e) => {
              e.preventDefault();
              HandleLogin();
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
