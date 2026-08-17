// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Components
import Navbar from './components/Navbar/Navbar';
import Header from './components/Header/Header';
import About from './components/About/About';
import Projects from './components/Projects/Projects';
import FunGame from './components/FunGame/FunGame';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import StandaloneArcadeWindow from './components/FunGame/StandaloneArcadeWindow';
import AiAssistant from './components/AiAssistant/AiAssistant';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminAuthGuard from './admin/AdminAuthGuard';
import AdminLayout from './admin/AdminLayout';
import DashboardOverview from './admin/DashboardOverview';
import NavbarCMS from './admin/NavbarCMS';
import HeroCMS from './admin/HeroCMS';
import AboutCMS from './admin/AboutCMS';
import SkillsCMS from './admin/SkillsCMS';
import TimelineCMS from './admin/TimelineCMS';
import ProjectsCMS from './admin/ProjectsCMS';
import PlaygroundCMS from './admin/PlaygroundCMS';
import GamesCMS from './admin/GamesCMS';
import DocumentsCMS from './admin/DocumentsCMS';
import ImplementationPlansCMS from './admin/ImplementationPlansCMS';
import AiAssistantCMS from './admin/AiAssistantCMS';
import MessagesInbox from './admin/MessagesInbox';
import FooterSubscribersCMS from './admin/FooterSubscribersCMS';
import SettingsCMS from './admin/SettingsCMS';
import UsersActivityCMS from './admin/UsersActivityCMS';
import AuthModal from './components/AuthModal/AuthModal';
import { useAuth } from './context/AuthContext';

function PublicPortfolio() {
  const { authModalOpen, closeAuthModal, authModalPrompt, authModalMode } = useAuth();
  return (
    <>
      <Navbar />
      <Header />
      <About />
      <Projects />
      <FunGame />
      <Contact />
      <Footer />
      <AiAssistant />
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
    <Routes>
      {/* ── Public Portfolio Home ── */}
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
          <Route path="about" element={<AboutCMS />} />
          <Route path="skills" element={<SkillsCMS />} />
          <Route path="timeline" element={<TimelineCMS />} />
          <Route path="projects" element={<ProjectsCMS />} />
          <Route path="playground" element={<PlaygroundCMS />} />
          <Route path="games" element={<GamesCMS />} />
          <Route path="docs" element={<DocumentsCMS />} />
          <Route path="plans" element={<ImplementationPlansCMS />} />
          <Route path="ai-assistant" element={<AiAssistantCMS />} />
          <Route path="messages" element={<MessagesInbox />} />
          <Route path="footer" element={<FooterSubscribersCMS />} />
          <Route path="settings" element={<SettingsCMS />} />
        </Route>
      </Route>

      {/* Fallback to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
