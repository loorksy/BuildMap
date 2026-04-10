# 🚀 BuildMap Universe - Phase 1 Implementation Plan

## 📅 تاريخ البدء: 10 أبريل 2026
## 🎯 الهدف: Community Foundation (الأساس المجتمعي)

---

## ✅ Phase 1 Checklist

### 🗄️ المرحلة 1: قاعدة البيانات (Database Schema)

- [ ] تحديث Users Collection
  - [ ] إضافة role: ["idea_owner", "builder", "buyer"]
  - [ ] إضافة profile: {avatar, bio, location, skills, portfolio_urls}
  - [ ] إضافة stats: {projects_published, followers_count, points, level}
  - [ ] إضافة verification: {email_verified, github_verified}
  
- [ ] إنشاء Public_Projects Collection
  - [ ] Schema كامل حسب البرومبت
  - [ ] Indexes: owner_id, visibility, category, created_at
  
- [ ] إنشاء Comments Collection
  - [ ] دعم nested replies (parent_comment_id)
  - [ ] أنواع التعليقات (comment, code_review, suggestion, question)
  - [ ] Reactions system
  
- [ ] إنشاء Follows Collection
  - [ ] follower_id + following_id
  - [ ] Index مركب لمنع التكرار
  
- [ ] إنشاء Saves Collection
  - [ ] user_id + project_id
  - [ ] created_at للترتيب
  
- [ ] إنشاء Notifications Collection
  - [ ] أنواع الإشعارات المختلفة
  - [ ] is_read flag

---

### 🔌 المرحلة 2: Backend APIs - Core

#### Authentication & Users
- [ ] POST /api/auth/register - تحديث لدعم الأدوار
- [ ] GET /api/users/:id/profile - البروفايل العام
- [ ] PUT /api/users/profile - تحديث البروفايل الشخصي
- [ ] GET /api/users/:id/projects - مشاريع مستخدم محدد
- [ ] GET /api/users/:id/stats - إحصائيات المستخدم

#### Projects Publishing
- [ ] POST /api/projects/:id/publish - نشر مشروع
- [ ] PUT /api/projects/:id/visibility - تغيير مستوى الخصوصية
- [ ] PUT /api/projects/:id/public-settings - تحديد المخرجات العامة
- [ ] GET /api/projects/:id/public - صفحة المشروع العامة

#### Explore & Discovery
- [ ] GET /api/explore - Explore Feed
  - Query params: category, tech, sort, page, limit
- [ ] GET /api/explore/trending - المشاريع الرائجة
- [ ] GET /api/explore/search - البحث الذكي
  - Query param: q (search query)

---

### 🔌 المرحلة 3: Backend APIs - Social Features

#### Follow System
- [ ] POST /api/users/:id/follow - متابعة مستخدم
- [ ] DELETE /api/users/:id/follow - إلغاء متابعة
- [ ] GET /api/users/:id/followers - قائمة المتابعين
- [ ] GET /api/users/:id/following - قائمة من يتابع
- [ ] GET /api/users/:id/is-following - هل أتابع هذا المستخدم

#### Save System
- [ ] POST /api/projects/:id/save - حفظ مشروع
- [ ] DELETE /api/projects/:id/save - إلغاء حفظ
- [ ] GET /api/saves - مشاريعي المحفوظة
- [ ] GET /api/projects/:id/is-saved - هل حفظت هذا المشروع

#### Comments System
- [ ] GET /api/projects/:id/comments - جلب التعليقات
  - دعم pagination
  - دعم nested replies
- [ ] POST /api/projects/:id/comments - إضافة تعليق
- [ ] POST /api/comments/:id/reply - الرد على تعليق
- [ ] PUT /api/comments/:id/reaction - إضافة/إزالة reaction
- [ ] DELETE /api/comments/:id - حذف تعليق
- [ ] PUT /api/comments/:id - تعديل تعليق

#### Notifications
- [ ] GET /api/notifications - جلب الإشعارات
- [ ] PUT /api/notifications/:id/read - تعليم كمقروء
- [ ] PUT /api/notifications/read-all - تعليم الكل كمقروء
- [ ] DELETE /api/notifications/:id - حذف إشعار

#### Stats & Views
- [ ] POST /api/projects/:id/view - تسجيل مشاهدة
- [ ] GET /api/projects/:id/stats - إحصائيات المشروع

---

### 🎨 المرحلة 4: Frontend - Routing & Core

- [ ] تحديث App.js routing
  - [ ] /explore - Explore Feed
  - [ ] /profile/:username - Public Profile
  - [ ] /profile/edit - Edit Profile
  - [ ] /project/:id/public - Public Project Page
  - [ ] /saves - Saved Projects
  - [ ] /notifications - Notifications Page
  
- [ ] تحديث Navigation/Header
  - [ ] زر Explore في الـ Nav
  - [ ] Notifications Bell (مع عداد)
  - [ ] User dropdown (Profile, Saves, Settings)

