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
            setError(
                "Please enter your first name and last name."
            );
            return;
        }

        if (!emailaddress.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                emailaddress.trim()
            )
        ) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!terms) {
            setError(
                "Please agree to the Terms of Service and Privacy Policy."
            );
            return;
        }

        try {
            setLoading(true);

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    emailaddress.trim(),
                    password
                );

            await sendEmailVerification(
                userCredential.user
            );

            sessionStorage.setItem(
                "pendingRegistration",
                JSON.stringify({
                    firstname: firstname.trim(),
                    lastname: lastname.trim(),
                    emailaddress: emailaddress.trim()
                })
            );

            navigate("/verify-email", {
                replace: true
            });

        } catch (error) {
            console.error(
                "Firebase registration failed:",
                error
            );

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {
                setError(
                    "An account already exists with this email address."
                );

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {
                setError(
                    "Please enter a valid email address."
                );

            } else if (
                error.code ===
                "auth/weak-password"
            ) {
                setError(
                    "Password is too weak. Please use a stronger password."
                );

            } else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {
                setError(
                    "Email/password authentication is not enabled in Firebase."
                );

            } else if (
                error.code ===
                "auth/network-request-failed"
            ) {
                setError(
                    "Network error. Please check your internet connection."
                );

            } else if (
                error.code ===
                "auth/too-many-requests"
            ) {
                setError(
                    "Too many attempts. Please try again later."
                );

            } else {
                setError(
                    error.message ||
                    "Unable to create your account. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#0b0d0f] font-['Inter'] text-[#e0e3e8]">

            <div className="fixed inset-0 -z-0">

                <div
                    className="absolute inset-0 bg-cover bg-center opacity-25"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqGnxC5GSNGc-KCUHhJPtal34tP9qIqTWNhZKg_0dv3D08GYYa2fUxsnQL9cha2iWBnd_hUoeez5gIdWtv6tFDvj94K8-1qkQC0ZSoIIBGwliGYRwL4qfe98ufCCipMhn7OD_OA76ML6xuz2wUKYSwebxewHZbHWq2c_WAOzm3BTcWm2dZjkuUUERD1gHzlisUPxy2YjnotudzP8JRPlEHZ2lKUR_WEjKPcKh0E0UfaTcdx1RNAWpU')"
                    }}
                />

                <div className="absolute inset-0 bg-[#0b0d0f]/75"/>

                <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d0f]/50 via-[#0b0d0f]/80 to-[#0b0d0f]"/>

            </div>

            <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">

                <div className="w-full max-w-lg">

                    <div className="overflow-hidden rounded-2xl border border-[#262c30] bg-[#101418]/95 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">

                        <div className="border-b border-[#262c30] px-6 py-8 text-center sm:px-10">

                            <h1 className="font-['Hanken_Grotesk'] text-4xl font-extrabold tracking-tight text-[#43fe6d]">
                                Cinephile 🎬
                            </h1>

                            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#43fe6d]"/>

                            <h2 className="mt-5 font-['Hanken_Grotesk'] text-2xl font-bold text-[#f1f3f4]">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#92999f]">
                                Join Cinephile 🎬 and start curating your
                                personal movie collection.
                            </p>

                        </div>

                        <div className="px-6 py-8 sm:px-10">

                            {error && (
                                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">

                                    <span className="material-symbols-outlined mt-0.5 text-[20px] text-red-400">
                                        error
                                    </span>

                                    <p className="text-sm leading-5 text-red-400">
                                        {error}
                                    </p>

                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                    <div>
                                        <label
                                            htmlFor="firstName"
                                            className="mb-2 block text-sm font-medium text-[#c7ced2]"
                                        >
                                            First Name
                                        </label>

                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            placeholder="Jean-Luc"
                                            value={firstname}
                                            onChange={(event) =>
                                                setFirstname(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-lg border border-[#2a3035] bg-[#181c20] px-4 text-sm text-[#e0e3e8] outline-none transition-all placeholder:text-[#5f666b] focus:border-[#43fe6d] focus:bg-[#1a1f23] focus:ring-2 focus:ring-[#43fe6d]/10"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="lastName"
                                            className="mb-2 block text-sm font-medium text-[#c7ced2]"
                                        >
                                            Last Name
                                        </label>

                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            placeholder="Godard"
                                            value={lastname}
                                            onChange={(event) =>
                                                setLastname(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-lg border border-[#2a3035] bg-[#181c20] px-4 text-sm text-[#e0e3e8] outline-none transition-all placeholder:text-[#5f666b] focus:border-[#43fe6d] focus:bg-[#1a1f23] focus:ring-2 focus:ring-[#43fe6d]/10"
                                        />
                                    </div>

                                </div>

                                <div>

                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-sm font-medium text-[#c7ced2]"
                                    >
                                        Email Address
                                    </label>

                                    <div className="relative">

                                        <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#687078]">
                                            mail
                                        </span>

                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="auteur@cinema.com"
                                            value={emailaddress}
                                            onChange={(event) =>
                                                setEmailaddress(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-lg border border-[#2a3035] bg-[#181c20] pl-12 pr-4 text-sm text-[#e0e3e8] outline-none transition-all placeholder:text-[#5f666b] focus:border-[#43fe6d] focus:bg-[#1a1f23] focus:ring-2 focus:ring-[#43fe6d]/10"
                                        />

                                    </div>

                                </div>

                                <div>

                                    <label
                                        htmlFor="password"
                                        className="mb-2 block text-sm font-medium text-[#c7ced2]"
                                    >
                                        Password
                                    </label>

                                    <div className="relative">

                                        <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#687078]">
                                            lock
                                        </span>

                                        <input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-lg border border-[#2a3035] bg-[#181c20] px-12 pr-12 text-sm text-[#e0e3e8] outline-none transition-all placeholder:text-[#5f666b] focus:border-[#43fe6d] focus:bg-[#1a1f23] focus:ring-2 focus:ring-[#43fe6d]/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    !showPassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-[#737b81] transition-colors hover:text-[#43fe6d]"
                                        >
                                            <span className="material-symbols-outlined text-[21px]">
                                                {showPassword
                                                    ? "visibility_off"
                                                    : "visibility"}
                                            </span>
                                        </button>

                                    </div>

                                    <p className="mt-1.5 text-xs text-[#626a70]">
                                        Minimum 6 characters.
                                    </p>

                                </div>

                                <div>

                                    <label
                                        htmlFor="confirmPassword"
                                        className="mb-2 block text-sm font-medium text-[#c7ced2]"
                                    >
                                        Confirm Password
                                    </label>

                                    <div className="relative">

                                        <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-[#687078]">
                                            lock_reset
                                        </span>

                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(event) =>
                                                setConfirmPassword(
                                                    event.target.value
                                                )
                                            }
                                            required
                                            className="h-12 w-full rounded-lg border border-[#2a3035] bg-[#181c20] px-12 pr-12 text-sm text-[#e0e3e8] outline-none transition-all placeholder:text-[#5f666b] focus:border-[#43fe6d] focus:bg-[#1a1f23] focus:ring-2 focus:ring-[#43fe6d]/10"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1.5 text-[#737b81] transition-colors hover:text-[#43fe6d]"
                                        >
                                            <span className="material-symbols-outlined text-[21px]">
                                                {showConfirmPassword
                                                    ? "visibility_off"
                                                    : "visibility"}
                                            </span>
                                        </button>

                                    </div>

                                </div>

                                <div className="flex items-start gap-3 pt-1">

                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={terms}
                                        onChange={(event) =>
                                            setTerms(
                                                event.target.checked
                                            )
                                        }
                                        required
                                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-[#343b40] bg-[#181c20] accent-[#43fe6d] focus:ring-2 focus:ring-[#43fe6d]/20"
                                    />

                                    <label
                                        htmlFor="terms"
                                        className="cursor-pointer text-xs leading-5 text-[#858d92]"
                                    >
                                        I agree to the{" "}

                                        <a
                                            href="#"
                                            onClick={(event) =>
                                                event.preventDefault()
                                            }
                                            className="font-medium text-[#43fe6d] hover:underline"
                                        >
                                            Terms of Service
                                        </a>{" "}

                                        and{" "}

                                        <a
                                            href="#"
                                            onClick={(event) =>
                                                event.preventDefault()
                                            }
                                            className="font-medium text-[#43fe6d] hover:underline"
                                        >
                                            Privacy Policy
                                        </a>
                                        .
                                    </label>

                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#43fe6d] px-6 font-['Hanken_Grotesk'] text-base font-bold text-[#00390f] shadow-[0_8px_25px_rgba(67,254,109,0.12)] transition-all duration-200 hover:bg-[#6cff80] hover:shadow-[0_8px_30px_rgba(67,254,109,0.2)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-[20px]">
                                                progress_activity
                                            </span>

                                            Sending Verification Email...
                                        </>
                                    ) : (
                                        <>
                                            Continue to Verification

                                            <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">
                                                arrow_forward
                                            </span>
                                        </>
                                    )}

                                </button>

                            </form>

                            <div className="mt-7 border-t border-[#262c30] pt-6 text-center">

                                <p className="text-sm text-[#777f85]">
                                    Already have an account?{" "}

                                    <Link
                                        to="/login"
                                        className="font-semibold text-[#43fe6d] transition-colors hover:text-[#6cff80] hover:underline"
                                    >
                                        Login
                                    </Link>
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="mt-6 text-center">

                        <p className="text-xs text-[#555d62]">
                            © 2024 Cinephile 🎬. All rights reserved.
                        </p>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Register;