import { useState } from "react";

const ResetPassword = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const getPasswordStrength = () => {
        if (!newPassword) {
            return {
                text: "Weak",
                level: 0,
            };
        }

        let score = 0;

        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;

        if (score <= 1) {
            return {
                text: "Weak",
                level: 1,
            };
        }

        if (score === 2) {
            return {
                text: "Medium",
                level: 2,
            };
        }

        if (score === 3) {
            return {
                text: "Strong",
                level: 3,
            };
        }

        return {
            text: "Very Strong",
            level: 4,
        };
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
        <div className="min-h-screen flex flex-col bg-[#101418] text-[#e0e3e8] font-sans antialiased relative">
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                        backgroundImage:
                            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqb3NSIieoqv_WUhJsaAdiZy6Ec2iqF3vyl_GDq8lpQBc__J5xnLwJgIDYtmNzMUBzZSKei_lB4FXYBvB_lJK_-SS2wwdmBPVe0fWt1Clp88Gkg5l2V4WzO-edGDaWCED-PvHqbXXZi17zHjNvwcj1MZ_K7SWx0iNKOtJgCSLdXodcebDJdJQ0jtsyvYz-1F4LyrwB_DKYjdCc649QdwmQ22w50nVF824OqvON4buV2-MZxvuSuLN8')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/80 to-[#0B0D0F]/60" />
            </div>

            <main className="flex-grow flex items-center justify-center p-5 md:p-16 relative z-10">
                <div className="w-full max-w-md">
                    <div className="bg-[#101418]/95 border border-[#262626] rounded-xl shadow-2xl overflow-hidden backdrop-blur-md p-8 md:p-10 flex flex-col items-center">
                        <div className="mb-8 w-24 h-24">
                            <img
                                src="https://lh3.googleusercontent.com/aida/AP1WRLuKBEZMLleKGt_5XBl8AMB3tKGJx6Gp9Anf2JEYe7bsGVaG1EO1_udLll6t97S5v7zqxYLR8_XlgALId9Oaj-7VQryGl8cHckuIVKVRlt6mG8pNpGclXFU9P6NRC2JIUqeNnAwegA5OdQ-TKsLqiX36IPI8qPdT5dA3DCxASwGhaJ1f3nyt8fPbwtTdpPBCE603hfEDIHn8aFWLI4cx8l3mG3D6hjFOMEsBXTow9E4U5IUD3pf4iz89ogc"
                                alt="Cinephile 🎬 Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <h1 className="font-bold text-2xl md:text-[32px] leading-8 md:leading-10 text-center mb-2">
                            Create a New Password
                        </h1>

                        <p className="text-[#a0a0a0] text-center mb-8 text-base leading-6">
                            Secure your premium discovery account.
                        </p>

                        <form className="w-full space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label
                                    htmlFor="new-password"
                                    className="block text-xs leading-4 tracking-wider font-semibold text-[#e0e3e8] uppercase"
                                >
                                    New Password
                                </label>

                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#a0a0a0]">
                                        <span className="material-symbols-outlined text-[20px]">
                                            lock
                                        </span>
                                    </span>

                                    <input
                                        id="new-password"
                                        name="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full bg-[#101418] border border-[#262626] rounded-lg py-3 pl-10 pr-10 text-[#e0e3e8] placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#ffb787] focus:ring-1 focus:ring-[#ffb787] transition-all"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#a0a0a0] hover:text-[#e0e3e8] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showNewPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 py-1">
                                <div className="flex justify-between text-xs leading-4 font-semibold">
                                    <span className="text-[#a0a0a0]">
                                        Password Strength
                                    </span>

                                    <span
                                        className={
                                            strength.level <= 1
                                                ? "text-[#ffb4ab]"
                                                : strength.level === 2
                                                    ? "text-[#eab308]"
                                                    : "text-[#43fe6d]"
                                        }
                                    >
                                        {strength.text}
                                    </span>
                                </div>

                                <div className="flex gap-1 h-1.5">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className={`flex-1 rounded-full transition-all duration-300 ${
    item <= strength.level
        ? strength.level <= 1
            ? "bg-[#ffb4ab]"
            : strength.level === 2
                ? "bg-[#eab308]"
                : "bg-[#43fe6d]"
        : "bg-[#262a2f]"
}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <label
                                    htmlFor="confirm-password"
                                    className="block text-xs leading-4 tracking-wider font-semibold text-[#e0e3e8] uppercase"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#a0a0a0]">
                                        <span className="material-symbols-outlined text-[20px]">
                                            lock_reset
                                        </span>
                                    </span>

                                    <input
                                        id="confirm-password"
                                        name="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="w-full bg-[#101418] border border-[#262626] rounded-lg py-3 pl-10 pr-10 text-[#e0e3e8] placeholder:text-[#a0a0a0] focus:outline-none focus:border-[#ffb787] focus:ring-1 focus:ring-[#ffb787] transition-all"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#a0a0a0] hover:text-[#e0e3e8] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showConfirmPassword ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#eab308] text-[#005d1e] font-semibold text-xl rounded-lg py-3 mt-4 hover:bg-[#43fe6d] transition-colors flex justify-center items-center gap-2"
                            >
                                <span>Reset Password</span>
                                <span className="material-symbols-outlined text-[20px]">
                                    arrow_forward
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <a
                                href="/login"
                                className="inline-flex items-center gap-1 text-base leading-6 text-[#a0a0a0] hover:text-[#eab308] transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    arrow_back
                                </span>
                                Back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="z-10 relative w-full bg-[#0B0D0F] border-t border-[#262626]">
                <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-bold text-2xl md:text-[32px] leading-10 text-[#43fe6d]">
                        Cinephile 🎬
                    </div>

                    <div className="flex gap-5 text-base leading-6 flex-wrap justify-center">
                        <a
                            href="#"
                            className="text-[#a0a0a0] hover:text-[#e0e3e8] transition-colors"
                        >
                            About Us
                        </a>

                        <a
                            href="#"
                            className="text-[#a0a0a0] hover:text-[#e0e3e8] transition-colors"
                        >
                            Community
                        </a>

                        <a
                            href="#"
                            className="text-[#a0a0a0] hover:text-[#e0e3e8] transition-colors"
                        >
                            Privacy Policy
                        </a>

                        <a
                            href="#"
                            className="text-[#a0a0a0] hover:text-[#e0e3e8] transition-colors"
                        >
                            Terms of Service
                        </a>
                    </div>

                    <div className="text-[#a0a0a0] text-base leading-6 text-center">
                        © 2024 Cinephile 🎬. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ResetPassword;

