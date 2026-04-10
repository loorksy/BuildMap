# BuildMap - Product Requirements Document

## Original Problem Statement
منصة SaaS باسم "BuildMap" تهدف إلى تحويل الأفكار العشوائية إلى مشاريع تقنية منظمة وجاهزة للتنفيذ. المنصة باللغة العربية بالكامل (واجهة + محتوى + RTL).

## User Personas
1. **رواد الأعمال** - لديهم أفكار مشاريع ويحتاجون لتحويلها لخطط تقنية
2. **المطورون المبتدئون** - يريدون فهم كيفية بناء مشاريعهم
3. **مدراء المنتجات** - يحتاجون لتوثيق تقني للمشاريع

## Core Requirements
- نظام مصادقة JWT مع تسجيل/دخول
- إدارة مفاتيح OpenRouter API
- Chat تفاعلي مع الذكاء الاصطناعي
- توليد 6 مخرجات (README-Frontend, README-Backend, Plan, Skills, Evaluation, Mind Map)
- دعم RTL كامل للعربية
- تصميم متجاوب Mobile/Desktop

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Backend**: FastAPI + MongoDB
- **AI Integration**: OpenRouter API
- **Authentication**: JWT with httpOnly cookies
- **AI System**: Multi-agent architecture with NLP analysis

## What's Been Implemented

### Phase 1 - MVP (Completed)
- JWT Authentication flow (register, login, logout, me)
- MongoDB Database setup for users, api_keys, projects, messages, outputs
- OpenRouter dynamic model fetching
- Dark/Light Mode toggle
- Professional Vibe Coding UI with RTL, progress bar, and file previews
- CORS and Cross-Origin Cookie session
- 6 output types generation (Frontend README, Backend README, Plan, Skills, Evaluation, MindMap)

### Phase 2 - Advanced AI System (Completed - April 10, 2026)
- Multi-Agent Architecture (Planner, Reviewer, Evaluator, Architect, Security)
- Skills Library (8 skills: TDD, API Design, Security, Database, Frontend, Backend, DevOps, Mobile)
- Advanced NLP for feature extraction (Arabic + English pattern matching)
- Technology detection from conversation
- Project type detection (web_app, mobile_app, api, ecommerce, saas, dashboard)
- Complexity analysis with estimated time and team size
- Verification Loop (requirements, design, security, quality, completeness)
- Memory & Learning system for pattern recognition
- Enhanced chat system prompts with agent-based context
- ZIP export for all project outputs including analysis report

### Backend APIs
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET/POST/DELETE /api/api-keys
- GET/POST /api/projects
- GET/PATCH/DELETE /api/projects/:id
- GET /api/projects/:id/analysis (enhanced with AI system)
- GET/POST /api/projects/:id/messages
- POST /api/projects/:id/generate
- GET /api/projects/:id/outputs
- GET /api/projects/:id/export (ZIP download)
- GET /api/models

### Frontend Pages
- Landing Page - Arabic RTL with hero section
- Login/Register Pages
- Dashboard - Projects list, API Key management
- Project Page - Vibe Coding chat interface with enhanced side panel

## Prioritized Backlog

### P0 (Critical) - ALL DONE
- [x] User authentication
- [x] API key management
- [x] Chat with AI
- [x] Output generation
- [x] Advanced AI system with NLP
- [x] ZIP export

### P1 (Important)
- [ ] Streaming responses for better UX
- [ ] Project sharing/collaboration

### P2 (Nice to have)
- [ ] Usage analytics dashboard
- [ ] Multiple API providers support
- [ ] Interactive mind map visualization