---

### 🎨 المرحلة 5: Frontend - Profile Pages

#### UserProfilePage.js
- [ ] معلومات البروفايل
  - [ ] Avatar + Name + Bio + Location
  - [ ] Stats (مشاريع، متابعين، متابَعين، نقاط)
  - [ ] Skills badges
  - [ ] Portfolio links
  - [ ] GitHub link (إن وُجد)
- [ ] زر Follow/Unfollow (إن لم يكن بروفايلك)
- [ ] زر Edit Profile (إن كان بروفايلك)
- [ ] Tabs:
  - [ ] Projects (مشاريعه المنشورة)
  - [ ] Activity (نشاطه الأخير)
  
#### EditProfilePage.js
- [ ] نموذج تعديل البروفايل
  - [ ] رفع/تغيير Avatar
  - [ ] Name, Bio, Location, Website
  - [ ] Skills (multi-select أو tags)
  - [ ] Portfolio URLs (إضافة/حذف)
  - [ ] Social links (GitHub, LinkedIn, Twitter)
- [ ] زر Save Changes

---

### 🎨 المرحلة 6: Frontend - Explore Feed

#### ExplorePage.js
- [ ] Hero Section
  - [ ] عنوان + وصف قصير
  - [ ] شريط بحث ذكي (مع اقتراحات)
- [ ] FilterSidebar
  - [ ] فلترة حسب Category
  - [ ] فلترة حسب Tech Stack
  - [ ] فلترة حسب Status (idea, in_development, completed)
  - [ ] Sorting (newest, trending, most_viewed, for_sale)
- [ ] Projects Grid
  - [ ] عرض بطاقات المشاريع
  - [ ] Infinite scroll أو Pagination
  - [ ] Empty state عند عدم وجود نتائج
  
#### ProjectCard Component
- [ ] عنوان المشروع + وصف مختصر
- [ ] شارات التقنيات (React, FastAPI, etc.)
- [ ] تقييم المجتمع (Stars)
- [ ] عدد المشاهدات والتعليقات والإعجابات
- [ ] شارة "للبيع 🏷️" + السعر (إن كان معروضاً)
- [ ] صورة صاحب المشروع + اسمه (رابط للبروفايل)
- [ ] زر Save سريع
- [ ] Hover effects

---

### 🎨 المرحلة 7: Frontend - Public Project Page

#### PublicProjectPage.js
- [ ] Hero Section
  - [ ] اسم المشروع
  - [ ] الوصف الكامل
  - [ ] شارات التقنيات
  - [ ] تاريخ النشر
  - [ ] صاحب المشروع (avatar + اسم + زر Follow)
  - [ ] Stats (مشاهدات، تعليقات، saves)
  - [ ] أزرار: Save, Share
  
- [ ] Public Outputs Section
  - [ ] Tabs للمخرجات المتاحة
  - [ ] Work Plan (مختصر)
  - [ ] Mind Map التفاعلية
  - [ ] Tech Stack المختار
  - [ ] زر "Get Full Access" إن كان للبيع
  
- [ ] Interaction Section
  - [ ] ReactionBar (🔥 فكرة قوية، 💰 مربحة، etc.)
  - [ ] Comments Section
  
- [ ] Sidebar (optional)
  - [ ] صاحب المشروع
  - [ ] مشاريع مشابهة
  - [ ] Call-to-Action (شراء أو تقديم عرض)

---

### 🎨 المرحلة 8: Frontend - Comments System

#### CommentsSection Component
- [ ] Header (عدد التعليقات)
- [ ] فلترة/ترتيب (newest, oldest, most_helpful)
- [ ] CommentForm لإضافة تعليق جديد
- [ ] قائمة التعليقات (مع nested replies)

#### CommentItem Component
- [ ] Avatar + Name + Date
- [ ] نوع التعليق (badge: 💬 عادي، 🔍 code review، etc.)
- [ ] المحتوى (مع دعم Markdown)
- [ ] ReactionBar (Reactions سريعة)
- [ ] أزرار: Reply, Edit (إن كان تعليقك), Delete
- [ ] Nested Replies (مع indent)

#### CommentForm Component
- [ ] Textarea لكتابة التعليق
- [ ] اختيار نوع التعليق (Dropdown)
- [ ] Mention support (@username)
- [ ] Markdown preview (optional)
- [ ] زر Submit

#### ReactionBar Component
- [ ] 5 Reactions: 🔥 💰 ✅ 🤔 🔄
- [ ] عرض عدد كل reaction
- [ ] Highlight إن ضغطت عليه
- [ ] Tooltip مع أسماء من ضغطوا

---

### 🎨 المرحلة 9: Frontend - Notifications

