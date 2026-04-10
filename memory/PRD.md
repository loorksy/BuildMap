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

## What's Been Implemented (April 10, 2026)

### Design Improvements (Latest)
- ✅ Dark/Light mode toggle with persistence
- ✅ Rounded corners (rounded-xl, rounded-2xl) on all elements
- ✅ Lucide-react icons replacing emojis
- ✅ Arabic error messages with clear explanations
- ✅ Dynamic model loading from OpenRouter API
- ✅ Professional design similar to app.emergent.sh
- ✅ Glass morphism header
- ✅ Gradient text effects
- ✅ Better shadows and hover states

### Vibe Coding Experience (Latest)
- ✅ Smart progress bar with 5 stages (فهم الفكرة, الفئة المستهدفة, المشكلة والحل, الميزات, المتطلبات التقنية)
- ✅ Quick suggestions with icons based on current stage
- ✅ Live project summary panel (type, features, technologies)
- ✅ Conversation analysis API endpoint
- ✅ Files preview panel for generated outputs
- ✅ Stage-aware AI prompts for smarter responses
- ✅ Auto-detect project type and features from conversation
- ✅ Progress percentage indicator

### Backend APIs
- ✅ Auth: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
- ✅ API Keys: /api/api-keys (GET, POST, DELETE)
- ✅ Projects: /api/projects (CRUD)
- ✅ Messages: /api/projects/:id/messages (GET, POST)
- ✅ Outputs: /api/projects/:id/generate, /api/projects/:id/outputs
- ✅ Models: /api/models

### Frontend Pages
- ✅ Landing Page - Arabic RTL with hero section
- ✅ Login/Register Pages
- ✅ Dashboard - Projects list, API Key management
- ✅ Project Page - Chat interface, Output tabs

### Features
- ✅ JWT authentication with httpOnly cookies
- ✅ Encrypted API key storage
- ✅ Real-time chat with OpenRouter AI
- ✅ 6 output types generation
- ✅ Mind map visualization
- ✅ Copy/Download outputs
- ✅ Model selection per project
- ✅ Conversation persistence

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] User authentication
- [x] API key management
- [x] Chat with AI
- [x] Output generation

### P1 (Important)
- [ ] Project memory summary for long conversations
- [ ] Streaming responses for better UX
- [ ] Export all outputs as ZIP

### P2 (Nice to have)
- [ ] Dark mode toggle
- [ ] Project sharing/collaboration
- [ ] Usage analytics dashboard
- [ ] Multiple API providers support

## Next Tasks
1. Add streaming responses for chat
2. Implement conversation summary for context optimization
3. Add export all outputs feature
4. Enhance mind map visualization with interactive library
