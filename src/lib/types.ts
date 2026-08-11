export type ProjectDTO = {
  id: string;
  name: string;
  description: string;
  status: string;
  techStack: string;
  repoUrl: string;
  liveUrl: string;
  deadline: string | null;
  priority: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number; notes: number };
  tasks?: TaskDTO[];
  notes?: NoteDTO[];
  links?: LinkDTO[];
};

export type TaskDTO = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  labels: string;
  checklist: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type NoteDTO = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type LinkDTO = {
  id: string;
  projectId: string;
  label: string;
  url: string;
  createdAt: string;
};

export type DashboardData = {
  projectCounts: Record<string, number>;
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  overdueTasks: Array<TaskDTO & { projectName: string }>;
  upcomingDeadlines: Array<{
    id: string;
    name: string;
    deadline: string;
    progress: number;
    status: string;
  }>;
  projectsProgress: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
  }>;
};
