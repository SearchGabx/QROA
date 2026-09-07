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
    <main className="max-w-xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <LogoutButton />
      </div>
      <ul className="space-y-2">
        <li>
          <Link href="/admin/meetings" className="text-blue-600 underline">
            Meetings
          </Link>
        </li>
        <li>
          <Link href="/admin/import" className="text-blue-600 underline">
            Import Students
          </Link>
        </li>
      </ul>
    </main>
  );
}