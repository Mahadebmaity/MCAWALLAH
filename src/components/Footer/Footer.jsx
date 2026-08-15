import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

/* ── Font Awesome via CDN is loaded in index.html ──
   Add this to your public/index.html <head>:
   <link rel="stylesheet"
     href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
*/

const CURRENT_YEAR = new Date().getFullYear();

const QUICK_LINKS = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Fun Game", href: "#fun-game" },
    { label: "Contact", href: "#contact" },
    { label: "Privacy Policy", href: "#privacy" },
];

const SOCIALS = [
    { icon: "fa-brands fa-github", href: "https://github.com", label: "GitHub", color: "#333" },
    { icon: "fa-brands fa-linkedin", href: "https://linkedin.com", label: "LinkedIn", color: "#0A66C2" },
    { icon: "fa-brands fa-twitter", href: "https://twitter.com", label: "Twitter", color: "#1DA1F2" },
    { icon: "fa-brands fa-instagram", href: "https://instagram.com", label: "Instagram", color: "#E1306C" },
    { icon: "fa-brands fa-facebook", href: "https://facebook.com", label: "Facebook", color: "#1877F2" },
];

export default function Footer() {
    /* ── state ── */
    const [backVisible, setBackVisible] = useState(false);
    const [newsEmail, setNewsEmail] = useState("");
    const [newsStatus, setNewsStatus] = useState(null); // "ok" | "err"
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [formErrors, setFormErrors] = useState({});
    const [formStatus, setFormStatus] = useState(null); // "ok" | "sending"
    const [visibleSections, setVisible] = useState({});
    const sectionRefs = useRef({});

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

    /* ── newsletter ── */
    const handleNewsletter = (e) => {
        e.preventDefault();
        if (!/\S+@\S+\.\S+/.test(newsEmail)) { setNewsStatus("err"); return; }
        setNewsStatus("ok");
        setNewsEmail("");
        setTimeout(() => setNewsStatus(null), 4000);
    };

    /* ── feedback form ── */
    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Name is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
        if (form.message.trim().length < 10) errs.message = "Message too short (min 10 chars)";
        return errs;
    };

    const handleFeedback = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }
        setFormErrors({});
        setFormStatus("sending");
        setTimeout(() => {
            setFormStatus("ok");
            setForm({ name: "", email: "", message: "" });
            setTimeout(() => setFormStatus(null), 4000);
        }, 1200);
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
                                <span className="footer__logo-bracket">&lt;</span>
                                <span className="footer__logo-name">Mahadeb</span>
                                <span className="footer__logo-bracket">/&gt;</span>
                            </div>
                            <p className="footer__desc">
                                Building beautiful, performant web experiences that users love.
                                Passionate about clean code, great design, and meaningful products.
                            </p>
                            {/* Social Icons */}
                            <div className="footer__socials">
                                {SOCIALS.map((s) => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer__social"
                                        title={s.label}
                                        style={{ "--social-color": s.color }}
                                    >
                                        <i className={s.icon} aria-hidden="true" />
                                        <span className="sr-only">{s.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* ── 2. Quick Links ── */}
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
                                {QUICK_LINKS.map((l) => (
                                    <li key={l.label}>
                                        <button className="footer__link" onClick={() => scrollTo(l.href)}>
                                            <i className="fa-solid fa-chevron-right footer__link-arrow" />
                                            {l.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* ── 3. Contact Info ── */}
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
                                <li className="footer__contact-item">
                                    <span className="footer__contact-icon">
                                        <i className="fa-solid fa-envelope" />
                                    </span>
                                    <div>
                                        <p className="footer__contact-label">Email</p>
                                        <a href="mailto:you@email.com" className="footer__contact-val">
                                            you@email.com
                                        </a>
                                    </div>
                                </li>
                                <li className="footer__contact-item">
                                    <span className="footer__contact-icon">
                                        <i className="fa-solid fa-phone" />
                                    </span>
                                    <div>
                                        <p className="footer__contact-label">Phone</p>
                                        <a href="tel:+911234567890" className="footer__contact-val">
                                            +91 12345 67890
                                        </a>
                                    </div>
                                </li>
                                <li className="footer__contact-item">
                                    <span className="footer__contact-icon">
                                        <i className="fa-solid fa-location-dot" />
                                    </span>
                                    <div>
                                        <p className="footer__contact-label">Location</p>
                                        <span className="footer__contact-val">Haldia, West Bengal, India</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* ── 4. Newsletter ── */}
                        <div
                            className={`footer__col footer__reveal ${visibleSections.news ? "footer__reveal--in" : ""}`}
                            ref={ref("news")}
                            style={{ animationDelay: "0.3s" }}
                        >
                            <h3 className="footer__col-title">
                                <span className="footer__col-title-line" />
                                Newsletter
                            </h3>
                            <p className="footer__news-desc">
                                Get updates on new projects and articles. No spam, ever.
                            </p>
                            <form className="footer__news-form" onSubmit={handleNewsletter} noValidate>
                                <div className="footer__news-input-wrap">
                                    <i className="fa-solid fa-at footer__news-icon" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={newsEmail}
                                        onChange={(e) => { setNewsEmail(e.target.value); setNewsStatus(null); }}
                                        className={`footer__news-input ${newsStatus === "err" ? "footer__news-input--err" : ""}`}
                                        aria-label="Email for newsletter"
                                    />
                                </div>
                                {newsStatus === "err" && <p className="footer__news-err">Enter a valid email.</p>}
                                {newsStatus === "ok" && <p className="footer__news-ok"><i className="fa-solid fa-circle-check" /> Subscribed!</p>}
                                <button type="submit" className="footer__news-btn">
                                    Subscribe <i className="fa-solid fa-paper-plane" />
                                </button>
                            </form>
                        </div>
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
                            © {CURRENT_YEAR} <span className="footer__copy-name">MCAWALLAH</span>. All rights reserved.
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
                            Made with <span className="footer__heart">♥</span> Mahadeb Maity
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
