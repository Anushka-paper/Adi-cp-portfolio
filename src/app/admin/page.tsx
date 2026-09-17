import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/admin-auth";
import { getProfileContent } from "@/lib/profile-content";
import { AdminForm } from "./admin-form";

export default async function AdminPage() {
  if (!(await hasValidSession())) {
    redirect("/admin/login");
  }

  const content = await getProfileContent();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-16">
      <AdminForm content={content} />
    </div>
  );
}
