# Feature 1: AI Portfolio Assistant (Developer Digital Twin)
**Status:** Completed & Live 🟢  
**Target:** Public Portfolio & Admin Studio

---

## Overview
A modern, interactive AI Portfolio Assistant that enables recruiters and visitors to converse naturally with an AI version of Mahadeb Maity. Answers questions regarding skills, projects, work experience, resume downloads, and contact options using live portfolio data from MongoDB.

## Architecture
- **Dual-Core Backend Engine:** Supports Google Gemini 3.6 Flash via `@google/genai` when `GEMINI_API_KEY` is present, with an embedded Semantic Knowledge Graph fallback for zero-cost offline operations.
- **Floating Glassmorphic Widget:** Glowing launcher orb, quick prompt chips, real-time typing indicator, and interactive action cards (Download Resume, Jump to Contact, View Projects, Launch Arcade).
- **Dedicated Admin Studio CMS (`/admin/ai-assistant`):** Real-time visitor question transcripts, KPI analytics, persona customizer, prompt builder, action card toggles, and live sandbox simulator.
