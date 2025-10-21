"use client";

import { useCallback, useMemo } from "react";
import { ChatKitPanel, type FactAction } from "@/components/ChatKitPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function App() {
  const { scheme, setScheme, preference, setPreference, resetPreference } =
    useColorScheme();

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  const themeLabel = useMemo(() => {
    switch (preference) {
      case "system":
        return "Auto";
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "Theme";
    }
  }, [preference]);

  const toggleScheme = useCallback(() => {
    const next = scheme === "light" ? "dark" : "light";
    setPreference(next);
  }, [scheme, setPreference]);

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-white/40 to-slate-300 opacity-80 dark:from-slate-900 dark:via-slate-950/60 dark:to-slate-900" />
        <div className="absolute left-1/2 top-16 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-400/40 blur-3xl dark:bg-indigo-500/30" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-400/40 blur-3xl dark:bg-emerald-500/30" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-sm dark:bg-white/10 dark:text-white">
              ChatKit
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              OpenAI Starter Experience
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={toggleScheme}
              className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white"
            >
              <span
                aria-hidden
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white transition group-hover:scale-105 dark:bg-white/20"
              >
                {scheme === "light" ? "☀️" : "🌙"}
              </span>
              {themeLabel}
            </button>
            <button
              type="button"
              onClick={resetPreference}
              className="rounded-full border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-white/10"
            >
              Reset Theme
            </button>
          </div>
        </header>

        <section className="mt-12 grid flex-1 gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Build delightful chat experiences in minutes.
              </h1>
              <p className="max-w-xl text-lg text-slate-600 dark:text-slate-300">
                Experiment with OpenAI ChatKit using a polished playground
                interface. Customize the panel, iterate on workflows, and ship
                human-grade conversations faster than ever.
              </p>
            </div>

            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <dt className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Launch-ready
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Production quality UI
                </dd>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <dt className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Flexible
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Drop-in web component
                </dd>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                <dt className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Customizable
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Theme &amp; workflow aware
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-emerald-500/30 blur-3xl transition duration-700 dark:from-blue-400/20 dark:via-purple-500/20 dark:to-emerald-400/20" />
            <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 transition duration-500 dark:border-white/10 dark:bg-slate-900/80 dark:ring-white/10">
              <ChatKitPanel
                theme={scheme}
                onWidgetAction={handleWidgetAction}
                onResponseEnd={handleResponseEnd}
                onThemeRequest={setScheme}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
