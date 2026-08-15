<div align="center">

# ⚡ MCA WALLAH | Personal Portfolio & CMS Studio

<p align="center">
  <strong>A state-of-the-art, full-stack developer portfolio and dynamic CMS built with React, Node.js, Express, and MongoDB.</strong>
</p>

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br />

[Live Demo](#-getting-started) • [Features](#-core-features) • [Admin Studio](#-admin-cms-studio) • [Gaming Arcade](#-interactive-gaming-arcade) • [Installation](#-getting-started) • [API Routes](#-api-endpoints)

</div>

---

## 📖 Overview

**MCA WALLAH Portfolio** is an ultra-modern, dynamic portfolio website and content management system designed for full-stack developers. It features bespoke glassmorphism aesthetics, fluid micro-interactions, real-time cross-tab updates via BroadcastChannel, a permanent Multi-Resume Vault, and an interactive Developer Gaming Arcade with global leaderboards.

Every single visual section — from navbar presentation styles to hero layouts, project categories, and contact triggers — is 100% customizable in real-time through the protected Admin Studio.

---

## ✨ Core Features

### 🧭 1. Dynamic Navigation & Header Dock
* **4 Distinct Presentation Styles**:
  * 💎 **Floating Frosted Glass Dock**: macOS-inspired floating island capsule with `backdrop-filter: blur(28px)`.
  * ⚡ **Cyber Neon Capsule**: Neo-Dev cyberpunk HUD with glowing neon border auras.
  * 🌌 **Minimalist Island Pill**: Streamlined compact dock with adaptive auto-fit geometry.
  * 📜 **Classic Full-Width Bar**: Edge-to-edge sticky navigation bar.
* **Custom Brand Identity**: Dynamic prefix/suffix (`<` / `/>`), brand text, and animated live pulsing dot.
* **🟢 Live Availability Badge**: Top-level status pill (e.g., *"Available for work"*).
* **🚀 Customizable "Let's Talk" CTA Button**: 4 button styling presets (Vibrant Gradient Glow, Cyber Neon Outline, Frosted Glass Pill, Solid Brand Accent) with customizable icon & target anchor.
* **Dark / Light Theme Engine**: Synchronized with user profile preferences and saved in `localStorage`.

### 🌌 2. Multi-Style Hero Section & Draggable Backdrop Widget
* **4 Selectable Hero Layouts**:
  * 💎 **Glassmorphic Floating Capsule**: Central glowing capsule with quick stat chips.
  * ⚡ **Two-Column Developer Split**: Left copy + Right interactive MacOS Code IDE with syntax highlighting and instant copy.
  * 🌌 **Minimalist Editorial Spotlight**: High-impact bold typography with radial ambient glow.
  * 🕹️ **Retro-Futuristic Hologram**: Cyber neon badges and angular cutouts.
* **Interactive Draggable Background Widget (`⬡ Background`)**:
  * Fully movable anywhere across the screen via mouse drag or mobile touch.
  * 8 dynamic backdrop presets: *Mesh Gradient*, *Aurora Borealis*, *Cyber Neon*, *Grid Matrix*, *Sunset*, *Deep Space*, *Clean Dark*, *Ocean Wave*, plus a **Custom Color Picker**.
  * Remembers drag coordinates across sessions.

### 📄 3. Permanent Resume Vault & Multi-Button Controller
* **Permanent Resume Library**: Resumes uploaded in the Admin panel are permanently stored in the vault with date and file size tracking.
* **Multi-Button Visibility Limiter**: Admin can activate up to **3 simultaneous resume buttons** on the portfolio with custom titles.
* **Header Sync & Dynamic Dropdown**: Header download button automatically syncs with the primary resume or renders a glassmorphic multi-resume dropdown with inline preview (`↗`) and direct download (`⬇`).

### 📂 4. Projects & Skills Showcase
* **Category Filtering**: Smooth filtering by Full Stack, Frontend, Python, UI/UX, or Open Source.
* **Featured Projects**: Live preview links, GitHub repository buttons, star/fork counters, and tech tags.
* **Animated Skills Meter**: Filterable skill bars categorized by Frontend, Backend, Database, and DevOps.

### 🎮 5. Interactive Gaming Arcade & Standalone Window
* **Built-in Developer Classics**:
  * 🐍 **Retro Snake**: Classic grid-based gameplay with difficulty multipliers.
  * ❌ **Tic-Tac-Toe**: Unbeatable Minimax AI mode and local 2-Player mode.
  * ⌨️ **Speed Typing Challenge**: WPM meter, accuracy tracker, and live timer.
  * 🧩 **15-Puzzle Sliding Tiles**: Move counter and interactive tile rearrangement.
* **Global Leaderboards**: Saves high scores, player handles, and timestamps to MongoDB.
* **Dual Display Mode**: Play inside the interactive inline modal or open the **Dedicated Standalone Window (`/arcade`)**.

### 📬 6. Contact & Feedback Engine
* Direct contact form with client-side validation and backend rate limiting.
* Automated email notification integration via Nodemailer.
* IP address and User-Agent logging for security.

---

## 🎛️ Admin CMS Studio

Protected behind JWT authentication (`/admin/login`), the Admin Studio provides full control over all content:

```
├── 📊 Dashboard Overview   -> Real-time visitor analytics, message counters & breakdown
├── 🧭 Navbar & Menu        -> Presentation style, dock shape, logo text, links & CTA button
├── 🪄 Hero & Header        -> Layout selector, typewriter roles, tech pills & social links
├── 👤 About Me             -> Bio, quick stats, hobbies, avatar upload & Permanent Resume Vault
├── 💡 Skills & Tools       -> Skill names, proficiency sliders, icons & categories
├── ⏳ Timeline             -> Education & experience chronological milestones
├── 📂 Projects             -> Project cards, tags, GitHub URLs, live links & visibility
├── 🎮 Games Hub            -> Game catalog, descriptions, visibility & leaderboard scores
├── 📥 Feedback Inbox       -> View, mark as read, and delete incoming contact messages
└── ⚙️ Settings & Backup    -> SEO meta tags, maintenance mode, data export & reset
```

---

## 🛠️ Architecture & Tech Stack

```
Portfolio
├── Client (Frontend)
│   ├── React 19 + Vite 8
│   ├── Vanilla CSS (Modern Design Tokens, Glassmorphism, CSS Grid & Flexbox)
│   ├── React Router 7 (SPA Routing + Protected Admin Guards)
│   ├── FontAwesome 6 Icons
│   └── HTML5 Canvas Particle Engine
│
└── Server (Backend)
    ├── Node.js + Express 4
    ├── MongoDB + Mongoose 8
    ├── JWT Authentication & BCrypt Password Hashing
    ├── Multer (File & Resume Uploads)
    ├── Nodemailer (Contact Notification Emails)
    └── Express Rate Limit & Helmet
```

---

## 📁 Project Directory Structure

```plaintext
Portfolio/
├── public/                     # Static assets (Favicons, Resume PDFs)
├── server/                     # Backend Express API & Database
│   ├── config/                 # Database connection (db.js)
│   ├── controllers/            # Portfolio & Admin business logic
│   ├── middleware/             # Auth guards & Multer file upload
│   ├── models/                 # Mongoose schemas (Hero, About, Navbar, Project, etc.)
│   ├── routes/                 # Express API route endpoints
│   ├── seeds/                  # Initial database seeding scripts
│   ├── services/               # Email service & helper utilities
│   ├── uploads/                # Dynamic uploaded resumes & avatars
│   └── server.js               # Main backend entry point (Port: 5000)
│
├── src/                        # Frontend React Application
│   ├── admin/                  # Protected Admin Studio CMS components
│   │   ├── AdminLayout.jsx     # Sidebar navigation & responsive admin shell
│   │   ├── NavbarCMS.jsx       # Dedicated Navbar styling & CTA customizer
│   │   ├── HeroCMS.jsx         # Hero layout style switcher & content editor
│   │   ├── AboutCMS.jsx        # Resume Vault & profile management
│   │   ├── ProjectsCMS.jsx     # Projects CRUD & ordering
│   │   ├── GamesCMS.jsx        # Arcade management & scores
│   │   └── admin.css           # Admin Studio design system
│   │
│   ├── components/             # Reusable Public UI Components
│   │   ├── Navbar/             # Floating Dock / Cyber / Full-Width Navbar
│   │   ├── Header/             # Multi-Style Hero & Draggable Background Widget
│   │   ├── About/              # Bio, dynamic quick stats, hobbies & resume pills
│   │   ├── Projects/           # Filterable projects grid & dynamic cards
│   │   ├── FunGame/            # Snake, TicTacToe, Typing, 15-Puzzle & Arcade
│   │   ├── Contact/            # Contact form & social media triggers
│   │   ├── Footer/             # Clean footer & quick back-to-top button
│   │   └── AuthModal/          # Visitor & user authentication modal
│   │
│   ├── context/                # Global State (AuthContext, DataContext)
│   ├── App.jsx                 # Route definitions & public/admin layout setup
│   ├── main.jsx                # React root entry point
│   └── index.css               # Global theme tokens, fonts & animations
│
├── .env.example                # Example environment variables
├── package.json                # Project dependencies & scripts
└── vite.config.js              # Vite configuration
```

---

## 🚀 Getting Started

### 📋 Prerequisites
* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **MongoDB**: Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI ([Download MongoDB](https://www.mongodb.com/try/download/community))
* **Git**: Installed on your system

---

### 📥 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Mahadebmaity/MCAWALLAH.git
cd Portfolio

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

### ⚙️ 2. Environment Configuration

Create a `.env` file inside the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_cms

# JWT Secret for Admin Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Optional Email Notifications (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
CONTACT_RECEIVER_EMAIL=mahadeb@portfolio.com
```

---

### 🗄️ 3. Seed Initial Database Data

To populate your database with default hero info, resume vault entries, projects, skills, and navbar settings:

```bash
cd server
node seeds/seedData.js
cd ..
```

---

### 💻 4. Run Locally

Open two terminal windows:

#### Terminal 1: Start Backend API (Port 5000)
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

#### Terminal 2: Start Frontend Client (Port 5173)
```bash
npm run dev
# Vite dev server running on http://localhost:5173
```

Now open **`http://localhost:5173`** in your browser!

---

## 📡 API Endpoints

### 🌐 Public Routes (`/api/portfolio`)
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/portfolio/public` | Fetches aggregated portfolio data (Hero, About, Navbar, Projects, Skills, Timeline, Games) |
| `POST` | `/api/portfolio/contact` | Submits feedback/contact message |
| `POST` | `/api/portfolio/analytics` | Logs anonymous visitor page view |
| `GET` | `/api/portfolio/games/scores/:slug` | Retrieves top leaderboard scores for a game |
| `POST` | `/api/portfolio/games/scores` | Submits a new high score to the leaderboard |

### 🔒 Admin Routes (`/api/admin`) *(Requires Bearer Token)*
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Dashboard stats, message inbox counts & recent traffic |
| `GET` | `/api/admin/section/:type` | Retrieves CMS data for a section (`navbar`, `hero`, `about`, `projects`, etc.) |
| `POST` | `/api/admin/section/:type` | Creates or updates section items in MongoDB |
| `PUT` | `/api/admin/section/:type/:id` | Updates a specific item by ID |
| `DELETE` | `/api/admin/section/:type/:id` | Removes an item by ID |
| `POST` | `/api/admin/upload/resume` | Uploads PDF/Doc resume to the permanent vault |
| `POST` | `/api/admin/upload/avatar` | Uploads profile avatar photo |

---

## 📱 Mobile Responsiveness & Accessibility

* **Fluid Viewports**: Seamlessly adapts from wide 4K displays down to narrow 360px mobile screens.
* **Touch-Friendly Controls**: Minimum 44px touch targets on buttons, sliders, and draggable handles.
* **Scroll Lock & Drawer Animation**: Fluid slide-out drawer navigation on mobile devices with backdrop blur.
* **SEO Optimized**: Semantic HTML5 landmark tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), structured meta tags, and high-contrast typography.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Crafted with ❤️ by <strong>Mahadeb Maity</strong> (MCA WALLAH)
</div>
