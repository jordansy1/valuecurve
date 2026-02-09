import { AlertCircle, Loader2 } from 'lucide-react';
import { useProjectList } from '../hooks/useProjectList';
import ProjectCard from '../components/admin/ProjectCard';
import NewProjectForm from '../components/admin/NewProjectForm';

export default function ProjectListPage() {
  const { projects, loading, error, refetch } = useProjectList();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Projects</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage value curve engagements
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="card text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={refetch} className="btn btn-primary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
            <NewProjectForm onCreated={refetch} />
          </div>
        )}
      </div>
    </main>
  );
}
