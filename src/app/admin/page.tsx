import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminDashboard from "./dashboard";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <AdminDashboard user={user} />;
}
