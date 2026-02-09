import { Link } from 'react-router-dom';
import { Users, Layers } from 'lucide-react';
import type { ProjectSummary } from '../../types';

interface ProjectCardProps {
  project: ProjectSummary;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/admin/${project.name}`}
      className="card hover:shadow-md transition-shadow group block"
    >
      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary transition-colors mb-1">
        {project.name}
      </h3>
      {project.industry && (
        <p className="text-sm text-gray-500 mb-4">{project.industry}</p>
      )}
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Layers className="w-4 h-4" />
          {project.feature_count} features
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {project.competitor_count} competitors
        </span>
      </div>
    </Link>
  );
}
