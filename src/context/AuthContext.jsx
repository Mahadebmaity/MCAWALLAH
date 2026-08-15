// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ── helpers ── */
    const getAccess = () => localStorage.getItem("accessToken");
    const getRefresh = () => localStorage.getItem("refreshToken");

    const saveTokens = (access, refresh) => {
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
    };
    const clearTokens = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    /* ── auto-refresh access token ── */
    const refreshAccess = useCallback(async () => {
        const rt = getRefresh();
        if (!rt) return null;
        try {
            const res = await fetch(`${API}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: rt }),
            });
            const data = await res.json();
            if (data.accessToken) {
                localStorage.setItem("accessToken", data.accessToken);
                return data.accessToken;
            }
        } catch { }
        return null;
    }, []);

    /* ── fetch with auto-retry on 401 ── */
    const authFetch = useCallback(async (url, options = {}) => {
        let token = getAccess();
        const makeReq = (t) =>
            fetch(url, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${t}`,
                },
            });

        let res = await makeReq(token);
        if (res.status === 401) {
            token = await refreshAccess();
            if (!token) { clearTokens(); setUser(null); return res; }
            res = await makeReq(token);
        }
        return res;
    }, [refreshAccess]);

    /* ── load user on mount ── */
    useEffect(() => {
        const boot = async () => {
            const token = getAccess() || await refreshAccess();
            if (!token) { setLoading(false); return; }
            try {
                const res = await authFetch(`${API}/user/me`);
                const data = await res.json();
                if (res.ok) {
                    setUser(data);
                    applyPrefs(data.preferences);
                } else {
                    clearTokens();
                }
            } catch { }
            setLoading(false);
        };
        boot();
    }, [authFetch, refreshAccess]);

    /* ── REGISTER ── */
    const register = async ({ name, email, password }) => {
        const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        applyPrefs(data.user.preferences);
        return data.user;
    };

    /* ── LOGIN ── */
    const login = async ({ email, password }) => {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        applyPrefs(data.user.preferences);
        return data.user;
    };

    /* ── LOGOUT ── */
    const logout = async () => {
        try { await authFetch(`${API}/auth/logout`, { method: "POST" }); } catch { }
        clearTokens();
        setUser(null);
    };

    /* ── UPDATE PROFILE ── */
    const updateProfile = async ({ name, email }) => {
        const res = await authFetch(`${API}/user/profile`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser((u) => ({ ...u, name: data.name, email: data.email }));
        return data;
    };

    /* ── CHANGE PASSWORD ── */
    const changePassword = async ({ currentPassword, newPassword }) => {
        const res = await authFetch(`${API}/user/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        return data;
    };

    /* ── UPLOAD AVATAR ── */
    const uploadAvatar = async (file) => {
        const form = new FormData();
        form.append("avatar", file);
        const res = await authFetch(`${API}/user/avatar`, { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser((u) => ({ ...u, avatar: data.avatarUrl }));
        return data.avatarUrl;
    };

    /* ── REMOVE AVATAR ── */
    const removeAvatar = async () => {
        const res = await authFetch(`${API}/user/avatar`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser((u) => ({ ...u, avatar: null }));
    };

    /* ── SAVE PREFERENCES ── */
    const savePreferences = async (prefs) => {
        const res = await authFetch(`${API}/user/preferences`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prefs),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser((u) => ({ ...u, preferences: data.preferences }));
        applyPrefs(data.preferences);
        return data.preferences;
    };

    /* ── apply theme prefs to DOM ── */
    const applyPrefs = (prefs) => {
        if (!prefs) return;
        document.documentElement.setAttribute("data-theme", prefs.darkMode ? "dark" : "light");
        if (prefs.accentColor) {
            document.documentElement.style.setProperty("--accent", prefs.accentColor);
        }
    };

    /* ── RESET TO DEFAULT CREDENTIALS ── */
    const resetToDefaultCredentials = async () => {
        const res = await authFetch(`${API}/user/reset-defaults`, {
            method: "POST"
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        if (data.user) {
            setUser((u) => ({ ...u, ...data.user }));
        }
        return data;
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            register,
            login,
            logout,
            updateProfile,
            changePassword,
            resetToDefaultCredentials,
            uploadAvatar,
            removeAvatar,
            savePreferences,
            authFetch,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
