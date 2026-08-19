import { useEffect, useRef, useState } from "react";
import { usePortfolioData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { getDocUrl, getMediaUrl, downloadFile } from "../../config/api";
import ResumeModal from "../ResumeModal/ResumeModal";
import "./About.css";

const DEFAULT_SKILLS = [
    { name: "React", level: 90, icon: "fa-brands fa-react", color: "#61DAFB" },
    { name: "JavaScript", level: 85, icon: "fa-brands fa-js", color: "#F7DF1E" },
    { name: "Node.js", level: 78, icon: "fa-brands fa-node-js", color: "#68A063" },
    { name: "Python", level: 72, icon: "fa-brands fa-python", color: "#3776AB" },
    { name: "CSS / Sass", level: 88, icon: "fa-brands fa-css3-alt", color: "#264DE4" },
    { name: "Git", level: 82, icon: "fa-brands fa-git-alt", color: "#F05032" },
    { name: "Figma", level: 70, icon: "fa-brands fa-figma", color: "#F24E1E" },
    { name: "TypeScript", level: 75, icon: "fa-solid fa-code", color: "#3178C6" },
];

const DEFAULT_TIMELINE = [
    {
        year: "2024",
        title: "Senior Frontend Developer",
        place: "Tech Company, India",
        desc: "Led UI architecture for a SaaS dashboard serving 50k+ users.",
        icon: "fa-solid fa-briefcase",
    },
    {
        year: "2023",
        title: "Full Stack Developer",
        place: "Startup, Remote",
        desc: "Built REST APIs and React apps from scratch, end-to-end.",
        icon: "fa-solid fa-laptop-code",
    },
    {
        year: "2022",
        title: "B.Tech — Computer Science",
        place: "University, West Bengal",
        desc: "Graduated with honours. Final project: AI-powered resume parser.",
        icon: "fa-solid fa-graduation-cap",
    },
    {
        year: "2021",
        title: "Open Source Contributor",
        place: "GitHub",
        desc: "Contributed to 10+ public repos, 200+ stars earned.",
        icon: "fa-brands fa-github",
    },
];

const DEFAULT_HOBBIES = [
    { icon: "fa-solid fa-gamepad", label: "Gaming" },
    { icon: "fa-solid fa-book-open", label: "Reading" },
    { icon: "fa-solid fa-music", label: "Music" },
    { icon: "fa-solid fa-camera", label: "Photography" },
    { icon: "fa-solid fa-terminal", label: "Open Source" },
    { icon: "fa-solid fa-mug-hot", label: "Coffee" },
];

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(el);
                }
            },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return [ref, inView];
}

function SkillBar({ skill, inView }) {
    return (
        <div className="about__skill">
            <div className="about__skill-header">
                <span className="about__skill-name">
                    <i className={skill.icon} style={{ color: skill.color }} />
                    {skill.name}
                </span>
                <span className="about__skill-pct">{skill.level}%</span>
            </div>
            <div className="about__skill-track">
                <div
                    className="about__skill-bar"
                    style={{
                        width: inView ? `${skill.level}%` : "0%",
                        background: `linear-gradient(90deg, ${skill.color}99, ${skill.color})`,
                        transitionDelay: `${Math.random() * 0.3}s`,
                    }}
                />
            </div>
        </div>
    );
}

