import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/admin-auth";
import { getProfileContent } from "@/lib/profile-content";
import { AdminForm } from "./admin-form";
import { logout } from "./actions";

export default async function AdminPage() {
  if (!(await hasValidSession())) {
    redirect("/admin/login");
  }

  const content = await getProfileContent();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">Edit profile content</h1>
        <form action={logout}>
          <button
            type="submit"
            className="shrink-0 text-sm font-medium underline underline-offset-4"
          >
            Sign out
          </button>
        </form>
      </div>
      <AdminForm content={content} />
    </div>
  );
}
