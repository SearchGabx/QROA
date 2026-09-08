import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import QRCode from "qrcode";
import LogoutButton from "@/components/LogoutButton";

export default async function MyQrPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const qrDataUrl = await QRCode.toDataURL(session.user.idNumber, {
    width: 320,
    margin: 2,
    color: {
      dark: "#1f1f1f",
      light: "#ffffff",
    },
  });

  return (
    <main className="max-w-md mx-auto p-8 text-center bg-white min-h-screen">
      <div className="flex justify-end mb-4">
        <LogoutButton />
      </div>

      <h1 className="text-2xl font-bold text-brand mb-1">My QR Code</h1>
      <p className="text-gray-500 mb-8">{session.user.name}</p>

      <div className="flex justify-center">
        <div className="bg-white border border-border-light rounded-3xl p-6 shadow-sm inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="Your attendance QR code"
            className="rounded-xl"
            width={320}
            height={320}
          />
        </div>
      </div>

      <div className="mt-6 inline-block bg-brand-light text-brand font-semibold px-5 py-2 rounded-full text-sm">
        ID: {session.user.idNumber}
      </div>

      <p className="mt-4 text-sm text-gray-400">
        Show this code to the admin at the start and end of each meeting.
      </p>
    </main>
  );
}