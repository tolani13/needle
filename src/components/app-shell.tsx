import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Clock3, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { MiniPlayer } from "@/components/mini-player";
import { MobileNav, Sidebar } from "@/components/sidebar";
import { NowPlaying } from "@/components/now-playing";
import { QueuePanel } from "@/components/queue-panel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNeedle } from "@/lib/needle/store";
import { NeedleMark } from "@/components/mock-player";

function resolveTheme(pref: "dark" | "light" | "system"): "dark" | "light" {
  if (pref === "system") {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }
  return pref;
}

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrate = useNeedle((s) => s.hydrate);
  const theme = useNeedle((s) => s.settings.theme);
  const playing = useNeedle((s) => s.playback.playing);
  const tick = useNeedle((s) => s.tick);
  const setVisible = useNeedle((s) => s.setVisible);
  const togglePlay = useNeedle((s) => s.togglePlay);
  const next = useNeedle((s) => s.next);
  const prev = useNeedle((s) => s.prev);
  const currentId = useNeedle((s) => s.queue[s.queueIndex]);
  const toggleFavorite = useNeedle((s) => s.toggleFavorite);
  const setNowPlayingOpen = useNeedle((s) => s.setNowPlayingOpen);
  const setQueueOpen = useNeedle((s) => s.setQueueOpen);
  const shortcutsOpen = useNeedle((s) => s.shortcutsOpen);
  const setShortcutsOpen = useNeedle((s) => s.setShortcutsOpen);
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setNowPlayingOpen(false);
  }, [pathname, setNowPlayingOpen]);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.dataset.theme = resolved;
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      document.documentElement.dataset.theme = mq.matches ? "light" : "dark";
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      tick(dt);
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, currentId, tick]);

  useEffect(() => {
    const onVis = () => {
      const visible = document.visibilityState === "visible";
      setVisible(visible);
      if (!visible && useNeedle.getState().playback.playing) {
        toast("Playback pauses when the player is not visible");
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setVisible]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (event.key === "/" && !typing) {
        event.preventDefault();
        void navigate({ to: "/search" });
        return;
      }
      if (event.key === "?" && !typing) {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }
      if (event.key === "Escape") {
        setNowPlayingOpen(false);
        setQueueOpen(false);
        setShortcutsOpen(false);
        setMoreOpen(false);
        return;
      }
      if (typing) return;
      if (event.key === " " || event.key.toLowerCase() === "k") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "j") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key.toLowerCase() === "f" && currentId) {
        event.preventDefault();
        toggleFavorite(currentId);
      } else if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        setNowPlayingOpen(true);
      } else if (event.key.toLowerCase() === "q") {
        event.preventDefault();
        setQueueOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    currentId,
    navigate,
    next,
    prev,
    setNowPlayingOpen,
    setQueueOpen,
    setShortcutsOpen,
    toggleFavorite,
    togglePlay,
  ]);

  return (
    <div className="grain relative flex h-dvh flex-col bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      <div className="flex min-h-0 flex-1">
        <Sidebar pathname={pathname} />
        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
            <Link to="/" className="flex items-center gap-2">
              <NeedleMark className="size-6 text-accent" />
              <span className="font-display text-lg italic">Needle</span>
            </Link>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => setMoreOpen(true)}
            >
              More
            </Button>
          </header>
          <main
            id="main"
            className="scroll-thin relative min-h-0 flex-1 overflow-y-auto"
          >
            <Outlet />
          </main>
          <NowPlaying />
        </div>
      </div>
      <MiniPlayer />
      <MobileNav pathname={pathname} />
      <QueuePanel />
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          className: "bg-surface text-fg border-border",
        }}
      />
      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent title="Keyboard">
          <ul className="space-y-2 text-sm text-muted">
            <li><Kbd>/</Kbd> Search</li>
            <li><Kbd>Space</Kbd> or <Kbd>K</Kbd> Play / pause</li>
            <li><Kbd>←</Kbd> Previous · <Kbd>→</Kbd> or <Kbd>J</Kbd> Next</li>
            <li><Kbd>F</Kbd> Favorite current</li>
            <li><Kbd>N</Kbd> Now playing · <Kbd>Q</Kbd> Queue</li>
            <li><Kbd>?</Kbd> This list · <Kbd>Esc</Kbd> Close</li>
          </ul>
        </DialogContent>
      </Dialog>
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/70"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-xl border border-border bg-surface p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg">More</p>
              <Button
                variant="quiet"
                size="iconSm"
                aria-label="Close"
                onClick={() => setMoreOpen(false)}
              >
                <X />
              </Button>
            </div>
            <div className="grid gap-1">
              <Link
                to="/favorites"
                className="flex h-12 items-center gap-3 rounded-md px-3 hover:bg-elevated"
                onClick={() => setMoreOpen(false)}
              >
                <Heart className="size-4" /> Favorites
              </Link>
              <Link
                to="/history"
                className="flex h-12 items-center gap-3 rounded-md px-3 hover:bg-elevated"
                onClick={() => setMoreOpen(false)}
              >
                <Clock3 className="size-4" /> History
              </Link>
              <Link
                to="/settings"
                className="flex h-12 items-center gap-3 rounded-md px-3 hover:bg-elevated"
                onClick={() => setMoreOpen(false)}
              >
                <Settings className="size-4" /> Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-sm border border-border bg-elevated px-1.5 py-0.5 font-sans text-xs text-fg">
      {children}
    </kbd>
  );
}
