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
    <main className="max-w-xl mx-auto p-8">
      <div className="mb-4">
        <BackButton fallbackHref="/admin" />
      </div>
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
            <div className="flex gap-3 text-sm items-center">
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
              <button
                onClick={() => handleDelete(meeting.id, meeting.name)}
                disabled={deletingId === meeting.id}
                className="text-red-600 underline disabled:opacity-50"
              >
                {deletingId === meeting.id ? "Deleting..." : "Delete"}
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