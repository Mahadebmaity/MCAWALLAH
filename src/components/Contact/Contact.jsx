import { useEffect, useRef, useState } from "react";
import { usePortfolioData } from "../../context/DataContext";
import { trackActivity } from "../../utils/analytics";
import "./Contact.css";

const SOCIAL_LINKS = [
    { icon: "fa-brands fa-github", label: "GitHub", href: "https://github.com", color: "#f0f0f0" },
    { icon: "fa-brands fa-linkedin", label: "LinkedIn", href: "https://linkedin.com", color: "#0A66C2" },
    { icon: "fa-brands fa-twitter", label: "Twitter", href: "https://twitter.com", color: "#1DA1F2" },
    { icon: "fa-brands fa-instagram", label: "Instagram", href: "https://instagram.com", color: "#E1306C" },
];

function useInView(threshold = 0.1) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

export default function Contact() {
    const { data, submitContactMessage } = usePortfolioData();
    const settings = data?.settings || {};

    const [sectionRef, sectionIn] = useInView(0.1);
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null); // null | "sending" | "ok" | "err"
    const [feedbackText, setFeedbackText] = useState("");

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
        if (!form.subject.trim()) e.subject = "Subject is required";
        if (form.message.trim().length < 10) e.message = "Message too short (min 10 chars)";
        return e;
    };

    const handleChange = (field) => (e) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
        if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        
        setErrors({});
        setStatus("sending");

        try {
            const res = await submitContactMessage(form);
            trackActivity({
                action: 'CONTACT_SUBMIT',
                category: 'contact',
                details: `Inquiry submitted: "${form.subject || 'No Subject'}" (${form.name})`,
                metadata: { senderName: form.name, senderEmail: form.email, subject: form.subject }
            });
            setStatus("ok");
            setFeedbackText(res.message || "Message sent! I'll reply within 24 hours.");
            setForm({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => setStatus(null), 5000);
        } catch (err) {
            setStatus("err");
            if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
                setFeedbackText("Cannot connect to server. Please make sure the backend server is running.");
            } else {
                setFeedbackText(err.message || "Failed to send message. Please try again.");
            }
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <section id="contact" className="contact">
            <span id="get-in-touch" style={{ position: "absolute", top: "-80px" }} aria-hidden="true" />
            <div className="contact__bg" aria-hidden="true">
                <div className="contact__bg-blob contact__bg-blob--1" />
                <div className="contact__bg-blob contact__bg-blob--2" />
                <div className="contact__bg-grid" />
            </div>

            <div className="contact__container">

                {/* Label */}
                <div className="contact__label">
                    <span className="contact__label-line" />
                    <span className="contact__label-text">
                        <i className="fa-solid fa-paper-plane" /> Contact
                    </span>
                    <span className="contact__label-line" />
                </div>

                <div
                    className={`contact__content contact__reveal ${sectionIn ? "contact__reveal--in" : ""}`}
                    ref={sectionRef}
                >

                    {/* ── LEFT: info ── */}
                    <div className="contact__info">
                        <h2 className="contact__title">
                            Let's <span className="contact__title-accent">Connect</span>
                        </h2>
                        <p className="contact__subtitle">
                            Have a project in mind, want to collaborate, or just say hi?
                            My inbox is always open — I'll get back within 24 hours.
                        </p>

                        {/* Info cards */}
                        <div className="contact__cards">
                            {[
                                { icon: "fa-solid fa-envelope", label: "Email", val: settings.contactEmail || "mahadeb@portfolio.com", href: `mailto:${settings.contactEmail || "mahadeb@portfolio.com"}` },
                                { icon: "fa-solid fa-phone", label: "Phone", val: settings.contactPhone || "+91 12345 67890", href: `tel:${settings.contactPhone || "+911234567890"}` },
                                { icon: "fa-solid fa-location-dot", label: "Location", val: settings.contactLocation || "Haldia, West Bengal, India", href: null },
                            ].map((c) => (
                                <div key={c.label} className="contact__card">
                                    <div className="contact__card-icon">
                                        <i className={c.icon} />
                                    </div>
                                    <div>
                                        <p className="contact__card-label">{c.label}</p>
                                        {c.href
                                            ? <a className="contact__card-val" href={c.href}>{c.val}</a>
                                            : <p className="contact__card-val">{c.val}</p>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Availability */}
                        <div className="contact__availability">
                            <span className="contact__avail-dot" />
                            <span>Currently available for freelance &amp; full-time roles</span>
                        </div>

                        {/* Socials */}
                        <div className="contact__socials">
                            <p className="contact__socials-label">Find me on</p>
                            <div className="contact__socials-row">
                                {SOCIAL_LINKS.map((s) => (
                                    <a
                                        key={s.label}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact__social"
                                        title={s.label}
                                        style={{ "--sc": s.color }}
                                    >
                                        <i className={s.icon} />
                                        <span>{s.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: form ── */}
                    <div className="contact__form-wrap">
                        <form className="contact__form" onSubmit={handleSubmit} noValidate>
                            <h3 className="contact__form-title">Send a Message</h3>

                            {/* Name + Email */}
                            <div className="contact__form-row">
                                <div className="contact__form-group">
                                    <label className="contact__form-label" htmlFor="c-name">
                                        <i className="fa-solid fa-user" /> Name
                                    </label>
                                    <input
                                        id="c-name" type="text" placeholder="Your name"
                                        value={form.name} onChange={handleChange("name")}
                                        className={`contact__form-input ${errors.name ? "contact__form-input--err" : ""}`}
                                    />
                                    {errors.name && <span className="contact__form-err">{errors.name}</span>}
                                </div>
                                <div className="contact__form-group">
                                    <label className="contact__form-label" htmlFor="c-email">
                                        <i className="fa-solid fa-envelope" /> Email
                                    </label>
                                    <input
                                        id="c-email" type="email" placeholder="your@email.com"
                                        value={form.email} onChange={handleChange("email")}
                                        className={`contact__form-input ${errors.email ? "contact__form-input--err" : ""}`}
                                    />
                                    {errors.email && <span className="contact__form-err">{errors.email}</span>}
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="contact__form-group">
                                <label className="contact__form-label" htmlFor="c-subject">
                                    <i className="fa-solid fa-tag" /> Subject
                                </label>
                                <input
                                    id="c-subject" type="text" placeholder="What's this about?"
                                    value={form.subject} onChange={handleChange("subject")}
                                    className={`contact__form-input ${errors.subject ? "contact__form-input--err" : ""}`}
                                />
                                {errors.subject && <span className="contact__form-err">{errors.subject}</span>}
                            </div>

                            {/* Message */}
                            <div className="contact__form-group">
                                <label className="contact__form-label" htmlFor="c-msg">
                                    <i className="fa-solid fa-message" /> Message
                                </label>
                                <textarea
                                    id="c-msg" rows={5} placeholder="Tell me about your project or idea..."
                                    value={form.message} onChange={handleChange("message")}
                                    className={`contact__form-input contact__form-textarea ${errors.message ? "contact__form-input--err" : ""}`}
                                />
                                {errors.message && <span className="contact__form-err">{errors.message}</span>}
                            </div>

                            {/* Status message */}
                            {status === "ok" && (
                                <div className="contact__form-success">
                                    <i className="fa-solid fa-circle-check" />
                                    {feedbackText}
                                </div>
                            )}

                            {status === "err" && (
                                <div className="contact__form-err" style={{ marginBottom: '14px', display: 'block', fontSize: '13px' }}>
                                    <i className="fa-solid fa-circle-exclamation" /> {feedbackText}
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`contact__form-btn ${status === "sending" ? "contact__form-btn--loading" : ""} ${status === "ok" ? "contact__form-btn--ok" : ""}`}
                                disabled={status === "sending"}
                            >
                                {status === "sending" && <><i className="fa-solid fa-circle-notch fa-spin" /> Sending…</>}
                                {status === "ok" && <><i className="fa-solid fa-circle-check" /> Sent!</>}
                                {!status && <><i className="fa-solid fa-paper-plane" /> Send Message</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
