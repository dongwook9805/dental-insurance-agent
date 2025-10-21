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
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-white to-emerald-100 opacity-80 dark:from-slate-900 dark:via-slate-950/80 dark:to-slate-900" />
        <div className="absolute left-[-12%] top-32 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute right-[-18%] top-0 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl dark:bg-purple-600/20" />
        <div className="absolute bottom-[-20%] left-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/20" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-16 pt-8 sm:px-10 lg:px-16">
        <header className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/60 bg-white/70 px-5 py-6 shadow-sm backdrop-blur sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              ChatKit Studio
            </div>
            <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
              Powered by OpenAI
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={toggleScheme}
              className="group flex items-center gap-2 rounded-full border border-transparent bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-slate-900/25 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-white/10"
            >
              <span
                aria-hidden
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs transition group-hover:scale-105 dark:bg-white/30 dark:text-slate-900"
              >
                {scheme === "light" ? "☀️" : "🌙"}
              </span>
              {themeLabel}
            </button>
            <button
              type="button"
              onClick={resetPreference}
              className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              Reset Theme
            </button>
          </div>
        </header>

        <section className="mt-10 flex flex-1 flex-col gap-12 lg:gap-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_minmax(26rem,1fr)] lg:items-start">
            <div className="flex flex-col gap-10">
              <div className="space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live Agent Preview
                </div>
                <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-6xl">
                  A cinematic playground for building intelligent chat journeys.
                </h1>
                <p className="max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-300">
                  Prototype, refine, and launch agents that feel magical. This
                  starter kit wraps ChatKit in a delightful experience with
                  responsive layouts, theme controls, and production-ready UX
                  flourishes.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#live-preview"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:bg-white dark:text-slate-900 dark:shadow-white/20"
                  >
                    Try the assistant
                    <span aria-hidden className="text-lg">
                      ↗
                    </span>
                  </a>
                  <a
                    href="https://chatkit.studio/playground"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  >
                    Explore configs
                  </a>
                </div>
              </div>

              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Setup time
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                    <span className="text-emerald-500">5</span> minutes
                  </dd>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Configure workflows and theme with zero custom CSS.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Integrations
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                    Tool aware
                  </dd>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Invoke theme switches, capture facts, or plug actions in.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Delivery
                  </dt>
                  <dd className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                    Production polish
                  </dd>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Animations, gradients, and glassmorphism out of the box.
                  </p>
                </div>
              </dl>

              <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Built for product teams
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Iterate on conversation design, orchestrate workflows, and
                    hand off a ready-to-ship chat experience without touching
                    low-level UI.
                  </p>
                </div>
                <ul className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    Adaptive dark/light themes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
                    Workflow-aware prompts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-purple-500" />
                    Quick-save fact collection
                  </li>
                </ul>
              </div>
            </div>

            <div
              id="live-preview"
              className="relative flex w-full flex-col gap-6 lg:sticky lg:top-20"
            >
              <div className="absolute inset-0 -z-10 rounded-[2.2rem] bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-emerald-500/30 blur-3xl transition duration-700 dark:from-blue-400/20 dark:via-purple-500/20 dark:to-emerald-400/20" />
              <div className="rounded-[2.2rem] border border-white/60 bg-white/80 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-xl transition duration-500 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20 sm:p-6">
                <div className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-xs font-medium uppercase tracking-[0.25em] text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <span>Live Preview</span>
                  <span className="inline-flex w-fit rounded-full bg-emerald-400/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-900 shadow shadow-emerald-500/30 dark:bg-emerald-400/20 dark:text-emerald-200">
                    real-time sync
                  </span>
                </div>
                <div className="mt-4">
                  <ChatKitPanel
                    theme={scheme}
                    onWidgetAction={handleWidgetAction}
                    onResponseEnd={handleResponseEnd}
                    onThemeRequest={setScheme}
                  />
                </div>
              </div>

              <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/80 p-5 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-white/10 dark:bg-white/5 lg:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    Implementation Notes
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    The live preview reuses your actual ChatKit workflow. Every
                    interaction goes through the same API session pipeline used
                    in production.
                  </p>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    Theme controls sync with assistant tools. Toggle the scheme,
                    refresh the chat, or capture facts to see them reflected in
                    real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/60 pt-8 text-sm text-slate-500 sm:flex-row dark:border-white/10 dark:text-slate-400">
          <div>
            Crafted with ❤️ for operators building AI copilots. Customize freely
            and deploy to Vercel in minutes.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-white"
            >
              GitHub
            </a>
            <a
              href="https://platform.openai.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-900 dark:hover:text-white"
            >
              OpenAI Docs
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
