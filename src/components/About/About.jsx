import { useEffect, useRef, useState } from "react";
import "./About.css";
// import profileImg from "./src/assests/Mahadeb.jpeg"

const SKILLS = [
    { name: "React", level: 90, icon: "fa-brands fa-react", color: "#61DAFB" },
    { name: "JavaScript", level: 85, icon: "fa-brands fa-js", color: "#F7DF1E" },
    { name: "Node.js", level: 78, icon: "fa-brands fa-node-js", color: "#68A063" },
    { name: "Python", level: 72, icon: "fa-brands fa-python", color: "#3776AB" },
    { name: "CSS / Sass", level: 88, icon: "fa-brands fa-css3-alt", color: "#264DE4" },
    { name: "Git", level: 82, icon: "fa-brands fa-git-alt", color: "#F05032" },
    { name: "Figma", level: 70, icon: "fa-brands fa-figma", color: "#F24E1E" },
    { name: "TypeScript", level: 75, icon: "fa-solid fa-code", color: "#3178C6" },
];

const TIMELINE = [
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

const HOBBIES = [
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
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true); },
            { threshold }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
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
    const [heroRef, heroIn] = useInView(0.1);
    const [skillRef, skillIn] = useInView(0.2);
    const [timeRef, timeIn] = useInView(0.1);
    const [hobbyRef, hobbyIn] = useInView(0.2);

    return (
        <section id="about" className="about">
            {/* ── bg decoration ── */}
            <div className="about__bg" aria-hidden="true">
                <div className="about__bg-blob about__bg-blob--1" />
                <div className="about__bg-blob about__bg-blob--2" />
                <div className="about__bg-grid" />
            </div>

            <div className="about__container">

                {/* ══ SECTION LABEL ══ */}
                <div className="about__label">
                    <span className="about__label-line" />
                    <span className="about__label-text">
                        <i className="fa-solid fa-circle-user" /> About Me
                    </span>
                    <span className="about__label-line" />
                </div>

                {/* ══ HERO ROW ══ */}
                <div
                    className={`about__hero about__reveal ${heroIn ? "about__reveal--in" : ""}`}
                    ref={heroRef}
                >
                    {/* Avatar */}
                    <div className="about__avatar-wrap">
                        <div className="about__avatar-ring" />
                        <div className="about__avatar">
                            {/* <img src={profileImg} alt="Mahadeb" className="about__avatar-img" /> */}
                            <i className="fa-solid fa-user about__avatar-icon" />
                        </div>
                        <div className="about__avatar-badge">
                            <i className="fa-solid fa-star" /> Available
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="about__bio">
                        <h2 className="about__name">
                            Hi, I'm <span className="about__name-accent">Mahadeb Maity</span> 👋
                        </h2>
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

                        {/* Quick stats */}
                        <div className="about__quick-stats">
                            {[
                                { icon: "fa-solid fa-code", val: "3+", label: "Years Coding" },
                                { icon: "fa-solid fa-folder-open", val: "40+", label: "Projects Done" },
                                { icon: "fa-solid fa-mug-hot", val: "∞", label: "Cups of Coffee" },
                            ].map((s) => (
                                <div key={s.label} className="about__quick-stat">
                                    <i className={s.icon} />
                                    <strong>{s.val}</strong>
                                    <span>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        <a href="/resume.pdf" download className="about__resume-btn">
                            <i className="fa-solid fa-download" /> Download Resume
                        </a>
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
                        {SKILLS.map((s) => (
                            <SkillBar key={s.name} skill={s} inView={skillIn} />
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
                        {TIMELINE.map((item, i) => (
                            <div
                                key={i}
                                className="about__timeline-item"
                                style={{ animationDelay: `${i * 0.15}s` }}
                            >
                                <div className="about__timeline-icon">
                                    <i className={item.icon} />
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
                        {HOBBIES.map((h) => (
                            <div key={h.label} className="about__hobby">
                                <i className={h.icon} />
                                <span>{h.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
