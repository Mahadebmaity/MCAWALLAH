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

    /* ── safe json parser helper ── */
    const parseResponseJson = async (res, defaultErrMsg = "Request failed") => {
        let data = {};
        try {
            const text = await res.text();
            if (text && text.trim().length > 0) {
                data = JSON.parse(text);
            }
        } catch {
            // Not a JSON response (e.g. proxy error or empty response)
        }
        if (!res.ok) {
            const fallback = res.status === 502 || res.status === 504 || res.status === 500
                ? "Backend server is offline or restarting. Please ensure the server is running."
                : defaultErrMsg;
            throw new Error(data.message || fallback);
        }
        return data;
    };

    /* ── load user on mount ── */
    useEffect(() => {
        const boot = async () => {
            const token = getAccess() || await refreshAccess();
            if (!token) { setLoading(false); return; }
            try {
                const res = await authFetch(`${API}/user/me`);
                if (res.ok) {
                    const data = await parseResponseJson(res);
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
        const data = await parseResponseJson(res, "Registration failed");
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        applyPrefs(data.user.preferences);
        if (typeof pendingAction === "function") {
            try { pendingAction(); } catch { }
            setPendingAction(null);
        }
        return data.user;
    };

    /* ── LOGIN ── */
    const login = async ({ email, password }) => {
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await parseResponseJson(res, "Login failed. Please check credentials.");
        saveTokens(data.accessToken, data.refreshToken);
        setUser(data.user);
        applyPrefs(data.user.preferences);
        if (typeof pendingAction === "function") {
            try { pendingAction(); } catch { }
            setPendingAction(null);
        }
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
        const data = await parseResponseJson(res, "Update profile failed");
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
        const data = await parseResponseJson(res, "Change password failed");
        return data;
    };

    /* ── UPLOAD AVATAR ── */
    const uploadAvatar = async (file) => {
        const form = new FormData();
        form.append("avatar", file);
        const res = await authFetch(`${API}/user/avatar`, { method: "POST", body: form });
        const data = await parseResponseJson(res, "Upload avatar failed");
        setUser((u) => ({ ...u, avatar: data.avatarUrl }));
        return data.avatarUrl;
    };

    /* ── REMOVE AVATAR ── */
    const removeAvatar = async () => {
        const res = await authFetch(`${API}/user/avatar`, { method: "DELETE" });
        const data = await parseResponseJson(res, "Remove avatar failed");
        setUser((u) => ({ ...u, avatar: null }));
    };

    /* ── SAVE PREFERENCES ── */
    const savePreferences = async (prefs) => {
        const res = await authFetch(`${API}/user/preferences`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prefs),
        });
        const data = await parseResponseJson(res, "Save preferences failed");
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
        const data = await parseResponseJson(res, "Reset credentials failed");
        if (data.user) {
            setUser((u) => ({ ...u, ...data.user }));
        }
        return data;
    };

    /* ── Global Auth Guard & Modal State ── */
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalPrompt, setAuthModalPrompt] = useState("");
    const [authModalMode, setAuthModalMode] = useState("login");
    const [pendingAction, setPendingAction] = useState(null);

    const openAuthModal = (prompt = "", defaultMode = "login") => {
        setAuthModalPrompt(prompt);
        setAuthModalMode(defaultMode);
        setAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setAuthModalOpen(false);
        setAuthModalPrompt("");
        setPendingAction(null);
    };

    const requireAuth = (callbackAction, promptMessage = "Please Sign In or Sign Up to continue.", defaultMode = "login") => {
        if (user) {
            return true;
        }
        if (typeof callbackAction === "function") {
            setPendingAction(() => callbackAction);
        }
        openAuthModal(promptMessage, defaultMode);
        return false;
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
            authModalOpen,
            authModalPrompt,
            authModalMode,
            openAuthModal,
            closeAuthModal,
            requireAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
