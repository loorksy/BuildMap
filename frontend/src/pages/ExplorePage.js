import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import ProjectCard from '../components/ProjectCard';
import { 
  Search, 
  Filter, 
  Sun, 
  Moon, 
  Sparkles,
  TrendingUp,
  Clock,
  Eye,
  DollarSign,
  X,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { logger } from '../utils/logger';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  'Web Application',
  'Mobile App',
  'API & Backend',
  'UI/UX Design',
  'Dashboard & Analytics',
  'E-commerce',
  'SaaS',
  'Social Platform',
  'AI & ML',
  'DevOps & Tools'
];

const TECH_STACK = [
  'React', 'Vue', 'Angular', 'Next.js', 'Flutter',
  'React Native', 'Node.js', 'Python', 'FastAPI',
  'Django', 'MongoDB', 'PostgreSQL', 'Firebase',
  'AWS', 'Docker', 'TypeScript'
];

const STATUS_OPTIONS = [
  { value: 'idea', label: 'فكرة' },
  { value: 'in_development', label: 'قيد التطوير' },
  { value: 'completed', label: 'مكتمل' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'الأحدث', icon: Clock },
  { value: 'trending', label: 'الرائج', icon: TrendingUp },
  { value: 'most_viewed', label: 'الأكثر مشاهدة', icon: Eye },
  { value: 'for_sale', label: 'للبيع', icon: DollarSign }
];

const ExplorePage = () => {
  const { theme, toggleTheme } = useTheme();
  
  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTech, setSelectedTech] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedTech, selectedStatus, sortBy, page]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        page: page,
        limit: 20
      });

      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTech.length > 0) params.append('tech', selectedTech.join(','));
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchQuery) params.append('q', searchQuery);

      const response = await axios.get(`${API}/explore?${params.toString()}`);
      
      if (page === 1) {
        setProjects(response.data.projects || []);
      } else {
        setProjects(prev => [...prev, ...(response.data.projects || [])]);
      }
      
      setHasMore((response.data.projects || []).length === 20);
    } catch (error) {
      logger.error('Error fetching projects:', error);
      toast.error('حدث خطأ أثناء جلب المشاريع');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const toggleTech = (tech) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter(t => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTech([]);
    setSelectedStatus(null);
    setSearchQuery('');
    setPage(1);
  };

  const activeFiltersCount = 
    (selectedCategory ? 1 : 0) + 
    selectedTech.length + 
    (selectedStatus ? 1 : 0);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-glow transition-smooth group-hover:shadow-glow-lg">
              <span className="text-primary-foreground font-black text-sm">B</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-foreground tracking-tight hidden sm:block">
              BuildMap
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link to="/dashboard">
              <Button size="sm" className="btn-primary rounded-lg text-xs sm:text-sm">
                لوحة التحكم
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">
              استكشف المشاريع
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            اكتشف أفكار مشاريع تقنية مبتكرة، تعلم من مشاريع الآخرين، وابدأ مشروعك القادم
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن مشاريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rounded-lg"
              />
            </div>
          </form>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg relative"
          >
            <Filter className="w-4 h-4 ml-2" />
            الفلاتر
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Sort */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {SORT_OPTIONS.map(option => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSortBy(option.value);
                    setPage(1);
                  }}
                  className="rounded-lg whitespace-nowrap text-xs sm:text-sm"
                >
                  <Icon className="w-3.5 h-3.5 ml-1" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-4 sm:p-5 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">تصفية النتائج</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5 ml-1" />
                  مسح الكل
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                الفئة
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat ? null : cat);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack Filter */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                التقنيات
              </label>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map(tech => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                      selectedTech.includes(tech)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                الحالة
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status.value}
                    onClick={() => {
                      setSelectedStatus(selectedStatus === status.value ? null : status.value);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth ${
                      selectedStatus === status.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((skeletonId) => (
              <div key={`skeleton-${skeletonId}`} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-5/6 mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <div className="h-7 w-7 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              لا توجد مشاريع
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              لم نجد أي مشاريع تطابق معايير البحث. جرب تغيير الفلاتر.
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                مسح جميع الفلاتر
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-fade-in">
              {projects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && !loading && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setPage(p => p + 1)}
                  variant="outline"
                  className="rounded-lg"
                >
                  <ChevronDown className="w-4 h-4 ml-2" />
                  عرض المزيد
                </Button>
              </div>
            )}

            {loading && page > 1 && (
              <div className="flex justify-center mt-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
