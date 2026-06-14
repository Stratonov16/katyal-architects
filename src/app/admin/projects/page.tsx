export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProjectsManager from "./projects-manager";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <ProjectsManager userRole={user.role} />;
}
