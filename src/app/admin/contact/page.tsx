export const runtime = "edge";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ContactManager from "./contact-manager";

export default async function ContactPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return <ContactManager userRole={user.role} />;
}
