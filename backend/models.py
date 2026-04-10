"""
BuildMap Universe - Data Models
All Pydantic models for API validation and MongoDB schemas
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class UserRole(str, Enum):
    """User roles in the platform"""
    IDEA_OWNER = "idea_owner"
    BUILDER = "builder"
    BUYER = "buyer"

class ProjectVisibility(str, Enum):
    """Project visibility levels"""
    PRIVATE = "private"      # Only owner can see
    UNLISTED = "unlisted"    # Anyone with link can see
    PUBLIC = "public"        # Published in Explore Feed

class ProjectStatus(str, Enum):
    """Project development status"""
    IDEA = "idea"
    IN_DEVELOPMENT = "in_development"
    COMPLETED = "completed"

class CommentType(str, Enum):
    """Types of comments"""
    COMMENT = "comment"           # Regular comment
    CODE_REVIEW = "code_review"   # Technical code review
    BUILT_THIS = "built_this"     # Builder claiming they built it
    SUGGESTION = "suggestion"     # Improvement suggestion
    QUESTION = "question"         # Question to owner

class ReactionType(str, Enum):
    """Quick reaction types"""
    FIRE = "fire"           # 🔥 Strong idea
    MONEY = "money"         # 💰 Profitable
    CHECK = "check"         # ✅ Feasible
    THINK = "think"         # 🤔 Needs study
    REPEAT = "repeat"       # 🔄 Already exists

class NotificationType(str, Enum):
    """Notification types"""
    NEW_FOLLOWER = "new_follower"
    NEW_COMMENT = "new_comment"
    COMMENT_REPLY = "comment_reply"
    PROJECT_SAVED = "project_saved"
    PROJECT_TRENDING = "project_trending"
    MENTION = "mention"

class UserLevel(str, Enum):
    """User gamification levels"""
    SEED = "seed"           # 0-500 points
    BUILDER = "builder"     # 500-2000 points
    INNOVATOR = "innovator" # 2000-5000 points
    VISIONARY = "visionary" # 5000-15000 points
    LEGEND = "legend"       # 15000+ points


# ==================== BASE MODELS ====================

class UserProfile(BaseModel):
    """User profile information"""
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    github_username: Optional[str] = None
    github_connected: bool = False
    skills: List[str] = []
    portfolio_urls: List[str] = []

class UserStats(BaseModel):
    """User statistics"""
    projects_published: int = 0
    projects_sold: int = 0
    projects_built: int = 0
    total_earnings: float = 0.0
    average_rating: float = 0.0
    followers_count: int = 0
    following_count: int = 0
    points: int = 0
    level: UserLevel = UserLevel.SEED

class UserVerification(BaseModel):
    """User verification status"""
    email_verified: bool = False
    phone_verified: bool = False
    github_verified: bool = False
    id_verified: bool = False

class PricingTier(BaseModel):
    """Pricing tier for selling ideas"""
    price: float
    includes: List[str]

class ProjectPricing(BaseModel):
    """Project pricing structure for marketplace"""
    basic: Optional[PricingTier] = None
    standard: Optional[PricingTier] = None
    premium: Optional[PricingTier] = None
    exclusive: Optional[Dict[str, Any]] = None  # {negotiable: true}

class ProjectStats(BaseModel):
    """Project statistics"""
    views: int = 0
    saves: int = 0
    comments_count: int = 0
    reactions: Dict[str, int] = {
        "fire": 0,
        "money": 0,
        "check": 0,
        "think": 0,
        "repeat": 0
    }

class IPCertificate(BaseModel):
    """Intellectual Property Certificate"""
    hash: str
    timestamp: datetime
    certificate_url: Optional[str] = None


# ==================== REQUEST/RESPONSE MODELS ====================

# Auth
class UserRegister(BaseModel):
    """User registration"""
    email: EmailStr
    password: str
    name: str
    role: List[UserRole] = [UserRole.IDEA_OWNER]  # Default role

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

class UserLogin(BaseModel):
    """User login"""
    email: EmailStr
    password: str

# Profile
class ProfileUpdate(BaseModel):
    """Update user profile"""
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    skills: Optional[List[str]] = None
    portfolio_urls: Optional[List[str]] = None

class PublicProfile(BaseModel):
    """Public user profile response"""
    id: str
    name: str
    email: str  # Will be hidden in actual response
    profile: UserProfile
    stats: UserStats
    verification: UserVerification
    role: List[UserRole]
    created_at: datetime

# Projects
class ProjectCreate(BaseModel):
    """Create new project"""
    title: str
    idea: str

class ProjectUpdate(BaseModel):
    """Update project"""
    title: Optional[str] = None
    selected_model: Optional[str] = None

class ProjectPublishSettings(BaseModel):
    """Settings for publishing a project"""
    visibility: ProjectVisibility
    public_outputs: List[str] = []  # Which outputs to show publicly
    for_sale: bool = False
    pricing: Optional[ProjectPricing] = None
    category: Optional[str] = None
    status: ProjectStatus = ProjectStatus.IDEA

# Comments
class CommentCreate(BaseModel):
    """Create new comment"""
    content: str
    type: CommentType = CommentType.COMMENT
    parent_comment_id: Optional[str] = None

class CommentUpdate(BaseModel):
    """Update comment"""
    content: str

class CommentReaction(BaseModel):
    """Add/remove reaction"""
    reaction: ReactionType

class CommentResponse(BaseModel):
    """Comment response"""
    id: str
    project_id: str
    author_id: str
    author_name: str
    author_avatar: Optional[str]
    content: str
    type: CommentType
    parent_comment_id: Optional[str] = None
    reactions: Dict[str, int]
    helpful_count: int = 0
    is_hidden: bool = False
    created_at: datetime
    replies: List['CommentResponse'] = []

# Notifications
class NotificationResponse(BaseModel):
    """Notification response"""
    id: str
    user_id: str
    type: NotificationType
    content: str
    link: Optional[str] = None
    is_read: bool = False
    created_at: datetime

# Explore & Feed
class ExploreFilters(BaseModel):
    """Filters for explore feed"""
    category: Optional[str] = None
    tech: Optional[List[str]] = None
    status: Optional[ProjectStatus] = None
    sort: Literal["newest", "trending", "most_viewed", "for_sale"] = "newest"
    page: int = 1
    limit: int = 20

class PublicProjectCard(BaseModel):
    """Project card for explore feed"""
    id: str
    title: str
    description: str
    tech_stack: List[str]
    category: Optional[str]
    status: ProjectStatus
    owner_id: str
    owner_name: str
    owner_avatar: Optional[str]
    stats: ProjectStats
    for_sale: bool = False
    pricing_start: Optional[float] = None
    created_at: datetime

class PublicProjectDetail(BaseModel):
    """Full public project page"""
    id: str
    title: str
    description: str
    tech_stack: List[str]
    category: Optional[str]
    status: ProjectStatus
    owner: PublicProfile
    public_outputs: List[str]
    stats: ProjectStats
    for_sale: bool = False
    pricing: Optional[ProjectPricing] = None
    ip_certificate: Optional[IPCertificate] = None
    created_at: datetime
    published_at: Optional[datetime] = None

# Messages
class MessageCreate(BaseModel):
    """Create new message"""
    content: str

# API Keys
class APIKeyCreate(BaseModel):
    """Create API key"""
    api_key: str
    provider: str = "openrouter"
    default_model: str = "openai/gpt-4o"


# ==================== DATABASE DOCUMENT MODELS ====================

# These represent the actual MongoDB documents

class UserDocument(BaseModel):
    """User document in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    name: str
    role: List[UserRole] = [UserRole.IDEA_OWNER]
    profile: UserProfile = UserProfile()
    stats: UserStats = UserStats()
    verification: UserVerification = UserVerification()
    plan: Literal["free", "studio_pro", "builder_pro"] = "free"
    created_at: datetime
    updated_at: datetime

