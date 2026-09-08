"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      idNumber,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid ID number or password.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border border-border-light rounded-3xl p-8 space-y-5 shadow-sm"
      >
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-brand">Log In</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your ID number to continue
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            ID Number
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full border border-border-light rounded-full px-5 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border-light rounded-full px-5 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            required
          />
        </div>

        {error && (
          <p className="text-brand text-sm text-center font-medium">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand hover:bg-brand-hover text-white font-semibold py-3 rounded-full disabled:opacity-50 shadow-sm"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </main>
  );
}