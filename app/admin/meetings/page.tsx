"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import BackButton from "@/components/Backbutton";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(meetingId: string, meetingName: string) {
    const confirmed = window.confirm(
      `Delete "${meetingName}"? This will also delete all its scan records. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(meetingId);
    try {
      const res = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete meeting");
        return;
      }

      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8 bg-white min-h-screen">
      <div className="mb-4">
        <BackButton fallbackHref="/admin" />
      </div>
      <h1 className="text-2xl font-bold text-brand mb-6">Meetings</h1>

      <form
        onSubmit={handleCreate}
        className="space-y-4 mb-8 bg-white border border-border-light rounded-3xl p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Meeting name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-border-light rounded-full px-5 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            placeholder="e.g. Week 3 Class"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Date (optional, defaults to now)
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-border-light rounded-full px-5 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
        </div>
        {error && <p className="text-brand text-sm font-medium">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-3 rounded-full disabled:opacity-50 shadow-sm"
        >
          {loading ? "Creating..." : "Create Meeting"}
        </button>
      </form>

      <ul className="space-y-3">
        {meetings.map((meeting) => (
          <li
            key={meeting.id}
            className="bg-white border border-border-light rounded-2xl p-4 flex justify-between items-center shadow-sm"
          >
            <div>
              <p className="font-semibold">{meeting.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(meeting.date).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2 text-sm items-center">
              <Link
                href={`/admin/scan?meetingId=${meeting.id}`}
                className="bg-brand-light text-brand font-medium px-4 py-2 rounded-full hover:bg-brand hover:text-white"
              >
                Scan
              </Link>
              <Link
                href={`/admin/meetings/${meeting.id}`}
                className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-full hover:bg-gray-200"
              >
                Report
              </Link>
              <button
                onClick={() => handleDelete(meeting.id, meeting.name)}
                disabled={deletingId === meeting.id}
                className="text-gray-400 hover:text-brand font-medium px-2 disabled:opacity-50"
              >
                {deletingId === meeting.id ? "..." : "Delete"}
              </button>
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