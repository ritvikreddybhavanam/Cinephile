import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    reload,
    sendEmailVerification
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { register } from "../../services/authService";

function VerifyEmail() {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [email, setEmail] = useState("");
    const [verified, setVerified] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [checking, setChecking] = useState(false);
    const [creating, setCreating] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const registrationData =
            sessionStorage.getItem("pendingRegistration");

        if (!registrationData) {
            setError(
                "Registration session was not found. Please register again."
            );
            return;
        }

        try {
            const data = JSON.parse(registrationData);

            setEmail(data.emailaddress || "");
        } catch {
            setError(
                "Registration data is invalid. Please register again."
            );
        }
    }, []);

    const checkVerification = async () => {
        setError("");
        setMessage("");

        try {
            setChecking(true);

            const currentUser = auth.currentUser;

            if (!currentUser) {
                setError(
                    "Verification session expired. Please register again."
                );
                return;
            }

            await reload(currentUser);

            if (currentUser.emailVerified) {
                setVerified(true);

                setMessage(
                    "Email verified successfully. You can now create your Cinephile 🎬 account."
                );
            } else {
                setVerified(false);

                setError(
                    "Your email has not been verified yet. Please click the verification link sent to your email."
                );
            }
        } catch (error) {
            console.error(
                "Email verification check failed:",
                error
            );

            setError(
                "Unable to check your email verification status."
            );
        } finally {
            setChecking(false);
        }
    };

    const resendVerificationEmail = async () => {
        setError("");
        setMessage("");

        try {
            setResending(true);

            const currentUser = auth.currentUser;

            if (!currentUser) {
                setError(
                    "Verification session expired. Please register again."
                );
                return;
            }

            if (currentUser.emailVerified) {
                setVerified(true);

                setMessage(
                    "Your email is already verified."
                );

                return;
            }

            await sendEmailVerification(currentUser);

            setMessage(
                "A new verification email has been sent."
            );
        } catch (error) {
            console.error(
                "Verification email resend failed:",
                error
            );

            if (
                error.code ===
                "auth/too-many-requests"
            ) {
                setError(
                    "Too many requests. Please wait before requesting another email."
                );
            } else {
                setError(
                    "Unable to resend the verification email."
                );
            }
        } finally {
            setResending(false);
        }
    };

    const handleCreateAccount = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!verified) {
            setError(
                "Please verify your email before creating your account."
            );
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

        const registrationData =
            sessionStorage.getItem("pendingRegistration");

        if (!registrationData) {
            setError(
                "Registration data was not found. Please register again."
            );
            return;
        }

        try {
            setCreating(true);
            const userData =
                JSON.parse(registrationData);

            const currentUser = auth.currentUser;

            if (!currentUser) {
                setError(
                    "Verification session expired. Please register again."
                );
                return;
            }

            await reload(currentUser);

            if (!currentUser.emailVerified) {
                setVerified(false);

                setError(
                    "Your email is no longer verified. Please verify your email first."
                );

                return;
            }

            const firebaseIdToken =
                await currentUser.getIdToken(true);

            await register({
                firebaseIdToken,
                firstname: userData.firstname,
                lastname: userData.lastname,
                emailaddress: userData.emailaddress,
                password,
                confirmPassword
            });

            sessionStorage.removeItem(
                "pendingRegistration"
            );

            setPassword("");
            setConfirmPassword("");

            navigate("/login", {
                replace: true,
                state: {
                    registrationSuccess: true,
                    email: userData.emailaddress
                }
            });
        } catch (error) {
            console.error("SQL account creation failed:", error);

            console.error("Status:", error.response?.status);
            console.error("Response data:", error.response?.data);
            console.error("Response headers:", error.response?.headers);

            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (typeof error.response?.data === "string") {
                setError(error.response.data);
            } else if (error.response?.status === 403) {
                setError(
                    "Server rejected the request (403). Check the backend console."
                );
            } else if (error.code === "auth/user-token-expired") {
                setError(
                    "Your verification session expired. Please register again."
                );
            } else if (error.message === "Network Error") {
                setError(
                    "Cannot connect to the backend server."
                );
            } else {
                setError(
                    "Unable to create your account. Please try again."
                );
            }
        }
        finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0b0d0f] px-4 text-[#e0e3e8]">

            <div className="w-full max-w-md">

                <div className="rounded-2xl border border-[#262c30] bg-[#101418] p-8 shadow-[0_20px_70px_rgba(0,0,0,0.55)]">

                    <div className="text-center">

                        <h1 className="font-['Hanken_Grotesk'] text-4xl font-extrabold text-[#43fe6d]">
                            Cinephile 🎬
                        </h1>

                        <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-[#43fe6d]" />

                        <h2 className="mt-6 text-2xl font-bold text-[#f1f3f4]">
                            Verify your email
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-[#92999f]">
                            We sent a verification link to
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-[#43fe6d]">
                            {email || "your email address"}
                        </p>

                    </div>

                    {error && (
                        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                            <p className="text-sm leading-5 text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {message && (
                        <div className="mt-6 rounded-lg border border-[#43fe6d]/30 bg-[#43fe6d]/10 px-4 py-3">
                            <p className="text-sm leading-5 text-[#43fe6d]">
                                {message}
                            </p>
                        </div>
                    )}

                    {!verified ? (
                        <div className="mt-8 space-y-4">

                            <button
                                type="button"
                                onClick={checkVerification}
                                disabled={checking}
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#43fe6d] px-6 font-['Hanken_Grotesk'] text-base font-bold text-[#00390f] transition-all duration-200 hover:bg-[#6cff80] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {checking ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[20px]">
                                            progress_activity
                                        </span>

                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        I've Verified My Email

                                        <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">
                                            check_circle
                                        </span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={resendVerificationEmail}
                                disabled={resending}
                                className="w-full text-center text-sm text-[#777f85] transition-colors hover:text-[#43fe6d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {resending
                                    ? "Sending..."
                                    : "Resend verification email"}
                            </button>

                        </div>
                    ) : (
                        <form
                            onSubmit={handleCreateAccount}
                            className="mt-8 space-y-5"
                        >

                            <div>

                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-[#c7ced2]"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    required
                                    minLength={6}
                                    className="h-12 w-full rounded-lg border border-[#2a3035] bg-[#181c20] px-4 text-sm text-[#e0e3e8] outline-none transition-all placeholder:text-[#5f666b] focus:border-[#43fe6d] focus:bg-[#1a1f23] focus:ring-2 focus:ring-[#43fe6d]/10"
                                />

                            </div>

                            <div>

                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-sm font-medium text-[#c7ced2]"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Confirm your password"
                                    required
                                    minLength={6}
                                    className="h-12 w-full rounded-lg border border-[#2a3035] bg-[#181c20] px-4 text-sm text-[#e0e3e8] outline-none transition-all placeholder:text-[#5f666b] focus:border-[#43fe6d] focus:bg-[#1a1f23] focus:ring-2 focus:ring-[#43fe6d]/10"
                                />

                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#43fe6d] px-6 font-['Hanken_Grotesk'] text-base font-bold text-[#00390f] transition-all duration-200 hover:bg-[#6cff80] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {creating ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[20px]">
                                            progress_activity
                                        </span>

                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Verify & Create Account

                                        <span className="material-symbols-outlined text-[20px]">
                                            arrow_forward
                                        </span>
                                    </>
                                )}
                            </button>

                        </form>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="mt-6 w-full text-center text-sm text-[#777f85] transition-colors hover:text-[#43fe6d]"
                    >
                        ← Back to Registration
                    </button>

                </div>

            </div>

        </div>
    );
}

export default VerifyEmail;
