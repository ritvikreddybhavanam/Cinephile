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
                    "Email verified successfully. You can now create your Cinephile account."
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
        <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-text antialiased font-sans">
            <div className="w-full max-w-md">
                <div className="rounded-lg border border-border bg-surface/90 backdrop-blur-md p-8 shadow-elevated">
                    <div className="text-center">
                        <h1 className="font-serif text-3xl font-semibold text-accent tracking-tight">
                            Cinephile
                        </h1>

                        <h2 className="mt-4 font-serif text-xl font-semibold text-text">
                            Verify Your Email
                        </h2>

                        <p className="mt-2 text-xs text-text-3 leading-relaxed">
                            We dispatched an authentication link to
                        </p>

                        <p className="mt-1 break-all text-xs font-semibold text-accent">
                            {email || "your email address"}
                        </p>
                    </div>

                    {error && (
                        <div className="mt-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3">
                            <p className="text-xs leading-5 text-error">
                                {error}
                            </p>
                        </div>
                    )}

                    {message && (
                        <div className="mt-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3">
                            <p className="text-xs leading-5 text-success">
                                {message}
                            </p>
                        </div>
                    )}

                    {!verified ? (
                        <div className="mt-6 space-y-3">
                            <button
                                type="button"
                                onClick={checkVerification}
                                disabled={checking}
                                className="btn-primary w-full py-3 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2"
                            >
                                {checking ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">
                                            progress_activity
                                        </span>
                                        Checking…
                                    </>
                                ) : (
                                    <>
                                        I've Verified My Email
                                        <span className="material-symbols-outlined text-[18px]">
                                            check_circle
                                        </span>
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={resendVerificationEmail}
                                disabled={resending}
                                className="w-full text-center text-xs text-text-3 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-50 py-2"
                            >
                                {resending
                                    ? "Sending…"
                                    : "Resend verification link"}
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleCreateAccount}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="password"
                                    className="label-caps mb-1.5 block"
                                >
                                    Set Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                    minLength={6}
                                    className="mc-input rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="label-caps mb-1.5 block"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(event.target.value)
                                    }
                                    placeholder="Confirm your password"
                                    required
                                    minLength={6}
                                    className="mc-input rounded-lg text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="btn-primary w-full py-3 text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 mt-4"
                            >
                                {creating ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">
                                            progress_activity
                                        </span>
                                        Creating Account…
                                    </>
                                ) : (
                                    <>
                                        Complete Registration
                                        <span className="material-symbols-outlined text-[18px]">
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
                        className="mt-6 w-full text-center text-xs text-text-3 transition-colors hover:text-accent"
                    >
                        ← Back to Registration
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerifyEmail;
