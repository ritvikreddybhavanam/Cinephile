import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

function Login() {
    const { handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            await handleLogin({
                emailaddress: email.trim(),
                password
            });

            navigate("/dashboard", {replace: true});
        } catch (error) {
            console.error("Login failed:", error);

            if (error.response?.status === 401) {
                setError("Invalid email or password.");
            } else if (error.response?.status === 403) {
                setError("Access denied. Please check your account.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Unable to login. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0B0D0F] font-[Inter,sans-serif] text-[#e0e3e8] antialiased">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 z-10 bg-[#0B0D0F]/80" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/50 to-transparent" />

                <div
                    className="h-full w-full bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRRgYfmLYBqNcrU-qx8N2Wql7OSAArBg2JUcg5AldJkEmsSsonMaFFrUY85baFaY15wbAiyO8QLfIYBQ9RNvzjI6dtEEM2Dah5s3414-w7nSInzG0A9_rd8vOQSO67mqnccotMX_aRjcTgIr_CwT12D_ACObvcc0JBsXO-b6zGCjZP321u6uw-9XKe3Dckb3vW9GKYJDzWEJwP0oDNFjh7b9b4H5sGxFWGTQscN98JhpOKlqymHLQ8')"
                    }}
                />
            </div>

            <main className="relative z-20 flex min-h-[calc(100vh-100px)] flex-grow items-center justify-center px-5 py-8 md:px-16">
                <div className="w-full max-w-md">
                    <div className="rounded-xl border border-[#262626] bg-[rgba(18,18,18,0.7)] p-8 shadow-2xl backdrop-blur-[16px]">
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 font-[Hanken_Grotesk,sans-serif] text-2xl font-bold leading-8 text-[#e0e3e8] md:text-[32px] md:leading-10">
                                Welcome Back
                            </h1>

                            <p className="text-base leading-6 text-[#a0a0a0]">
                                Sign in to continue your cinematic journey.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="sr-only">
                                    Email Address
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a0a0a0]">
                                        <span className="material-symbols-outlined text-[20px]">
                                            mail
                                        </span>
                                    </span>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-[#262626] bg-[#181c20] py-3 pl-10 pr-4 text-base text-[#e0e3e8] outline-none transition-colors placeholder:text-[#a0a0a0] focus:border-[#43fe6d] focus:ring-1 focus:ring-[#43fe6d]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#a0a0a0]">
                                        <span className="material-symbols-outlined text-[20px]">
                                            lock
                                        </span>
                                    </span>

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full rounded-lg border border-[#262626] bg-[#181c20] py-3 pl-10 pr-12 text-base text-[#e0e3e8] outline-none transition-colors placeholder:text-[#a0a0a0] focus:border-[#43fe6d] focus:ring-1 focus:ring-[#43fe6d]"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#a0a0a0] transition-colors hover:text-[#e0e3e8]"
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPassword
                                                ? "visibility"
                                                : "visibility_off"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) =>
                                            setRememberMe(e.target.checked)
                                        }
                                        className="h-4 w-4 cursor-pointer rounded border-[#262626] bg-[#181c20] text-[#43fe6d] focus:ring-[#43fe6d] focus:ring-offset-[#0B0D0F]"
                                    />

                                    <label
                                        htmlFor="remember-me"
                                        className="ml-2 block cursor-pointer text-sm text-[#a0a0a0] transition-colors hover:text-[#e0e3e8]"
                                    >
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link
                                        to="/forgot-password"
                                        className="text-[#a0a0a0] transition-colors hover:text-[#43fe6d]"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-lg border border-transparent bg-[#43fe6d] px-4 py-3 text-sm font-semibold text-[#005d1e] shadow-sm transition-all duration-200 hover:bg-[#00e054] focus:outline-none focus:ring-2 focus:ring-[#43fe6d] focus:ring-offset-2 focus:ring-offset-[#0B0D0F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </div>
                        </form>

                        <div className="relative mt-8">
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center"
                            >
                                <div className="w-full border-t border-[#262626]" />
                            </div>

                            <div className="relative flex justify-center">
                                <span className="rounded-full bg-[#181c20]/80 px-2 text-sm text-[#a0a0a0] backdrop-blur-sm">
                                    or
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-base leading-6 text-[#a0a0a0]">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-semibold text-[#43fe6d] transition-colors hover:text-[#00e054]"
                                >
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-20 w-full border-t border-[#262626] bg-[#0B0D0F]">
                <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-5 py-8 md:flex-row md:px-16">
                    <div className="font-[Hanken_Grotesk,sans-serif] text-[32px] font-bold leading-10 text-[#43fe6d]">
                        Cinephile 🎬
                    </div>

                    <nav className="flex flex-wrap justify-center gap-6 text-base text-[#a0a0a0]">
                        <a
                            href="#"
                            className="cursor-pointer transition-colors hover:text-[#e0e3e8]"
                        >
                            About Us
                        </a>

                        <a
                            href="#"
                            className="cursor-pointer transition-colors hover:text-[#e0e3e8]"
                        >
                            Community
                        </a>

                        <a
                            href="#"
                            className="cursor-pointer transition-colors hover:text-[#e0e3e8]"
                        >
                            Privacy Policy
                        </a>

                        <Link
                            to="/register"
                            className="font-semibold text-[#43fe6d] transition-colors hover:text-[#00e054]"
                        >
                            Create Account
                        </Link>
                    </nav>

                    <div className="text-base text-[#a0a0a0]">
                        © 2024 Cinephile 🎬. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Login;
