import { useState } from "react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const getPasswordStrength = () => {
        if (!newPassword) {
            return { text: "Weak", level: 0 };
        }

        let score = 0;
        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;

        if (score <= 1) return { text: "Weak", level: 1 };
        if (score === 2) return { text: "Moderate", level: 2 };
        if (score === 3) return { text: "Strong", level: 3 };
        return { text: "Very Strong", level: 4 };
    };

    const strength = getPasswordStrength();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        console.log("Password reset successfully");
    };

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text font-sans antialiased relative">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqb3NSIieoqv_WUhJsaAdiZy6Ec2iqF3vyl_GDq8lpQBc__J5xnLwJgIDYtmNzMUBzZSKei_lB4FXYBvB_lJK_-SS2wwdmBPVe0fWt1Clp88Gkg5l2V4WzO-edGDaWCED-PvHqbXXZi17zHjNvwcj1MZ_K7SWx0iNKOtJgCSLdXodcebDJdJQ0jtsyvYz-1F4LyrwB_DKYjdCc649QdwmQ22w50nVF824OqvON4buV2-MZxvuSuLN8')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/70" />
            </div>

            <main className="flex-grow flex items-center justify-center p-5 md:p-16 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-surface/90 border border-border rounded-lg shadow-elevated overflow-hidden backdrop-blur-md p-8 md:p-10 flex flex-col items-center">
                        <Link to="/" className="no-underline mb-4">
                            <span className="font-serif text-3xl font-semibold tracking-tight text-accent">
                                Cinephile
                            </span>
                        </Link>

                        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-text text-center mb-2">
                            New Password
                        </h1>

                        <p className="text-text-3 text-center mb-6 text-sm leading-relaxed">
                            Set a secure password for your account.
                        </p>

                        <form className="w-full space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="new-password"
                                    className="label-caps"
                                >
                                    New Password
                                </label>

                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-3">
                                        <span className="material-symbols-outlined text-[18px]">
                                            lock
                                        </span>
                                    </span>

                                    <input
                                        id="new-password"
                                        name="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        className="mc-input pl-11 pr-10 rounded-lg text-sm"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-3 hover:text-text transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {showNewPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 py-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-text-3">Strength</span>
                                    <span
                                        className={
                                            strength.level <= 1
                                                ? "text-error"
                                                : strength.level === 2
                                                    ? "text-accent"
                                                    : "text-success"
                                        }
                                    >
                                        {strength.text}
                                    </span>
                                </div>

                                <div className="flex gap-1 h-1">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className={`flex-1 rounded-full transition-all duration-300 ${
                                                item <= strength.level
                                                    ? strength.level <= 1
                                                        ? "bg-error"
                                                        : strength.level === 2
                                                            ? "bg-accent"
                                                            : "bg-success"
                                                    : "bg-border"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5 mt-3">
                                <label
                                    htmlFor="confirm-password"
                                    className="label-caps"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-3">
                                        <span className="material-symbols-outlined text-[18px]">
                                            lock_reset
                                        </span>
                                    </span>

                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="mc-input pl-11 pr-10 rounded-lg text-sm"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-3 hover:text-text transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {showConfirmPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full py-3 text-xs tracking-wider uppercase font-semibold mt-4"
                            >
                                <span>Update Password</span>
                                <span className="material-symbols-outlined text-[16px] ml-1">
                                    arrow_forward
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1 text-xs text-text-3 hover:text-accent transition-colors no-underline font-medium"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    arrow_back
                                </span>
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResetPassword;
