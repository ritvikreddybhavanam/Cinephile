import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";
import { auth } from "../../firebase/firebase";

function Register() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [emailaddress, setEmailaddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [terms, setTerms] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!firstname.trim() || !lastname.trim()) {
            setError("Please enter your first name and last name.");
            return;
        }
        if (!emailaddress.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailaddress.trim())) {
            setError("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!terms) {
            setError("Please agree to the Terms of Service and Privacy Policy.");
            return;
        }

        try {
            setLoading(true);

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                emailaddress.trim(),
                password
            );

            await sendEmailVerification(userCredential.user);

            sessionStorage.setItem("pendingRegistration", JSON.stringify({
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                emailaddress: emailaddress.trim()
            }));

            navigate("/verify-email", { replace: true });

        } catch (error) {
            console.error("Firebase registration failed:", error);

            if (error.code === "auth/email-already-in-use") {
                setError("An account already exists with this email address.");
            } else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else if (error.code === "auth/weak-password") {
                setError("Password is too weak. Please use a stronger password.");
            } else if (error.code === "auth/operation-not-allowed") {
                setError("Email/password authentication is not enabled.");
            } else if (error.code === "auth/network-request-failed") {
                setError("Network error. Please check your internet connection.");
            } else if (error.code === "auth/too-many-requests") {
                setError("Too many attempts. Please try again later.");
            } else {
                setError(error.message || "Unable to create your account. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-bg text-text antialiased">

            {/* Backdrop */}
            <div className="fixed inset-0 -z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-15"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqGnxC5GSNGc-KCUHhJPtal34tP9qIqTWNhZKg_0dv3D08GYYa2fUxsnQL9cha2iWBnd_hUoeez5gIdWtv6tFDvj94K8-1qkQC0ZSoIIBGwliGYRwL4qfe98ufCCipMhn7OD_OA76ML6xuz2wUKYSwebxewHZbHWq2c_WAOzm3BTcWm2dZjkuUUERD1gHzlisUPxy2YjnotudzP8JRPlEHZ2lKUR_WEjKPcKh0E0UfaTcdx1RNAWpU')"
                    }}
                />
                <div className="absolute inset-0 bg-bg/75" />
                <div className="absolute inset-0 bg-gradient-to-b from-bg/50 via-bg/80 to-bg" />
            </div>

            <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-lg">

                    {/* Card */}
                    <div className="overflow-hidden rounded-xl border border-border bg-surface/95 shadow-elevated backdrop-blur-xl">

                        {/* Header */}
                        <div className="border-b border-border px-6 py-8 text-center sm:px-10">
                            <Link to="/" className="inline-block font-serif text-3xl font-semibold text-accent no-underline">
                                Cinephile
                            </Link>
                            <div className="mx-auto mt-3 h-px w-12 bg-accent/50 rounded" />
                            <h2 className="mt-5 font-serif text-xl font-semibold text-text">
                                Create your account
                            </h2>
                            <p className="mt-2 text-sm text-text-3 leading-relaxed">
                                Join Cinephile and start curating your personal film journal.
                            </p>
                        </div>

                        {/* Form body */}
                        <div className="px-6 py-8 sm:px-10">

                            {error && (
                                <div className="mb-5 flex items-start gap-3 rounded-lg border border-error/30 bg-error/10 px-4 py-3">
                                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-error">error</span>
                                    <p className="text-sm text-error">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Name row */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium text-text-2 uppercase tracking-wider">
                                            First Name
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="pointer-events-none absolute left-3.5 flex items-center text-text-3">
                                                <span className="material-symbols-outlined text-[18px]">person</span>
                                            </span>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                placeholder="Jean-Luc"
                                                value={firstname}
                                                onChange={(e) => setFirstname(e.target.value)}
                                                required
                                                className="mc-input !pl-11 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium text-text-2 uppercase tracking-wider">
                                            Last Name
                                        </label>
                                        <div className="relative flex items-center">
                                            <span className="pointer-events-none absolute left-3.5 flex items-center text-text-3">
                                                <span className="material-symbols-outlined text-[18px]">badge</span>
                                            </span>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                placeholder="Godard"
                                                value={lastname}
                                                onChange={(e) => setLastname(e.target.value)}
                                                required
                                                className="mc-input !pl-11 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

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
                                            placeholder="auteur@cinema.com"
                                            value={emailaddress}
                                            onChange={(e) => setEmailaddress(e.target.value)}
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
                                            placeholder="••••••••"
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
                                    <p className="mt-1 text-[11px] text-text-3">Minimum 6 characters.</p>
                                </div>

                                {/* Confirm password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-text-2 uppercase tracking-wider">
                                        Confirm Password
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="pointer-events-none absolute left-3.5 flex items-center text-text-3">
                                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                                        </span>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="mc-input !pl-11 !pr-11 rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 flex items-center text-text-3 transition-colors hover:text-text focus:outline-none"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                {showConfirmPassword ? "visibility" : "visibility_off"}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-start gap-3 pt-1">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={terms}
                                        onChange={(e) => setTerms(e.target.checked)}
                                        required
                                        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border bg-surface accent-accent focus:ring-2 focus:ring-accent/20"
                                    />
                                    <label htmlFor="terms" className="cursor-pointer text-xs text-text-3 leading-5">
                                        I agree to the{" "}
                                        <Link to="/terms" className="text-accent no-underline hover:underline">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="/privacy" className="text-accent no-underline hover:underline">
                                            Privacy Policy
                                        </Link>.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-3 mt-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[18px]">
                                                progress_activity
                                            </span>
                                            Sending Verification…
                                        </>
                                    ) : (
                                        <>
                                            Continue to Verification
                                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 border-t border-border pt-5 text-center">
                                <p className="text-sm text-text-3">
                                    Already have an account?{" "}
                                    <Link to="/login" className="font-medium text-accent no-underline transition-colors hover:text-accent-hover">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 text-center">
                        <p className="text-xs text-text-3">© {new Date().getFullYear()} Cinephile. All rights reserved.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Register;