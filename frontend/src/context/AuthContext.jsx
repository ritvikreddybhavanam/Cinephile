import { createContext, useState } from "react";
import { login } from "../services/authService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("token")
    );

    const handleLogin = async (credentials) => {
        const data = await login(credentials);

        const userData = {
            id: data.id,
            firstname: data.firstname,
            lastname: data.lastname,
            emailaddress: data.emailaddress
        };

        setUser(userData);
        setToken(data.token);

        localStorage.setItem("token", data.token);
        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        return data;
    };

    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                handleLogin,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};