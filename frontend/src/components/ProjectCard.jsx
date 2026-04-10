import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import SaveButton from './SaveButton';
import { Eye, MessageCircle, Bookmark, DollarSign } from 'lucide-react';

const ProjectCard = ({ project }) => {
  return (
    <Link 
      to={`/project/${project.project_id || project.id}/public`}
      className="block group"
    >
      <div className="bg-card border border-border rounded-lg p-4 sm:p-5 hover:border-primary/50 transition-smooth hover:shadow-md">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
              {project.title}
            </h3>
            {project.category && (
              <Badge variant="outline" className="text-xs mb-2">
                {project.category}
              </Badge>
            )}
          </div>
          {project.for_sale && project.pricing_start && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md text-xs font-medium shrink-0">
              <DollarSign className="w-3 h-3" />
              {project.pricing_start}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
          {project.description}
        </p>

        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {project.tech_stack.slice(0, 4).map((tech, idx) => (
              <span 
                key={`tech-${tech}-${idx}`}
                className="px-2 py-0.5 bg-primary/5 text-primary text-xs rounded-md border border-primary/10"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-md">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {/* Owner */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
              {project.owner_name?.charAt(0) || '؟'}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {project.owner_name || 'مستخدم'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-muted-foreground shrink-0">
            <div className="flex items-center gap-1 text-xs">
              <Eye className="w-3.5 h-3.5" />
              {project.stats?.views || 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              {project.stats?.comments_count || 0}
            </div>
            <SaveButton 
              projectId={project.project_id || project.id} 
              initialIsSaved={project.is_saved}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
