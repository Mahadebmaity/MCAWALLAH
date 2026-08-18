// src/components/Feedback/LogoutFeedbackModal.jsx
import { useState, useEffect, useRef } from "react";
import { API_BASE } from "../../config/api";
import "./LogoutFeedbackModal.css";

const VIBE_OPTIONS = [
    { id: "loved", emoji: "😍", label: "Loved the Website!" },
    { id: "smooth", emoji: "🚀", label: "Super Smooth & Fast" },
    { id: "design", emoji: "🎨", label: "Stunning Modern UI" },
    { id: "arcade", emoji: "🕹️", label: "Fun Arcade & Games" },
    { id: "suggestion", emoji: "💡", label: "Have a Suggestion" },
];

export default function LogoutFeedbackModal({
    isOpen,
    user,
    onClose,
    onLogout,
    isExitIntent = false,
}) {
    const [selectedVibe, setSelectedVibe] = useState("loved");
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Auto focus text input after modal animation
            setTimeout(() => {
                textareaRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const userName = user?.name || "Friend";
    const userEmail = user?.email || "anonymous@visitor.com";

    const handleSubmitFeedback = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        const vibeObj = VIBE_OPTIONS.find((v) => v.id === selectedVibe);
        const vibeLabel = vibeObj ? `${vibeObj.emoji} ${vibeObj.label}` : "Exit Feedback";
        const messageBody = feedbackText.trim()
            ? `Vibe: ${vibeLabel}\n\nUser Feedback:\n${feedbackText.trim()}`
            : `User gave a quick rating: ${vibeLabel} before leaving.`;

        try {
            await fetch(`${API_BASE}/portfolio/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: userName,
                    email: userEmail,
                    subject: `[User Exit Feedback] ${vibeLabel}`,
                    message: messageBody,
                }),
            });
        } catch (err) {
            console.warn("Could not save exit feedback:", err);
        } finally {
            setIsSubmitting(false);
            onLogout();
        }
    };

    const handleSkipAndLogout = () => {
        onLogout();
    };

    return (
        <div className="exit-feedback-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="exit-feedback-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glowing Ambient Top Border */}
                <div className="exit-feedback-glow-bar" />

                {/* Close 'X' Button */}
                <button
                    type="button"
                    className="exit-feedback-close-btn"
                    onClick={onClose}
                    aria-label="Close modal and stay on site"
                    title="Stay on website"
                >
                    <i className="fa-solid fa-xmark" />
                </button>

                {/* Header */}
                <div className="exit-feedback-header">
                    <div className="exit-feedback-avatar-ring">
                        <span className="exit-feedback-avatar-emoji">👋</span>
                    </div>
                    <h3 className="exit-feedback-title">
                        Leaving so soon, <span className="exit-feedback-name">{userName}</span>?
                    </h3>
                    <p className="exit-feedback-subtitle">
                        {isExitIntent
                            ? "Before you go, how was your experience exploring the portfolio?"
                            : "Before logging out, take 5 seconds to tell Mahadeb how you liked the portfolio!"}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitFeedback} className="exit-feedback-form">
                    {/* 1-Tap Vibe Rating Chips */}
                    <div className="exit-feedback-vibes-label">Quick Vibe Check:</div>
                    <div className="exit-feedback-vibes-list">
                        {VIBE_OPTIONS.map((vibe) => (
                            <button
                                key={vibe.id}
                                type="button"
                                className={`exit-vibe-chip ${selectedVibe === vibe.id ? "active" : ""}`}
                                onClick={() => setSelectedVibe(vibe.id)}
                            >
                                <span className="exit-vibe-emoji">{vibe.emoji}</span>
                                <span className="exit-vibe-text">{vibe.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Freeform Feedback Textarea */}
                    <div className="exit-feedback-input-wrap">
                        <textarea
                            ref={textareaRef}
                            className="exit-feedback-textarea"
                            rows={3}
                            placeholder="What did you like? Any bugs, advice, or suggestions? (Optional)..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            maxLength={500}
                        />
                        <div className="exit-feedback-char-count">
                            {feedbackText.length}/500
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="exit-feedback-actions">
                        <button
                            type="button"
                            className="exit-feedback-btn-skip"
                            onClick={handleSkipAndLogout}
                            disabled={isSubmitting}
                        >
                            <i className="fa-solid fa-right-from-bracket" /> Just Logout (Skip)
                        </button>

                        <button
                            type="submit"
                            className="exit-feedback-btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin" /> Sending...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-paper-plane" /> Send Feedback &amp; Logout
                                </>
                            )}
                        </button>
                    </div>

                    <div className="exit-feedback-footer-note">
                        <button
                            type="button"
                            className="exit-feedback-stay-link"
                            onClick={onClose}
                        >
                            Changed your mind? <span style={{ textDecoration: 'underline' }}>Stay on website</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
