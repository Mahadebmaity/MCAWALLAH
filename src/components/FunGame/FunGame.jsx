// src/components/FunGame/FunGame.jsx
import { useEffect, useRef, useState } from "react";
import { usePortfolioData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
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
        difficulty: "Medium",
        engine: "Canvas 2D & State Machine",
        controls: ["W, A, S, D", "Arrow Keys", "Touch D-Pad"],
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
        difficulty: "Hard",
        engine: "Matrix Grid Algorithm",
        controls: ["Swipe Gestures", "Arrow Keys", "Undo Move"],
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
        difficulty: "Dynamic",
        engine: "Real-time Telemetry & Sound FX",
        controls: ["Physical Keyboard", "Keystroke Timing", "Audio FX"],
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
        difficulty: "Unbeatable AI",
        engine: "Minimax Game Tree & Heuristics",
        controls: ["Mouse Click", "Touch Tap", "Reset Grid"],
        features: ["Unbeatable AI Bot", "2-Player Pass Mode", "Win Streak Animations"]
    }
];

// Interactive Animated Mini Canvas Preview for CRT Monitor
function ArcadeCRTPreview({ game }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let step = 0;

        const render = () => {
            step++;
            const w = canvas.width;
            const h = canvas.height;

            ctx.clearRect(0, 0, w, h);

            // Background grid
            ctx.fillStyle = '#060814';
            ctx.fillRect(0, 0, w, h);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            const gridSize = 20;
            for (let x = 0; x < w; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            if (game.slug === 'snake') {
                // Draw animated snake
                const snakeColor = game.color || '#e84545';
                const t = step * 0.05;
                const pathLength = 8;
                for (let i = 0; i < pathLength; i++) {
                    const segT = t - i * 0.25;
                    const x = (w / 2) + Math.cos(segT) * (w * 0.3);
                    const y = (h / 2) + Math.sin(segT * 2) * (h * 0.25);
                    const size = i === 0 ? 14 : 10;

                    ctx.fillStyle = i === 0 ? '#ffffff' : snakeColor;
                    ctx.shadowColor = snakeColor;
                    ctx.shadowBlur = i === 0 ? 15 : 8;
                    ctx.beginPath();
                    ctx.roundRect(x - size / 2, y - size / 2, size, size, 4);
                    ctx.fill();
                }

                // Apple
                const appleX = (w / 2) + Math.cos(t * 0.8 + 2) * (w * 0.25);
                const appleY = (h / 2) + Math.sin(t * 0.8) * (h * 0.2);
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(appleX, appleY, 6, 0, Math.PI * 2);
                ctx.fill();
            } else if (game.slug === '2048') {
                // 4x4 Grid tiles
                const startX = w / 2 - 80;
                const startY = h / 2 - 80;
                const tiles = [
                    [2, 4, 8, 16],
                    [32, 64, 128, 256],
                    [512, 1024, 2048, '✨'],
                    [0, 2, 4, 8]
                ];
                ctx.shadowBlur = 0;
                tiles.forEach((row, r) => {
                    row.forEach((val, c) => {
                        const x = startX + c * 40;
                        const y = startY + r * 40;
                        const isGold = val === 2048 || val === '✨';
                        ctx.fillStyle = isGold ? '#f59e0b' : val === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(245, 158, 11, 0.2)';
                        ctx.strokeStyle = isGold ? '#fbbf24' : 'rgba(245, 158, 11, 0.4)';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.roundRect(x, y, 34, 34, 6);
                        ctx.fill();
                        ctx.stroke();

                        if (val !== 0) {
                            ctx.fillStyle = isGold ? '#000' : '#fff';
                            ctx.font = 'bold 10px Fira Code, monospace';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(val, x + 17, y + 17);
                        }
                    });
                });
            } else if (game.slug === 'typing') {
                // Hacker Matrix Text Stream
                ctx.fillStyle = '#10b981';
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 8;
                ctx.font = '12px Fira Code, monospace';
                ctx.textAlign = 'left';

                const lines = [
                    "> const speed = getTypingWPM();",
                    "> const accuracy = 99.4%;",
                    "> function masterDeveloperCode() {",
                    ">   return '⚡ LIGHTNING SPEED ⚡';",
                    "> } // Ready to test your fingers"
                ];

                lines.forEach((line, idx) => {
                    const subLen = Math.min(line.length, Math.floor(((step * 0.8) + idx * 5) % (line.length + 15)));
                    const visibleText = line.substring(0, subLen);
                    ctx.fillText(visibleText, 24, 45 + idx * 24);
                });

                // Blinking cursor
                if (Math.floor(step / 20) % 2 === 0) {
                    ctx.fillStyle = '#34d399';
                    ctx.fillRect(24 + 180, 45 + 4 * 24 - 10, 8, 14);
                }
            } else {
                // Tic Tac Toe Grid
                const startX = w / 2 - 60;
                const startY = h / 2 - 60;

                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 10;

                // Vertical lines
                ctx.beginPath();
                ctx.moveTo(startX + 40, startY);
                ctx.lineTo(startX + 40, startY + 120);
                ctx.moveTo(startX + 80, startY);
                ctx.lineTo(startX + 80, startY + 120);
                // Horizontal lines
                ctx.moveTo(startX, startY + 40);
                ctx.lineTo(startX + 120, startY + 40);
                ctx.moveTo(startX, startY + 80);
                ctx.lineTo(startX + 120, startY + 80);
                ctx.stroke();

                // Draw X
                ctx.strokeStyle = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(startX + 10, startY + 10);
                ctx.lineTo(startX + 30, startY + 30);
                ctx.moveTo(startX + 30, startY + 10);
                ctx.lineTo(startX + 10, startY + 30);
                ctx.stroke();

                // Draw O
                ctx.strokeStyle = '#f43f5e';
                ctx.shadowColor = '#f43f5e';
                ctx.beginPath();
                ctx.arc(startX + 60, startY + 60, 12, 0, Math.PI * 2);
                ctx.stroke();

                // Another X
                ctx.strokeStyle = '#38bdf8';
                ctx.shadowColor = '#38bdf8';
                ctx.beginPath();
                ctx.moveTo(startX + 90, startY + 90);
                ctx.lineTo(startX + 110, startY + 110);
                ctx.moveTo(startX + 110, startY + 90);
                ctx.lineTo(startX + 90, startY + 110);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [game.slug, game.color]);

    return (
        <div className="arcade-crt-screen">
            <canvas ref={canvasRef} width={360} height={230} className="arcade-crt-canvas" />
            <div className="arcade-crt-scanlines" />
            <div className="arcade-crt-glow" style={{ '--glow-color': game.color || '#38bdf8' }} />
            <div className="arcade-crt-badge">
                <span className="arcade-rec-dot" /> LIVE SIMULATOR
            </div>
        </div>
    );
}

export default function FunGame() {
    const { data } = usePortfolioData();
    const { requireAuth } = useAuth();
    const sectionRef = useRef(null);
    const [viewMode, setViewMode] = useState("arcade"); // 'arcade' (Interactive Console HUD) or 'grid' (Matrix Grid)
    const [selectedGameIndex, setSelectedGameIndex] = useState(0);

    const sectionConfig = data?.settings?.gamesSection || {
        badgeText: "Fun Zone Arcade",
        headingMain: "Interactive",
        headingAccent: "Gaming Lounge",
        description: "Take a quick break! Play retro classics, test your developer typing speed, solve sliding number puzzles, or challenge our unbeatable AI bot.",
        ctaButtonText: "Play Our Games (Opens Full Arena)",
        showCtaButton: true,
        isPublic: true
    };

    // Merge data from database with rich fallbacks
    const rawGames = data?.games?.length ? data.games : DEFAULT_GAMES;

    const defaultMappedGames = DEFAULT_GAMES.map(defaultGame => {
        const found = rawGames.find(g =>
            g.slug === defaultGame.slug ||
            (g.slug === 'speed-typer' && defaultGame.slug === 'typing')
        );
        if (!found) return defaultGame;
        return {
            ...defaultGame,
            ...found,
            slug: defaultGame.slug,
            tagline: found.tagline || defaultGame.tagline,
            categoryBadge: found.categoryBadge || defaultGame.categoryBadge,
            desc: found.desc || defaultGame.desc,
            icon: found.icon || defaultGame.icon,
            color: found.color || defaultGame.color,
            difficulty: found.difficulty || defaultGame.difficulty,
            engine: found.engine || defaultGame.engine,
            controls: (found.controls && found.controls.length > 0) ? found.controls : defaultGame.controls,
            features: (found.features && found.features.length > 0) ? found.features : defaultGame.features
        };
    });

    const customGames = rawGames.filter(g =>
        !DEFAULT_GAMES.some(df => df.slug === g.slug || (g.slug === 'speed-typer' && df.slug === 'typing'))
    );

    const gamesList = [...defaultMappedGames, ...customGames];
    const activeGame = gamesList[selectedGameIndex] || gamesList[0] || DEFAULT_GAMES[0];

    if (sectionConfig.isPublic === false) return null;

    const openGame = (slug = "snake") => {
        if (!requireAuth(
            () => window.open(`/arcade/${slug}`, "_blank"),
            "Please Sign In or Sign Up to play Arcade Games and record your high scores!",
            "register"
        )) {
            return;
        }
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

                    {/* Master Bar: Cartridge Selectors & View Switcher */}
                    <div className="game-showcase__top-bar">
                        {/* Cartridge Selection Tabs */}
                        <div className="game-showcase__cartridges">
                            {gamesList.map((g, idx) => (
                                <button
                                    key={g.slug || idx}
                                    type="button"
                                    onClick={() => setSelectedGameIndex(idx)}
                                    className={`game-cartridge-btn ${selectedGameIndex === idx ? 'active' : ''}`}
                                    style={{ '--cat-color': g.color || '#e84545' }}
                                >
                                    <i className={g.icon || "fa-solid fa-gamepad"} />
                                    <span>{g.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* View Switcher Toggle */}
                        <div className="game-showcase__view-switcher" role="tablist">
                            <button
                                type="button"
                                className={`game-view-btn ${viewMode === 'arcade' ? 'active' : ''}`}
                                onClick={() => setViewMode('arcade')}
                                title="Interactive Cyber Arcade Console"
                            >
                                <i className="fa-solid fa-tv" /> <span>Arcade Console</span>
                            </button>
                            <button
                                type="button"
                                className={`game-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Uniform Holographic Matrix Grid"
                            >
                                <i className="fa-solid fa-table-cells" /> <span>Matrix Grid</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════════
                     MODE 1: INTERACTIVE CYBER ARCADE CONSOLE HUD
                ══════════════════════════════════════════════════════════ */}
                {viewMode === 'arcade' && activeGame && (
                    <div className="arcade-station-wrapper" style={{ '--accent-color': activeGame.color || '#e84545' }}>
                        {/* Ambient Neon Backing */}
                        <div className="arcade-station-ambient" />

                        <div className="arcade-station-card">
                            {/* Left: CRT Screen Monitor Frame */}
                            <div className="arcade-station-screen-col">
                                <div className="arcade-cabinet-frame">
                                    <div className="arcade-cabinet-header">
                                        <span className="arcade-cabinet-dot red" />
                                        <span className="arcade-cabinet-dot yellow" />
                                        <span className="arcade-cabinet-dot green" />
                                        <span className="arcade-cabinet-title">ARCADE_OS v2.4 // {activeGame.slug.toUpperCase()}</span>
                                    </div>

                                    {/* Animated Canvas CRT Screen */}
                                    <ArcadeCRTPreview game={activeGame} />

                                    {/* Action Launch Bar */}
                                    <div className="arcade-cabinet-footer">
                                        <button
                                            type="button"
                                            onClick={() => openGame(activeGame.slug)}
                                            className="arcade-btn-insert-coin"
                                        >
                                            <i className="fa-solid fa-play" />
                                            <span>⚡ LAUNCH ARENA (PLAY)</span>
                                            <i className="fa-solid fa-arrow-up-right-from-square" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Telemetry & Controls HUD */}
                            <div className="arcade-station-telemetry-col">
                                <div className="arcade-hud-header">
                                    <span className="arcade-hud-badge" style={{ color: activeGame.color, borderColor: `${activeGame.color}40`, background: `${activeGame.color}15` }}>
                                        <i className={activeGame.icon || "fa-solid fa-gamepad"} /> {activeGame.categoryBadge || "Arcade"}
                                    </span>
                                    <span className="arcade-hud-status">
                                        <span className="arcade-hud-dot" style={{ background: activeGame.color }} /> READY TO PLAY
                                    </span>
                                </div>

                                <div className="arcade-hud-info">
                                    <span className="arcade-hud-tagline">{activeGame.tagline}</span>
                                    <h3 className="arcade-hud-title">{activeGame.title}</h3>
                                    <p className="arcade-hud-desc">{activeGame.desc}</p>
                                </div>

                                {/* Spec Telemetry Grid */}
                                <div className="arcade-telemetry-grid">
                                    <div className="arcade-telemetry-item">
                                        <span className="arcade-telemetry-label">DIFFICULTY</span>
                                        <span className="arcade-telemetry-val" style={{ color: activeGame.color }}>
                                            {activeGame.difficulty || "Dynamic"}
                                        </span>
                                    </div>
                                    <div className="arcade-telemetry-item">
                                        <span className="arcade-telemetry-label">ENGINE ARCHITECTURE</span>
                                        <span className="arcade-telemetry-val">
                                            {activeGame.engine || "Canvas 2D Engine"}
                                        </span>
                                    </div>
                                </div>

                                {/* Controls Matrix */}
                                {activeGame.controls?.length > 0 && (
                                    <div className="arcade-controls-row">
                                        <span className="arcade-controls-label">
                                            <i className="fa-solid fa-keyboard" /> CONTROLS:
                                        </span>
                                        <div className="arcade-controls-pills">
                                            {activeGame.controls.map((ctrl, i) => (
                                                <span key={i} className="arcade-key-pill">{ctrl}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Features Checklist */}
                                {activeGame.features?.length > 0 && (
                                    <div className="arcade-hud-features">
                                        {activeGame.features.map((feat, i) => (
                                            <span key={i} className="arcade-hud-feat-item">
                                                <i className="fa-solid fa-check" style={{ color: activeGame.color }} /> {feat}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════════════════
                     MODE 2: 100% UNIFORM HOLOGRAPHIC MATRIX GRID
                ══════════════════════════════════════════════════════════ */}
                {viewMode === 'grid' && (
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

                                {/* Card Footer with Launch Button */}
                                <div className="game-card__footer">
                                    <div className="game-card__action-btn">
                                        <span>Launch Game</span>
                                        <i className="fa-solid fa-arrow-right" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
