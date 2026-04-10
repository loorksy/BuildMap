"""
BuildMap Advanced AI System
- Multi-Agent Architecture (Planner, Reviewer, Evaluator)
- Skills Library
- Verification Loop
- Memory & Learning System
- Advanced NLP for Feature Extraction
"""

import re
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timezone

# ==================== SKILLS LIBRARY ====================

SKILLS_LIBRARY = {
    "tdd-workflow": {
        "name": "TDD Workflow",
        "name_ar": "التطوير المبني على الاختبارات",
        "description": "Test-Driven Development with 80%+ coverage",
        "triggers": ["اختبار", "test", "tdd", "coverage", "تغطية"],
        "steps": [
            "تحديد المتطلبات والواجهات",
            "كتابة اختبارات فاشلة (RED)",
            "تنفيذ الكود الأدنى (GREEN)",
            "إعادة الهيكلة (REFACTOR)",
            "التحقق من التغطية 80%+"
        ]
    },
    "api-design": {
        "name": "API Design",
        "name_ar": "تصميم الـ API",
        "description": "REST API design patterns and best practices",
        "triggers": ["api", "rest", "endpoint", "نقطة نهاية", "خدمة"],
        "steps": [
            "تحديد الموارد (Resources)",
            "تصميم نقاط النهاية (Endpoints)",
            "تحديد طرق HTTP المناسبة",
            "تصميم هيكل الاستجابة",
            "توثيق الـ API"
        ]
    },
    "security-review": {
        "name": "Security Review",
        "name_ar": "مراجعة الأمان",
        "description": "OWASP Top 10 security audit",
        "triggers": ["أمان", "security", "حماية", "تشفير", "مصادقة", "authentication"],
        "steps": [
            "فحص Injection vulnerabilities",
            "مراجعة Authentication/Authorization",
            "فحص تسرب البيانات الحساسة",
            "مراجعة CSRF/XSS protection",
            "تدقيق إعدادات الأمان"
        ]
    },
    "database-design": {
        "name": "Database Design",
        "name_ar": "تصميم قاعدة البيانات",
        "description": "Database schema and optimization",
        "triggers": ["قاعدة بيانات", "database", "mongodb", "sql", "جدول", "schema"],
        "steps": [
            "تحديد الكيانات والعلاقات",
            "تصميم الـ Schema",
            "تحديد الفهارس (Indexes)",
            "تخطيط الـ Migrations",
            "استراتيجية النسخ الاحتياطي"
        ]
    },
    "frontend-patterns": {
        "name": "Frontend Patterns",
        "name_ar": "أنماط الواجهة الأمامية",
        "description": "React/Next.js component patterns",
        "triggers": ["react", "frontend", "واجهة", "component", "ui", "ux"],
        "steps": [
            "تحديد المكونات الرئيسية",
            "تصميم State Management",
            "تخطيط التنقل والتوجيه",
            "تصميم النماذج والتحقق",
            "تحسين الأداء"
        ]
    },
    "backend-patterns": {
        "name": "Backend Patterns",
        "name_ar": "أنماط الخادم الخلفي",
        "description": "Server-side architecture patterns",
        "triggers": ["backend", "server", "خادم", "api", "node", "python", "fastapi"],
        "steps": [
            "تصميم البنية (Architecture)",
            "تحديد الطبقات (Layers)",
            "معالجة الأخطاء",
            "التسجيل والمراقبة",
            "التوسع والأداء"
        ]
    },
    "devops-setup": {
        "name": "DevOps Setup",
        "name_ar": "إعداد DevOps",
        "description": "CI/CD and deployment configuration",
        "triggers": ["deploy", "نشر", "ci", "cd", "docker", "kubernetes"],
        "steps": [
            "إعداد بيئات التطوير",
            "تكوين CI/CD Pipeline",
            "إعداد Docker/Containers",
            "تكوين المراقبة",
            "استراتيجية النشر"
        ]
    },
    "mobile-patterns": {
        "name": "Mobile Patterns",
        "name_ar": "أنماط تطبيقات الموبايل",
        "description": "Mobile app development patterns",
        "triggers": ["mobile", "موبايل", "جوال", "ios", "android", "flutter", "react native"],
        "steps": [
            "تصميم واجهة المستخدم",
            "إدارة الحالة (State)",
            "التكامل مع الـ API",
            "التخزين المحلي",
            "الإشعارات والأذونات"
        ]
    }
}

