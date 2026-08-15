// src/admin/GamesCMS.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ToastNotification from './ToastNotification';
import './admin.css';

export default function GamesCMS() {
    const { authFetch } = useAuth();
    const [activeTab, setActiveTab] = useState('section'); // 'section' | 'games' | 'scores'
    const [games, setGames] = useState([]);
    const [sectionSettings, setSectionSettings] = useState({
        badgeText: 'Fun Zone Arcade',
        headingMain: 'Interactive',
        headingAccent: 'Gaming Lounge',
        description: 'Take a quick break! Play retro classics, test your developer typing speed, solve sliding number puzzles, or challenge our unbeatable AI bot.',
        ctaButtonText: 'Play Our Games (Opens Full Arena)',
        showCtaButton: true,
        isPublic: true
    });

    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [toast, setToast] = useState(null);

    // Form state for game CRUD
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        tagline: '',
        categoryBadge: 'Arcade',
        desc: '',
        featuresText: '',
        icon: 'fa-solid fa-gamepad',
        color: '#e84545',
        instructions: 'Use arrow keys or touch to control.',
        isPublic: true
    });

    const fetchGamesAndSettings = async () => {
        try {
            const [gamesRes, settingsRes] = await Promise.all([
                authFetch('http://localhost:5000/api/admin/section/games'),
                authFetch('http://localhost:5000/api/admin/section/settings')
            ]);

            if (gamesRes.ok) {
                const data = await gamesRes.json();
                setGames(data || []);
            }

            if (settingsRes.ok) {
                const sData = await settingsRes.json();
                if (sData?.gamesSection) {
                    setSectionSettings(prev => ({ ...prev, ...sData.gamesSection }));
                }
            }
        } catch (err) {
            console.error('Failed to load games:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchScoreAnalytics = async () => {
        try {
            const res = await authFetch('http://localhost:5000/api/admin/games/scores');
            if (res.ok) {
                const data = await res.json();
                setScoreData(data);
            }
        } catch (err) {
            console.error('Failed to load scores:', err);
        }
    };

    useEffect(() => {
        fetchGamesAndSettings();
        fetchScoreAnalytics();
    }, []);

    // Save Section Header Settings
    const handleSaveSectionSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await authFetch('http://localhost:5000/api/admin/section/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gamesSection: sectionSettings
                })
            });

            if (res.ok) {
                try {
                    const channel = new BroadcastChannel('portfolio_cms_sync');
                    channel.postMessage({ type: 'settings_updated', timestamp: Date.now() });
                    channel.close();
                } catch (e) {}

                setToast({
                    type: 'success',
                    title: 'Gaming Section Header Saved! 🎮',
                    message: 'Your custom title, description, and button text are now live.'
                });
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Failed to Save Settings',
                message: err.message
            });
        } finally {
            setSavingSettings(false);
        }
    };

    const openAddModal = () => {
        setEditingGame(null);
        setFormData({
            title: '',
            slug: '',
            tagline: 'Arcade Challenge',
            categoryBadge: 'Arcade',
            desc: 'Exciting mini game for your visitors to enjoy!',
            featuresText: '3 Speed Modes, Live Scoreboard',
            icon: 'fa-solid fa-gamepad',
            color: '#e84545',
            instructions: 'Use arrow keys or touch to control.',
            isPublic: true
        });
        setModalOpen(true);
    };

    const openEditModal = (game) => {
        setEditingGame(game);
        setFormData({
            title: game.title,
            slug: game.slug,
            tagline: game.tagline || 'Arcade Challenge',
            categoryBadge: game.categoryBadge || 'Arcade',
            desc: game.desc,
            featuresText: Array.isArray(game.features) ? game.features.join(', ') : '',
            icon: game.icon || 'fa-solid fa-gamepad',
            color: game.color || '#e84545',
            instructions: game.instructions || '',
            isPublic: game.isPublic ?? true
        });
        setModalOpen(true);
    };

    const handleSaveGame = async (e) => {
        e.preventDefault();
        try {
            const features = formData.featuresText
                ? formData.featuresText.split(',').map(s => s.trim()).filter(Boolean)
                : [];

            const payload = {
                ...formData,
                features
            };

            const url = editingGame
                ? `http://localhost:5000/api/admin/section/games/${editingGame._id}`
                : 'http://localhost:5000/api/admin/section/games';
            const method = editingGame ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setModalOpen(false);
                fetchGamesAndSettings();
                setToast({
                    type: 'success',
                    title: editingGame ? 'Game Updated! 🎮' : 'New Game Added! 🕹️',
                    message: `"${formData.title}" is saved.`
                });
            } else {
                throw new Error('Save failed');
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Error Saving Game',
                message: err.message
            });
        }
    };

    const handleDeleteGame = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title || 'this game'}"?`)) return;
        try {
            const res = await authFetch(`http://localhost:5000/api/admin/section/games/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setGames(prev => prev.filter(g => g._id !== id));
                setToast({
                    type: 'success',
                    title: 'Game Deleted',
                    message: `"${title || 'Game'}" removed from Games Hub.`
                });
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Delete Failed',
                message: err.message
            });
        }
    };

    const handleDeleteScore = async (id) => {
        if (!window.confirm('Delete this score from the leaderboard?')) return;
        try {
            const res = await authFetch(`http://localhost:5000/api/admin/games/scores/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchScoreAnalytics();
                setToast({
                    type: 'success',
                    title: 'Score Removed',
                    message: 'Leaderboard score deleted.'
                });
            }
        } catch (err) {
            setToast({
                type: 'error',
                title: 'Failed to Delete Score',
                message: err.message
            });
        }
    };

    const toggleVisibility = async (id, title) => {
        try {
            const res = await authFetch(`http://localhost:5000/api/admin/section/games/${id}/visibility`, {
                method: 'PATCH'
            });
            if (res.ok) {
                const data = await res.json();
                setGames(prev => prev.map(g => g._id === id ? { ...g, isPublic: data.item.isPublic } : g));
                setToast({
                    type: 'success',
                    title: data.item.isPublic ? 'Game Set to Public 🌐' : 'Game Set to Private 🔒',
                    message: `"${title || 'Game'}" visibility updated.`
                });
            }
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Games Hub...</div>;

    return (
        <div>
            {/* Interactive Toast Notification Popup */}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />

            {/* Top Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    onClick={() => setActiveTab('section')}
                    className={`adm-btn ${activeTab === 'section' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-sliders" /> Section Header & Description
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('games')}
                    className={`adm-btn ${activeTab === 'games' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-gamepad" /> Games List & Cards ({games.length})
                </button>
                <button
                    type="button"
                    onClick={() => { setActiveTab('scores'); fetchScoreAnalytics(); }}
                    className={`adm-btn ${activeTab === 'scores' ? 'adm-btn-primary' : 'adm-btn-secondary'}`}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px' }}
                >
                    <i className="fa-solid fa-trophy" /> Live Leaderboard & Scores ({scoreData?.totalSessions || 0})
                </button>
            </div>

            {/* ── TAB 1: SECTION HEADER & DESCRIPTION ── */}
            {activeTab === 'section' && (
                <div className="adm-card">
                    <div className="adm-card-header">
                        <div>
                            <h3 className="adm-card-title">
                                <i className="fa-solid fa-sliders" style={{ color: 'var(--adm-primary)' }}></i>
                                Game Section Header & Texts Customizer
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                Control the badge label, main heading, gradient accent word, description, and Master CTA button text.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveSectionSettings}>
                        <div className="adm-grid-3">
                            <div className="adm-form-group">
                                <label className="adm-label">Section Badge Label</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={sectionSettings.badgeText || ''}
                                    onChange={(e) => setSectionSettings({ ...sectionSettings, badgeText: e.target.value })}
                                    placeholder="Fun Zone Arcade"
                                />
                            </div>
                            <div className="adm-form-group">
                                <label className="adm-label">Main Heading Word(s)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={sectionSettings.headingMain || ''}
                                    onChange={(e) => setSectionSettings({ ...sectionSettings, headingMain: e.target.value })}
                                    placeholder="Interactive"
                                />
                            </div>
                            <div className="adm-form-group">
                                <label className="adm-label">Gradient Accent Heading Word(s)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={sectionSettings.headingAccent || ''}
                                    onChange={(e) => setSectionSettings({ ...sectionSettings, headingAccent: e.target.value })}
                                    placeholder="Gaming Lounge"
                                />
                            </div>
                        </div>

                        <div className="adm-form-group">
                            <label className="adm-label">Section Description Paragraph</label>
                            <textarea
                                rows={3}
                                className="adm-textarea"
                                value={sectionSettings.description || ''}
                                onChange={(e) => setSectionSettings({ ...sectionSettings, description: e.target.value })}
                                placeholder="Take a quick break! Play retro classics, test your developer typing speed..."
                            />
                        </div>

                        <div className="adm-grid-2">
                            <div className="adm-form-group">
                                <label className="adm-label">Master CTA Button Text</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={sectionSettings.ctaButtonText || ''}
                                    onChange={(e) => setSectionSettings({ ...sectionSettings, ctaButtonText: e.target.value })}
                                    placeholder="Play Our Games (Opens Full Arena)"
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">CTA Button Visibility</label>
                                <div className="adm-toggle-wrap" style={{ marginTop: '8px' }}>
                                    <label className="adm-switch">
                                        <input
                                            type="checkbox"
                                            checked={sectionSettings.showCtaButton !== false}
                                            onChange={(e) => setSectionSettings({ ...sectionSettings, showCtaButton: e.target.checked })}
                                        />
                                        <span className="adm-slider" />
                                    </label>
                                    <span style={{ fontSize: '13px' }}>
                                        {sectionSettings.showCtaButton !== false ? 'Show Master Play Button' : 'Hidden (Cards Only)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="adm-btn adm-btn-primary"
                                style={{ padding: '12px 32px', fontSize: '14px', fontWeight: '700' }}
                            >
                                <i className="fa-solid fa-floppy-disk" /> {savingSettings ? 'Saving...' : 'Save Section Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── TAB 2: GAMES LIST & CARDS ── */}
            {activeTab === 'games' && (
                <div className="adm-card">
                    <div className="adm-card-header">
                        <div>
                            <h3 className="adm-card-title">
                                <i className="fa-solid fa-gamepad" style={{ color: 'var(--adm-primary)' }}></i>
                                Game Cards Catalog ({games.length})
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--adm-text-muted)' }}>
                                Edit titles, descriptions, feature badges, colors, and instructions for all arcade games.
                            </p>
                        </div>
                        <button onClick={openAddModal} className="adm-btn adm-btn-primary">
                            <i className="fa-solid fa-plus"></i> Add New Game
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                        {games.map((game) => (
                            <div
                                key={game._id}
                                style={{
                                    background: 'var(--adm-surface-2)',
                                    border: '1px solid var(--adm-border)',
                                    borderRadius: '16px',
                                    padding: '22px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    opacity: game.isPublic ? 1 : 0.65,
                                    borderTop: `4px solid ${game.color || '#e84545'}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: `${game.color || '#e84545'}22`,
                                            color: game.color || '#e84545',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px'
                                        }}>
                                            <i className={game.icon || 'fa-solid fa-gamepad'}></i>
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--adm-text-main)' }}>
                                                {game.title}
                                            </h4>
                                            <span style={{ fontSize: '11px', color: 'var(--adm-text-muted)', fontFamily: 'monospace' }}>
                                                slug: {game.slug}
                                            </span>
                                        </div>
                                    </div>

                                    <span style={{
                                        fontSize: '11px',
                                        padding: '4px 10px',
                                        borderRadius: '999px',
                                        background: `${game.color || '#e84545'}15`,
                                        color: game.color || '#e84545',
                                        fontWeight: '700',
                                        border: `1px solid ${game.color || '#e84545'}35`
                                    }}>
                                        {game.categoryBadge || 'Arcade'}
                                    </span>
                                </div>

                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--adm-text-muted)', lineHeight: '1.5', flex: 1 }}>
                                    {game.desc}
                                </p>

                                {game.features?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {game.features.map((f, idx) => (
                                            <span key={idx} style={{ fontSize: '10px', background: 'var(--adm-surface)', border: '1px solid var(--adm-border)', padding: '2px 8px', borderRadius: '4px', color: 'var(--adm-text-muted)' }}>
                                                ✓ {f}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '14px',
                                    borderTop: '1px solid var(--adm-border)'
                                }}>
                                    <button
                                        onClick={() => toggleVisibility(game._id, game.title)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '12px',
                                            color: game.isPublic ? '#34d399' : '#94a3b8'
                                        }}
                                    >
                                        <i className={`fa-solid ${game.isPublic ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                        {game.isPublic ? 'Public' : 'Private'}
                                    </button>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => openEditModal(game)}
                                            className="adm-btn adm-btn-sm adm-btn-secondary"
                                        >
                                            <i className="fa-solid fa-pen"></i> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGame(game._id, game.title)}
                                            className="adm-btn adm-btn-sm adm-btn-danger"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── TAB 3: SCORES & LEADERBOARDS ── */}
            {activeTab === 'scores' && (
                <div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div className="adm-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                <i className="fa-solid fa-gamepad" />
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', textTransform: 'uppercase' }}>Total Games Played</span>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--adm-text-main)' }}>{scoreData?.totalSessions || 0}</div>
                            </div>
                        </div>

                        <div className="adm-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(232, 69, 69, 0.15)', color: '#e84545', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                🐍
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', textTransform: 'uppercase' }}>Top Snake Score</span>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: '#e84545' }}>
                                    {scoreData?.leaderboards?.snake?.[0]?.score || 0} pts
                                </div>
                            </div>
                        </div>

                        <div className="adm-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                🔢
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', textTransform: 'uppercase' }}>Top 2048 Score</span>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: '#f59e0b' }}>
                                    {scoreData?.leaderboards?.puzzle2048?.[0]?.score || 0} pts
                                </div>
                            </div>
                        </div>

                        <div className="adm-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                ⌨️
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)', textTransform: 'uppercase' }}>Top Typing Speed</span>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }}>
                                    {scoreData?.leaderboards?.typing?.[0]?.score || 0} WPM
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="adm-card">
                        <div className="adm-card-header">
                            <div>
                                <h3 className="adm-card-title">
                                    <i className="fa-solid fa-trophy" style={{ color: '#f59e0b' }} />
                                    Recent Player Leaderboard Submissions
                                </h3>
                            </div>
                        </div>

                        <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
                            <table className="adm-table">
                                <thead>
                                    <tr>
                                        <th>Player</th>
                                        <th>Game</th>
                                        <th>Score / WPM</th>
                                        <th>Played At</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoreData?.recentScores?.length > 0 ? (
                                        scoreData.recentScores.map((score) => (
                                            <tr key={score._id}>
                                                <td>
                                                    <strong style={{ color: 'var(--adm-text-main)', fontSize: '14px' }}>
                                                        {score.playerName}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        textTransform: 'uppercase',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                        background: 'var(--adm-surface-2)',
                                                        color: 'var(--adm-primary)'
                                                    }}>
                                                        {score.gameSlug}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong style={{ fontSize: '15px', color: 'var(--adm-primary)' }}>
                                                        {score.score} {score.gameSlug === 'typing' ? 'WPM' : 'pts'}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '12px', color: 'var(--adm-text-muted)' }}>
                                                        {new Date(score.createdAt).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleDeleteScore(score._id)}
                                                        className="adm-btn adm-btn-danger adm-btn-sm"
                                                    >
                                                        <i className="fa-solid fa-trash" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--adm-text-muted)' }}>
                                                No game scores submitted yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Dialog for Adding / Editing a Game Card ── */}
            {modalOpen && (
                <div className="adm-modal-overlay">
                    <div className="adm-modal">
                        <div className="adm-modal-header">
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                                {editingGame ? 'Edit Game Card' : 'Add New Game Card'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--adm-text-muted)', cursor: 'pointer', fontSize: '18px' }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSaveGame}>
                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">Game Title</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Retro Snake"
                                    />
                                </div>
                                <div className="adm-form-group">
                                    <label className="adm-label">URL Slug</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder="e.g. snake"
                                    />
                                </div>
                            </div>

                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">Tagline Phrase</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        placeholder="e.g. Classic Reflex Arcade"
                                    />
                                </div>
                                <div className="adm-form-group">
                                    <label className="adm-label">Category Badge</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={formData.categoryBadge}
                                        onChange={(e) => setFormData({ ...formData, categoryBadge: e.target.value })}
                                        placeholder="e.g. Arcade Classic"
                                    />
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Description</label>
                                <textarea
                                    rows={2}
                                    className="adm-textarea"
                                    value={formData.desc}
                                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                                    placeholder="Brief explanation of gameplay..."
                                />
                            </div>

                            <div className="adm-form-group">
                                <label className="adm-label">Feature Badges (comma separated)</label>
                                <input
                                    type="text"
                                    className="adm-input"
                                    value={formData.featuresText}
                                    onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                                    placeholder="3 Speed Modes, Live Telemetry, Leaderboard"
                                />
                            </div>

                            <div className="adm-grid-2">
                                <div className="adm-form-group">
                                    <label className="adm-label">FontAwesome Icon</label>
                                    <input
                                        type="text"
                                        className="adm-input"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="fa-solid fa-gamepad"
                                    />
                                </div>
                                <div className="adm-form-group">
                                    <label className="adm-label">Accent Theme Color</label>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            className="adm-input"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="adm-form-group">
                                <div className="adm-toggle-wrap">
                                    <label className="adm-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.isPublic}
                                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                        />
                                        <span className="adm-slider"></span>
                                    </label>
                                    <span style={{ fontSize: '13px' }}>
                                        {formData.isPublic ? 'Publicly Visible in Portfolio' : 'Private (Draft)'}
                                    </span>
                                </div>
                            </div>

                            <div className="adm-modal-footer">
                                <button type="button" onClick={() => setModalOpen(false)} className="adm-btn adm-btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="adm-btn adm-btn-primary">
                                    {editingGame ? 'Update Game' : 'Save Game'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
