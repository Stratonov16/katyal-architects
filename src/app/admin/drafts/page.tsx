export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DraftsView from "./drafts-view";

export default async function DraftsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "super_admin") redirect("/admin");

  return <DraftsView />;
}