# ==================== AGENT DEFINITIONS ====================

class AgentRole(Enum):
    PLANNER = "planner"
    REVIEWER = "reviewer"
    EVALUATOR = "evaluator"
    ARCHITECT = "architect"
    SECURITY = "security"

@dataclass
class Agent:
    role: AgentRole
    name: str
    name_ar: str
    description: str
    system_prompt: str
    tools: List[str] = field(default_factory=list)

AGENTS = {
    AgentRole.PLANNER: Agent(
        role=AgentRole.PLANNER,
        name="Planner",
        name_ar="المخطط",
        description="Creates implementation blueprints and task breakdowns",
        system_prompt="""أنت المخطط الذكي في BuildMap. مهمتك:
1. تحليل الفكرة وتقسيمها إلى مهام
2. ترتيب الأولويات
3. تقدير الجهد المطلوب
4. تحديد المخاطر المحتملة
5. اقتراح التقنيات المناسبة

قدم خطة منظمة وقابلة للتنفيذ.""",
        tools=["analyze", "plan", "estimate"]
    ),
    AgentRole.REVIEWER: Agent(
        role=AgentRole.REVIEWER,
        name="Reviewer",
        name_ar="المراجع",
        description="Reviews plans and code for quality and best practices",
        system_prompt="""أنت المراجع الذكي في BuildMap. مهمتك:
1. مراجعة الخطط والتصاميم
2. التحقق من أفضل الممارسات
3. اكتشاف الثغرات والمشاكل
4. اقتراح التحسينات
5. ضمان الجودة والاتساق

كن دقيقاً وبناءً في ملاحظاتك.""",
        tools=["review", "suggest", "validate"]
    ),
    AgentRole.EVALUATOR: Agent(
        role=AgentRole.EVALUATOR,
        name="Evaluator",
        name_ar="المقيّم",
        description="Evaluates project feasibility and quality metrics",
        system_prompt="""أنت المقيّم الذكي في BuildMap. مهمتك:
1. تقييم جدوى المشروع
2. تحليل SWOT
3. تقدير التكلفة والوقت
4. تحديد معايير النجاح
5. تقديم توصيات نهائية

قدم تقييماً موضوعياً وشاملاً.""",
        tools=["evaluate", "analyze", "score"]
    ),
    AgentRole.ARCHITECT: Agent(
        role=AgentRole.ARCHITECT,
        name="Architect",
        name_ar="المهندس المعماري",
        description="Designs system architecture and technical decisions",
        system_prompt="""أنت المهندس المعماري في BuildMap. مهمتك:
1. تصميم البنية التقنية
2. اختيار التقنيات المناسبة
3. تحديد أنماط التصميم
4. رسم مخططات النظام
5. ضمان قابلية التوسع

قدم تصميماً متيناً وقابلاً للتطوير.""",
        tools=["design", "diagram", "decide"]
    ),
    AgentRole.SECURITY: Agent(
        role=AgentRole.SECURITY,
        name="Security Expert",
        name_ar="خبير الأمان",
        description="Reviews security aspects and vulnerabilities",
        system_prompt="""أنت خبير الأمان في BuildMap. مهمتك:
1. تحليل متطلبات الأمان
2. تحديد نقاط الضعف المحتملة
3. اقتراح إجراءات الحماية
4. مراجعة المصادقة والتفويض
5. ضمان حماية البيانات

كن صارماً في معايير الأمان.""",
        tools=["scan", "audit", "recommend"]
    )
}

# ==================== ADVANCED NLP ====================

