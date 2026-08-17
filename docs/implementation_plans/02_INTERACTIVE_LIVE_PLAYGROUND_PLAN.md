# Feature 2: Interactive Project Live Playground & Sandbox CMS
**Status:** In Progress 🚀  
**Target:** Public Portfolio Projects Showcase & Admin Studio

---

## Overview
An interactive inline code sandbox and live working application playground that allows recruiters and visitors to interact with projects directly inside the portfolio without leaving the page. Includes responsive device viewport switchers (Desktop 100%, Tablet 768px, Mobile 375px) and source code architecture breakdown.

## Architecture
- **Public Sandbox Modal:** Glassmorphic modal with device viewport switcher, live embedded app frame, and multi-file code inspector with syntax highlighting & 1-tap copy.
- **Dedicated Playground CMS (`/admin/playground`):** Add, edit, and manage project sandboxes, code snippets, live URLs, device frames, and live tester directly inside Admin Studio.
- **Backend Storage:** MongoDB `Playground` collection with public and admin RESTful API endpoints.
