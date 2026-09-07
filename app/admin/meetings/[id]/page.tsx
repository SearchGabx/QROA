"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
    <div style={{ padding: 24 }}>
      <h1>Meeting Attendance</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {summary ? (
        <div style={{ display: "flex", gap: 16, margin: "16px 0" }}>
          <div>Total students: {summary.total}</div>
          <div style={{ color: "green" }}>Full: {summary.full}</div>
          <div style={{ color: "orange" }}>Partial: {summary.partial}</div>
          <div style={{ color: "red" }}>Absent: {summary.absent}</div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <a href={`/api/admin/meetings/${meetingId}/export`}>
        <button>Download Excel Report</button>
      </a>
    </div>
  );
}