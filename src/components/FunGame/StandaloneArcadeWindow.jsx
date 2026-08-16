// src/components/FunGame/StandaloneArcadeWindow.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SnakeGame from "./SnakeGame";
import Puzzle2048 from "./Puzzle2048";
import TypingChallenge from "./TypingChallenge";
import TicTacToe from "./TicTacToe";
import GameLeaderboard from "./GameLeaderboard";
import GameInstructionsModal from "./GameInstructionsModal";
import AuthModal from "../AuthModal/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../config/api";
import { trackActivity } from "../../utils/analytics";
import "./FunGame.css";

const GAMES = [
    { title: "Retro Snake", slug: "snake", icon: "fa-solid fa-gamepad", color: "#e84545" },
    { title: "2048 Puzzle", slug: "2048", icon: "fa-solid fa-shapes", color: "#f59e0b" },
    { title: "Typing Speed Trainer", slug: "typing", icon: "fa-solid fa-keyboard", color: "#10b981" },
    { title: "Tic Tac Toe AI", slug: "tictactoe", icon: "fa-solid fa-xmark", color: "#38bdf8" }
];

export default function StandaloneArcadeWindow() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeSlug, setActiveSlug] = useState(slug || "snake");
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true); // First show instructions automatically!
    const [scoreAlert, setScoreAlert] = useState(null);

    // Live Game Stopwatch Timer
    const [gameSeconds, setGameSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);

    // Recent Match / Run History for current session
    const [sessionHistory, setSessionHistory] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("arcade_session_history") || "[]");
        } catch {
            return [];
        }
    });

    const [bests, setBests] = useState(() => ({
        snake: Number(localStorage.getItem("arcade_best_snake") || 0),
        "2048": Number(localStorage.getItem("arcade_best_2048") || 0),
        typing: Number(localStorage.getItem("arcade_best_typing") || 0),
        tictactoe: Number(localStorage.getItem("arcade_best_tictactoe") || 0)
    }));

    useEffect(() => {
        if (slug && GAMES.some(g => g.slug === slug)) {
            setActiveSlug(slug);
            setShowInstructions(true); // Auto show instruction on game switch!
            resetTimer();
        }
    }, [slug]);

    // Timer loop
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => {
                setGameSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isTimerRunning]);

    const resetTimer = () => {
        clearInterval(timerRef.current);
        setGameSeconds(0);
        setIsTimerRunning(false);
    };

    const formatTime = (totalSec) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSwitchGame = (newSlug) => {
        setActiveSlug(newSlug);
        setShowInstructions(true); // Show rules first
        resetTimer();
        navigate(`/arcade/${newSlug}`, { replace: true });
    };

    const handleGameOver = async (finalScore, metrics = {}) => {
        if (typeof finalScore !== 'number' || finalScore <= 0) return;

        setIsTimerRunning(false);

        const durationSeconds = metrics.durationSeconds || gameSeconds || 1;
        const timeString = formatTime(durationSeconds);

        // Record to local session history
        const newRun = {
            id: Date.now(),
            gameSlug: activeSlug,
            score: finalScore,
            durationSeconds,
            timeString,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            metrics
        };

        trackActivity({
            action: 'GAME_PLAY',
            category: 'game',
            details: `Played ${activeSlug.toUpperCase()} (Score: ${finalScore} pts in ${timeString})`,
            metadata: { gameSlug: activeSlug, score: finalScore, durationSeconds, timeString }
        });

        const updatedHistory = [newRun, ...sessionHistory].slice(0, 10);
        setSessionHistory(updatedHistory);
        localStorage.setItem("arcade_session_history", JSON.stringify(updatedHistory));

        // Update personal best
        const currentBest = bests[activeSlug] || 0;
        if (finalScore > currentBest) {
            setBests(prev => {
                const updated = { ...prev, [activeSlug]: finalScore };
                localStorage.setItem(`arcade_best_${activeSlug}`, finalScore.toString());
                return updated;
            });
        }

        // Submit to API
        try {
            const playerName = user?.name || localStorage.getItem('player_nickname') || 'Guest Player';
            const res = await fetch(`${API_BASE}/portfolio/games/${activeSlug}/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerName,
                    score: finalScore,
                    metrics: { ...metrics, durationSeconds }
                })
            });

            if (res.ok) {
                const json = await res.json();
                setScoreAlert({
                    title: `Session Score Recorded: ${finalScore} pts! 🏆`,
                    message: `Global Rank #${json.rank || 1} on the Hall of Fame.`
                });
                setTimeout(() => setScoreAlert(null), 5000);
            }
        } catch (err) {
            console.warn('Score submission error:', err.message);
        }
    };

    const currentGame = GAMES.find(g => g.slug === activeSlug) || GAMES[0];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--gm-bg, #07070f)',
            color: 'var(--gm-text-1, #f8fafc)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--gm-font-b, sans-serif)'
        }}>
            {/* Top Arcade Navigation Bar */}
            <header style={{
                background: 'var(--adm-surface, #0f172a)',
                borderBottom: '1px solid var(--adm-border, rgba(255,255,255,0.08))',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link
                        to="/#fun-game"
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <i className="fa-solid fa-arrow-left" /> Back to Portfolio
                    </Link>
                    <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--gm-font-d, sans-serif)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-gamepad" style={{ color: 'var(--gm-accent, #e84545)' }} />
                        Arcade Arena Lounge
                    </div>
                </div>

                {/* Telemetry Strip: Live Session Timer & Hall of Fame Trigger */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--adm-border)',
                        fontFamily: 'var(--gm-font-m)',
                        fontSize: '13px'
                    }}>
                        <i className="fa-solid fa-stopwatch" style={{ color: '#38bdf8' }} />
                        <span>Elapsed: <strong>{formatTime(gameSeconds)}</strong></span>
                    </div>

                    <button
                        onClick={() => setShowInstructions(true)}
                        className="adm-btn adm-btn-secondary adm-btn-sm"
                        title="View How to Play Instructions"
                    >
                        <i className="fa-solid fa-circle-question" /> Rules & Tips
                    </button>

                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="game__leaderboard-btn"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                        <i className="fa-solid fa-trophy" /> Global Hall of Fame
                    </button>
                </div>
            </header>

            {/* Score Banner Notification */}
            {scoreAlert && (
                <div style={{
                    maxWidth: '840px',
                    margin: '16px auto 0',
                    width: 'calc(100% - 32px)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    color: '#34d399',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <i className="fa-solid fa-medal" style={{ fontSize: '18px', color: '#f59e0b' }} />
                    <div><strong>{scoreAlert.title}</strong> — {scoreAlert.message}</div>
                </div>
            )}

            {/* Game Selector Tabs */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px 16px 10px',
                flexWrap: 'wrap'
            }}>
                {GAMES.map((g) => (
                    <button
                        key={g.slug}
                        onClick={() => handleSwitchGame(g.slug)}
                        className={`game__tab-btn ${activeSlug === g.slug ? "game__tab-btn--active" : ""}`}
                        style={{
                            fontSize: '13px',
                            padding: '10px 22px',
                            borderColor: activeSlug === g.slug ? g.color : 'transparent',
                            background: activeSlug === g.slug ? g.color : undefined
                        }}
                    >
                        <i className={g.icon} />
                        <span>{g.title}</span>
                    </button>
                ))}
            </div>

            {/* Main Arcade Stage & Live History Sidebar */}
            <main style={{
                flex: 1,
                display: 'flex',
                gap: '20px',
                justifyContent: 'center',
                padding: '14px clamp(10px, 3vw, 24px) 36px',
                flexWrap: 'wrap'
            }}>
                {/* Active Game Stage Card */}
                <div style={{
                    background: 'var(--adm-surface, rgba(15,23,42,0.6))',
                    border: '1px solid var(--adm-border, rgba(255,255,255,0.08))',
                    borderRadius: 'clamp(16px, 4vw, 24px)',
                    padding: 'clamp(16px, 4vw, 32px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                    maxWidth: '820px',
                    width: '100%',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '800', fontFamily: 'var(--gm-font-d)' }}>
                                {currentGame.title}
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                            style={{ fontSize: '11px' }}
                        >
                            <i className="fa-solid fa-info" /> Instructions
                        </button>
                    </div>

                    {activeSlug === "snake" && (
                        <SnakeGame
                            onGameOver={handleGameOver}
                            bestScore={bests.snake}
                        />
                    )}
                    {activeSlug === "2048" && (
                        <Puzzle2048
                            onGameOver={handleGameOver}
                            bestScore={bests["2048"]}
                        />
                    )}
                    {activeSlug === "typing" && (
                        <TypingChallenge
                            onGameOver={handleGameOver}
                            bestScore={bests.typing}
                        />
                    )}
                    {activeSlug === "tictactoe" && (
                        <TicTacToe
                            onGameOver={handleGameOver}
                            bestScore={bests.tictactoe}
                        />
                    )}
                </div>

                {/* Session Run History & Telemetry Panel */}
                <div style={{
                    width: '100%',
                    maxWidth: '360px',
                    background: 'var(--adm-surface, rgba(15,23,42,0.6))',
                    border: '1px solid var(--adm-border, rgba(255,255,255,0.08))',
                    borderRadius: '20px',
                    padding: 'clamp(16px, 3vw, 22px)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    height: 'fit-content'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-clock-rotate-left" style={{ color: '#38bdf8' }} />
                            Recent Session Runs
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--gm-text-3)', fontFamily: 'var(--gm-font-m)' }}>
                            {sessionHistory.length} recorded
                        </span>
                    </div>

                    {sessionHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--gm-text-3)', fontSize: '13px' }}>
                            <i className="fa-solid fa-gamepad" style={{ fontSize: '28px', opacity: 0.3, marginBottom: '8px' }} />
                            <p style={{ margin: 0 }}>Play a match to see your live session run history and timestamps!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
                            {sessionHistory.map((run) => (
                                <div
                                    key={run.id}
                                    style={{
                                        background: 'var(--adm-surface-2, rgba(255,255,255,0.03))',
                                        border: '1px solid var(--adm-border, rgba(255,255,255,0.06))',
                                        borderRadius: '10px',
                                        padding: '10px 14px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gm-text-3)', fontWeight: '700' }}>
                                            {run.gameSlug} • {run.timestamp}
                                        </span>
                                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--gm-text-1)' }}>
                                            {run.score} {run.gameSlug === 'typing' ? 'WPM' : 'pts'}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--gm-font-m)' }}>
                                        ⏱️ {run.timeString || '00:30'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Instruction Modal (Opens First on Game Start) */}
            {showInstructions && (
                <GameInstructionsModal
                    gameSlug={activeSlug}
                    onClose={() => setShowInstructions(false)}
                />
            )}

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <GameLeaderboard
                    gameSlug={activeSlug}
                    onClose={() => setShowLeaderboard(false)}
                />
            )}

            {/* Authentication Gate Modal for Guest Visitors */}
            {!user && (
                <AuthModal
                    onClose={() => navigate("/")}
                    prompt="Please Sign In or Sign Up to access the Arcade Arena & record your high scores!"
                    defaultMode="register"
                />
            )}
        </div>
    );
}
