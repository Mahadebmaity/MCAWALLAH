// src/components/FunGame/FunGame.jsx
import { useEffect, useRef } from "react";
import { usePortfolioData } from "../../context/DataContext";
import "./FunGame.css";

const DEFAULT_GAMES = [
    {
        title: "Retro Snake",
        slug: "snake",
        tagline: "Classic Reflex Arcade",
        desc: "Eat glowing food dots to grow longer, avoid collisions, and test your lightning reflexes across 3 speed tiers.",
        icon: "fa-solid fa-gamepad",
        categoryBadge: "Arcade Classic",
        color: "#e84545",
        features: ["3 Speed Modes", "Dynamic D-Pad", "Global Leaderboard"]
    },
    {
        title: "2048 Puzzle",
        slug: "2048",
        tagline: "Mathematical Strategy",
        desc: "Slide and merge matching number tiles on a 4x4 grid to reach the coveted 2048 tile and set record scores.",
        icon: "fa-solid fa-shapes",
        categoryBadge: "Puzzle & Logic",
        color: "#f59e0b",
        features: ["4x4 Animated Grid", "Touch Swipe", "Score Multipliers"]
    },
    {
        title: "Typing Speed Trainer",
        slug: "typing",
        tagline: "Pro Touch-Typing Tutor",
        desc: "Master number rows, alphabet pangrams, and real programming syntax with live WPM telemetry & audio feedback.",
        icon: "fa-solid fa-keyboard",
        categoryBadge: "Skill & Speed",
        color: "#10b981",
        features: ["Live WPM Telemetry", "Mechanical Sound FX", "Visual Keyboard Guide"]
    },
    {
        title: "Tic Tac Toe AI",
        slug: "tictactoe",
        tagline: "Tactical Match",
        desc: "Challenge our unbeatable Minimax AI bot or play with a friend in local 2-Player pass-and-play mode.",
        icon: "fa-solid fa-xmark",
        categoryBadge: "AI & 2-Player",
        color: "#38bdf8",
        features: ["Unbeatable AI Bot", "2-Player Pass Mode", "Win Streak Animations"]
    }
];

export default function FunGame() {
    const { data } = usePortfolioData();
    const sectionRef = useRef(null);

    const sectionConfig = data?.settings?.gamesSection || {
        badgeText: "Fun Zone Arcade",
        headingMain: "Interactive",
        headingAccent: "Gaming Lounge",
        description: "Take a quick break! Play retro classics, test your developer typing speed, solve sliding number puzzles, or challenge our unbeatable AI bot.",
        ctaButtonText: "Play Our Games (Opens Full Arena)",
        showCtaButton: true,
        isPublic: true
    };

    const gamesList = data?.games?.length
        ? data.games.map(g => {
            const fallback = DEFAULT_GAMES.find(df => df.slug === g.slug) || {};
            return {
                ...fallback,
                ...g,
                features: g.features?.length ? g.features : fallback.features || []
            };
        })
        : DEFAULT_GAMES;

    if (sectionConfig.isPublic === false) return null;

    const openGame = (slug = "snake") => {
        window.open(`/arcade/${slug}`, "_blank");
    };

    return (
        <section id="fun-game" className="game-showcase" ref={sectionRef}>
            <div className="game-showcase__bg" aria-hidden="true">
                <div className="game-showcase__blob game-showcase__blob--1" />
                <div className="game-showcase__blob game-showcase__blob--2" />
            </div>

            <div className="game-showcase__container">
                {/* Section Header */}
                <div className="game-showcase__header">
                    <div className="game-showcase__label">
                        <span className="game-showcase__label-line" />
                        <span className="game-showcase__label-text">
                            <i className="fa-solid fa-gamepad" /> {sectionConfig.badgeText || "Fun Zone Arcade"}
                        </span>
                        <span className="game-showcase__label-line" />
                    </div>

                    <h2 className="game-showcase__title">
                        {sectionConfig.headingMain || "Interactive"}{" "}
                        <span className="game-showcase__title-accent">
                            {sectionConfig.headingAccent || "Gaming Lounge"}
                        </span>
                    </h2>
                    <p className="game-showcase__desc">
                        {sectionConfig.description || "Take a quick break! Play retro classics, test your developer typing speed, solve sliding number puzzles, or challenge our unbeatable AI bot."}
                    </p>

                    {/* Master Launch CTA Button */}
                    {sectionConfig.showCtaButton !== false && (
                        <div className="game-showcase__cta-wrap">
                            <button
                                onClick={() => openGame("snake")}
                                className="game-showcase__play-btn"
                            >
                                <span className="game-showcase__play-btn-glow" />
                                <i className="fa-solid fa-play" />
                                <span>{sectionConfig.ctaButtonText || "Play Our Games (Opens Full Arena)"}</span>
                                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '14px', opacity: 0.8 }} />
                            </button>
                        </div>
                    )}
                </div>

                {/* 4 Redesigned UX Game Cards Grid */}
                <div className="game-showcase__grid">
                    {gamesList.map((g) => (
                        <div
                            key={g.slug || g._id}
                            className="game-card"
                            onClick={() => openGame(g.slug)}
                            role="button"
                            tabIndex={0}
                            style={{ "--card-color": g.color || "#e84545" }}
                        >
                            {/* Ambient glowing top accent */}
                            <div className="game-card__glow-bar" />

                            <div className="game-card__top">
                                <div className="game-card__icon-box">
                                    <i className={g.icon || "fa-solid fa-gamepad"} />
                                </div>
                                <span className="game-card__badge">
                                    {g.categoryBadge || "Arcade"}
                                </span>
                            </div>

                            <div className="game-card__body">
                                <span className="game-card__tagline">{g.tagline || "Mini Game"}</span>
                                <h3 className="game-card__title">{g.title}</h3>
                                <p className="game-card__desc">{g.desc}</p>
                            </div>

                            {/* Feature Pills */}
                            {g.features?.length > 0 && (
                                <div className="game-card__features">
                                    {g.features.slice(0, 3).map((feat, idx) => (
                                        <span key={idx} className="game-card__feature-pill">
                                            <i className="fa-solid fa-check" /> {feat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Card Footer with prominent Launch Button */}
                            <div className="game-card__footer">
                                <div className="game-card__action-btn">
                                    <span>Launch Game</span>
                                    <i className="fa-solid fa-arrow-right" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