class PublicProjectDocument(BaseModel):
    """Published project document in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str  # Reference to original project
    owner_id: str
    title: str
    description: str
    category: Optional[str] = None
    tech_stack: List[str] = []
    visibility: ProjectVisibility
    for_sale: bool = False
    pricing: Optional[ProjectPricing] = None
    public_outputs: List[str] = []
    stats: ProjectStats = ProjectStats()
    ip_certificate: Optional[IPCertificate] = None
    status: ProjectStatus = ProjectStatus.IDEA
    created_at: datetime
    published_at: datetime

class CommentDocument(BaseModel):
    """Comment document in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    author_id: str
    parent_comment_id: Optional[str] = None
    type: CommentType
    content: str
    reactions: Dict[str, int] = {
        "fire": 0, "money": 0, "check": 0, "think": 0, "repeat": 0
    }
    helpful_count: int = 0
    is_hidden: bool = False
    created_at: datetime

class FollowDocument(BaseModel):
    """Follow relationship document"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    follower_id: str
    following_id: str
    created_at: datetime

class SaveDocument(BaseModel):
    """Saved project document"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    project_id: str
    created_at: datetime

class NotificationDocument(BaseModel):
    """Notification document"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: NotificationType
    content: str
    link: Optional[str] = None
    is_read: bool = False
    created_at: datetime


# Import uuid for default_factory
import uuid
