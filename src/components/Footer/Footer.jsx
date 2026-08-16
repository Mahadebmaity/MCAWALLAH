import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import "./Footer.css";

const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_QUICK_LINKS = [
    { label: "Home", href: "#home", isVisible: true },
    { label: "About", href: "#about", isVisible: true },
    { label: "Projects", href: "#projects", isVisible: true },
    { label: "Fun Game", href: "#fun-game", isVisible: true },
    { label: "Contact", href: "#contact", isVisible: true },
    { label: "Privacy Policy", href: "#privacy", isVisible: true },
];

const DEFAULT_SOCIALS = [
    { icon: "fa-brands fa-github", href: "https://github.com", label: "GitHub", color: "#333", isVisible: true },
    { icon: "fa-brands fa-linkedin", href: "https://linkedin.com", label: "LinkedIn", color: "#0A66C2", isVisible: true },
    { icon: "fa-brands fa-twitter", href: "https://twitter.com", label: "Twitter", color: "#1DA1F2", isVisible: true },
    { icon: "fa-brands fa-instagram", href: "https://instagram.com", label: "Instagram", color: "#E1306C", isVisible: true },
    { icon: "fa-brands fa-facebook", href: "https://facebook.com", label: "Facebook", color: "#1877F2", isVisible: true },
];

