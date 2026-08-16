// src/components/FunGame/Puzzle2048.jsx
import { useState, useEffect, useCallback, useRef } from "react";

const SIZE = 4;

const TILE_COLORS = {
    2: { bg: "#eee4da", color: "#776e65" },
    4: { bg: "#ede0c8", color: "#776e65" },
    8: { bg: "#f2b179", color: "#f9f6f2" },
    16: { bg: "#f59563", color: "#f9f6f2" },
    32: { bg: "#f67c5f", color: "#f9f6f2" },
    64: { bg: "#f65e3b", color: "#f9f6f2" },
    128: { bg: "#edcf72", color: "#f9f6f2" },
    256: { bg: "#edcc61", color: "#f9f6f2" },
    512: { bg: "#edc850", color: "#f9f6f2" },
    1024: { bg: "#edc53f", color: "#f9f6f2" },
    2048: { bg: "#edc22e", color: "#f9f6f2" },
    4096: { bg: "#3c3a32", color: "#f9f6f2" }
};

function getEmptyBoard() {
    return Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
}

function addRandomTile(board) {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) emptyCells.push({ r, c });
        }
    }
    if (emptyCells.length === 0) return board;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map(row => [...row]);
    newBoard[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
}

export default function Puzzle2048({ onGameOver, onGameStart, bestScore }) {
    const [board, setBoard] = useState(getEmptyBoard);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameStatus, setGameStatus] = useState("idle"); // idle | playing | over | won
    const [highestTile, setHighestTile] = useState(2);
    const boardRef = useRef(null);
    const startTimeRef = useRef(0);

    const initGame = () => {
        let b = getEmptyBoard();
        b = addRandomTile(b);
        b = addRandomTile(b);
        setBoard(b);
        setScore(0);
        setMoves(0);
        setHighestTile(4);
        setGameStatus("playing");
        startTimeRef.current = Date.now();
        if (onGameStart) onGameStart();
    };

    const checkGameOver = (currentBoard) => {
        // Check for empty cells
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (currentBoard[r][c] === 0) return false;
            }
        }
        // Check for adjacent matches
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const current = currentBoard[r][c];
                if (r < SIZE - 1 && currentBoard[r + 1][c] === current) return false;
                if (c < SIZE - 1 && currentBoard[r][c + 1] === current) return false;
            }
        }
        return true;
    };

    const slideRow = (row) => {
        let arr = row.filter(val => val !== 0);
        let addedScore = 0;
        let maxVal = 0;

        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                addedScore += arr[i];
                if (arr[i] > maxVal) maxVal = arr[i];
                arr[i + 1] = 0;
            }
        }

        arr = arr.filter(val => val !== 0);
        while (arr.length < SIZE) {
            arr.push(0);
        }

        return { newRow: arr, addedScore, maxVal };
    };

    const move = useCallback((direction) => {
        if (gameStatus !== "playing") return;

        let newBoard = board.map(row => [...row]);
        let totalAddedScore = 0;
        let highest = highestTile;
        let changed = false;

        if (direction === "left") {
            for (let r = 0; r < SIZE; r++) {
                const { newRow, addedScore, maxVal } = slideRow(newBoard[r]);
                if (newRow.some((val, idx) => val !== newBoard[r][idx])) changed = true;
                newBoard[r] = newRow;
                totalAddedScore += addedScore;
                if (maxVal > highest) highest = maxVal;
            }
        } else if (direction === "right") {
            for (let r = 0; r < SIZE; r++) {
                const reversed = [...newBoard[r]].reverse();
                const { newRow, addedScore, maxVal } = slideRow(reversed);
                const restored = newRow.reverse();
                if (restored.some((val, idx) => val !== newBoard[r][idx])) changed = true;
                newBoard[r] = restored;
                totalAddedScore += addedScore;
                if (maxVal > highest) highest = maxVal;
            }
        } else if (direction === "up") {
            for (let c = 0; c < SIZE; c++) {
                const col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
                const { newRow, addedScore, maxVal } = slideRow(col);
                for (let r = 0; r < SIZE; r++) {
                    if (newBoard[r][c] !== newRow[r]) changed = true;
                    newBoard[r][c] = newRow[r];
                }
                totalAddedScore += addedScore;
                if (maxVal > highest) highest = maxVal;
            }
        } else if (direction === "down") {
            for (let c = 0; c < SIZE; c++) {
                const col = [newBoard[3][c], newBoard[2][c], newBoard[1][c], newBoard[0][c]];
                const { newRow, addedScore, maxVal } = slideRow(col);
                const restored = newRow.reverse();
                for (let r = 0; r < SIZE; r++) {
                    if (newBoard[r][c] !== restored[r]) changed = true;
                    newBoard[r][c] = restored[r];
                }
                totalAddedScore += addedScore;
                if (maxVal > highest) highest = maxVal;
            }
        }

        if (changed) {
            const spawnedBoard = addRandomTile(newBoard);
            const newScore = score + totalAddedScore;
            setBoard(spawnedBoard);
            setScore(newScore);
            setMoves(m => m + 1);
            setHighestTile(highest);

            const durationSeconds = startTimeRef.current
                ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
                : 1;

            if (highest >= 2048 && gameStatus !== "won") {
                setGameStatus("won");
                if (onGameOver) onGameOver(newScore, { highestTile: highest, moves: moves + 1, durationSeconds });
            } else if (checkGameOver(spawnedBoard)) {
                setGameStatus("over");
                if (onGameOver) onGameOver(newScore, { highestTile: highest, moves: moves + 1, durationSeconds });
            }
        }
    }, [board, gameStatus, highestTile, moves, onGameOver, score]);

    /* ── keyboard input ── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
                if (e.key === "ArrowUp") move("up");
                if (e.key === "ArrowDown") move("down");
                if (e.key === "ArrowLeft") move("left");
                if (e.key === "ArrowRight") move("right");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [move]);

    /* ── touch / swipe ── */
    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            if (!touchStartX || !touchStartY) return;
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = e.changedTouches[0].clientY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 30) {
                    move(diffX > 0 ? "right" : "left");
                }
            } else {
                if (Math.abs(diffY) > 30) {
                    move(diffY > 0 ? "down" : "up");
                }
            }
        };

        const el = boardRef.current;
        if (el) {
            el.addEventListener("touchstart", handleTouchStart);
            el.addEventListener("touchend", handleTouchEnd);
        }
        return () => {
            if (el) {
                el.removeEventListener("touchstart", handleTouchStart);
                el.removeEventListener("touchend", handleTouchEnd);
            }
        };
    }, [move]);

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

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--gm-card)', border: '1px solid var(--gm-border)', padding: '12px 18px', borderRadius: '12px', boxShadow: 'var(--gm-shadow)' }}>
                    <div>
                        <span style={{ fontSize: '11px', color: 'var(--gm-text-3)', textTransform: 'uppercase' }}>Highest Tile</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gm-accent)' }}>{highestTile}</div>
                    </div>
                    <div>
                        <span style={{ fontSize: '11px', color: 'var(--gm-text-3)', textTransform: 'uppercase' }}>Total Moves</span>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--gm-text-1)' }}>{moves}</div>
                    </div>
                </div>

                {/* Dpad for touch / mouse */}
                <div className="game__controls-box">
                    <div className="game__guide">
                        <div className="game__guide-key" onClick={() => move("up")}><i className="fa-solid fa-up-long" /></div>
                        <div className="game__guide-row">
                            <div className="game__guide-key" onClick={() => move("left")}><i className="fa-solid fa-left-long" /></div>
                            <div className="game__guide-key" onClick={() => move("down")}><i className="fa-solid fa-down-long" /></div>
                            <div className="game__guide-key" onClick={() => move("right")}><i className="fa-solid fa-right-long" /></div>
                        </div>
                        <span className="game__guide-note">Use Arrow Keys or Swipe on Touchscreen</span>
                    </div>
                </div>
            </div>

            {/* 2048 Grid Canvas Card */}
            <div className="game__canvas-wrap" ref={boardRef} style={{ width: '100%', minWidth: '280px', maxWidth: '420px', aspectRatio: '1 / 1', background: '#bbada0', padding: '12px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', userSelect: 'none', position: 'relative', boxSizing: 'border-box', margin: '0 auto' }}>
                {board.map((row, r) => (
                    <div key={r} style={{ display: 'flex', gap: '10px', height: '22%' }}>
                        {row.map((cell, c) => {
                            const tileStyle = TILE_COLORS[cell] || { bg: 'rgba(238, 228, 218, 0.35)', color: 'transparent' };
                            return (
                                <div
                                    key={c}
                                    style={{
                                        flex: 1,
                                        borderRadius: '8px',
                                        background: cell === 0 ? 'rgba(238, 228, 218, 0.35)' : tileStyle.bg,
                                        color: tileStyle.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: cell > 512 ? '1.4rem' : '1.8rem',
                                        fontWeight: '800',
                                        fontFamily: 'var(--gm-font-d)',
                                        boxShadow: cell > 0 ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                                        transition: 'all 0.15s ease'
                                    }}
                                >
                                    {cell !== 0 ? cell : ''}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Overlays */}
                {gameStatus !== "playing" && (
                    <div className="game__overlay" style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.92)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '24px',
                        textAlign: 'center',
                        zIndex: 10
                    }}>
                        {gameStatus === "idle" && (
                            <>
                                <div className="game__overlay-icon">🔢</div>
                                <h3 className="game__overlay-title">2048 Puzzle</h3>
                                <p className="game__overlay-sub">Join numbers using arrow keys or swipe to reach the 2048 tile!</p>
                                <button className="game__overlay-btn" onClick={initGame}>
                                    <i className="fa-solid fa-play" /> Start Game
                                </button>
                            </>
                        )}
                        {gameStatus === "over" && (
                            <>
                                <div className="game__overlay-icon">🧩</div>
                                <h3 className="game__overlay-title">No More Moves!</h3>
                                <p className="game__overlay-sub">Final Score: <strong style={{ color: '#fff', fontSize: '1.2rem' }}>{score}</strong></p>
                                <p className="game__overlay-sub" style={{ fontSize: '13px', marginTop: '-4px' }}>Highest Tile: <strong>{highestTile}</strong></p>
                                <button className="game__overlay-btn" onClick={initGame}>
                                    <i className="fa-solid fa-rotate-right" /> Try Again
                                </button>
                            </>
                        )}
                        {gameStatus === "won" && (
                            <>
                                <div className="game__overlay-icon">🏆</div>
                                <h3 className="game__overlay-title">You Won 2048!</h3>
                                <p className="game__overlay-sub">Incredible job! Final Score: <strong style={{ color: '#fff' }}>{score}</strong></p>
                                <button className="game__overlay-btn" onClick={initGame}>
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
