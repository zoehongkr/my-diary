"use client";

import { useEffect, useMemo, useState } from "react";

type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

const STORAGE_KEY = "my-diary-phase1-entries";

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

export function DiaryApp() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as DiaryEntry[];
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [entries]
  );

  const canSubmit = title.trim().length > 0 || content.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const nextEntry: DiaryEntry = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setEntries((current) => [nextEntry, ...current]);
    setTitle("");
    setContent("");
  }

  function handleDelete(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleClearAll() {
    setEntries([]);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12 sm:px-10">
      <section className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-200/50 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/75 dark:shadow-black/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Diary Phase 1
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Capture your day in a simple diary.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Add new journal entries, review them instantly, and preserve them in the browser while you build your diary.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Clear all entries
          </button>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-200/50 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/75 dark:shadow-black/10">
          <h2 className="text-2xl font-semibold text-zinc-950 dark:text-white">New entry</h2>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="grid gap-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Title
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="What happened today?"
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Content
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your thoughts, memories, or plans..."
                  rows={8}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                />
              </label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Entries are stored locally in your browser. Use the title or content to keep each note meaningful.
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Add entry
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-200/50 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/75 dark:shadow-black/10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-zinc-950 dark:text-white">Diary entries</h2>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              {entries.length}
            </span>
          </div>

          {sortedEntries.length === 0 ? (
            <p className="mt-6 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              No entries yet. Add your first note to begin your diary journey.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {sortedEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                        {entry.title || "Untitled entry"}
                      </h3>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-700 dark:text-zinc-300">
                    {entry.content || "No additional text provided."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
