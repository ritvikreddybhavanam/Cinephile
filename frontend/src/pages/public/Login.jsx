import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import CinematicIntro from "../../components/common/CinematicIntro.jsx";

function Login() {
    const { handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showIntro, setShowIntro] = useState(false);

    const handleIntroComplete = (preloaded) => {
        navigate("/dashboard", { replace: true, state: { fromLogin: true, preloadedMovies: preloaded } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);
            await handleLogin({ emailaddress: email.trim(), password });
            setShowIntro(true);
        } catch (error) {
            setLoading(false);
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
        }
    };

    return (
        <>
            {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
            <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-bg text-text antialiased">

            {/* Cinematic backdrop */}
            <div className="absolute inset-0 z-0">
                <div
                    className="h-full w-full bg-cover bg-center opacity-20"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRRgYfmLYBqNcrU-qx8N2Wql7OSAArBg2JUcg5AldJkEmsSsonMaFFrUY85baFaY15wbAiyO8QLfIYBQ9RNvzjI6dtEEM2Dah5s3414-w7nSInzG0A9_rd8vOQSO67mqnccotMX_aRjcTgIr_CwT12D_ACObvcc0JBsXO-b6zGCjZP321u6uw-9XKe3Dckb3vW9GKYJDzWEJwP0oDNFjh7b9b4H5sGxFWGTQscN98JhpOKlqymHLQ8')"
                    }}
                />
                <div className="absolute inset-0 bg-bg/70" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
            </div>

            {/* Header wordmark */}
            <header className="relative z-10 flex justify-center pt-10 pb-6">
                <Link to="/" className="font-serif text-2xl font-semibold text-accent no-underline">
                    Cinephile
                </Link>
            </header>

            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 md:px-16">
                <div className="w-full max-w-sm">
                    <div className="rounded-xl border border-border bg-surface/90 p-6 shadow-elevated backdrop-blur-xl sm:p-8">

                        <div className="mb-8 text-center">
                            <h1 className="font-serif text-2xl font-semibold text-text mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-sm text-text-3">
                                Continue your cinematic journey.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-text-2 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative flex items-center">
                                    <span className="pointer-events-none absolute left-3.5 flex items-center text-text-3">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                    </span>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="mc-input !pl-11 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-text-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative flex items-center">
                                    <span className="pointer-events-none absolute left-3.5 flex items-center text-text-3">
                                        <span className="material-symbols-outlined text-[18px]">lock</span>
                                    </span>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="mc-input !pl-11 !pr-11 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 flex items-center text-text-3 transition-colors hover:text-text focus:outline-none"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {showPassword ? "visibility" : "visibility_off"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Remember + Forgot */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 cursor-pointer rounded border-border bg-surface accent-accent focus:ring-accent"
                                    />
                                    <label htmlFor="remember-me" className="cursor-pointer text-xs text-text-3 hover:text-text-2">
                                        Remember me
                                    </label>
                                </div>
                                <Link to="/forgot-password" className="text-xs text-text-3 no-underline transition-colors hover:text-accent">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-surface px-3 text-xs text-text-3">or</span>
                            </div>
                        </div>

                        <p className="text-center text-sm text-text-3">
                            New here?{" "}
                            <Link to="/register" className="font-medium text-accent no-underline transition-colors hover:text-accent-hover">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 w-full border-t border-border bg-bg/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-5 py-5 text-center sm:flex-row md:px-8">
                    <span className="font-serif text-lg font-semibold text-accent">Cinephile</span>
                    <nav className="flex flex-wrap justify-center gap-6 text-xs text-text-3">
                        <Link to="/about" className="no-underline hover:text-text transition-colors">About</Link>
                        <Link to="/privacy" className="no-underline hover:text-text transition-colors">Privacy</Link>
                        <Link to="/terms" className="no-underline hover:text-text transition-colors">Terms</Link>
                    </nav>
                    <span className="text-xs text-text-3">© {new Date().getFullYear()} Cinephile</span>
                </div>
            </footer>
        </div>
        </>
    );
}

export default Login;
