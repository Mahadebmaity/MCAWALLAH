// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Immediate Components (Critical for initial fast paint)
import Navbar from './components/Navbar/Navbar';
import Header from './components/Header/Header';
import MomentsSlider from './components/MomentsSlider/MomentsSlider';
import About from './components/About/About';
import Projects from './components/Projects/Projects';
import FunGame from './components/FunGame/FunGame';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import AiAssistant from './components/AiAssistant/AiAssistant';
import CommandPalette from './components/CommandPalette/CommandPalette';
import AuthModal from './components/AuthModal/AuthModal';
import { useAuth } from './context/AuthContext';

// Lazy-loaded Components (Downloaded only when navigated to)
const StandaloneArcadeWindow = lazy(() => import('./components/FunGame/StandaloneArcadeWindow'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminAuthGuard = lazy(() => import('./admin/AdminAuthGuard'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const DashboardOverview = lazy(() => import('./admin/DashboardOverview'));
const NavbarCMS = lazy(() => import('./admin/NavbarCMS'));
const HeroCMS = lazy(() => import('./admin/HeroCMS'));
const MomentsCMS = lazy(() => import('./admin/MomentsCMS'));
const AboutCMS = lazy(() => import('./admin/AboutCMS'));
const SkillsCMS = lazy(() => import('./admin/SkillsCMS'));
const TimelineCMS = lazy(() => import('./admin/TimelineCMS'));
const ProjectsCMS = lazy(() => import('./admin/ProjectsCMS'));
const PlaygroundCMS = lazy(() => import('./admin/PlaygroundCMS'));
const GamesCMS = lazy(() => import('./admin/GamesCMS'));
const DocumentsCMS = lazy(() => import('./admin/DocumentsCMS'));
const ImplementationPlansCMS = lazy(() => import('./admin/ImplementationPlansCMS'));
const CommandPaletteCMS = lazy(() => import('./admin/CommandPaletteCMS'));
const AiAssistantCMS = lazy(() => import('./admin/AiAssistantCMS'));
const MessagesInbox = lazy(() => import('./admin/MessagesInbox'));
const FooterSubscribersCMS = lazy(() => import('./admin/FooterSubscribersCMS'));
const SettingsCMS = lazy(() => import('./admin/SettingsCMS'));
const UsersActivityCMS = lazy(() => import('./admin/UsersActivityCMS'));

// Lightweight loading fallback for lazy admin routes
function RouteLoadingFallback() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#38bdf8',
      fontSize: '14px',
      gap: '10px'
    }}>
      <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '20px' }} />
      <span>Loading Module...</span>
    </div>
  );
}

function PublicPortfolio() {
  const { user, loading, authModalOpen, closeAuthModal, authModalPrompt, authModalMode } = useAuth();

  if (loading) {
    return <RouteLoadingFallback />;
  }

  // ── Unauthenticated Visitor: Display Auth Wall Portal (Sign Up / Sign In Required) ──
  if (!user) {
    return (
      <AuthModal
        isWall={true}
        defaultMode="login"
        prompt="Please Sign In or Create an Account to unlock Mahadeb's Full Engineering Portfolio, Live Projects & AI Digital Twin."
      />
    );
  }

  // ── Authenticated User: Complete Portfolio Unlocked ──
  return (
    <>
      <Navbar />
      <Header />
      <MomentsSlider />
      <About />
      <Projects />
      <FunGame />
      <Contact />
      <Footer />
      <AiAssistant />
      <CommandPalette />
      {authModalOpen && (
        <AuthModal
          onClose={closeAuthModal}
          prompt={authModalPrompt}
          defaultMode={authModalMode}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* ── Public Portfolio Home (Instant Render) ── */}
        <Route path="/" element={<PublicPortfolio />} />

        {/* ── Dedicated Standalone Full-Screen Arcade Mode ── */}
        <Route path="/arcade" element={<StandaloneArcadeWindow />} />
        <Route path="/arcade/:slug" element={<StandaloneArcadeWindow />} />

        {/* ── Admin Login ── */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ── Protected Admin Studio ── */}
        <Route path="/admin" element={<AdminAuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="users-activity" element={<UsersActivityCMS />} />
            <Route path="navbar" element={<NavbarCMS />} />
            <Route path="hero" element={<HeroCMS />} />
            <Route path="moments" element={<MomentsCMS />} />
            <Route path="about" element={<AboutCMS />} />
            <Route path="skills" element={<SkillsCMS />} />
            <Route path="timeline" element={<TimelineCMS />} />
            <Route path="projects" element={<ProjectsCMS />} />
            <Route path="playground" element={<PlaygroundCMS />} />
            <Route path="games" element={<GamesCMS />} />
            <Route path="docs" element={<DocumentsCMS />} />
            <Route path="plans" element={<ImplementationPlansCMS />} />
            <Route path="command-palette" element={<CommandPaletteCMS />} />
            <Route path="ai-assistant" element={<AiAssistantCMS />} />
            <Route path="messages" element={<MessagesInbox />} />
            <Route path="footer" element={<FooterSubscribersCMS />} />
            <Route path="settings" element={<SettingsCMS />} />
          </Route>
        </Route>

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
