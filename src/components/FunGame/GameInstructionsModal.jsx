// src/components/FunGame/GameInstructionsModal.jsx

const INSTRUCTIONS = {
    snake: {
        title: "🐍 How to Play Retro Snake",
        badge: "Classic Arcade",
        rules: [
            "Use the Arrow Keys, WASD, on-screen D-pad, or swipe on touchscreen to change snake direction.",
            "Eat the glowing red food dots to grow your snake and earn +10 points per dot.",
            "Avoid crashing into the border walls or biting your own snake body.",
            "Select 'Fast' speed mode for a rapid reflex challenge and higher adrenaline gameplay."
        ],
        tips: [
            "Plan your path along the perimeter walls to maximize open space in the center.",
            "Don't rush sharp 180° turns without leaving enough clearance for your tail."
        ]
    },
    "2048": {
        title: "🔢 How to Play 2048 Puzzle",
        badge: "Mathematical Strategy",
        rules: [
            "Use Arrow Keys or swipe on touchscreens to slide all number tiles across the 4x4 grid.",
            "When two tiles with the exact same number collide (e.g. 2+2 or 8+8), they merge into one with double value (4, 16, 32...).",
            "A new 2 or 4 tile randomly spawns after every valid move.",
            "Reach the legendary 2048 tile to win, or keep building higher tiles (4096+)!"
        ],
        tips: [
            "The Corner Strategy: Keep your highest tile locked in one specific corner (like bottom-right).",
            "Build decreasing numerical chains along your home row (e.g. 512, 256, 128, 64)."
        ]
    },
    typing: {
        title: "⌨️ How to Master Touch Typing",
        badge: "Skill & Speed Trainer",
        rules: [
            "Select your desired practice category: Alphabet Pangrams, Numbers Row Only, Home/Finger Rows, or Full Code Syntax.",
            "Set your countdown timer (15s, 30s, 60s, or 120s) and click 'Start Practice'.",
            "Type continuously. The jumping caret advances and highlights correct characters in green and mistakes in red with backspace correction.",
            "Watch the live visual keyboard below to learn proper finger positioning without looking at your physical keyboard."
        ],
        tips: [
            "Prioritize accuracy over speed initially. 95%+ accuracy builds muscle memory, which naturally unlocks 80+ WPM speed.",
            "Keep your wrists slightly elevated and return your index fingers to the 'F' and 'J' home keys."
        ]
    },
    tictactoe: {
        title: "⭕❌ How to Play Tic Tac Toe AI",
        badge: "Logic & Tactics",
        rules: [
            "The match is played on a 3x3 grid. You are 'X' and your opponent/AI is 'O'.",
            "Take turns placing your mark in an empty square.",
            "The first player to get 3 marks in a horizontal, vertical, or diagonal row claims victory!",
            "If all 9 cells are filled with no 3-in-a-row, the round ends in a draw."
        ],
        tips: [
            "Try 'Unbeatable AI' mode to test your wits against the optimal Minimax algorithm.",
            "Switch to '2-Player Pass' mode to challenge a friend sitting next to you."
        ]
    }
};

export default function GameInstructionsModal({ gameSlug, onClose }) {
    const data = INSTRUCTIONS[gameSlug] || INSTRUCTIONS.snake;

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
                maxWidth: '520px',
                background: 'var(--adm-surface, #0f172a)',
                border: '1px solid var(--adm-border, rgba(255,255,255,0.1))',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                animation: 'slideUp 0.3s ease'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--adm-text-main, #fff)' }}>
                            {data.title}
                        </h3>
                        <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '999px', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>
                            {data.badge}
                        </span>
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

                <div style={{ marginBottom: '18px' }}>
                    <h4 style={{ fontSize: '13px', color: 'var(--adm-primary, #38bdf8)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                        Game Rules & Controls:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--adm-text-main, #cbd5e1)', fontSize: '13px', lineHeight: '1.6' }}>
                        {data.rules.map((rule, idx) => (
                            <li key={idx} style={{ marginBottom: '6px' }}>{rule}</li>
                        ))}
                    </ul>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-lightbulb" /> Pro Strategy Tips:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--adm-text-main, #cbd5e1)', fontSize: '12px', lineHeight: '1.5' }}>
                        {data.tips.map((tip, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={onClose}
                    className="adm-btn adm-btn-primary"
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px' }}
                >
                    Got It, Let's Play! 🎮
                </button>
            </div>
        </div>
    );
}
