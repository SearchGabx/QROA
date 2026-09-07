"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      onClick={handleBack}
      className="text-sm text-gray-700 border border-gray-400 rounded px-4 py-2 min-h-11 active:bg-gray-100"
    >
      Back
    </button>
  );
}