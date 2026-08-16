import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthModal.css";

export default function AuthModal({ onClose, prompt, defaultMode = "login" }) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState(defaultMode || "login");
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [errMsg, setErrMsg] = useState("");
    const [showPw, setShowPw] = useState(false);

    const change = (f) => (e) => {
        setForm((p) => ({ ...p, [f]: e.target.value }));
        if (errors[f]) setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
    };

    const validate = () => {
        const e = {};
        if (mode === "register" && !form.name.trim()) e.name = "Name required";
        if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
        if (form.password.length < 6) e.password = "Min 6 characters";
        if (mode === "register" && form.password !== form.confirm) e.confirm = "Passwords don't match";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setStatus("loading");
        setErrMsg("");
        try {
            if (mode === "login") {
                await login({ email: form.email, password: form.password });
            } else {
                await register({ name: form.name, email: form.email, password: form.password });
            }
            onClose();
        } catch (err) {
            if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
                setErrMsg("Cannot connect to backend server. Make sure the server is running.");
            } else {
                setErrMsg(err.message || "Authentication failed");
            }
            setStatus("error");
        }
    };

    const switchMode = () => {
        setMode((m) => (m === "login" ? "register" : "login"));
        setErrors({}); setErrMsg(""); setStatus(null);
        setForm({ name: "", email: "", password: "", confirm: "" });
    };

    return (
        <div className="auth-modal__backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="auth-modal">

                {/* Close button */}
                <button className="auth-modal__close" onClick={onClose} aria-label="Close">
                    <i className="fa-solid fa-xmark" />
                </button>

                {/* Logo */}
                <div className="auth-modal__logo">
                    <span className="auth-modal__logo-bracket">&lt;</span>
                    <span className="auth-modal__logo-name">Mahadeb</span>
                    <span className="auth-modal__logo-bracket">/&gt;</span>
                </div>

                {/* Optional Interactive Action Guard Prompt Banner */}
                {prompt && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(232, 69, 69, 0.15))',
                        border: '1.5px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '12.5px',
                        color: '#f1f5f9',
                        lineHeight: '1.4',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        <i className="fa-solid fa-shield-halved" style={{ color: '#38bdf8', fontSize: '18px', flexShrink: 0 }} />
                        <span>{prompt}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="auth-modal__tabs">
                    <button
                        className={`auth-modal__tab ${mode === "login" ? "auth-modal__tab--active" : ""}`}
                        onClick={() => mode !== "login" && switchMode()}
                    >
                        <i className="fa-solid fa-right-to-bracket" /> Sign In
                    </button>
                    <button
                        className={`auth-modal__tab ${mode === "register" ? "auth-modal__tab--active" : ""}`}
                        onClick={() => mode !== "register" && switchMode()}
                    >
                        <i className="fa-solid fa-user-plus" /> Sign Up
                    </button>
                </div>

                {/* Form */}
                <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>

                    {mode === "register" && (
                        <div className="auth-modal__group">
                            <label className="auth-modal__label"><i className="fa-solid fa-user" /> Name</label>
                            <input
                                type="text" placeholder="Your full name"
                                value={form.name} onChange={change("name")}
                                className={`auth-modal__input ${errors.name ? "auth-modal__input--err" : ""}`}
                            />
                            {errors.name && <span className="auth-modal__err">{errors.name}</span>}
                        </div>
                    )}

                    <div className="auth-modal__group">
                        <label className="auth-modal__label"><i className="fa-solid fa-envelope" /> Email</label>
                        <input
                            type="email" placeholder="your@email.com"
                            value={form.email} onChange={change("email")}
                            className={`auth-modal__input ${errors.email ? "auth-modal__input--err" : ""}`}
                        />
                        {errors.email && <span className="auth-modal__err">{errors.email}</span>}
                    </div>

                    <div className="auth-modal__group">
                        <label className="auth-modal__label"><i className="fa-solid fa-lock" /> Password</label>
                        <div className="auth-modal__pw-wrap">
                            <input
                                type={showPw ? "text" : "password"} placeholder="••••••••"
                                value={form.password} onChange={change("password")}
                                className={`auth-modal__input ${errors.password ? "auth-modal__input--err" : ""}`}
                            />
                            <button type="button" className="auth-modal__pw-eye" onClick={() => setShowPw(!showPw)}>
                                <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                            </button>
                        </div>
                        {errors.password && <span className="auth-modal__err">{errors.password}</span>}
                    </div>

                    {mode === "register" && (
                        <div className="auth-modal__group">
                            <label className="auth-modal__label"><i className="fa-solid fa-lock" /> Confirm Password</label>
                            <input
                                type="password" placeholder="••••••••"
                                value={form.confirm} onChange={change("confirm")}
                                className={`auth-modal__input ${errors.confirm ? "auth-modal__input--err" : ""}`}
                            />
                            {errors.confirm && <span className="auth-modal__err">{errors.confirm}</span>}
                        </div>
                    )}

                    {errMsg && (
                        <div className="auth-modal__server-err">
                            <i className="fa-solid fa-circle-exclamation" /> {errMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`auth-modal__btn ${status === "loading" ? "auth-modal__btn--loading" : ""}`}
                        disabled={status === "loading"}
                    >
                        {status === "loading"
                            ? <><i className="fa-solid fa-circle-notch fa-spin" /> Please wait…</>
                            : mode === "login"
                                ? <><i className="fa-solid fa-right-to-bracket" /> Sign In</>
                                : <><i className="fa-solid fa-user-plus" /> Create Account</>
                        }
                    </button>
                </form>

                <p className="auth-modal__switch">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button className="auth-modal__switch-btn" onClick={switchMode}>
                        {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                </p>

                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                    <Link
                        to="/admin/login"
                        onClick={onClose}
                        className="auth-modal__admin-link"
                        style={{ fontSize: '12px', color: 'var(--accent, #e84545)', textDecoration: 'none', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <i className="fa-solid fa-lock" /> Go to Admin Studio Portal &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