export default function About() {
    const { data } = usePortfolioData();
    const { requireAuth } = useAuth();
    const about = data?.about || {};

    const [heroRef, heroIn] = useInView(0.1);
    const [skillRef, skillIn] = useInView(0.2);
    const [timeRef, timeIn] = useInView(0.1);
    const [hobbyRef, hobbyIn] = useInView(0.2);

    const [imgError, setImgError] = useState(false);
    const [previewResume, setPreviewResume] = useState(null);

    useEffect(() => {
        setImgError(false);
    }, [about.avatarUrl]);

    const avatarSrc = getMediaUrl(about.avatarUrl);

    const initials = about.displayName
        ? about.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "MM";

    const skills = data?.skills?.length ? data.skills : DEFAULT_SKILLS;
    const timeline = data?.timeline?.length ? data.timeline : DEFAULT_TIMELINE;
    const hobbies = about.hobbies?.length ? about.hobbies : DEFAULT_HOBBIES;

    const handleResumeDownload = (resItem) => {
        const performDownload = async () => {
            const targetUrl = resItem.url || about.resumeUrl || "/resume.pdf";
            const title = resItem.title || about.resumeLabel || "Resume";
            await downloadFile(targetUrl, title);
        };
        if (!requireAuth(performDownload, "Please Sign In or Sign Up to download full resume & CV documents.", "register")) return;
        performDownload();
    };

    const handleResumePreview = (resItem) => {
        const performPreview = () => {
            const targetUrl = resItem.url || about.resumeUrl || "/resume.pdf";
            const title = resItem.title || about.resumeLabel || "Resume";
            setPreviewResume({ url: targetUrl, title, fileSize: resItem.fileSize || 'PDF' });
        };
        if (!requireAuth(performPreview, "Please Sign In or Sign Up to preview resume documents.", "register")) return;
        performPreview();
    };

    return (
        <section id="about" className="about">
            <div className="about__bg" aria-hidden="true">
                <div className="about__bg-blob about__bg-blob--1" />
                <div className="about__bg-blob about__bg-blob--2" />
                <div className="about__bg-grid" />
            </div>

            <div className="about__container">

                <div className="about__label">
                    <span className="about__label-line" />
                    <span className="about__label-text">
                        <i className="fa-solid fa-circle-user" /> About Me
                    </span>
                    <span className="about__label-line" />
                </div>

                <div
                    className={`about__hero about__reveal ${heroIn ? "about__reveal--in" : ""}`}
                    ref={heroRef}
                >
                    <div className="about__avatar-wrap">
                        <div className="about__avatar-ring" />
                        <div className="about__avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                            {avatarSrc && !imgError ? (
                                <img
                                    key={avatarSrc}
                                    src={avatarSrc}
                                    alt={about.displayName || "Avatar"}
                                    onError={() => setImgError(true)}
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <span style={{
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    letterSpacing: '1px'
                                }}>
                                    {initials}
                                </span>
                            )}
                        </div>
                        <div className="about__avatar-badge">
                            <i className="fa-solid fa-star" /> Available
                        </div>
                    </div>

                    <div className="about__bio">
                        <h2 className="about__name">
                            Hi, I'm <span className="about__name-accent">{about.displayName || "Mahadeb Maity"}</span> 👋
                        </h2>
                        {about.paragraphs?.length ? (
                            about.paragraphs.map((p, idx) => (
                                <p key={idx} className="about__bio-text">{p}</p>
                            ))
                        ) : (
                            <>
                                <p className="about__bio-text">
                                    I'm a passionate <strong>Full Stack Developer</strong> based in Haldia, West Bengal, India.
                                    I love turning complex problems into elegant, user-friendly solutions.
                                    With 3+ years of experience, I specialise in building fast, accessible,
                                    and beautiful web applications that people enjoy using.
                                </p>
                                <p className="about__bio-text">
                                    When I'm not coding, you'll find me exploring open source projects,
                                    sipping coffee, or levelling up in my favourite games.
                                </p>
                            </>
                        )}

                        {/* Quick stats */}
                        <div className="about__quick-stats">
                            {(about.quickStats?.length ? about.quickStats : [
                                { icon: "fa-solid fa-code", val: "3+", label: "Years Coding" },
                                { icon: "fa-solid fa-folder-open", val: "40+", label: "Projects Done" },
                                { icon: "fa-solid fa-mug-hot", val: "∞", label: "Cups of Coffee" },
                            ]).map((s, idx) => (
                                <div key={idx} className="about__quick-stat">
                                    <i className={s.icon} />
                                    <strong>{s.val}</strong>
                                    <span>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Resume Actions (Preserves base resume + adds admin configured resumes) */}
                        {(() => {
                            const baseDefaultResume = {
                                title: about.resumeLabel || "Download Resume",
                                url: about.resumeUrl || "/resume.pdf",
                                fileSize: "PDF",
                                isVisible: true
                            };

                            const customResumes = Array.isArray(about.resumes)
                                ? about.resumes.filter(r => r && r.isVisible !== false)
                                : [];

                            const visibleResumes = customResumes.some(r => r.url === baseDefaultResume.url)
                                ? customResumes
                                : [baseDefaultResume, ...customResumes];

                            if (visibleResumes.length === 0) return null;

                            return (
                                <div className="about__resume-group">
                                    {visibleResumes.map((resItem, idx) => (
                                        <div key={idx} className="about__resume-item-wrap">
                                            <button
                                                type="button"
                                                onClick={() => handleResumeDownload(resItem)}
                                                className="about__resume-btn"
                                                title={`Download ${resItem.title || 'Resume'}`}
                                            >
                                                <i className={resItem.icon || about.resumeIcon || "fa-solid fa-file-pdf"} /> {resItem.title || about.resumeLabel || "Download Resume"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleResumePreview(resItem)}
                                                className="about__resume-preview-btn"
                                                title={`Preview ${resItem.title || 'CV'} online`}
                                            >
                                                <i className="fa-solid fa-arrow-up-right-from-square" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* ══ SKILLS ══ */}
                <div
                    className={`about__skills-section about__reveal ${skillIn ? "about__reveal--in" : ""}`}
                    ref={skillRef}
                >
                    <h3 className="about__section-title">
                        <i className="fa-solid fa-wand-magic-sparkles" /> Skills &amp; Technologies
                    </h3>
                    <div className="about__skills-grid">
                        {skills.map((s) => (
                            <SkillBar key={s._id || s.name} skill={s} inView={skillIn} />
                        ))}
                    </div>
                </div>

                {/* ══ TIMELINE ══ */}
                <div
                    className={`about__timeline-section about__reveal ${timeIn ? "about__reveal--in" : ""}`}
                    ref={timeRef}
                >
                    <h3 className="about__section-title">
                        <i className="fa-solid fa-timeline" /> Experience &amp; Education
                    </h3>
                    <div className="about__timeline">
                        {timeline.map((item, i) => (
                            <div
                                key={item._id || i}
                                className="about__timeline-item"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            >
                                <div className="about__timeline-icon">
                                    <i className={item.icon || "fa-solid fa-briefcase"} />
                                </div>
                                <div className="about__timeline-content">
                                    <span className="about__timeline-year">{item.year}</span>
                                    <h4 className="about__timeline-title">{item.title}</h4>
                                    <p className="about__timeline-place">
                                        <i className="fa-solid fa-location-dot" /> {item.place}
                                    </p>
                                    <p className="about__timeline-desc">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ══ HOBBIES ══ */}
                <div
                    className={`about__hobbies-section about__reveal ${hobbyIn ? "about__reveal--in" : ""}`}
                    ref={hobbyRef}
                >
                    <h3 className="about__section-title">
                        <i className="fa-solid fa-heart" /> Hobbies &amp; Interests
                    </h3>
                    <div className="about__hobbies">
                        {hobbies.map((h, idx) => (
                            <div key={idx} className="about__hobby">
                                <i className={h.icon} />
                                <span>{h.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ══ Dedicated Glassmorphic Resume Viewer Popup Modal ══ */}
            {previewResume && (
                <ResumeModal
                    resume={previewResume}
                    onClose={() => setPreviewResume(null)}
                />
            )}
        </section>
    );
}
