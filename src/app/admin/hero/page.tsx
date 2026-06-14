import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import HeroManager from "./hero-manager";

export default async function HeroPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <HeroManager userRole={user.role} />;
}
