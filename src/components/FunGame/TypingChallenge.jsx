// src/components/FunGame/TypingChallenge.jsx
import { useState, useEffect, useRef, useCallback } from "react";

// Curated drill categories for comprehensive typing practice
const DRILL_CATEGORIES = {
    alphabet: {
        title: "🔤 Alphabet & Words",
        drills: [
            "The quick brown fox jumps over the lazy dog near the vibrant river bank.",
            "Pack my box with five dozen liquor jugs and deliver them with high precision.",
            "Sphinx of black quartz judge my vow as ancient wisdom guides every decision.",
            "Technology empowers creative thinkers to build solutions that impact millions of people.",
            "Every programmer begins with simple print statements before mastering full stack engineering."
        ]
    },
    numbers: {
        title: "🔢 Numbers Row Only",
        drills: [
            "1029 3847 5610 9283 7465 1928 3746 5019 2837 4650",
            "9876543210 1234567890 24680 13579 98765 43210 5544332211",
            "3.14159 2.71828 1.61803 0.57721 1.41421 9.80665 299792458",
            "404 200 201 500 502 403 401 301 302 304 8080 3000 5000"
        ]
    },
    homerow: {
        title: "🖐️ Home & Finger Rows",
        drills: [
            "asdf jkl; asdf jkl; aassddff jjkkll;; fjdksla; fjdksla;",
            "qwer uiop qwer uiop qqaazz xxssww eedcc vvrrt ggtthhyy",
            "zxcv bnm, zxcv bnm, zzxxccvv bbnnmm,, zxcvbnm ./;lkjhgfdsa"
        ]
    },
    symbols: {
        title: "⚡ Symbols & Operators",
        drills: [
            "const add = (a, b) => { return (a + b) * 2; };",
            "if (user.role === 'admin' && status !== 404) { return true; }",
            "arr.filter(item => item.id !== null && item.active || false);",
            "<div className=\"container\" style={{ display: 'flex', gap: '12px' }}>"
        ]
    },
    code: {
        title: "💻 Full Code Syntax",
        drills: [
            "import { useState, useEffect } from 'react'; export default function App() { return <main>Hello</main>; }",
            "async function fetchData(url) { const res = await fetch(url); const json = await res.json(); return json; }",
            "def calculate_metrics(data): return { 'avg': sum(data) / len(data), 'total': len(data) }",
            "SELECT id, username, email FROM users WHERE is_active = true ORDER BY created_at DESC LIMIT 10;"
        ]
    }
};

const KEYBOARD_ROWS = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
    ["Space"]
];

