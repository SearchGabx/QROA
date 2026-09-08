import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <main className="max-w-xl mx-auto p-8 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-brand">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <div className="space-y-3">
        <Link
          href="/admin/meetings"
          className="block bg-white border border-border-light rounded-2xl px-6 py-4 font-semibold hover:border-brand hover:bg-brand-light shadow-sm"
        >
          Meetings
        </Link>
        <Link
          href="/admin/import"
          className="block bg-white border border-border-light rounded-2xl px-6 py-4 font-semibold hover:border-brand hover:bg-brand-light shadow-sm"
        >
          Import Students
        </Link>
      </div>
    </main>
  );
}