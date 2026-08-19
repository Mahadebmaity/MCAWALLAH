import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthModal.css";

export default function AuthModal({ onClose, prompt, defaultMode = "login", isWall = false }) {
    const { login, register, sendSignupOtp } = useAuth();
    const [mode, setMode] = useState(defaultMode || "login");
    const [signupStep, setSignupStep] = useState("form"); // "form" | "otp"
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", otp: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [errMsg, setErrMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const otpInputRef = useRef(null);

    // Countdown timer for OTP
    useEffect(() => {
        let interval = null;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [otpTimer]);

    // Focus OTP input when entering OTP step
    useEffect(() => {
        if (signupStep === "otp" && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [signupStep]);

    const change = (f) => (e) => {
        let val = e.target.value;
        if (f === "otp") {
            val = val.replace(/\D/g, "").slice(0, 6);
        }
        setForm((p) => ({ ...p, [f]: val }));
        if (errors[f]) setErrors((p) => { const n = { ...p }; delete n[f]; return n; });
    };

    const validateForm = () => {
        const e = {};
        if (mode === "register" && !form.name.trim()) e.name = "Name is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
        if (form.password.length < 6) e.password = "Minimum 6 characters required";
        if (mode === "register" && form.password !== form.confirm) e.confirm = "Passwords do not match";
        return e;
    };

    const validateOtp = () => {
        const e = {};
        if (!form.otp || form.otp.trim().length !== 6) {
            e.otp = "Please enter the 6-digit OTP sent to your email";
        }
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setErrMsg("");
        setSuccessMsg("");

        if (mode === "login") {
            const errs = validateForm();
            if (errs.email || errs.password) {
                setErrors({ email: errs.email, password: errs.password });
                return;
            }
            setErrors({});
            setStatus("loading");
            try {
                await login({ email: form.email, password: form.password });
                if (typeof onClose === 'function') onClose();
            } catch (err) {
                handleError(err);
            }
            return;
        }

        // Register Flow - Step 1: Send OTP
        if (mode === "register" && signupStep === "form") {
            const errs = validateForm();
            if (Object.keys(errs).length) {
                setErrors(errs);
                return;
            }
            setErrors({});
            setStatus("loading");
            try {
                const res = await sendSignupOtp({ email: form.email, name: form.name });
                setSignupStep("otp");
                setOtpTimer(60);
                setSuccessMsg(res.message || `Verification code sent to ${form.email}`);
                setStatus(null);
            } catch (err) {
                handleError(err);
            }
            return;
        }

        // Register Flow - Step 2: Verify OTP and Complete Registration
        if (mode === "register" && signupStep === "otp") {
            const errs = validateOtp();
            if (Object.keys(errs).length) {
                setErrors(errs);
                return;
            }
            setErrors({});
            setStatus("loading");
            try {
                await register({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    otp: form.otp
                });
                if (typeof onClose === 'function') onClose();
            } catch (err) {
                handleError(err);
            }
        }
    };

    const handleResendOtp = async () => {
        if (otpTimer > 0 || resendLoading) return;
        setResendLoading(true);
        setErrMsg("");
        setSuccessMsg("");
        try {
            const res = await sendSignupOtp({ email: form.email, name: form.name });
            setOtpTimer(60);
            setSuccessMsg(res.message || "A new 6-digit OTP has been sent!");
        } catch (err) {
            handleError(err);
        } finally {
            setResendLoading(false);
        }
    };

    const handleError = (err) => {
        if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
            setErrMsg("Cannot connect to backend server. Make sure the server is running.");
        } else {
            setErrMsg(err.message || "Authentication failed");
        }
        setStatus("error");
    };

    const switchMode = () => {
        setMode((m) => (m === "login" ? "register" : "login"));
        setSignupStep("form");
        setErrors({});
        setErrMsg("");
        setSuccessMsg("");
        setStatus(null);
        setForm({ name: "", email: "", password: "", confirm: "", otp: "" });
    };

    return (
        <div
            className={`auth-modal__backdrop ${isWall ? "auth-modal__backdrop--wall" : ""}`}
            onClick={(e) => {
                if (!isWall && e.target === e.currentTarget && typeof onClose === 'function') {
                    onClose();
                }
            }}
        >
            {isWall && (
                <div className="auth-wall__ambient-glow" aria-hidden="true" />
            )}

            <div className={`auth-modal ${isWall ? "auth-modal--wall" : ""}`}>
                {/* Close button */}
                {!isWall && (
                    <button className="auth-modal__close" onClick={onClose} aria-label="Close">
                        <i className="fa-solid fa-xmark" />
                    </button>
                )}

                {/* Logo */}
                <div className="auth-modal__logo">
                    <span className="auth-modal__logo-bracket">&lt;</span>
                    <span className="auth-modal__logo-name">Mahadeb Maity</span>
                    <span className="auth-modal__logo-bracket">/&gt;</span>
                </div>

                {/* Prompt Banner */}
                {prompt && (
                    <div className="auth-modal__prompt-banner">
                        <i className="fa-solid fa-shield-halved" />
                        <span>{prompt}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="auth-modal__tabs">
                    <button
                        type="button"
                        className={`auth-modal__tab ${mode === "login" ? "auth-modal__tab--active" : ""}`}
                        onClick={() => mode !== "login" && switchMode()}
                    >
                        <i className="fa-solid fa-right-to-bracket" /> Sign In
                    </button>
                    <button
                        type="button"
                        className={`auth-modal__tab ${mode === "register" ? "auth-modal__tab--active" : ""}`}
                        onClick={() => mode !== "register" && switchMode()}
                    >
                        <i className="fa-solid fa-user-shield" /> Sign Up
                    </button>
                </div>

                {/* Form */}
                <form className="auth-modal__form" onSubmit={handleSubmit} noValidate>
                    {mode === "login" && (
                        <>
                            <div className="auth-modal__group">
                                <label className="auth-modal__label"><i className="fa-solid fa-envelope" /> Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={change("email")}
                                    className={`auth-modal__input ${errors.email ? "auth-modal__input--err" : ""}`}
                                    required
                                />
                                {errors.email && <span className="auth-modal__err">{errors.email}</span>}
                            </div>

                            <div className="auth-modal__group">
                                <label className="auth-modal__label"><i className="fa-solid fa-lock" /> Password</label>
                                <div className="auth-modal__pw-wrap">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={change("password")}
                                        className={`auth-modal__input ${errors.password ? "auth-modal__input--err" : ""}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-modal__pw-eye"
                                        onClick={() => setShowPw(!showPw)}
                                        title={showPw ? "Hide password" : "Show password"}
                                    >
                                        <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                                    </button>
                                </div>
                                {errors.password && <span className="auth-modal__err">{errors.password}</span>}
                            </div>
                        </>
                    )}

                    {mode === "register" && signupStep === "form" && (
                        <>
                            <div className="auth-modal__group">
                                <label className="auth-modal__label"><i className="fa-solid fa-user" /> Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    value={form.name}
                                    onChange={change("name")}
                                    className={`auth-modal__input ${errors.name ? "auth-modal__input--err" : ""}`}
                                    required
                                />
                                {errors.name && <span className="auth-modal__err">{errors.name}</span>}
                            </div>

                            <div className="auth-modal__group">
                                <label className="auth-modal__label"><i className="fa-solid fa-envelope" /> Personal Email Address</label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={change("email")}
                                    className={`auth-modal__input ${errors.email ? "auth-modal__input--err" : ""}`}
                                    required
                                />
                                {errors.email && <span className="auth-modal__err">{errors.email}</span>}
                                <span className="auth-modal__hint">
                                    <i className="fa-solid fa-circle-info" /> We will send a 6-digit OTP code to verify this email.
                                </span>
                            </div>

                            <div className="auth-modal__group">
                                <label className="auth-modal__label"><i className="fa-solid fa-lock" /> Create Password</label>
                                <div className="auth-modal__pw-wrap">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={change("password")}
                                        className={`auth-modal__input ${errors.password ? "auth-modal__input--err" : ""}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="auth-modal__pw-eye"
                                        onClick={() => setShowPw(!showPw)}
                                        title={showPw ? "Hide password" : "Show password"}
                                    >
                                        <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                                    </button>
                                </div>
                                {errors.password && <span className="auth-modal__err">{errors.password}</span>}
                            </div>

                            <div className="auth-modal__group">
                                <label className="auth-modal__label"><i className="fa-solid fa-lock" /> Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.confirm}
                                    onChange={change("confirm")}
                                    className={`auth-modal__input ${errors.confirm ? "auth-modal__input--err" : ""}`}
                                    required
                                />
                                {errors.confirm && <span className="auth-modal__err">{errors.confirm}</span>}
                            </div>
                        </>
                    )}

                    {mode === "register" && signupStep === "otp" && (
                        <div className="auth-modal__otp-section">
                            <div className="auth-modal__otp-info">
                                <div className="auth-modal__otp-icon-wrap">
                                    <i className="fa-solid fa-envelope-open-text" />
                                </div>
                                <h3 className="auth-modal__otp-heading">Verify Your Email</h3>
                                <p className="auth-modal__otp-subtext">
                                    We sent a 6-digit verification code to:
                                    <br />
                                    <strong className="auth-modal__otp-target-email">{form.email}</strong>
                                </p>
                                <button
                                    type="button"
                                    className="auth-modal__change-email-btn"
                                    onClick={() => {
                                        setSignupStep("form");
                                        setErrMsg("");
                                        setSuccessMsg("");
                                    }}
                                >
                                    <i className="fa-solid fa-pen" /> Change Email
                                </button>
                            </div>

                            <div className="auth-modal__group">
                                <label className="auth-modal__label">
                                    <i className="fa-solid fa-key" /> Enter 6-Digit Verification Code
                                </label>
                                <input
                                    ref={otpInputRef}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="123456"
                                    value={form.otp}
                                    onChange={change("otp")}
                                    className={`auth-modal__input auth-modal__otp-input ${errors.otp ? "auth-modal__input--err" : ""}`}
                                    autoComplete="one-time-code"
                                    required
                                />
                                {errors.otp && <span className="auth-modal__err">{errors.otp}</span>}
                            </div>

                            <div className="auth-modal__resend-wrap">
                                {otpTimer > 0 ? (
                                    <span className="auth-modal__timer">
                                        <i className="fa-regular fa-clock" /> Resend code in <strong>0:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}</strong>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        className="auth-modal__resend-btn"
                                        onClick={handleResendOtp}
                                        disabled={resendLoading}
                                    >
                                        {resendLoading ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin" /> Sending...</>
                                        ) : (
                                            <><i className="fa-solid fa-rotate-right" /> Resend Verification Code</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {errMsg && (
                        <div className="auth-modal__server-err">
                            <i className="fa-solid fa-circle-exclamation" /> {errMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="auth-modal__server-success">
                            <i className="fa-solid fa-circle-check" /> {successMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`auth-modal__btn ${status === "loading" ? "auth-modal__btn--loading" : ""}`}
                        disabled={status === "loading"}
                    >
                        {status === "loading" ? (
                            <><i className="fa-solid fa-circle-notch fa-spin" /> Please wait…</>
                        ) : mode === "login" ? (
                            <><i className="fa-solid fa-right-to-bracket" /> Sign In &amp; Unlock Portfolio</>
                        ) : signupStep === "form" ? (
                            <><i className="fa-solid fa-paper-plane" /> Send Verification Code &rarr;</>
                        ) : (
                            <><i className="fa-solid fa-shield-check" /> Verify Code &amp; Create Account</>
                        )}
                    </button>

                    {mode === "register" && signupStep === "otp" && (
                        <button
                            type="button"
                            className="auth-modal__back-step-btn"
                            onClick={() => {
                                setSignupStep("form");
                                setErrMsg("");
                                setSuccessMsg("");
                            }}
                        >
                            &larr; Back to Registration Details
                        </button>
                    )}
                </form>

                <p className="auth-modal__switch">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                    <button type="button" className="auth-modal__switch-btn" onClick={switchMode}>
                        {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                </p>

                <div className="auth-modal__footer-admin">
                    <Link
                        to="/admin/login"
                        onClick={() => { if (typeof onClose === 'function') onClose(); }}
                        className="auth-modal__admin-link"
                    >
                        <i className="fa-solid fa-lock" /> Go to Admin Studio Portal &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
