"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import BackButton from "@/components/Backbutton";

type ScanType = "START" | "END";

type ScanLogEntry = {
  idNumber: string;
  status: "success" | "duplicate" | "error";
  message: string;
};

function ScanPageInner() {
  const searchParams = useSearchParams();
  const meetingId = searchParams.get("meetingId");

  const [scanType, setScanType] = useState<ScanType>("START");
  const [log, setLog] = useState<ScanLogEntry[]>([]);
  const scanTypeRef = useRef(scanType);

  useEffect(() => {
    scanTypeRef.current = scanType;
  }, [scanType]);

  useEffect(() => {
    if (!meetingId) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    async function handleSuccess(decodedText: string) {
      scanner.pause(true);

      try {
        const res = await fetch("/api/admin/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idNumber: decodedText,
            meetingId,
            type: scanTypeRef.current,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setLog((prev) => [
            {
              idNumber: decodedText,
              status: data.duplicate ? "duplicate" : "error",
              message: data.error || "Failed to record scan",
            },
            ...prev,
          ]);
        } else {
          setLog((prev) => [
            {
              idNumber: decodedText,
              status: "success",
              message: `${data.name} — ${scanTypeRef.current}`,
            },
            ...prev,
          ]);
        }
      } catch {
        setLog((prev) => [
          {
            idNumber: decodedText,
            status: "error",
            message: "Network error",
          },
          ...prev,
        ]);
      }

      setTimeout(() => {
        scanner.resume();
      }, 1500);
    }

    scanner.render(handleSuccess, () => {
      // Ignore per-frame scan failures; this fires constantly while
      // the camera is pointed at anything that isn't a valid QR code.
    });

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [meetingId]);

  if (!meetingId) {
    return (
      <main className="max-w-md mx-auto p-8 text-center">
        <p className="text-red-600 mb-4">
          No meeting selected.
        </p>
        <BackButton fallbackHref="/admin/meetings" />
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Scan Attendance</h1>
        <BackButton fallbackHref="/admin/meetings" />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setScanType("START")}
          className={`px-4 py-2 rounded ${
            scanType === "START" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Start
        </button>
        <button
          onClick={() => setScanType("END")}
          className={`px-4 py-2 rounded ${
            scanType === "END" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          End
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Currently scanning: <strong>{scanType}</strong>
      </p>

      <div id="qr-reader" className="mb-6" />

      <div>
        <h2 className="font-semibold mb-2">Recent scans</h2>
        <ul className="space-y-1 text-sm">
          {log.map((entry, i) => (
            <li
              key={i}
              className={
                entry.status === "success"
                  ? "text-green-600"
                  : entry.status === "duplicate"
                  ? "text-amber-600"
                  : "text-red-600"
              }
            >
              {entry.idNumber} — {entry.message}
            </li>
          ))}
          {log.length === 0 && (
            <li className="text-gray-400">No scans yet.</li>
          )}
        </ul>
      </div>
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <ScanPageInner />
    </Suspense>
  );
}