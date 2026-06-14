export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ServicesManager from "./services-manager";

export default async function ServicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <ServicesManager userRole={user.role} />;
}
