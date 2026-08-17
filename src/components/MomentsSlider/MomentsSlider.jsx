// src/components/MomentsSlider/MomentsSlider.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { usePortfolioData } from '../../context/DataContext';
import { getMediaUrl } from '../../config/api';
import './MomentsSlider.css';

const DEFAULT_MOMENTS = [
    {
        _id: 'm-1',
        title: 'College Tech Fest & Hackathon Champions 🏆',
        subtitle: 'B.Tech CSE • Final Year Highlights',
        category: 'College Moments',
        imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
        description: 'Secured 1st position in the 36-hour intra-college hackathon building a real-time collaborative workspace. An unforgettable night of nonstop coding, pizza, and engineering camaraderie!',
        date: 'March 2024',
        location: 'College Campus Auditorium, West Bengal',
        tags: ['Hackathon', '1st Place', 'Team Alpha', 'College Days'],
        featured: true
    },
    {
        _id: 'm-2',
        title: 'Campus Coding Bootcamp & Mentorship Workshop 💻',
        subtitle: 'Mentoring 50+ Junior Developers',
        category: 'College Moments',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
        description: 'Led a hands-on React & Node.js architecture workshop for sophomore students, helping them build and deploy their very first full-stack web applications on GitHub.',
        date: 'November 2023',
        location: 'CSE Lab 3, Haldia',
        tags: ['Mentorship', 'React Workshop', 'Teaching', 'Campus'],
        featured: true
    },
    {
        _id: 'm-3',
        title: 'MCA WALLAH Portfolio Engine Launch Day 🚀',
        subtitle: '11 CMS Modules & System Architecture',
        category: 'Project Highlights',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
        description: 'Successfully deployed the MCA WALLAH portfolio suite with dynamic broadcast sync, automated resume vaults, interactive arcade games, and AI assistant intelligence.',
        date: 'January 2024',
        location: 'Remote Workstation',
        tags: ['Full Stack', 'Vite', 'React 19', 'MongoDB Atlas'],
        featured: true
    },
    {
        _id: 'm-4',
        title: 'Annual Technical Symposium & Project Exhibition 🎪',
        subtitle: 'Demonstrating Real-Time IoT & Web Apps',
        category: 'Hackathons & Events',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
        description: 'Showcased our automated resume parser and data visualization dashboard to visiting industry engineers and college professors during the annual tech expo.',
        date: 'February 2024',
        location: 'Main Exhibition Hall',
        tags: ['Exhibition', 'Live Demo', 'Tech Symposium'],
        featured: false
    },
    {
        _id: 'm-5',
        title: 'Late Night Developer Jam & Arcade Game Polish 🎮',
        subtitle: 'Building the Retro Snake & Minimax AI',
        category: 'Milestones',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
        description: 'Designing retro arcade games with HTML5 Canvas 2D and unbeatable Minimax AI decision trees right into the developer portfolio.',
        date: 'December 2023',
        location: 'Developer Den',
        tags: ['GameDev', 'Canvas', 'Minimax AI', 'Milestone'],
        featured: false
    }
];

