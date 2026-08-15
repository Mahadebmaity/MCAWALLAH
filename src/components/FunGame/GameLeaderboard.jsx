// src/components/FunGame/GameLeaderboard.jsx
import { useState, useEffect } from "react";

export default function GameLeaderboard({ gameSlug, onClose }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [totalPlays, setTotalPlays] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/portfolio/games/${gameSlug}/leaderboard`);
                if (res.ok) {
                    const data = await res.json();
                    setLeaderboard(data.leaderboard || []);
                    setTotalPlays(data.totalPlays || 0);
                }
            } catch (err) {
                console.error("Failed to load leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [gameSlug]);

    const gameNames = {
        snake: "Retro Snake",
        "2048": "2048 Puzzle",
        typing: "Typing Speed"
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                background: 'var(--adm-surface, #0f172a)',
                border: '1px solid var(--adm-border, rgba(255,255,255,0.1))',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                animation: 'slideUp 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--adm-text-main, #fff)' }}>
                            🏆 {gameNames[gameSlug] || "Arcade"} Hall of Fame
                        </h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--adm-text-muted, #94a3b8)' }}>
                            {totalPlays} total sessions recorded globally
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--adm-text-muted, #94a3b8)',
                            fontSize: '20px',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)' }}>
                        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }} />
                        <div>Loading global rankings...</div>
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-text-muted)' }}>
                        <i className="fa-solid fa-trophy" style={{ fontSize: '32px', marginBottom: '12px', color: 'rgba(255,255,255,0.2)' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>Be the first player to record a high score!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                        {leaderboard.map((item, index) => {
                            const isTop3 = index < 3;
                            const medalColors = ['#f59e0b', '#94a3b8', '#b45309'];
                            return (
                                <div
                                    key={item._id || index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        background: isTop3 ? 'rgba(56, 189, 248, 0.08)' : 'var(--adm-surface-2, rgba(255,255,255,0.03))',
                                        border: `1px solid ${isTop3 ? 'rgba(56, 189, 248, 0.25)' : 'var(--adm-border, rgba(255,255,255,0.06))'}`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: isTop3 ? medalColors[index] : 'rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '800'
                                        }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '14px', color: 'var(--adm-text-main, #fff)', display: 'block' }}>
                                                {item.playerName}
                                            </strong>
                                            <span style={{ fontSize: '11px', color: 'var(--adm-text-muted, #94a3b8)' }}>
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--gm-accent, #e84545)' }}>
                                            {item.score} {gameSlug === 'typing' ? 'WPM' : 'pts'}
                                        </div>
                                        {item.metrics?.accuracy && (
                                            <span style={{ fontSize: '11px', color: '#10b981' }}>{item.metrics.accuracy}% acc</span>
                                        )}
                                        {item.metrics?.highestTile && (
                                            <span style={{ fontSize: '11px', color: '#f59e0b' }}>tile: {item.metrics.highestTile}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={onClose}
                        className="adm-btn adm-btn-secondary"
                        style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                    >
                        Back to Game
                    </button>
                </div>
            </div>
        </div>
    );
}
