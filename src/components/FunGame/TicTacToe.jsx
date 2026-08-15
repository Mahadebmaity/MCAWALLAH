// src/components/FunGame/TicTacToe.jsx
import { useState, useEffect, useCallback } from "react";

const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

export default function TicTacToe({ onGameOver, bestScore }) {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [gameMode, setGameMode] = useState("ai_hard"); // 'ai_easy' | 'ai_hard' | 'pvp'
    const [scores, setScores] = useState({ x: 0, o: 0, ties: 0 });
    const [winner, setWinner] = useState(null); // 'X' | 'O' | 'Tie' | null
    const [winningLine, setWinningLine] = useState(null);

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
            // Easy AI: random move
            return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
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

    const handleClick = useCallback((index) => {
        if (board[index] || winner) return;

        const newBoard = [...board];
        newBoard[index] = isXNext ? "X" : "O";
        setBoard(newBoard);

        const winResult = checkWinner(newBoard);
        if (winResult) {
            handleGameEnd(winResult);
            return;
        }

        setIsXNext(!isXNext);
    }, [board, isXNext, winner]);

    // Handle AI turn
    useEffect(() => {
        if (gameMode !== "pvp" && !isXNext && !winner) {
            const timer = setTimeout(() => {
                const aiMove = getBestMove([...board], gameMode === "ai_hard");
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
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [isXNext, gameMode, board, winner]);

    const handleGameEnd = (winResult) => {
        setWinner(winResult.winner);
        setWinningLine(winResult.line);

        if (winResult.winner === "X") {
            setScores(s => ({ ...s, x: s.x + 1 }));
            const pts = 100 * (scores.x + 1);
            if (onGameOver) onGameOver(pts, { mode: gameMode, result: "Win vs AI" });
        } else if (winResult.winner === "O") {
            setScores(s => ({ ...s, o: s.o + 1 }));
        } else {
            setScores(s => ({ ...s, ties: s.ties + 1 }));
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setWinningLine(null);
        setIsXNext(true);
    };

    return (
        <div className="game__engine-wrap">
            <div className="game__info-panel">
                <div className="game__scores">
                    <div className="game__score-card">
                        <i className="fa-solid fa-xmark" style={{ color: '#e84545' }} />
                        <strong>{scores.x}</strong>
                        <span>You (X)</span>
                    </div>
                    <div className="game__score-card">
                        <i className="fa-solid fa-o" style={{ color: '#38bdf8' }} />
                        <strong>{scores.o}</strong>
                        <span>{gameMode === "pvp" ? "Player 2 (O)" : "AI Bot (O)"}</span>
                    </div>
                    <div className="game__score-card">
                        <i className="fa-solid fa-handshake" style={{ color: '#94a3b8' }} />
                        <strong>{scores.ties}</strong>
                        <span>Draws</span>
                    </div>
                </div>

                {/* Game Mode Selector */}
                <div style={{ background: 'var(--gm-card)', border: '1px solid var(--gm-border)', padding: '14px', borderRadius: '12px', boxShadow: 'var(--gm-shadow)' }}>
                    <label style={{ fontSize: '11px', color: 'var(--gm-text-3)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontWeight: '700' }}>
                        Choose Opponent Mode:
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'ai_hard', label: '🤖 Unbeatable AI' },
                            { id: 'ai_easy', label: '👶 Casual AI' },
                            { id: 'pvp', label: '👥 2-Player Pass' }
                        ].map((m) => (
                            <button
                                key={m.id}
                                onClick={() => { setGameMode(m.id); resetGame(); }}
                                className={`game__speed-btn ${gameMode === m.id ? 'game__speed-btn--active' : ''}`}
                                style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="game__controls-box">
                    <button
                        onClick={resetGame}
                        className="adm-btn adm-btn-secondary"
                        style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                    >
                        <i className="fa-solid fa-rotate-right" /> Reset Board
                    </button>
                </div>
            </div>

            {/* 3x3 Tic Tac Toe Grid Canvas */}
            <div className="game__canvas-wrap" style={{
                width: '100%',
                maxWidth: '380px',
                aspectRatio: '1 / 1',
                background: 'var(--adm-surface-2, rgba(15,23,42,0.6))',
                border: '1px solid var(--gm-border)',
                borderRadius: '18px',
                padding: '14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                gap: '10px',
                position: 'relative'
            }}>
                {board.map((cell, idx) => {
                    const isWinningCell = winningLine?.includes(idx);
                    return (
                        <button
                            key={idx}
                            onClick={() => handleClick(idx)}
                            disabled={Boolean(cell) || Boolean(winner) || (!isXNext && gameMode !== "pvp")}
                            style={{
                                background: isWinningCell
                                    ? 'rgba(16, 185, 129, 0.25)'
                                    : cell
                                    ? 'var(--gm-card)'
                                    : 'rgba(255, 255, 255, 0.03)',
                                border: `2px solid ${isWinningCell ? '#10b981' : 'var(--gm-border)'}`,
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2.5rem',
                                fontWeight: '900',
                                color: cell === 'X' ? '#e84545' : '#38bdf8',
                                cursor: cell || winner ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                                transform: isWinningCell ? 'scale(1.05)' : 'none',
                                boxShadow: isWinningCell ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none'
                            }}
                        >
                            {cell === 'X' && <i className="fa-solid fa-xmark" />}
                            {cell === 'O' && <i className="fa-solid fa-o" />}
                        </button>
                    );
                })}

                {/* Overlays */}
                {winner && (
                    <div className="game__overlay" style={{ background: 'rgba(15, 23, 42, 0.88)' }}>
                        <div className="game__overlay-icon">
                            {winner === "X" ? "🎉" : winner === "O" ? "🤖" : "🤝"}
                        </div>
                        <h3 className="game__overlay-title">
                            {winner === "X" ? "You Won the Match!" : winner === "O" ? (gameMode === "pvp" ? "Player O Won!" : "AI Claimed Victory!") : "It's a Standoff Draw!"}
                        </h3>
                        <p className="game__overlay-sub">
                            {winner === "X" ? "+100 pts added to your score!" : "Ready for a rematch?"}
                        </p>
                        <button className="game__overlay-btn" onClick={resetGame}>
                            <i className="fa-solid fa-rotate-right" /> Play Next Round
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
