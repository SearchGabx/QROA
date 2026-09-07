import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function MyQrPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="max-w-md mx-auto p-8 text-center">
      <h1 className="text-2xl font-semibold mb-4">My QR Code</h1>
      <p className="text-gray-500">
        Logged in as {session.user.name} ({session.user.idNumber})
      </p>
      <p className="mt-4 text-sm text-gray-400">
        QR code generation coming next.
      </p>
    </main>
  );
}