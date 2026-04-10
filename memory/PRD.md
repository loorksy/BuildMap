# BuildMap - Product Requirements Document

## Original Problem Statement
منصة SaaS باسم "BuildMap" تهدف إلى تحويل الأفكار العشوائية إلى مشاريع تقنية منظمة وجاهزة للتنفيذ. المنصة باللغة العربية بالكامل (واجهة + محتوى + RTL).

## User Personas
1. **رواد الأعمال** - لديهم أفكار مشاريع ويحتاجون لتحويلها لخطط تقنية
2. **المطورون المبتدئون** - يريدون فهم كيفية بناء مشاريعهم
3. **مدراء المنتجات** - يحتاجون لتوثيق تقني للمشاريع

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + @xyflow/react
- **Backend**: FastAPI + MongoDB
- **AI Integration**: OpenRouter, OpenAI, Anthropic, Google AI (multi-provider)
- **Authentication**: JWT with httpOnly cookies
- **AI System**: Multi-agent architecture with NLP analysis

## What's Been Implemented

### Phase 1 - MVP (Completed)
- JWT Authentication, MongoDB setup, OpenRouter model fetching
- Dark/Light Mode, Professional Vibe Coding UI, CORS cookie session
- 6 output types generation

### Phase 2 - Advanced AI System (Completed - April 10, 2026)
- Multi-Agent Architecture, Skills Library, NLP, Verification Loop
- ZIP export for all outputs + analysis

### Phase 3 - Streaming (Completed - April 10, 2026)
- SSE streaming endpoint, fetch + ReadableStream, blinking cursor

### Phase 4 - Multi-Provider + Mind Map (Completed - April 10, 2026)
- **Multi-Provider API Support**: OpenRouter, OpenAI, Anthropic, Google AI
  - Provider selection grid in API Key dialog
  - Automatic routing to correct provider based on model
  - Models aggregated from all connected providers
  - New endpoints: GET /api/providers, DELETE /api/api-keys/{provider}
- **Interactive Mind Map**: @xyflow/react with custom nodes, radial layout,
  zoom/pan, drag, animated edges

### Backend APIs
- Auth: register, login, logout, me
- Keys: GET/POST/DELETE /api/api-keys, DELETE /api/api-keys/{provider}
- Providers: GET /api/providers
- Projects: CRUD, analysis, messages, messages/stream, generate, outputs, export
- Models: GET /api/models (aggregated)

## Prioritized Backlog

### P0 (Critical) - ALL DONE
- [x] Authentication, API keys, Chat, Outputs, NLP, ZIP, Streaming
- [x] Multi-provider support
- [x] Interactive mind map

### P1 (Important)
- [ ] Project sharing/collaboration
- [ ] Usage analytics dashboard

### P2 (Nice to have)
- [ ] Real-time collaboration
- [ ] Template library
