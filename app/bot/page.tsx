"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SupabaseStatus = "checking" | "connected" | "error";

export default function Home() {
  const [status, setStatus] = useState<SupabaseStatus>("checking");
  const [message, setMessage] = useState("Checking Supabase connection...");

  useEffect(() => {
    async function checkSupabaseConnection() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setStatus("connected");
        setMessage("Supabase is connected and ready.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to connect to Supabase.",
        );
      }
    }

    checkSupabaseConnection();
  }, []);

  const statusColor =
    status === "connected"
      ? "bg-green-100 text-green-700"
      : status === "error"
        ? "bg-red-100 text-red-700"
        : "bg-zinc-100 text-zinc-700";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <main className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          LocalLink
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
          Supabase connection
        </h1>
        <p className="mt-3 text-zinc-600">
          big bot This page initializes the Supabase client using your public environment
          variables and performs a quick auth check.
        </p>

        <div className={`mt-6 rounded-xl px-4 py-3 text-sm font-medium ${statusColor}`}>
          {message}
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <p className="font-medium text-zinc-900">Required environment variables</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
