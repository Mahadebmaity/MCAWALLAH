import { useEffect, useRef, useState, useCallback } from "react";
import "./FunGame.css";

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

export default function FunGame() {
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
    const [best, setBest] = useState(() => Number(localStorage.getItem("snakeBest") || 0));
    const [phase, setPhase] = useState("idle"); // idle | playing | over
    const [speed, setSpeed] = useState(150);

    const sectionRef = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
        if (sectionRef.current) obs.observe(sectionRef.current);
        return () => obs.disconnect();
    }, []);

    /* ── draw ── */
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const { snake, food } = stateRef.current;
        const isDark = document.documentElement.getAttribute("data-theme") !== "light";

        ctx.fillStyle = isDark ? "#07070d" : "#f0f0f8";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // grid
        ctx.strokeStyle = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
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

            // wall
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
                endGame(); return;
            }
            // self
            if (s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
                endGame(); return;
            }

            s.snake = [head, ...s.snake];

            if (head.x === s.food.x && head.y === s.food.y) {
                s.score += 10;
                s.food = randomFood(s.snake);
                setScore(s.score);
            } else {
                s.snake.pop();
            }
        }
        draw();
        animRef.current = requestAnimationFrame(loop);
    }, [draw, speed]);

    const endGame = () => {
        stateRef.current.running = false;
        stateRef.current.over = true;
        cancelAnimationFrame(animRef.current);
        const s = stateRef.current.score;
        if (s > Number(localStorage.getItem("snakeBest") || 0)) {
            localStorage.setItem("snakeBest", s);
            setBest(s);
        }
        setPhase("over");
        draw();
    };

    const startGame = () => {
        const food = randomFood(INIT_SNAKE);
        stateRef.current = { snake: [...INIT_SNAKE], dir: INIT_DIR, nextDir: INIT_DIR, food, score: 0, running: true, over: false };
        lastTime.current = 0;
        setScore(0);
        setPhase("playing");
        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(loop);
    };

    /* ── keyboard ── */
    useEffect(() => {
        const MAP = { ArrowUp: [-0, 1, -1], ArrowDown: [0, 1, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
        const dirs = {
            ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        };
        const onKey = (e) => {
            if (!dirs[e.key]) return;
            e.preventDefault();
            const s = stateRef.current;
            const nd = dirs[e.key];
            if (nd.x === -s.dir.x && nd.y === -s.dir.y) return; // no reverse
            s.nextDir = nd;
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    /* ── touch swipe ── */
    useEffect(() => {
        let sx = 0, sy = 0;
        const dirs = {
            up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
            left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
        };
        const onStart = (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; };
        const onEnd = (e) => {
            const dx = e.changedTouches[0].clientX - sx;
            const dy = e.changedTouches[0].clientY - sy;
            let dir;
            if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? "right" : "left";
            else dir = dy > 0 ? "down" : "up";
            const s = stateRef.current;
            const nd = dirs[dir];
            if (nd.x === -s.dir.x && nd.y === -s.dir.y) return;
            s.nextDir = nd;
        };
        const canvas = canvasRef.current;
        if (canvas) { canvas.addEventListener("touchstart", onStart); canvas.addEventListener("touchend", onEnd); }
        return () => { if (canvas) { canvas.removeEventListener("touchstart", onStart); canvas.removeEventListener("touchend", onEnd); } };
    }, [phase]);

    /* ── initial draw ── */
    useEffect(() => { draw(); }, [draw]);
    useEffect(() => () => cancelAnimationFrame(animRef.current), []);

    /* ── D-pad button helper ── */
    const dpad = (dir) => {
        const dirs = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
        const nd = dirs[dir];
        const s = stateRef.current;
        if (nd.x === -s.dir.x && nd.y === -s.dir.y) return;
        s.nextDir = nd;
    };

    return (
        <section id="fun-game" className="game" ref={sectionRef}>
            <div className="game__bg" aria-hidden="true">
                <div className="game__bg-blob game__bg-blob--1" />
                <div className="game__bg-blob game__bg-blob--2" />
            </div>

            <div className="game__container">
                {/* Label */}
                <div className="game__label">
                    <span className="game__label-line" />
                    <span className="game__label-text"><i className="fa-solid fa-gamepad" /> Fun Zone</span>
                    <span className="game__label-line" />
                </div>

                <div className={`game__content game__reveal ${inView ? "game__reveal--in" : ""}`}>
                    <div className="game__info">
                        <h2 className="game__title">Play <span className="game__title-accent">Snake</span></h2>
                        <p className="game__desc">
                            Take a break! Use arrow keys or the D-pad below to control the snake.
                            Eat the <span style={{ color: "#e84545" }}>●</span> red dots to score. Don't hit the walls!
                        </p>

                        {/* Scoreboard */}
                        <div className="game__scores">
                            <div className="game__score-card">
                                <i className="fa-solid fa-trophy" />
                                <strong>{score}</strong>
                                <span>Score</span>
                            </div>
                            <div className="game__score-card game__score-card--best">
                                <i className="fa-solid fa-medal" />
                                <strong>{best}</strong>
                                <span>Best</span>
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

                        {/* Controls guide */}
                        <div className="game__guide">
                            <div className="game__guide-key"><i className="fa-solid fa-up-long" /></div>
                            <div className="game__guide-row">
                                <div className="game__guide-key"><i className="fa-solid fa-left-long" /></div>
                                <div className="game__guide-key"><i className="fa-solid fa-down-long" /></div>
                                <div className="game__guide-key"><i className="fa-solid fa-right-long" /></div>
                            </div>
                            <span className="game__guide-note">Arrow keys or swipe on mobile</span>
                        </div>
                    </div>

                    {/* Canvas area */}
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
                                        <h3 className="game__overlay-title">Snake Game</h3>
                                        <p className="game__overlay-sub">Classic fun, right in your portfolio!</p>
                                        <button className="game__overlay-btn" onClick={startGame}>
                                            <i className="fa-solid fa-play" /> Start Game
                                        </button>
                                    </>
                                )}
                                {phase === "over" && (
                                    <>
                                        <div className="game__overlay-icon">💀</div>
                                        <h3 className="game__overlay-title">Game Over</h3>
                                        <p className="game__overlay-sub">Score: <strong>{score}</strong></p>
                                        {score >= best && score > 0 && <p className="game__overlay-best">🎉 New Best!</p>}
                                        <button className="game__overlay-btn" onClick={startGame}>
                                            <i className="fa-solid fa-rotate-right" /> Play Again
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mobile D-pad */}
                        <div className="game__dpad">
                            <button className="game__dpad-btn" onClick={() => dpad("up")}><i className="fa-solid fa-chevron-up" /></button>
                            <div className="game__dpad-row">
                                <button className="game__dpad-btn" onClick={() => dpad("left")}><i className="fa-solid fa-chevron-left" /></button>
                                <button className="game__dpad-btn game__dpad-btn--center" onClick={phase === "playing" ? undefined : startGame}>
                                    {phase === "playing" ? "●" : <i className="fa-solid fa-play" />}
                                </button>
                                <button className="game__dpad-btn" onClick={() => dpad("right")}><i className="fa-solid fa-chevron-right" /></button>
                            </div>
                            <button className="game__dpad-btn" onClick={() => dpad("down")}><i className="fa-solid fa-chevron-down" /></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
