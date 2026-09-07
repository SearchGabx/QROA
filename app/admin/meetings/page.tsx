"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

type Meeting = {
  id: string;
  name: string;
  date: string;
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMeetings() {
    try {
      const res = await fetch("/api/admin/meetings");
      const data = await res.json();
      if (res.ok) {
        setMeetings(data.meetings);
      }
    } catch {
      // Silently ignore; the list will just stay empty if this fails
    }
  }

  useEffect(() => {
    loadMeetings();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date: date || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create meeting");
        return;
      }

      setName("");
      setDate("");
      loadMeetings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Meetings</h1>

      <form
        onSubmit={handleCreate}
        className="space-y-3 mb-8 border rounded p-4"
      >
        <div>
          <label className="block text-sm mb-1">Meeting name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="e.g. Week 3 Class"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">
            Date (optional, defaults to now)
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Meeting"}
        </button>
      </form>

      <ul className="space-y-2">
        {meetings.map((meeting) => (
          <li
            key={meeting.id}
            className="border rounded p-3 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{meeting.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(meeting.date).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link
                href={`/admin/scan?meetingId=${meeting.id}`}
                className="text-blue-600 underline"
              >
                Scan
              </Link>
              <Link
                href={`/admin/meetings/${meeting.id}`}
                className="text-blue-600 underline"
              >
                Report
              </Link>
            </div>
          </li>
        ))}
        {meetings.length === 0 && (
          <p className="text-gray-500 text-sm">No meetings yet.</p>
        )}
      </ul>
    </main>
  );
}