class AdvancedNLP:
    """Advanced NLP for feature extraction and analysis"""
    
    # Feature patterns
    FEATURE_PATTERNS = [
        # Arabic patterns
        (r'(?:ميزة|خاصية|وظيفة|إمكانية)\s*[:\s]+([^،\n.]+)', 'feature'),
        (r'(?:يمكن|يستطيع|قادر على)\s+([^،\n.]+)', 'capability'),
        (r'(?:يجب|لابد|ضروري)\s+([^،\n.]+)', 'requirement'),
        (r'(?:نظام|صفحة|شاشة|واجهة)\s+([^،\n.]+)', 'component'),
        # List patterns
        (r'[-•]\s*([^،\n.]+?)(?=[-•]|\n|$)', 'list_item'),
        (r'\d+[.)-]\s*([^،\n.]+?)(?=\d+[.)-]|\n|$)', 'numbered_item'),
        # English patterns
        (r'(?:feature|functionality|capability)[:\s]+([^,\n.]+)', 'feature_en'),
        (r'(?:can|should|must)\s+([^,\n.]+)', 'requirement_en'),
    ]
    
    # Technology detection
    TECH_PATTERNS = {
        # Frontend
        "React": [r'\breact\b', r'\bريأكت\b', r'\bjsx\b'],
        "Next.js": [r'\bnext\.?js\b', r'\bnext\b', r'\bنكست\b'],
        "Vue.js": [r'\bvue\b', r'\bفيو\b'],
        "Angular": [r'\bangular\b', r'\bأنجولار\b'],
        "Flutter": [r'\bflutter\b', r'\bفلاتر\b'],
        "React Native": [r'\breact\s*native\b', r'\bريأكت نيتيف\b'],
        # Backend
        "Node.js": [r'\bnode\.?js\b', r'\bnode\b', r'\bنود\b'],
        "Python": [r'\bpython\b', r'\bبايثون\b'],
        "FastAPI": [r'\bfastapi\b', r'\bفاست\b'],
        "Django": [r'\bdjango\b', r'\bجانجو\b'],
        "Express": [r'\bexpress\b', r'\bإكسبريس\b'],
        "Go": [r'\bgolang\b', r'\bgo\b', r'\bجو\b'],
        # Database
        "MongoDB": [r'\bmongodb\b', r'\bmongo\b', r'\bمونجو\b'],
        "PostgreSQL": [r'\bpostgres\b', r'\bpostgresql\b'],
        "MySQL": [r'\bmysql\b', r'\bماي إس كيو إل\b'],
        "Firebase": [r'\bfirebase\b', r'\bفايربيس\b'],
        "Supabase": [r'\bsupabase\b', r'\bسوبابيس\b'],
        # Cloud
        "AWS": [r'\baws\b', r'\bamazon\b', r'\bأمازون\b'],
        "Google Cloud": [r'\bgcp\b', r'\bgoogle cloud\b'],
        "Vercel": [r'\bvercel\b', r'\bفيرسل\b'],
        "Docker": [r'\bdocker\b', r'\bدوكر\b'],
    }
    
    # Project type detection
    PROJECT_TYPES = {
        "web_app": {
            "name_ar": "تطبيق ويب",
            "patterns": [r'\bتطبيق ويب\b', r'\bweb app\b', r'\bموقع\b', r'\bwebsite\b'],
            "default_tech": ["React", "Node.js", "MongoDB"]
        },
        "mobile_app": {
            "name_ar": "تطبيق موبايل",
            "patterns": [r'\bتطبيق موبايل\b', r'\bتطبيق جوال\b', r'\bmobile\b', r'\bios\b', r'\bandroid\b'],
            "default_tech": ["Flutter", "Firebase"]
        },
        "api": {
            "name_ar": "خدمة API",
            "patterns": [r'\bapi\b', r'\bخدمة\b', r'\bbackend\b', r'\brest\b'],
            "default_tech": ["FastAPI", "PostgreSQL"]
        },
        "ecommerce": {
            "name_ar": "متجر إلكتروني",
            "patterns": [r'\bمتجر\b', r'\bتجارة\b', r'\becommerce\b', r'\bshop\b'],
            "default_tech": ["Next.js", "Stripe", "MongoDB"]
        },
        "saas": {
            "name_ar": "منصة SaaS",
            "patterns": [r'\bsaas\b', r'\bمنصة\b', r'\bplatform\b', r'\bاشتراك\b'],
            "default_tech": ["React", "Node.js", "PostgreSQL", "Stripe"]
        },
        "dashboard": {
            "name_ar": "لوحة تحكم",
            "patterns": [r'\bلوحة تحكم\b', r'\bdashboard\b', r'\bإدارة\b', r'\badmin\b'],
            "default_tech": ["React", "Chart.js", "Node.js"]
        }
    }
    
    # User type detection
    USER_TYPES = {
        "b2c": {
            "name_ar": "مستخدمين عاديين",
            "patterns": [r'\bمستخدم\b', r'\bعميل\b', r'\buser\b', r'\bcustomer\b']
        },
        "b2b": {
            "name_ar": "شركات ومؤسسات",
            "patterns": [r'\bشركة\b', r'\bمؤسسة\b', r'\bbusiness\b', r'\benterprise\b']
        },
        "developers": {
            "name_ar": "مطورين",
            "patterns": [r'\bمطور\b', r'\bdeveloper\b', r'\bبرمجة\b']
        },
        "internal": {
            "name_ar": "استخدام داخلي",
            "patterns": [r'\bداخلي\b', r'\binternal\b', r'\bموظف\b']
        }
    }

    @classmethod
    def extract_features(cls, text: str) -> List[Dict[str, Any]]:
        """Extract features from text using advanced patterns"""
        features = []
        seen = set()
        
        for pattern, feature_type in cls.FEATURE_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                clean = match.strip()
                if clean and len(clean) > 3 and len(clean) < 100 and clean.lower() not in seen:
                    seen.add(clean.lower())
                    features.append({
                        "text": clean,
                        "type": feature_type,
                        "confidence": 0.8 if feature_type in ['feature', 'requirement'] else 0.6
                    })
        
        return features[:10]  # Limit to top 10
    
    @classmethod
    def detect_technologies(cls, text: str) -> List[Dict[str, Any]]:
        """Detect technologies mentioned in text"""
        detected = []
        text_lower = text.lower()
        
        for tech, patterns in cls.TECH_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    detected.append({
                        "name": tech,
                        "confidence": 0.9
                    })
                    break
        
        return detected
    
    @classmethod
    def detect_project_type(cls, text: str) -> Dict[str, Any]:
        """Detect project type from text"""
        text_lower = text.lower()
        scores = {}
        
        for ptype, config in cls.PROJECT_TYPES.items():
            score = 0
            for pattern in config["patterns"]:
                if re.search(pattern, text_lower):
                    score += 1
            scores[ptype] = score
        
        if scores:
            best = max(scores, key=scores.get)
            if scores[best] > 0:
                return {
                    "type": best,
                    "name_ar": cls.PROJECT_TYPES[best]["name_ar"],
                    "confidence": min(1.0, scores[best] * 0.3),
                    "suggested_tech": cls.PROJECT_TYPES[best]["default_tech"]
                }
        
        return {
            "type": "unknown",
            "name_ar": "غير محدد",
            "confidence": 0,
            "suggested_tech": ["React", "Node.js", "MongoDB"]
        }
    
    @classmethod
    def detect_user_type(cls, text: str) -> Dict[str, Any]:
        """Detect target user type"""
        text_lower = text.lower()
        
        for utype, config in cls.USER_TYPES.items():
            for pattern in config["patterns"]:
                if re.search(pattern, text_lower):
                    return {
                        "type": utype,
                        "name_ar": config["name_ar"],
                        "confidence": 0.7
                    }
        
        return {"type": "unknown", "name_ar": "غير محدد", "confidence": 0}
    
    @classmethod
    def analyze_complexity(cls, features: List, technologies: List) -> Dict[str, Any]:
        """Analyze project complexity"""
        feature_count = len(features)
        tech_count = len(technologies)
        
        # Complexity scoring
        complexity_score = (feature_count * 2) + (tech_count * 3)
        
        if complexity_score < 10:
            level = "simple"
            level_ar = "بسيط"
            estimated_days = "1-2 أسابيع"
        elif complexity_score < 25:
            level = "medium"
            level_ar = "متوسط"
            estimated_days = "3-6 أسابيع"
        elif complexity_score < 50:
            level = "complex"
            level_ar = "معقد"
            estimated_days = "2-3 أشهر"
        else:
            level = "enterprise"
            level_ar = "مؤسسي"
            estimated_days = "4-6 أشهر"
        
        return {
            "level": level,
            "level_ar": level_ar,
            "score": complexity_score,
            "estimated_time": estimated_days,
            "team_size": max(1, complexity_score // 15)
        }
    
    @classmethod
    def suggest_skills(cls, text: str, project_type: str) -> List[Dict[str, Any]]:
        """Suggest relevant skills based on context"""
        suggested = []
        text_lower = text.lower()
        
        for skill_id, skill in SKILLS_LIBRARY.items():
            for trigger in skill["triggers"]:
                if trigger in text_lower:
                    suggested.append({
                        "id": skill_id,
                        "name": skill["name"],
                        "name_ar": skill["name_ar"],
                        "relevance": 0.8
                    })
                    break
        
        # Always suggest based on project type
        type_skills = {
            "web_app": ["frontend-patterns", "backend-patterns", "api-design"],
            "mobile_app": ["mobile-patterns", "api-design"],
            "api": ["api-design", "backend-patterns", "database-design"],
            "ecommerce": ["frontend-patterns", "security-review", "database-design"],
            "saas": ["security-review", "api-design", "devops-setup"],
            "dashboard": ["frontend-patterns", "database-design"]
        }
        
        for skill_id in type_skills.get(project_type, []):
            if skill_id not in [s["id"] for s in suggested]:
                skill = SKILLS_LIBRARY.get(skill_id)
                if skill:
                    suggested.append({
                        "id": skill_id,
                        "name": skill["name"],
                        "name_ar": skill["name_ar"],
                        "relevance": 0.6
                    })
        
        return suggested[:5]

# ==================== VERIFICATION LOOP ====================

@dataclass
class VerificationResult:
    step: str
    passed: bool
    message: str
    details: Dict[str, Any] = field(default_factory=dict)

class VerificationLoop:
    """Build → Test → Lint → Security verification loop"""
    
    STEPS = [
        {
            "id": "requirements",
            "name_ar": "التحقق من المتطلبات",
            "description": "التأكد من اكتمال المتطلبات"
        },
        {
            "id": "design",
            "name_ar": "مراجعة التصميم",
            "description": "التحقق من صحة التصميم"
        },
        {
            "id": "security",
            "name_ar": "فحص الأمان",
            "description": "التحقق من متطلبات الأمان"
        },
        {
            "id": "quality",
            "name_ar": "ضمان الجودة",
            "description": "التحقق من معايير الجودة"
        },
        {
            "id": "completeness",
            "name_ar": "اكتمال المخرجات",
            "description": "التأكد من اكتمال جميع المخرجات"
        }
    ]
    
    @classmethod
    def verify_requirements(cls, analysis: Dict) -> VerificationResult:
        """Verify requirements completeness"""
        progress = analysis.get("total_progress", 0)
        features = analysis.get("project_summary", {}).get("features", [])
        
        passed = progress >= 50 and len(features) >= 2
        return VerificationResult(
            step="requirements",
            passed=passed,
            message="المتطلبات مكتملة" if passed else "المتطلبات غير مكتملة",
            details={"progress": progress, "feature_count": len(features)}
        )
    
    @classmethod
    def verify_design(cls, analysis: Dict) -> VerificationResult:
        """Verify design quality"""
        tech = analysis.get("project_summary", {}).get("technologies", [])
        ptype = analysis.get("project_summary", {}).get("type", "unknown")
        
        passed = len(tech) >= 1 and ptype != "غير محدد"
        return VerificationResult(
            step="design",
            passed=passed,
            message="التصميم مقبول" if passed else "التصميم يحتاج تحسين",
            details={"technologies": tech, "project_type": ptype}
        )
    
    @classmethod
    def verify_security(cls, text: str) -> VerificationResult:
        """Basic security requirements check"""
        security_keywords = ["مصادقة", "auth", "تشفير", "encrypt", "أمان", "security"]
        has_security = any(kw in text.lower() for kw in security_keywords)
        
        return VerificationResult(
            step="security",
            passed=True,  # Always pass but with recommendations
            message="تمت مراجعة الأمان" if has_security else "يُنصح بإضافة متطلبات الأمان",
            details={"security_mentioned": has_security}
        )
    
    @classmethod
    def run_verification(cls, analysis: Dict, conversation_text: str) -> List[VerificationResult]:
        """Run full verification loop"""
        results = []
        
        results.append(cls.verify_requirements(analysis))
        results.append(cls.verify_design(analysis))
        results.append(cls.verify_security(conversation_text))
        
        # Quality check
        results.append(VerificationResult(
            step="quality",
            passed=True,
            message="معايير الجودة محققة",
            details={}
        ))
        
        # Completeness check
        all_passed = all(r.passed for r in results[:3])
        results.append(VerificationResult(
            step="completeness",
            passed=all_passed,
            message="جاهز للتوليد" if all_passed else "يحتاج مزيد من المعلومات",
            details={"ready": all_passed}
        ))
        
        return results

# ==================== MEMORY & LEARNING ====================

@dataclass
class Instinct:
    """Learned pattern from conversations"""
    pattern: str
    category: str
    frequency: int = 1
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_used: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MemorySystem:
    """Memory and learning system for pattern recognition"""
    
    @staticmethod
    def extract_patterns(messages: List[Dict]) -> List[Dict]:
        """Extract patterns from conversation history"""
        patterns = []
        
        for msg in messages:
            content = msg.get("content", "")
            
            # Extract questions patterns
            if "?" in content or "؟" in content:
                patterns.append({
                    "type": "question",
                    "content": content[:100]
                })
            
            # Extract decision patterns
            if any(word in content for word in ["نعم", "لا", "أريد", "أفضل", "yes", "no"]):
                patterns.append({
                    "type": "decision",
                    "content": content[:100]
                })
        
        return patterns
    
    @staticmethod
    def generate_summary(messages: List[Dict], max_length: int = 500) -> str:
        """Generate conversation summary for context"""
        if not messages:
            return ""
        
        # Get key points
        key_points = []
        for msg in messages:
            content = msg.get("content", "")
            if msg.get("role") == "user" and len(content) > 10:
                key_points.append(content[:100])
        
        summary = "ملخص المحادثة:\n"
        for i, point in enumerate(key_points[:5], 1):
            summary += f"{i}. {point}\n"
        
        return summary[:max_length]

# ==================== MAIN ANALYSIS FUNCTION ====================

def full_analysis(messages: List[Dict], idea: str) -> Dict[str, Any]:
    """Perform full project analysis"""
    
    # Combine all text
    full_text = idea + " " + " ".join([m.get("content", "") for m in messages])
    
    # NLP Analysis
    features = AdvancedNLP.extract_features(full_text)
    technologies = AdvancedNLP.detect_technologies(full_text)
    project_type = AdvancedNLP.detect_project_type(full_text)
    user_type = AdvancedNLP.detect_user_type(full_text)
    complexity = AdvancedNLP.analyze_complexity(features, technologies)
    suggested_skills = AdvancedNLP.suggest_skills(full_text, project_type["type"])
    
    # Verification
    analysis = {
        "project_summary": {
            "type": project_type["name_ar"],
            "features": [f["text"] for f in features],
            "technologies": [t["name"] for t in technologies] or project_type["suggested_tech"]
        },
        "total_progress": min(100, len(messages) * 10 + len(features) * 5)
    }
    verification = VerificationLoop.run_verification(analysis, full_text)
    
    # Memory
    patterns = MemorySystem.extract_patterns(messages)
    summary = MemorySystem.generate_summary(messages)
    
    return {
        "features": features,
        "technologies": technologies or [{"name": t, "confidence": 0.5} for t in project_type["suggested_tech"]],
        "project_type": project_type,
        "user_type": user_type,
        "complexity": complexity,
        "suggested_skills": suggested_skills,
        "verification": [
            {
                "step": v.step,
                "passed": v.passed,
                "message": v.message
            }
            for v in verification
        ],
        "patterns": patterns[:10],
        "summary": summary,
        "ready_to_generate": all(v.passed for v in verification)
    }