export default function MomentsSlider() {
    const { data } = usePortfolioData();
    const momentsList = (data?.moments && data.moments.length > 0) ? data.moments : DEFAULT_MOMENTS;

    const [activeCategory, setActiveCategory] = useState('All');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const sliderContainerRef = useRef(null);

    // Filter items
    const filteredMoments = useMemo(() => {
        if (activeCategory === 'All') return momentsList;
        return momentsList.filter(m => m.category === activeCategory);
    }, [momentsList, activeCategory]);

    // Ensure index remains in bounds when category changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [activeCategory]);

    const total = filteredMoments.length;
    const currentMoment = filteredMoments[currentIndex] || filteredMoments[0];

    // Navigation functions
    const nextSlide = () => {
        if (total === 0) return;
        setCurrentIndex(prev => (prev + 1) % total);
    };

    const prevSlide = () => {
        if (total === 0) return;
        setCurrentIndex(prev => (prev - 1 + total) % total);
    };

    const goToSlide = (index) => {
        if (index >= 0 && index < total) {
            setCurrentIndex(index);
        }
    };

    // Autoplay Timer
    useEffect(() => {
        if (!isAutoplay || isHovered || total <= 1) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 4500);
        return () => clearInterval(interval);
    }, [isAutoplay, isHovered, total, currentIndex]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex !== null) {
                if (e.key === 'Escape') setLightboxIndex(null);
                if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev + 1) % total);
                if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev - 1 + total) % total);
                return;
            }
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [total, lightboxIndex]);

    // Touch Swipe handling
    const touchStartRef = useRef(0);
    const handleTouchStart = (e) => {
        touchStartRef.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStartRef.current - touchEnd;
        if (Math.abs(diff) > 40) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    };

    const categories = ['All', 'College Moments', 'Project Highlights', 'Hackathons & Events', 'Milestones'];

    if (total === 0) return null;

    return (
        <section id="moments" className="moments-section" aria-label="Moments and Highlights Photo Slider">
            <div className="moments-ambient-glow" aria-hidden="true" />

            <div className="moments-container">
                {/* ── Section Header ── */}
                <div className="moments-header">
                    <div className="moments-badge">
                        <span className="moments-badge-dot" />
                        <span>CAPTURED MEMORIES &amp; MILESTONES</span>
                    </div>

                    <h2 className="moments-title">
                        Life, Campus &amp; <span className="moments-title-gradient">Developer Moments</span>
                    </h2>

                    <p className="moments-subtitle">
                        Memorable milestones from college hackathons, technical bootcamps, and full-stack software breakthroughs.
                    </p>

                    {/* Category Filter Tabs */}
                    <div className="moments-category-tabs">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                className={`moments-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat === 'All' && <i className="fa-solid fa-layer-group" />}
                                {cat === 'College Moments' && <i className="fa-solid fa-graduation-cap" />}
                                {cat === 'Project Highlights' && <i className="fa-solid fa-code-branch" />}
                                {cat === 'Hackathons & Events' && <i className="fa-solid fa-trophy" />}
                                {cat === 'Milestones' && <i className="fa-solid fa-flag-checkered" />}
                                <span>{cat}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── 3D Coverflow Stage & Synced Story ── */}
                <div
                    className="moments-stage-wrapper"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    ref={sliderContainerRef}
                >
                    {/* 3D Visual Cards Stage */}
                    <div className="moments-cards-stage">
                        {filteredMoments.map((item, idx) => {
                            // Calculate relative offset from currentIndex
                            let offset = idx - currentIndex;
                            if (offset < -Math.floor(total / 2)) offset += total;
                            if (offset > Math.floor(total / 2)) offset -= total;

                            const isActive = idx === currentIndex;
                            const isPrev = offset === -1;
                            const isNext = offset === 1;
                            const isVisible = Math.abs(offset) <= 2;

                            return (
                                <div
                                    key={item._id || idx}
                                    className={`moments-card ${isActive ? 'is-active' : ''} ${isPrev ? 'is-prev' : ''} ${isNext ? 'is-next' : ''}`}
                                    style={{
                                        '--offset': offset,
                                        '--abs-offset': Math.abs(offset),
                                        display: isVisible ? 'block' : 'none'
                                    }}
                                    onClick={() => {
                                        if (!isActive) {
                                            goToSlide(idx);
                                        } else {
                                            setLightboxIndex(idx);
                                        }
                                    }}
                                    title={isActive ? "Click to view full photo" : `Click to view ${item.title}`}
                                >
                                    <div className="moments-card-inner">
                                        <img
                                            src={getMediaUrl(item.imageUrl)}
                                            alt={item.title}
                                            className="moments-card-img"
                                            loading="lazy"
                                        />
                                        <div className="moments-card-overlay">
                                            <span className="moments-card-cat-pill">
                                                <i className="fa-solid fa-camera" /> {item.category}
                                            </span>
                                            {isActive && (
                                                <button
                                                    type="button"
                                                    className="moments-card-expand-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setLightboxIndex(idx);
                                                    }}
                                                    title="Open Fullscreen"
                                                >
                                                    <i className="fa-solid fa-expand" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Controls Bar (Prev/Next, Pagination, Autoplay) */}
                    <div className="moments-controls-bar">
                        <button
                            type="button"
                            className="moments-nav-btn prev"
                            onClick={prevSlide}
                            aria-label="Previous Moment"
                        >
                            <i className="fa-solid fa-chevron-left" />
                        </button>

                        <div className="moments-pagination-dots">
                            {filteredMoments.map((_, dotIdx) => (
                                <button
                                    key={dotIdx}
                                    type="button"
                                    className={`moments-dot ${dotIdx === currentIndex ? 'active' : ''}`}
                                    onClick={() => goToSlide(dotIdx)}
                                    aria-label={`Go to slide ${dotIdx + 1}`}
                                />
                            ))}
                        </div>

                        <div className="moments-counter-pill">
                            <span className="current-num">{String(currentIndex + 1).padStart(2, '0')}</span>
                            <span className="sep">/</span>
                            <span className="total-num">{String(total).padStart(2, '0')}</span>
                        </div>

                        <button
                            type="button"
                            className={`moments-autoplay-btn ${isAutoplay ? 'active' : ''}`}
                            onClick={() => setIsAutoplay(!isAutoplay)}
                            title={isAutoplay ? "Pause Autoplay" : "Resume Autoplay"}
                        >
                            <i className={`fa-solid ${isAutoplay ? 'fa-pause' : 'fa-play'}`} />
                        </button>

                        <button
                            type="button"
                            className="moments-nav-btn next"
                            onClick={nextSlide}
                            aria-label="Next Moment"
                        >
                            <i className="fa-solid fa-chevron-right" />
                        </button>
                    </div>

                    {/* ── Synced Story Narrative Card (Slides in sync with photo) ── */}
                    {currentMoment && (
                        <div className="moments-story-card" key={currentMoment._id || currentIndex}>
                            <div className="moments-story-header">
                                <div className="moments-story-badges">
                                    <span className="moments-story-cat">
                                        <i className="fa-solid fa-bookmark" /> {currentMoment.category}
                                    </span>
                                    {currentMoment.date && (
                                        <span className="moments-story-date">
                                            <i className="fa-solid fa-calendar-days" /> {currentMoment.date}
                                        </span>
                                    )}
                                    {currentMoment.location && (
                                        <span className="moments-story-location">
                                            <i className="fa-solid fa-location-dot" /> {currentMoment.location}
                                        </span>
                                    )}
                                </div>

                                <h3 className="moments-story-title">{currentMoment.title}</h3>
                                {currentMoment.subtitle && (
                                    <h4 className="moments-story-subtitle">{currentMoment.subtitle}</h4>
                                )}
                            </div>

                            <p className="moments-story-desc">
                                {currentMoment.description}
                            </p>

                            {currentMoment.tags && currentMoment.tags.length > 0 && (
                                <div className="moments-story-tags">
                                    {currentMoment.tags.map((t, tIdx) => (
                                        <span key={tIdx} className="moments-tag-chip">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                 FULLSCREEN LIGHTBOX MODAL
            ══════════════════════════════════════════════════════════ */}
            {lightboxIndex !== null && filteredMoments[lightboxIndex] && (
                <div className="moments-lightbox-overlay" onClick={() => setLightboxIndex(null)}>
                    <div className="moments-lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="moments-lightbox-close"
                            onClick={() => setLightboxIndex(null)}
                            title="Close Lightbox"
                        >
                            <i className="fa-solid fa-xmark" />
                        </button>

                        <div className="moments-lightbox-body">
                            <div className="moments-lightbox-image-wrap">
                                <img
                                    src={getMediaUrl(filteredMoments[lightboxIndex].imageUrl)}
                                    alt={filteredMoments[lightboxIndex].title}
                                    className="moments-lightbox-img"
                                />
                            </div>

                            <div className="moments-lightbox-info">
                                <div className="moments-story-badges">
                                    <span className="moments-story-cat">
                                        {filteredMoments[lightboxIndex].category}
                                    </span>
                                    {filteredMoments[lightboxIndex].date && (
                                        <span className="moments-story-date">
                                            {filteredMoments[lightboxIndex].date}
                                        </span>
                                    )}
                                </div>

                                <h3 className="moments-lightbox-title">{filteredMoments[lightboxIndex].title}</h3>
                                {filteredMoments[lightboxIndex].subtitle && (
                                    <h4 className="moments-story-subtitle">{filteredMoments[lightboxIndex].subtitle}</h4>
                                )}

                                <p className="moments-lightbox-desc">
                                    {filteredMoments[lightboxIndex].description}
                                </p>

                                {filteredMoments[lightboxIndex].tags?.length > 0 && (
                                    <div className="moments-story-tags">
                                        {filteredMoments[lightboxIndex].tags.map((t, i) => (
                                            <span key={i} className="moments-tag-chip">#{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lightbox Prev / Next Controls */}
                        {total > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="moments-lightbox-nav prev"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((lightboxIndex - 1 + total) % total);
                                    }}
                                >
                                    <i className="fa-solid fa-chevron-left" />
                                </button>
                                <button
                                    type="button"
                                    className="moments-lightbox-nav next"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((lightboxIndex + 1) % total);
                                    }}
                                >
                                    <i className="fa-solid fa-chevron-right" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
