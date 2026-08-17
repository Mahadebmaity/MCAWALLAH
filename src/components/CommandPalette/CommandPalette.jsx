import { useState, useEffect, useRef } from 'react';
import { usePortfolioData } from '../../context/DataContext';
import { API_BASE, getDocUrl } from '../../config/api';
import './CommandPalette.css';

export default function CommandPalette() {
    const { data } = usePortfolioData();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);

    // Global Key Listener for Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Auto-focus search input when palette opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Build Comprehensive Command List
    const buildCommandList = () => {
        const list = [];

        // 1. Navigation Commands
        list.push(
            { id: 'nav-hero', group: 'Navigation', title: 'Home / Hero Header', icon: 'fa-solid fa-house', desc: 'Jump to top intro', action: () => scrollToSection('hero') },
            { id: 'nav-about', group: 'Navigation', title: 'About Mahadeb Maity', icon: 'fa-solid fa-user', desc: 'Bio, education & journey', action: () => scrollToSection('about') },
            { id: 'nav-skills', group: 'Navigation', title: 'Skills & Tech Stack', icon: 'fa-solid fa-microchip', desc: 'React 19, Node.js, MongoDB', action: () => scrollToSection('skills') },
            { id: 'nav-projects', group: 'Navigation', title: 'Featured Projects Showcase', icon: 'fa-solid fa-folder-open', desc: 'Live applications & code', action: () => scrollToSection('projects') },
            { id: 'nav-arcade', group: 'Navigation', title: 'Retro Arcade Lounge', icon: 'fa-solid fa-gamepad', desc: 'Play Snake, 2048 & Minimax AI', action: () => scrollToSection('game') },
            { id: 'nav-contact', group: 'Navigation', title: 'Contact & Hire Form', icon: 'fa-solid fa-envelope', desc: 'Get in touch for opportunities', action: () => scrollToSection('contact') }
        );

        // 2. Project Sandboxes & Live Links
        if (data?.projects?.length) {
            data.projects.forEach((p, idx) => {
                list.push({
                    id: `proj-${idx}`,
                    group: 'Projects & Demos',
                    title: p.title,
                    icon: 'fa-solid fa-laptop-code',
                    desc: p.category || 'Live Project',
                    action: () => {
                        scrollToSection('projects');
                        if (p.live) window.open(p.live, '_blank');
                    }
                });
            });
        }

        // 3. Resume (Public)
        list.push(
            {
                id: 'doc-resume',
                group: 'Resume',
                title: 'Download Verified Resume (PDF)',
                icon: 'fa-solid fa-file-arrow-down',
                desc: 'Full-stack software developer resume',
                action: () => {
                    const dlLink = document.createElement('a');
                    dlLink.href = getDocUrl('/docs/PORTFOLIO_SYSTEM_DOCUMENTATION.pdf');
                    dlLink.download = 'Mahadeb_Maity_Resume.pdf';
                    dlLink.click();
                }
            }
        );

        // 4. Arcade Minigames
        list.push(
            { id: 'game-snake', group: 'Arcade Lounge', title: 'Play Retro Cyber Snake', icon: 'fa-solid fa-worm', desc: 'Classic snake arcade game', action: () => { window.location.href = '/arcade/snake'; } },
            { id: 'game-2048', group: 'Arcade Lounge', title: 'Play 2048 Number Puzzle', icon: 'fa-solid fa-border-all', desc: 'Merge numbers to 2048', action: () => { window.location.href = '/arcade/2048'; } },
            { id: 'game-ttt', group: 'Arcade Lounge', title: 'Play Tic-Tac-Toe AI (Minimax)', icon: 'fa-solid fa-xmark', desc: 'Unbeatable AI challenge', action: () => { window.location.href = '/arcade/tic-tac-toe'; } },
            { id: 'game-typing', group: 'Arcade Lounge', title: 'Play Typing Speed Challenge', icon: 'fa-solid fa-keyboard', desc: 'Test WPM typing speed', action: () => { window.location.href = '/arcade/typing-speed'; } }
        );

        // 5. Contact & Socials
        list.push(
            { id: 'social-gh', group: 'Social & Links', title: 'Open GitHub Profile', icon: 'fa-brands fa-github', desc: 'github.com/Mahadebmaity', action: () => window.open('https://github.com/Mahadebmaity', '_blank') },
            { id: 'social-li', group: 'Social & Links', title: 'Connect on LinkedIn', icon: 'fa-brands fa-linkedin', desc: 'Professional network', action: () => window.open('https://linkedin.com', '_blank') },
            { id: 'social-email', group: 'Social & Links', title: 'Send Direct Email', icon: 'fa-solid fa-paper-plane', desc: 'mahadeb@example.com', action: () => { window.location.href = 'mailto:mahadebmaity@example.com'; } }
        );

        return list;
    };

    const scrollToSection = (id) => {
        setIsOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const allCommands = buildCommandList();

    const filteredCommands = allCommands.filter(c => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        return c.title.toLowerCase().includes(q) ||
            c.group.toLowerCase().includes(q) ||
            (c.desc && c.desc.toLowerCase().includes(q));
    });

    // Keyboard Arrow navigation & Enter execution
    const handleKeyDownInMenu = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % (filteredCommands.length || 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[activeIndex]) {
                filteredCommands[activeIndex].action();
                setIsOpen(false);
            }
        }
    };

    // Group commands by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.group]) acc[cmd.group] = [];
        acc[cmd.group].push(cmd);
        return acc;
    }, {});

    return (
        <>
            {/* ── Floating Search Pill Launcher (Visible on Bottom Left) ── */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="cp-launcher-trigger"
                title="Open Command Palette (Ctrl + K)"
            >
                <i className="fa-solid fa-magnifying-glass" style={{ color: '#38bdf8' }} />
                <span>Search portfolio...</span>
                <span className="cp-kbd-badge">Ctrl K</span>
            </button>

            {/* ── Modal Overlay ── */}
            {isOpen && (
                <div className="cp-overlay" onClick={() => setIsOpen(false)}>
                    <div className="cp-container" onClick={(e) => e.stopPropagation()}>
                        {/* Search Input Bar */}
                        <div className="cp-header">
                            <i className="fa-solid fa-magnifying-glass cp-search-icon" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="cp-input"
                                placeholder="Type a command, project name, skill, or document..."
                                value={query}
                                onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(0); }}
                                onKeyDown={handleKeyDownInMenu}
                            />
                            <span className="cp-esc-badge" onClick={() => setIsOpen(false)}>ESC</span>
                        </div>

                        {/* Results list grouped by section */}
                        <div className="cp-results-list">
                            {filteredCommands.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                                    <i className="fa-solid fa-compass" style={{ fontSize: '32px', marginBottom: '8px' }} />
                                    <p style={{ margin: 0, fontSize: '13px' }}>No commands match "<strong>{query}</strong>"</p>
                                </div>
                            ) : (
                                Object.keys(groupedCommands).map((groupName) => (
                                    <div key={groupName}>
                                        <div className="cp-group-title">{groupName}</div>
                                        {groupedCommands[groupName].map((cmd) => {
                                            const itemGlobalIndex = filteredCommands.findIndex(c => c.id === cmd.id);
                                            const isActive = itemGlobalIndex === activeIndex;

                                            return (
                                                <div
                                                    key={cmd.id}
                                                    className={`cp-item ${isActive ? 'is-active' : ''}`}
                                                    onClick={() => { cmd.action(); setIsOpen(false); }}
                                                    onMouseEnter={() => setActiveIndex(itemGlobalIndex)}
                                                >
                                                    <div className="cp-item-left">
                                                        <div className="cp-item-icon-box">
                                                            <i className={cmd.icon} />
                                                        </div>
                                                        <div className="cp-item-title">
                                                            {cmd.title}
                                                            {cmd.desc && <span className="cp-item-desc">• {cmd.desc}</span>}
                                                        </div>
                                                    </div>
                                                    <span className="cp-item-badge">Jump ↵</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Keyboard Hints */}
                        <div className="cp-footer">
                            <div className="cp-footer-keys">
                                <div className="cp-footer-key-item">
                                    <kbd>↑</kbd> <kbd>↓</kbd> <span>Navigate</span>
                                </div>
                                <div className="cp-footer-key-item">
                                    <kbd>↵</kbd> <span>Select</span>
                                </div>
                                <div className="cp-footer-key-item">
                                    <kbd>ESC</kbd> <span>Close</span>
                                </div>
                            </div>
                            <span style={{ color: '#38bdf8', fontWeight: '600' }}>Developer Spotlight</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
