import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
      <ul className="space-y-2">
        <li>
          <Link href="/admin/import" className="text-blue-600 underline">
            Import Students
          </Link>
        </li>
      </ul>
    </main>
  );
}