#### NotificationBell Component (في الـ Header)
- [ ] أيقونة الجرس
- [ ] Badge بعدد الإشعارات الجديدة
- [ ] Dropdown عند النقر
  - [ ] قائمة آخر 5 إشعارات
  - [ ] زر "View All"
  - [ ] زر "Mark all as read"

#### NotificationsPage.js
- [ ] قائمة كل الإشعارات
- [ ] تجميع حسب التاريخ (اليوم، أمس، هذا الأسبوع)
- [ ] أنواع الإشعارات:
  - [ ] New follower
  - [ ] New comment on your project
  - [ ] Someone saved your project
  - [ ] Your project is trending
  - [ ] Reply to your comment
- [ ] زر حذف/تعليم كمقروء لكل إشعار

---

### 🎨 المرحلة 10: Frontend - Social Components

#### FollowButton Component
- [ ] زر "متابعة" / "إلغاء المتابعة"
- [ ] Loading state
- [ ] تحديث العدد فورياً

#### SaveButton Component
- [ ] أيقونة Bookmark (فارغة/ممتلئة)
- [ ] Tooltip: "Save" / "Saved"
- [ ] تأثير عند النقر

#### FollowersModal Component
- [ ] Modal يعرض قائمة المتابعين/المتابَعين
- [ ] Tabs: Followers / Following
- [ ] كل مستخدم: Avatar + Name + Bio + زر Follow
- [ ] Search داخل القائمة

#### SavedProjectsPage.js
- [ ] عنوان "مشاريعي المحفوظة"
- [ ] Grid من المشاريع المحفوظة
- [ ] Empty state عند عدم وجود مشاريع

---

### 🔧 المرحلة 11: تحديثات على الصفحات الحالية

#### DashboardPage.js
- [ ] زر "Publish Project" لكل مشروع
  - [ ] Dialog لاختيار مستوى الخصوصية
  - [ ] اختيار المخرجات العامة
  - [ ] Confirmation
- [ ] Badge "Published" للمشاريع المنشورة
- [ ] زر "View Public Page" للمشاريع المنشورة

#### ProjectPage.js
- [ ] زر "Share" في الـ Header
  - [ ] Copy link
  - [ ] Share على Twitter/LinkedIn (optional)
- [ ] Indicator إن كان المشروع منشوراً

---

### 🧪 المرحلة 12: Testing & Quality

#### Backend Testing
- [ ] اختبار كل API endpoint
- [ ] التحقق من الـ Authentication & Authorization
- [ ] اختبار edge cases (مثلاً: follow نفسك)
- [ ] اختبار pagination
- [ ] اختبار search functionality

#### Frontend Testing
- [ ] اختبار كل صفحة على Desktop
- [ ] اختبار كل صفحة على Mobile
- [ ] اختبار الـ Routing
- [ ] اختبار Loading states
- [ ] اختبار Error states
- [ ] اختبار Empty states

#### Integration Testing
- [ ] تدفق كامل: تسجيل → نشر مشروع → استكشاف → تعليق
- [ ] تدفق Follow → Notification → View Profile
- [ ] تدفق Save → View Saved Projects

---

### 🎨 المرحلة 13: Design & UX Polish

- [ ] التأكد من consistency مع Impeccable Design System
- [ ] تحسين Responsive design
- [ ] إضافة Animations (fade-in, slide, etc.)
- [ ] تحسين Loading states (Skeletons)
- [ ] تحسين Error messages (user-friendly)
- [ ] Accessibility (a11y):
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] ARIA labels

---

### 📝 المرحلة 14: Documentation

- [ ] تحديث API Documentation
- [ ] إضافة comments في الكود
- [ ] User Guide للميزات الجديدة
- [ ] تحديث README.md

---

## 📊 Progress Tracking

```
Phase 1 Progress: 0% (0/54 tasks completed)

المرحلة 1 (قاعدة البيانات):     [ ] 0/6
المرحلة 2 (Backend Core):        [ ] 0/9
المرحلة 3 (Backend Social):      [ ] 0/13
المرحلة 4 (Frontend Routing):    [ ] 0/2
المرحلة 5 (Profile Pages):       [ ] 0/2
المرحلة 6 (Explore Feed):        [ ] 0/3
المرحلة 7 (Public Project):      [ ] 0/4
المرحلة 8 (Comments System):     [ ] 0/4
المرحلة 9 (Notifications):       [ ] 0/2
المرحلة 10 (Social Components):  [ ] 0/4
المرحلة 11 (Updates):            [ ] 0/2
المرحلة 12 (Testing):            [ ] 0/3
المرحلة 13 (Design Polish):      [ ] 0/6
المرحلة 14 (Documentation):      [ ] 0/4
```

---

## 🚀 التالي: البدء بالتنفيذ!

سأبدأ الآن بـ **المرحلة 1: قاعدة البيانات** ثم **المرحلة 2: Backend APIs Core**

---

**آخر تحديث:** 10 أبريل 2026
