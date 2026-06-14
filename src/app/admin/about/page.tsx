export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AboutManager from "./about-manager";

export default async function AboutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <AboutManager userRole={user.role} />;
}
