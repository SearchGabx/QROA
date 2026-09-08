"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BackButton from "@/components/Backbutton";

type Summary = { total: number; full: number; partial: number; absent: number };

export default function MeetingReportPage() {
  const params = useParams();
  const meetingId = params.id as string;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchSummary() {
      try {
        const res = await fetch(`/api/admin/meetings/${meetingId}/summary`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setSummary(data);
      } catch {
        if (active) setError("Could not load live count");
      }
    }

    fetchSummary();
    const interval = setInterval(fetchSummary, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [meetingId]);

  return (
    <main className="max-w-xl mx-auto p-8 bg-white min-h-screen">
      <div className="mb-6">
        <BackButton fallbackHref="/admin/meetings" />
      </div>

      <h1 className="text-2xl font-bold text-brand mb-6">
        Meeting Attendance
      </h1>

      {error && (
        <p className="text-brand font-medium mb-4">{error}</p>
      )}

      {summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-gray-50 border border-border-light rounded-2xl px-4 py-5 text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-5 text-center">
            <p className="text-2xl font-bold text-green-700">
              {summary.full}
            </p>
            <p className="text-sm text-green-700 mt-1">Full</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-5 text-center">
            <p className="text-2xl font-bold text-amber-700">
              {summary.partial}
            </p>
            <p className="text-sm text-amber-700 mt-1">Partial</p>
          </div>
          <div className="bg-brand-light border border-brand-light rounded-2xl px-4 py-5 text-center">
            <p className="text-2xl font-bold text-brand">
              {summary.absent}
            </p>
            <p className="text-sm text-brand mt-1">Absent</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 mb-8">Loading...</p>
      )}

      <a href={`/api/admin/meetings/${meetingId}/export`}>
        <button className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-full shadow-sm">
          Download Excel Report
        </button>
      </a>
    </main>
  );
}