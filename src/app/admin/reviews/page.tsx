export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ReviewsManager from "./reviews-manager";

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <ReviewsManager userRole={user.role} />;
}
