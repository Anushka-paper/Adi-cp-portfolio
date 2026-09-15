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
    <div className="mx-auto min-h-screen max-w-lg px-4 py-16">
      <h1 className="mb-6 text-lg font-semibold">Edit profile content</h1>
      <AdminForm content={content} />
    </div>
  );
}
