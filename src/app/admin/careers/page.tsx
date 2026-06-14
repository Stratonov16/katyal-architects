export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CareersManager from "./careers-manager";

export default async function CareersAdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <CareersManager userRole={user.role} />;
}