export default function Footer() {
    const { user, requireAuth } = useAuth();

    /* ── state ── */
    const [footerConfig, setFooterConfig] = useState(null);
    const [backVisible, setBackVisible] = useState(false);
    const [newsEmail, setNewsEmail] = useState("");
    const [newsStatus, setNewsStatus] = useState(null); // "ok" | "err" | "loading"
    const [newsMessage, setNewsMessage] = useState("");
    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        message: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [formStatus, setFormStatus] = useState(null); // "ok" | "sending"
    const [visibleSections, setVisible] = useState({});
    const sectionRefs = useRef({});

    useEffect(() => {
        if (user) {
            setForm((p) => ({
                ...p,
                name: p.name || user.name || "",
                email: p.email || user.email || ""
            }));
        }
    }, [user]);

    /* ── Fetch Dynamic Footer Data ── */
    useEffect(() => {
        const fetchFooterData = async () => {
            try {
                const res = await fetch(`${API_BASE}/portfolio/public`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.footer) {
                        setFooterConfig(data.footer);
                    }
                }
            } catch (err) {
                console.warn("Using default footer config:", err.message);
            }
        };
        fetchFooterData();
    }, []);

    /* ── back-to-top visibility ── */
    useEffect(() => {
        const onScroll = () => setBackVisible(window.scrollY > 400);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* ── intersection observer for reveal ── */
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => {
                if (e.isIntersecting)
                    setVisible((prev) => ({ ...prev, [e.target.dataset.section]: true }));
            }),
            { threshold: 0.12 }
        );
        Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
        return () => obs.disconnect();
    }, []);

    const ref = (key) => (el) => {
        sectionRefs.current[key] = el;
        if (el) el.dataset.section = key;
    };

    /* ── real newsletter subscription to backend ── */
    const handleNewsletter = async (e) => {
        e.preventDefault();
        const targetEmail = user?.email || newsEmail;

        if (!targetEmail || !/\S+@\S+\.\S+/.test(targetEmail)) {
            setNewsStatus("err");
            setNewsMessage("Please enter a valid email address.");
            return;
        }

        setNewsStatus("loading");
        try {
            const res = await fetch(`${API_BASE}/portfolio/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: targetEmail, userId: user?._id, userName: user?.name })
            });
            const data = await res.json();

            if (res.ok) {
                setNewsStatus("ok");
                setNewsMessage(data.message || "🎉 Subscribed successfully!");
                if (!user) setNewsEmail("");
                setTimeout(() => {
                    setNewsStatus(null);
                    setNewsMessage("");
                }, 5000);
            } else {
                setNewsStatus("err");
                setNewsMessage(data.message || "Subscription failed. Try again.");
            }
        } catch (err) {
            setNewsStatus("err");
            setNewsMessage("Network error. Please try again later.");
        }
    };

    /* ── feedback form ── */
    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Name is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
        if (form.message.trim().length < 10) errs.message = "Message too short (min 10 chars)";
        return errs;
    };

    const handleFeedback = async (e) => {
        if (e) e.preventDefault();

        const sendFeedback = async () => {
            const errs = validate();
            if (Object.keys(errs).length) { setFormErrors(errs); return; }
            setFormErrors({});
            setFormStatus("sending");

            try {
                const res = await fetch(`${API_BASE}/portfolio/contact`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        subject: "Footer Feedback Submission",
                        message: form.message
                    })
                });

                if (res.ok) {
                    setFormStatus("ok");
                    setForm({ name: user?.name || "", email: user?.email || "", message: "" });
                    setTimeout(() => setFormStatus(null), 4000);
                } else {
                    setFormStatus(null);
                    setFormErrors({ general: "Failed to send feedback. Please try again." });
                }
            } catch {
                setFormStatus(null);
                setFormErrors({ general: "Network error. Please try again later." });
            }
        };

        if (!requireAuth(sendFeedback, "Please Sign In or Sign Up to submit website feedback.", "register")) {
            return;
        }

        sendFeedback();
    };

    const handleFormChange = (field) => (e) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
        if (formErrors[field]) setFormErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    };

    /* ── scroll to section ── */
    const scrollTo = (href) => {
        if (href.startsWith("#")) {
            const el = document.getElementById(href.slice(1));
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (footerConfig?.isPublic === false) return null;

    // Config values with fallbacks
    const brandName = footerConfig?.brandName || "Mahadeb";
    const brandPrefix = footerConfig?.brandPrefix !== undefined ? footerConfig.brandPrefix : "<";
    const brandSuffix = footerConfig?.brandSuffix !== undefined ? footerConfig.brandSuffix : "/>";
    const bio = footerConfig?.bio || "Building beautiful, performant web experiences that users love. Passionate about clean code, great design, and meaningful products.";
    const contactEmail = footerConfig?.contactEmail || "you@email.com";
    const contactPhone = footerConfig?.contactPhone || "+91 12345 67890";
    const contactLocation = footerConfig?.contactLocation || "Haldia, West Bengal, India";
    const newsletterTitle = footerConfig?.newsletterTitle || "NEWSLETTER";
    const newsletterSubtitle = footerConfig?.newsletterSubtitle || "Get updates on new projects and articles. No spam, ever.";
    const newsletterButtonText = footerConfig?.newsletterButtonText || "Subscribe";
    const copyrightText = footerConfig?.copyrightText || "Mahadeb Maity. Built with React & Node.js";

    const quickLinks = (footerConfig?.quickLinks?.length > 0 ? footerConfig.quickLinks : DEFAULT_QUICK_LINKS).filter(l => l.isVisible !== false);
    const socials = (footerConfig?.socials?.length > 0 ? footerConfig.socials : DEFAULT_SOCIALS).filter(s => s.isVisible !== false);

    const showNewsletter = footerConfig?.showNewsletter !== false;
    const showSocials = footerConfig?.showSocials !== false;
    const showQuickLinks = footerConfig?.showQuickLinks !== false;
    const showContactInfo = footerConfig?.showContactInfo !== false;

    return (
        <>
            {/* ══════════════════════════════
                FOOTER
            ══════════════════════════════ */}
            <footer className="footer" id="footer">

                {/* ── decorative top wave ── */}
                <div className="footer__wave" aria-hidden="true">
                    <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
                        <path d="M0,40 C360,0 1080,80 1440,20 L1440,60 L0,60 Z" />
                    </svg>
                </div>

                <div className="footer__inner">

                    {/* ══════════════════════
                        ROW 1: main grid
                    ══════════════════════ */}
                    <div className="footer__grid">

                        {/* ── 1. Branding ── */}
                        <div
                            className={`footer__col footer__col--brand footer__reveal ${visibleSections.brand ? "footer__reveal--in" : ""}`}
                            ref={ref("brand")}
                        >
                            <div className="footer__logo">
                                {brandPrefix && <span className="footer__logo-bracket">{brandPrefix}</span>}
                                <span className="footer__logo-name">{brandName}</span>
                                {brandSuffix && <span className="footer__logo-bracket">{brandSuffix}</span>}
                            </div>
                            <p className="footer__desc">
                                {bio}
                            </p>
                            {/* Social Icons */}
                            {showSocials && socials.length > 0 && (
                                <div className="footer__socials">
                                    {socials.map((s) => (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="footer__social"
                                            title={s.label}
                                            style={{ "--social-color": s.color || "#38bdf8" }}
                                        >
                                            <i className={s.icon} aria-hidden="true" />
                                            <span className="sr-only">{s.label}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── 2. Quick Links ── */}
                        {showQuickLinks && (
                            <div
                                className={`footer__col footer__reveal ${visibleSections.links ? "footer__reveal--in" : ""}`}
                                ref={ref("links")}
                                style={{ animationDelay: "0.1s" }}
                            >
                                <h3 className="footer__col-title">
                                    <span className="footer__col-title-line" />
                                    Quick Links
                                </h3>
                                <ul className="footer__links">
                                    {quickLinks.map((l) => (
                                        <li key={l.label}>
                                            <button className="footer__link" onClick={() => scrollTo(l.href)}>
                                                <i className="fa-solid fa-chevron-right footer__link-arrow" />
                                                {l.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* ── 3. Contact Info ── */}
                        {showContactInfo && (
                            <div
                                className={`footer__col footer__reveal ${visibleSections.contact ? "footer__reveal--in" : ""}`}
                                ref={ref("contact")}
                                style={{ animationDelay: "0.2s" }}
                            >
                                <h3 className="footer__col-title">
                                    <span className="footer__col-title-line" />
                                    Get in Touch
                                </h3>
                                <ul className="footer__contact-list">
                                    {contactEmail && (
                                        <li className="footer__contact-item">
                                            <span className="footer__contact-icon">
                                                <i className="fa-solid fa-envelope" />
                                            </span>
                                            <div>
                                                <p className="footer__contact-label">Email</p>
                                                <a href={`mailto:${contactEmail}`} className="footer__contact-val">
                                                    {contactEmail}
                                                </a>
                                            </div>
                                        </li>
                                    )}
                                    {contactPhone && (
                                        <li className="footer__contact-item">
                                            <span className="footer__contact-icon">
                                                <i className="fa-solid fa-phone" />
                                            </span>
                                            <div>
                                                <p className="footer__contact-label">Phone</p>
                                                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="footer__contact-val">
                                                    {contactPhone}
                                                </a>
                                            </div>
                                        </li>
                                    )}
                                    {contactLocation && (
                                        <li className="footer__contact-item">
                                            <span className="footer__contact-icon">
                                                <i className="fa-solid fa-location-dot" />
                                            </span>
                                            <div>
                                                <p className="footer__contact-label">Location</p>
                                                <span className="footer__contact-val">{contactLocation}</span>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* ── 4. Newsletter ── */}
                        {showNewsletter && (
                            <div
                                className={`footer__col footer__reveal ${visibleSections.news ? "footer__reveal--in" : ""}`}
                                ref={ref("news")}
                                style={{ animationDelay: "0.3s" }}
                            >
                                <h3 className="footer__col-title">
                                    <span className="footer__col-title-line" />
                                    {newsletterTitle}
                                </h3>
                                <p className="footer__news-desc">
                                    {newsletterSubtitle}
                                </p>
                                <form className="footer__news-form" onSubmit={handleNewsletter} noValidate>
                                    {user ? (
                                        /* ── Signed-In User: Hide Input Box, Show Active Account Pill ── */
                                        <div style={{
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            border: '1px solid rgba(56, 189, 248, 0.3)',
                                            borderRadius: '10px',
                                            padding: '8px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                width: '26px',
                                                height: '26px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--f-accent, #e84545), #38bdf8)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '11px',
                                                fontWeight: '800',
                                                color: '#fff',
                                                flexShrink: 0
                                            }}>
                                                {user.name ? user.name[0].toUpperCase() : 'U'}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Signed in as
                                                </div>
                                                <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#38bdf8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Guest / Anonymous Visitor: Show Email Input Box ── */
                                        <div className="footer__news-input-wrap">
                                            <i className="fa-solid fa-at footer__news-icon" />
                                            <input
                                                type="email"
                                                placeholder="your@email.com"
                                                value={newsEmail}
                                                onChange={(e) => { setNewsEmail(e.target.value); setNewsStatus(null); setNewsMessage(""); }}
                                                className={`footer__news-input ${newsStatus === "err" ? "footer__news-input--err" : ""}`}
                                                aria-label="Email for newsletter"
                                                disabled={newsStatus === "loading"}
                                            />
                                        </div>
                                    )}

                                    {newsStatus === "err" && <p className="footer__news-err">{newsMessage || "Enter a valid email."}</p>}
                                    {newsStatus === "ok" && (
                                        <p className="footer__news-ok">
                                            <i className="fa-solid fa-circle-check" /> {newsMessage || "Subscribed!"}
                                        </p>
                                    )}
                                    <button type="submit" className="footer__news-btn" disabled={newsStatus === "loading"}>
                                        {newsStatus === "loading" ? (
                                            <><i className="fa-solid fa-circle-notch fa-spin" /> Subscribing...</>
                                        ) : (
                                            <>{newsletterButtonText} <i className="fa-solid fa-paper-plane" /></>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* ══════════════════════
                        ROW 2: Feedback Form
                    ══════════════════════ */}
                    <div
                        className={`footer__feedback footer__reveal ${visibleSections.feedback ? "footer__reveal--in" : ""}`}
                        ref={ref("feedback")}
                    >
                        <h3 className="footer__col-title footer__col-title--center">
                            <span className="footer__col-title-line" />
                            Send Feedback
                            <span className="footer__col-title-line" />
                        </h3>

                        <form className="footer__form" onSubmit={handleFeedback} noValidate>
                            <div className="footer__form-row">
                                {/* Name */}
                                <div className="footer__form-group">
                                    <label className="footer__form-label" htmlFor="f-name">
                                        <i className="fa-solid fa-user" /> Name
                                    </label>
                                    <input
                                        id="f-name"
                                        type="text"
                                        placeholder="Your name"
                                        value={form.name}
                                        onChange={handleFormChange("name")}
                                        className={`footer__form-input ${formErrors.name ? "footer__form-input--err" : ""}`}
                                    />
                                    {formErrors.name && <span className="footer__form-err">{formErrors.name}</span>}
                                </div>

                                {/* Email */}
                                <div className="footer__form-group">
                                    <label className="footer__form-label" htmlFor="f-email">
                                        <i className="fa-solid fa-envelope" /> Email
                                    </label>
                                    <input
                                        id="f-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={form.email}
                                        onChange={handleFormChange("email")}
                                        className={`footer__form-input ${formErrors.email ? "footer__form-input--err" : ""}`}
                                    />
                                    {formErrors.email && <span className="footer__form-err">{formErrors.email}</span>}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="footer__form-group">
                                <label className="footer__form-label" htmlFor="f-msg">
                                    <i className="fa-solid fa-message" /> Message
                                </label>
                                <textarea
                                    id="f-msg"
                                    rows={4}
                                    placeholder="Your message (min 10 characters)..."
                                    value={form.message}
                                    onChange={handleFormChange("message")}
                                    className={`footer__form-input footer__form-textarea ${formErrors.message ? "footer__form-input--err" : ""}`}
                                />
                                {formErrors.message && <span className="footer__form-err">{formErrors.message}</span>}
                            </div>

                            <button
                                type="submit"
                                className={`footer__form-btn ${formStatus === "sending" ? "footer__form-btn--loading" : ""} ${formStatus === "ok" ? "footer__form-btn--ok" : ""}`}
                                disabled={formStatus === "sending"}
                            >
                                {formStatus === "sending" && <><i className="fa-solid fa-circle-notch fa-spin" /> Sending…</>}
                                {formStatus === "ok" && <><i className="fa-solid fa-circle-check" /> Message Sent!</>}
                                {!formStatus && <><i className="fa-solid fa-paper-plane" /> Send Message</>}
                            </button>
                        </form>
                    </div>

                    {/* ══════════════════════
                        Bottom Bar
                    ══════════════════════ */}
                    <div className="footer__bottom">
                        <p className="footer__copy">
                            © {CURRENT_YEAR} <span className="footer__copy-name">{copyrightText}</span>. All rights reserved.
                        </p>
                        <div className="footer__bottom-links">
                            <button className="footer__bottom-link" onClick={() => scrollTo("#privacy")}>Privacy Policy</button>
                            <span className="footer__bottom-sep">·</span>
                            <button className="footer__bottom-link" onClick={() => scrollTo("#terms")}>Terms</button>
                            <span className="footer__bottom-sep">·</span>
                            <Link to="/admin/login" className="footer__bottom-link" style={{ color: 'var(--f-accent, #e84545)', textDecoration: 'none', fontWeight: '700' }} title="Admin Studio Portal">
                                <i className="fa-solid fa-lock" style={{ fontSize: '10px', marginRight: '4px' }} />Admin Portal
                            </Link>
                        </div>
                        <p className="footer__made-with">
                            Made with <span className="footer__heart">♥</span> {brandName}
                        </p>
                    </div>
                </div>
            </footer>

            {/* ── Back to Top ── */}
            <button
                className={`footer__back-top ${backVisible ? "footer__back-top--visible" : ""}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                title="Back to top"
            >
                <i className="fa-solid fa-chevron-up" />
            </button>
        </>
    );
}
