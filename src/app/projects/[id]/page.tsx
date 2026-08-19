import { ProjectDetailView } from "@/components/projects/ProjectDetailView";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailView id={id} />;
}
