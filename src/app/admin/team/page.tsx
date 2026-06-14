export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import TeamManager from "./team-manager";

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <TeamManager userRole={user.role} />;
}
