"use client";

import { useState } from "react";

type ImportResult = {
  processed: number;
  skipped: number;
  errors: string[];
};

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/import-students", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Import failed");
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong while uploading the file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Import Students</h1>
      <p className="text-sm text-gray-500 mb-6">
        Upload the .xlsx file with PROM, ID, and NAME columns.
      </p>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mb-4 block"
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload and Import"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 border rounded p-4">
          <p>Processed: {result.processed}</p>
          <p>Skipped rows: {result.skipped}</p>
          {result.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-red-600">Errors:</p>
              <ul className="text-sm text-red-600 list-disc pl-5">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </main>
  );
}