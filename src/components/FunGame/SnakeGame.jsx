// src/components/FunGame/SnakeGame.jsx
import { useEffect, useRef, useState, useCallback } from "react";

const CELL = 20;
const ROWS = 20;
const COLS = 20;
const INIT_SNAKE = [{ x: 10, y: 10 }];
const INIT_DIR = { x: 1, y: 0 };

function randomFood(snake) {
    let pos;
    do {
        pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
}

export default function SnakeGame({ onGameOver, bestScore }) {
    const canvasRef = useRef(null);
    const stateRef = useRef({
        snake: INIT_SNAKE,
        dir: INIT_DIR,
        nextDir: INIT_DIR,
        food: randomFood(INIT_SNAKE),
        score: 0,
        running: false,
        over: false,
    });
    const animRef = useRef(null);
    const lastTime = useRef(0);

    const [score, setScore] = useState(0);
    const [phase, setPhase] = useState("idle"); // idle | playing | over
    const [speed, setSpeed] = useState(150);

    /* ── draw ── */
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const { snake, food } = stateRef.current;
        const isDark = document.documentElement.getAttribute("data-theme") !== "light";

        ctx.fillStyle = isDark ? "#07070d" : "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // grid
        ctx.strokeStyle = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.05)";
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(COLS * CELL, r * CELL); ctx.stroke();
        }
        for (let c = 0; c <= COLS; c++) {
            ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, ROWS * CELL); ctx.stroke();
        }

        // food
        ctx.fillStyle = "#e84545";
        ctx.shadowColor = "#e84545";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // snake
        snake.forEach((seg, i) => {
            const ratio = 1 - i / snake.length;
            ctx.fillStyle = i === 0
                ? "#2e86de"
                : `rgba(46,134,222,${0.3 + ratio * 0.6})`;
            ctx.shadowColor = i === 0 ? "#2e86de" : "transparent";
            ctx.shadowBlur = i === 0 ? 10 : 0;
            const pad = i === 0 ? 1 : 2;
            ctx.beginPath();
            ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 4);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }, []);

    /* ── game loop ── */
    const loop = useCallback((timestamp) => {
        const s = stateRef.current;
        if (!s.running) return;
        if (timestamp - lastTime.current >= speed) {
            lastTime.current = timestamp;

            // move
            s.dir = s.nextDir;
            const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

            // wall collision
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
                endGame(); return;
            }
            // self collision
            if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
                endGame(); return;
            }

            s.snake = [head, ...s.snake];

            // eat food
            if (head.x === s.food.x && head.y === s.food.y) {
                s.score += 10;
                setScore(s.score);
                s.food = randomFood(s.snake);
            } else {
                s.snake.pop();
            }

            draw();
        }
        animRef.current = requestAnimationFrame(loop);
    }, [draw, speed]);

    const startTimeRef = useRef(0);

    const startGame = () => {
        const initSnake = [{ x: 10, y: 10 }];
        stateRef.current = {
            snake: initSnake,
            dir: INIT_DIR,
            nextDir: INIT_DIR,
            food: randomFood(initSnake),
            score: 0,
            running: true,
            over: false,
        };
        startTimeRef.current = Date.now();
        setScore(0);
        setPhase("playing");
        lastTime.current = performance.now();
        animRef.current = requestAnimationFrame(loop);
    };

    const endGame = () => {
        const finalScore = stateRef.current.score;
        stateRef.current.running = false;
        stateRef.current.over = true;
        cancelAnimationFrame(animRef.current);
        setPhase("over");

        const durationSeconds = startTimeRef.current
            ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
            : 1;

        if (onGameOver) {
            onGameOver(finalScore, {
                durationSeconds,
                moves: stateRef.current.snake.length
            });
        }
    };

    /* ── keyboard input ── */
    useEffect(() => {
        const onKey = (e) => {
            const dirs = {
                ArrowUp: { x: 0, y: -1 }, KeyW: { x: 0, y: -1 },
                ArrowDown: { x: 0, y: 1 }, KeyS: { x: 0, y: 1 },
                ArrowLeft: { x: -1, y: 0 }, KeyA: { x: -1, y: 0 },
                ArrowRight: { x: 1, y: 0 }, KeyD: { x: 1, y: 0 },
            };
            const nd = dirs[e.code];
            if (!nd) return;
            e.preventDefault();
            const s = stateRef.current;
            if (!s.running) return;
            if (nd.x === -s.dir.x && nd.y === -s.dir.y) return;
            s.nextDir = nd;
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* ── touch / swipe ── */
    useEffect(() => {
        let startX, startY;
        const onStart = (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        };
        const onEnd = (e) => {
            if (!startX || !startY) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            const dir = Math.abs(dx) > Math.abs(dy)
                ? (dx > 0 ? "right" : "left")
                : (dy > 0 ? "down" : "up");
            dpad(dir);
        };
        const canvas = canvasRef.current;
        if (canvas) { canvas.addEventListener("touchstart", onStart); canvas.addEventListener("touchend", onEnd); }
        return () => { if (canvas) { canvas.removeEventListener("touchstart", onStart); canvas.removeEventListener("touchend", onEnd); } };
    }, [phase]);

    /* ── initial draw ── */
    useEffect(() => { draw(); }, [draw]);
    useEffect(() => () => cancelAnimationFrame(animRef.current), []);

    const dpad = (dir) => {
        const dirs = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
        const nd = dirs[dir];
        const s = stateRef.current;
        if (!s.running) return;
        if (nd.x === -s.dir.x && nd.y === -s.dir.y) return;
        s.nextDir = nd;
    };

    return (
        <div className="game__engine-wrap">
            <div className="game__info-panel">
                <div className="game__scores">
                    <div className="game__score-card">
                        <i className="fa-solid fa-trophy" />
                        <strong>{score}</strong>
                        <span>Current Score</span>
                    </div>
                    <div className="game__score-card game__score-card--best">
                        <i className="fa-solid fa-medal" />
                        <strong>{bestScore}</strong>
                        <span>Your Best</span>
                    </div>
                </div>

                {/* Speed selector */}
                <div className="game__speed">
                    <span className="game__speed-label">Speed:</span>
                    {[{ label: "Slow", val: 220 }, { label: "Normal", val: 150 }, { label: "Fast", val: 80 }].map((s) => (
                        <button
                            key={s.val}
                            className={`game__speed-btn ${speed === s.val ? "game__speed-btn--active" : ""}`}
                            onClick={() => setSpeed(s.val)}
                            disabled={phase === "playing"}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Controls guide & Dpad */}
                <div className="game__controls-box">
                    <div className="game__guide">
                        <div className="game__guide-key" onClick={() => dpad("up")}><i className="fa-solid fa-up-long" /></div>
                        <div className="game__guide-row">
                            <div className="game__guide-key" onClick={() => dpad("left")}><i className="fa-solid fa-left-long" /></div>
                            <div className="game__guide-key" onClick={() => dpad("down")}><i className="fa-solid fa-down-long" /></div>
                            <div className="game__guide-key" onClick={() => dpad("right")}><i className="fa-solid fa-right-long" /></div>
                        </div>
                        <span className="game__guide-note">Use Arrow Keys, WASD, or Click/Swipe</span>
                    </div>
                </div>
            </div>

            {/* Canvas screen area */}
            <div className="game__canvas-wrap">
                <canvas
                    ref={canvasRef}
                    width={COLS * CELL}
                    height={ROWS * CELL}
                    className="game__canvas"
                />

                {/* Overlay */}
                {phase !== "playing" && (
                    <div className="game__overlay">
                        {phase === "idle" && (
                            <>
                                <div className="game__overlay-icon">🐍</div>
                                <h3 className="game__overlay-title">Retro Snake</h3>
                                <p className="game__overlay-sub">Eat food dots, grow longer, avoid walls!</p>
                                <button className="game__overlay-btn" onClick={startGame}>
                                    <i className="fa-solid fa-play" /> Start Game
                                </button>
                            </>
                        )}
                        {phase === "over" && (
                            <>
                                <div className="game__overlay-icon">💀</div>
                                <h3 className="game__overlay-title">Game Over!</h3>
                                <p className="game__overlay-sub">Final Score: <strong style={{ color: '#fff', fontSize: '1.2rem' }}>{score}</strong></p>
                                {score >= bestScore && score > 0 && <p className="game__overlay-best">🎉 New Best Score!</p>}
                                <button className="game__overlay-btn" onClick={startGame}>
                                    <i className="fa-solid fa-rotate-right" /> Play Again
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