export default function TypingChallenge({ onGameOver, onGameStart, bestScore }) {
    const [categoryKey, setCategoryKey] = useState("alphabet");
    const [selectedDuration, setSelectedDuration] = useState(30); // 15, 30, 60, 120
    const [targetText, setTargetText] = useState(DRILL_CATEGORIES.alphabet.drills[0]);
    const [userInput, setUserInput] = useState("");
    const [timeLeft, setTimeLeft] = useState(30);
    const [phase, setPhase] = useState("idle"); // idle | playing | over
    const [wpm, setWpm] = useState(0);
    const [cpm, setCpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [errorsCount, setErrorsCount] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const audioCtxRef = useRef(null);

    // Synthesized Mechanical Click Audio via Web Audio API
    const playClickSound = useCallback((isError = false) => {
        if (!soundEnabled) return;
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            if (isError) {
                osc.frequency.setValueAtTime(140, ctx.currentTime);
                osc.type = 'sawtooth';
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            } else {
                osc.frequency.setValueAtTime(750, ctx.currentTime);
                osc.type = 'triangle';
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
                osc.start();
                osc.stop(ctx.currentTime + 0.035);
            }
        } catch {}
    }, [soundEnabled]);

    const changeCategory = (catKey) => {
        setCategoryKey(catKey);
        const drills = DRILL_CATEGORIES[catKey]?.drills || [];
        const randomDrill = drills[Math.floor(Math.random() * drills.length)] || drills[0];
        setTargetText(randomDrill);
        resetTest();
    };

    const startTest = () => {
        const drills = DRILL_CATEGORIES[categoryKey]?.drills || [];
        const randomDrill = drills[Math.floor(Math.random() * drills.length)] || drills[0];
        setTargetText(randomDrill);
        setUserInput("");
        setTimeLeft(selectedDuration);
        setWpm(0);
        setCpm(0);
        setAccuracy(100);
        setErrorsCount(0);
        setPhase("playing");
        if (onGameStart) onGameStart();
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const resetTest = () => {
        clearInterval(timerRef.current);
        setUserInput("");
        setTimeLeft(selectedDuration);
        setWpm(0);
        setCpm(0);
        setAccuracy(100);
        setErrorsCount(0);
        setPhase("idle");
    };

    // Countdown Timer
    useEffect(() => {
        if (phase === "playing") {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        finishTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    const finishTest = useCallback(() => {
        clearInterval(timerRef.current);
        setPhase("over");

        const timeElapsed = selectedDuration - timeLeft || selectedDuration;
        const words = userInput.trim().split(/\s+/).filter(Boolean).length;
        const finalWpm = Math.round((words / (timeElapsed / 60))) || 0;
        const finalCpm = Math.round((userInput.length / (timeElapsed / 60))) || 0;

        let correctChars = 0;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === targetText[i]) correctChars++;
        }
        const finalAcc = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;

        setWpm(finalWpm);
        setCpm(finalCpm);
        setAccuracy(finalAcc);

        if (onGameOver) {
            onGameOver(finalWpm, {
                accuracy: finalAcc,
                cpm: finalCpm,
                category: categoryKey,
                duration: timeElapsed
            });
        }
    }, [categoryKey, onGameOver, selectedDuration, targetText, timeLeft, userInput]);

    const handleInputChange = (e) => {
        if (phase !== "playing") return;
        const val = e.target.value;

        // Check if last typed character was an error
        const lastIdx = val.length - 1;
        if (lastIdx >= 0) {
            const isErr = val[lastIdx] !== targetText[lastIdx];
            if (isErr) setErrorsCount(c => c + 1);
            playClickSound(isErr);
        }

        setUserInput(val);

        // Live calculation
        const timeElapsed = selectedDuration - timeLeft;
        if (timeElapsed > 0) {
            const words = val.trim().split(/\s+/).filter(Boolean).length;
            const liveWpm = Math.round((words / (timeElapsed / 60))) || 0;
            const liveCpm = Math.round((val.length / (timeElapsed / 60))) || 0;
            setWpm(liveWpm);
            setCpm(liveCpm);
        }

        // Quote completed
        if (val === targetText) {
            finishTest();
        }
    };

    const nextChar = targetText[userInput.length]?.toLowerCase() || "";

    return (
        <div className="game__engine-wrap">
            {/* Left Telemetry & Controls Panel */}
            <div className="game__info-panel">
                <div className="game__scores">
                    <div className="game__score-card">
                        <i className="fa-solid fa-gauge-high" />
                        <strong>{wpm}</strong>
                        <span>Speed (WPM)</span>
                    </div>
                    <div className="game__score-card">
                        <i className="fa-solid fa-bullseye" style={{ color: '#10b981' }} />
                        <strong>{accuracy}%</strong>
                        <span>Accuracy</span>
                    </div>
                    <div className="game__score-card game__score-card--best">
                        <i className="fa-solid fa-medal" />
                        <strong>{bestScore}</strong>
                        <span>Best WPM</span>
                    </div>
                </div>

                {/* Drill Category Selector */}
                <div style={{ background: 'var(--gm-card)', border: '1px solid var(--gm-border)', padding: '14px', borderRadius: '12px', boxShadow: 'var(--gm-shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gm-text-3)', textTransform: 'uppercase', fontWeight: '700' }}>
                            Practice Drill Mode:
                        </span>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            style={{ background: 'none', border: 'none', color: soundEnabled ? 'var(--gm-accent)' : 'var(--gm-text-3)', cursor: 'pointer', fontSize: '13px' }}
                            title="Toggle Keyboard Sound"
                        >
                            <i className={`fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {Object.entries(DRILL_CATEGORIES).map(([key, cat]) => (
                            <button
                                key={key}
                                onClick={() => changeCategory(key)}
                                className={`game__speed-btn ${categoryKey === key ? 'game__speed-btn--active' : ''}`}
                                style={{ flex: 1, minWidth: '100px', padding: '6px 10px', fontSize: '11px' }}
                            >
                                {cat.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration Selector & Timer */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gm-card)', border: '1px solid var(--gm-border)', padding: '12px 18px', borderRadius: '12px', boxShadow: 'var(--gm-shadow)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gm-text-3)', textTransform: 'uppercase', marginRight: '4px' }}>Time:</span>
                        {[15, 30, 60, 120].map((sec) => (
                            <button
                                key={sec}
                                onClick={() => { setSelectedDuration(sec); setTimeLeft(sec); }}
                                disabled={phase === "playing"}
                                className={`game__speed-btn ${selectedDuration === sec ? 'game__speed-btn--active' : ''}`}
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                                {sec}s
                            </button>
                        ))}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--gm-text-3)', textTransform: 'uppercase' }}>Countdown</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: timeLeft <= 5 ? '#ef4444' : 'var(--gm-accent)' }}>
                            {timeLeft}s
                        </div>
                    </div>
                </div>

                <div className="game__controls-box">
                    <button
                        onClick={startTest}
                        className="adm-btn adm-btn-primary"
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px' }}
                    >
                        <i className={`fa-solid ${phase === 'playing' ? 'fa-rotate-right' : 'fa-play'}`} />
                        {phase === 'playing' ? 'Restart Practice' : 'Start Typing Test'}
                    </button>
                </div>
            </div>

            {/* Right Typing Arena & Visual Keyboard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '460px' }}>
                <div className="game__canvas-wrap" style={{
                    minHeight: '240px',
                    width: '100%',
                    maxWidth: '100%',
                    background: 'var(--gm-card)',
                    border: '1px solid var(--gm-border)',
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                }}>
                    {/* Prompt Character Stream */}
                    <div style={{
                        fontFamily: 'var(--gm-font-m)',
                        fontSize: '15px',
                        lineHeight: '1.8',
                        color: 'var(--gm-text-3)',
                        background: 'var(--adm-surface-2, rgba(0,0,0,0.2))',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid var(--gm-border)',
                        minHeight: '90px',
                        userSelect: 'none',
                        letterSpacing: '0.5px',
                        wordBreak: 'break-word'
                    }}>
                        {targetText.split('').map((char, index) => {
                            let color = 'var(--gm-text-3)';
                            let bg = 'transparent';
                            const isCurrent = index === userInput.length;

                            if (index < userInput.length) {
                                color = userInput[index] === char ? '#10b981' : '#ef4444';
                                bg = userInput[index] === char ? 'transparent' : 'rgba(239, 68, 68, 0.2)';
                            }

                            return (
                                <span
                                    key={index}
                                    style={{
                                        color,
                                        background: bg,
                                        textDecoration: index < userInput.length && userInput[index] !== char ? 'underline' : 'none',
                                        borderBottom: isCurrent ? '3px solid var(--gm-accent)' : 'none',
                                        borderRadius: '2px',
                                        fontWeight: isCurrent ? '700' : 'normal'
                                    }}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </div>

                    {/* Live Hidden / Auto-focused Typing Input */}
                    <textarea
                        ref={inputRef}
                        rows={2}
                        disabled={phase !== "playing"}
                        value={userInput}
                        onChange={handleInputChange}
                        placeholder={phase === "playing" ? "Type continuously... caret will advance automatically" : "Click Start Typing Test to begin practice..."}
                        style={{
                            width: '100%',
                            fontFamily: 'var(--gm-font-m)',
                            fontSize: '14px',
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'var(--adm-surface-2, rgba(0,0,0,0.15))',
                            border: '1px solid var(--gm-border)',
                            color: 'var(--gm-text-1)',
                            resize: 'none',
                            marginTop: '12px',
                            outline: 'none'
                        }}
                    />

                    {/* Overlays */}
                    {phase !== "playing" && (
                        <div className="game__overlay" style={{ background: 'rgba(15, 23, 42, 0.88)' }}>
                            {phase === "idle" && (
                                <>
                                    <div className="game__overlay-icon">⌨️</div>
                                    <h3 className="game__overlay-title">{DRILL_CATEGORIES[categoryKey]?.title}</h3>
                                    <p className="game__overlay-sub">Master your touch typing, accuracy, and raw speed!</p>
                                    <button className="game__overlay-btn" onClick={startTest}>
                                        <i className="fa-solid fa-play" /> Start Practice
                                    </button>
                                </>
                            )}
                            {phase === "over" && (
                                <>
                                    <div className="game__overlay-icon">🎯</div>
                                    <h3 className="game__overlay-title">Drill Complete!</h3>
                                    <p className="game__overlay-sub">Speed: <strong style={{ color: '#fff', fontSize: '1.3rem' }}>{wpm} WPM</strong> ({cpm} CPM)</p>
                                    <p className="game__overlay-sub" style={{ fontSize: '13px', marginTop: '-4px' }}>Accuracy: <strong>{accuracy}%</strong> • Errors: <strong>{errorsCount}</strong></p>
                                    {wpm >= bestScore && wpm > 0 && <p className="game__overlay-best">🎉 New Record High WPM!</p>}
                                    <button className="game__overlay-btn" onClick={startTest}>
                                        <i className="fa-solid fa-rotate-right" /> Next Practice
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* On-Screen Interactive Virtual Keyboard Guide */}
                <div style={{
                    background: 'var(--gm-card)',
                    border: '1px solid var(--gm-border)',
                    borderRadius: '14px',
                    padding: '8px',
                    boxShadow: 'var(--gm-shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    userSelect: 'none',
                    overflowX: 'auto',
                    width: '100%'
                }}>
                    <div style={{ fontSize: '10px', color: 'var(--gm-text-3)', textTransform: 'uppercase', textAlign: 'center', marginBottom: '2px', fontWeight: '700' }}>
                        Touch Typing Visual Guide
                    </div>
                    {KEYBOARD_ROWS.map((row, rIdx) => (
                        <div key={rIdx} style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                            {row.map((k, kIdx) => {
                                const isNext = (k === "Space" && nextChar === " ") || (k.toLowerCase() === nextChar);
                                const isSpace = k === "Space";
                                return (
                                    <div
                                        key={kIdx}
                                        style={{
                                            padding: isSpace ? '4px clamp(20px, 6vw, 50px)' : '4px clamp(3px, 1vw, 6px)',
                                            borderRadius: '4px',
                                            background: isNext ? 'var(--gm-accent)' : 'var(--adm-surface-2, rgba(255,255,255,0.04))',
                                            color: isNext ? '#fff' : 'var(--gm-text-2)',
                                            fontSize: 'clamp(9px, 2.2vw, 11px)',
                                            fontFamily: 'var(--gm-font-m)',
                                            border: `1px solid ${isNext ? 'var(--gm-accent)' : 'var(--gm-border)'}`,
                                            textAlign: 'center',
                                            fontWeight: isNext ? '800' : '500',
                                            transform: isNext ? 'scale(1.1)' : 'none',
                                            transition: 'all 0.1s ease',
                                            boxShadow: isNext ? '0 0 10px var(--gm-glow)' : 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        {k}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
