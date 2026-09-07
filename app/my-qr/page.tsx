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
  });

  return (
    <main className="max-w-md mx-auto p-8 text-center">
      <div className="flex justify-end mb-2">
        <LogoutButton />
      </div>
      <h1 className="text-2xl font-semibold mb-2">My QR Code</h1>
      <p className="text-gray-500 mb-6">{session.user.name}</p>

      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="Your attendance QR code"
          className="border rounded-lg"
          width={320}
          height={320}
        />
      </div>

      <p className="mt-6 text-sm text-gray-400">
        ID: {session.user.idNumber}
      </p>
      <p className="mt-2 text-xs text-gray-400">
        Show this code to the admin at the start and end of each meeting.
      </p>
    </main>
  );
}