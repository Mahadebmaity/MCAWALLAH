// src/components/FunGame/TicTacToe.jsx
import { useState, useEffect, useCallback, useRef } from "react";

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

export default function TicTacToe({ onGameOver, bestScore }) {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameMode, setGameMode] = useState("ai_hard"); // 'ai_hard' | 'ai_easy' | 'pvp'
    const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });
    const [streak, setStreak] = useState(0);
    const [winner, setWinner] = useState(null); // 'X' | 'O' | 'Tie' | null
    const [winningLine, setWinningLine] = useState(null);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const overlayTimerRef = useRef(null);

    const checkWinner = (squares) => {
        for (const combo of WINNING_COMBOS) {
            const [a, b, c] = combo;
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return { winner: squares[a], line: combo };
            }
        }
        if (squares.every(Boolean)) return { winner: "Tie", line: null };
        return null;
    };

    // Minimax Unbeatable AI
    const minimax = (squares, depth, isMaximizing) => {
        const result = checkWinner(squares);
        if (result) {
            if (result.winner === "O") return 10 - depth;
            if (result.winner === "X") return depth - 10;
            return 0;
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = "O";
                    const evaluation = minimax(squares, depth + 1, false);
                    squares[i] = null;
                    maxEval = Math.max(maxEval, evaluation);
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = "X";
                    const evaluation = minimax(squares, depth + 1, true);
                    squares[i] = null;
                    minEval = Math.min(minEval, evaluation);
                }
            }
            return minEval;
        }
    };

    const getBestMove = (squares, isHard) => {
        const emptyIndices = squares.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null);
        if (emptyIndices.length === 0) return null;

        if (!isHard) {
            // Casual AI: 60% random move, 40% optimal block/win
            if (Math.random() < 0.6) {
                return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            }
        }

        // Hard AI: Minimax optimal move
        let bestScoreVal = -Infinity;
        let move = emptyIndices[0];

        for (const idx of emptyIndices) {
            squares[idx] = "O";
            const scoreVal = minimax(squares, 0, false);
            squares[idx] = null;
            if (scoreVal > bestScoreVal) {
                bestScoreVal = scoreVal;
                move = idx;
            }
        }
        return move;
    };

    const handleGameEnd = (winResult) => {
        setWinner(winResult.winner);
        setWinningLine(winResult.line);

        if (winResult.winner === "X") {
            setScores(s => {
                const newX = s.x + 1;
                const totalPts = newX * 100;
                if (onGameOver) onGameOver(totalPts, { mode: gameMode, result: "Victory" });
                return { ...s, x: newX };
            });
            setStreak(prev => prev + 1);
        } else if (winResult.winner === "O") {
            setScores(s => ({ ...s, o: s.o + 1 }));
            setStreak(0);
        } else {
            setScores(s => ({ ...s, ties: s.ties + 1 }));
        }

        // Delay popup overlay so player can clearly see the winning 3-in-a-row highlight
        clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = setTimeout(() => {
            setShowOverlay(true);
        }, 700);
    };

    const handleClick = useCallback((index) => {
        if (board[index] || winner || isAiThinking) return;

        const newBoard = [...board];
        newBoard[index] = isXNext ? "X" : "O";
        setBoard(newBoard);

        const winResult = checkWinner(newBoard);
        if (winResult) {
            handleGameEnd(winResult);
            return;
        }

        setIsXNext(!isXNext);
    }, [board, isXNext, winner, isAiThinking]);

    // Handle AI turn
    useEffect(() => {
        if (gameMode !== "pvp" && !isXNext && !winner) {
            setIsAiThinking(true);
            const timer = setTimeout(() => {
                const aiMove = getBestMove([...board], gameMode === "ai_hard");
                setIsAiThinking(false);
                if (aiMove !== null) {
                    const newBoard = [...board];
                    newBoard[aiMove] = "O";
                    setBoard(newBoard);

                    const winResult = checkWinner(newBoard);
                    if (winResult) {
                        handleGameEnd(winResult);
                    } else {
                        setIsXNext(true);
                    }
                }
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameMode, board, winner]);

    const resetGame = () => {
        clearTimeout(overlayTimerRef.current);
        setBoard(Array(9).fill(null));
        setWinner(null);
        setWinningLine(null);
        setShowOverlay(false);
        setIsAiThinking(false);
        setIsXNext(true);
    };

    return (
        <div className="game__engine-wrap">
            <div className="game__info-panel">
                <div className="game__scores">
                    <div className="game__score-card">
                        <i className="fa-solid fa-xmark" style={{ color: '#e84545', fontSize: '18px' }} />
                        <strong>{scores.x}</strong>
                        <span>You (X)</span>
                    </div>
                    <div className="game__score-card">
                        <i className="fa-solid fa-o" style={{ color: '#38bdf8', fontSize: '16px' }} />
                        <strong>{scores.o}</strong>
                        <span>{gameMode === "pvp" ? "Player 2 (O)" : "AI Bot (O)"}</span>
                    </div>
                    <div className="game__score-card">
                        <i className="fa-solid fa-handshake" style={{ color: '#94a3b8', fontSize: '16px' }} />
                        <strong>{scores.ties}</strong>
                        <span>Draws</span>
                    </div>
                </div>

                {/* Win Streak Indicator */}
                {streak > 1 && (
                    <div style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '10px',
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: '#f59e0b',
                        fontSize: '13px',
                        fontWeight: '700'
                    }}>
                        <span>🔥</span>
                        <span>{streak} Match Win Streak!</span>
                    </div>
                )}

                {/* Game Mode Selector */}
                <div style={{ background: 'var(--gm-card)', border: '1px solid var(--gm-border)', padding: '14px', borderRadius: '14px', boxShadow: 'var(--gm-shadow)' }}>
                    <label style={{ fontSize: '11px', color: 'var(--gm-text-3)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontWeight: '700' }}>
                        Opponent Mode:
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'ai_hard', label: '🤖 Unbeatable AI' },
                            { id: 'ai_easy', label: '👶 Casual AI' },
                            { id: 'pvp', label: '👥 2-Player' }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => { setGameMode(m.id); resetGame(); }}
                                className={`game__speed-btn ${gameMode === m.id ? 'game__speed-btn--active' : ''}`}
                                style={{ flex: 1, padding: '8px 10px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Active Turn Live Status Banner */}
                <div style={{
                    background: 'var(--gm-card)',
                    border: '1px solid var(--gm-border)',
                    borderRadius: '12px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    fontWeight: '600'
                }}>
                    {winner ? (
                        <span style={{ color: winner === 'X' ? '#4ade80' : winner === 'O' ? '#38bdf8' : '#f59e0b' }}>
                            Match Concluded: {winner === 'Tie' ? 'Draw' : `${winner} Wins`}
                        </span>
                    ) : isAiThinking ? (
                        <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-circle-notch fa-spin" /> AI Bot is calculating...
                        </span>
                    ) : isXNext ? (
                        <span style={{ color: '#e84545', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e84545', display: 'inline-block', boxShadow: '0 0 8px #e84545' }} />
                            Your Turn (Play X)
                        </span>
                    ) : (
                        <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block', boxShadow: '0 0 8px #38bdf8' }} />
                            {gameMode === 'pvp' ? "Player 2's Turn (Play O)" : "AI Turn"}
                        </span>
                    )}
                </div>

                <div className="game__controls-box">
                    <button
                        onClick={resetGame}
                        className="adm-btn adm-btn-secondary"
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '13px' }}
                    >
                        <i className="fa-solid fa-rotate-right" /> Reset Board
                    </button>
                </div>
            </div>

            {/* 3x3 Tic Tac Toe Grid Canvas */}
            <div className="game__canvas-wrap" style={{
                width: '100%',
                maxWidth: '360px',
                aspectRatio: '1 / 1',
                background: 'var(--adm-surface-2, rgba(15,23,42,0.75))',
                border: '1px solid var(--gm-border)',
                borderRadius: '20px',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                gap: '10px',
                position: 'relative',
                margin: '0 auto'
            }}>
                {board.map((cell, idx) => {
                    const isWinningCell = winningLine?.includes(idx);
                    return (
                        <button
                            key={idx}
                            onClick={() => handleClick(idx)}
                            disabled={Boolean(cell) || Boolean(winner) || isAiThinking || (!isXNext && gameMode !== "pvp")}
                            style={{
                                background: isWinningCell
                                    ? 'rgba(34, 197, 94, 0.28)'
                                    : cell
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(255, 255, 255, 0.02)',
                                border: `2px solid ${isWinningCell ? '#22c55e' : 'var(--gm-border)'}`,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.4rem',
                                fontWeight: '900',
                                color: cell === 'X' ? '#e84545' : '#38bdf8',
                                cursor: cell || winner || isAiThinking ? 'default' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isWinningCell ? 'scale(1.06)' : 'none',
                                boxShadow: isWinningCell ? '0 0 24px rgba(34, 197, 94, 0.5)' : 'none'
                            }}
                        >
                            {cell === 'X' && <i className="fa-solid fa-xmark" style={{ filter: 'drop-shadow(0 0 10px rgba(232, 69, 69, 0.6))' }} />}
                            {cell === 'O' && <i className="fa-solid fa-o" style={{ filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))' }} />}
                        </button>
                    );
                })}

                {/* Victory / Draw Overlay */}
                {showOverlay && (
                    <div className="game__overlay" style={{ background: 'rgba(15, 23, 42, 0.92)', borderRadius: '18px' }}>
                        <div className="game__overlay-icon" style={{ fontSize: '2.8rem' }}>
                            {winner === "X" ? "🎉" : winner === "O" ? "🤖" : "🤝"}
                        </div>
                        <h3 className="game__overlay-title" style={{ fontSize: '1.35rem' }}>
                            {winner === "X" ? "Victory Claimed!" : winner === "O" ? (gameMode === "pvp" ? "Player O Won!" : "AI Bot Won!") : "It's a Draw!"}
                        </h3>
                        <p className="game__overlay-sub" style={{ fontSize: '0.85rem' }}>
                            {winner === "X" ? "+100 points added to your score!" : "Challenge again to take the lead!"}
                        </p>
                        <button className="game__overlay-btn" onClick={resetGame} style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
                            <i className="fa-solid fa-rotate-right" /> Play Next Round
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
