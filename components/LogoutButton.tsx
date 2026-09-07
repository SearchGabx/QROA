export default function LogoutButton() {
  return (
    <a href="/api/auth/signout?callbackUrl=/login" className="inline-block text-sm text-red-600 border border-red-600 rounded px-4 py-2 min-h-11 leading-loose text-center">
      Log Out
    </a>
  );
}