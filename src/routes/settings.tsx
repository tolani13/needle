import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getMediaProvider } from "@/lib/needle/provider";
import { exportState, validateImport } from "@/lib/needle/persistence";
import { useNeedle } from "@/lib/needle/store";
import type { PlayerSizePref, ThemePref } from "@/lib/needle/types";
import { HIDDEN_PAUSE_MESSAGE } from "@/lib/needle/types";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings · Needle" }] }),
});

function SettingsPage() {
  const settings = useNeedle((s) => s.settings);
  const setTheme = useNeedle((s) => s.setTheme);
  const setPlayerSize = useNeedle((s) => s.setPlayerSize);
  const replaceState = useNeedle((s) => s.replaceState);
  const reset = useNeedle((s) => s.reset);
  const playback = useNeedle((s) => s.playback);
  const setVisible = useNeedle((s) => s.setVisible);
  const setShortcutsOpen = useNeedle((s) => s.setShortcutsOpen);
  const [resetOpen, setResetOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const provider = getMediaProvider();

  const onExport = () => {
    const state = useNeedle.getState();
    const blob = new Blob([exportState(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "needle-library.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Library exported");
  };

  const onImport = async (file: File) => {
    const text = await file.text();
    const result = validateImport(text);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    replaceState(result.state);
    toast("Library imported");
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-8 md:px-8">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Needle keeps your library on this device.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-lg">YouTube</h2>
        <p className="mt-2 text-sm text-muted">
          {provider.connected
            ? "Connected"
            : "Not connected — using the offline catalog."}
        </p>
        <p className="mt-2 text-sm text-subtle">
          Live search and the official visible player come later. Needle will never
          download media, extract audio, or keep playing when the player is hidden.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-lg">Appearance</h2>
        <div className="mt-4 grid gap-2">
          {(["dark", "light", "system"] as ThemePref[]).map((value) => (
            <label key={value} className="flex h-11 items-center gap-3 text-sm">
              <input
                type="radio"
                name="theme"
                checked={settings.theme === value}
                onChange={() => setTheme(value)}
                className="accent-accent"
              />
              {value === "dark" ? "Dark" : value === "light" ? "Light" : "Match device"}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-lg">Player</h2>
        <div className="mt-4 grid gap-2">
          {(["full", "compact"] as PlayerSizePref[]).map((value) => (
            <label key={value} className="flex h-11 items-center gap-3 text-sm">
              <input
                type="radio"
                name="playerSize"
                checked={settings.playerSize === value}
                onChange={() => setPlayerSize(value)}
                className="accent-accent"
              />
              {value === "full" ? "Expanded now playing" : "Compact mini player"}
            </label>
          ))}
        </div>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => setVisible(!playback.playerVisible)}
        >
          {playback.playerVisible ? "Simulate hidden window" : "Show player again"}
        </Button>
        {!playback.playerVisible && (
          <p className="mt-3 text-sm text-warn">{HIDDEN_PAUSE_MESSAGE}</p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-lg">Library data</h2>
        <p className="mt-2 text-sm text-muted">
          Export a JSON copy, import one back, or restore the demo library.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onExport}>
            Export
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            Import
          </Button>
          <Button variant="quiet" onClick={() => setResetOpen(true)}>
            Restore demo library
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onImport(file);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-lg">Keyboard</h2>
        <p className="mt-2 text-sm text-muted">
          Space plays and pauses. Slash jumps to search.
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => setShortcutsOpen(true)}>
          View shortcuts
        </Button>
      </section>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent title="Restore the demo library?">
          <p className="mb-4 text-sm text-muted">
            Playlists, favorites, queue, and history on this device will be replaced
            with the demo catalog.
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => {
                reset();
                setResetOpen(false);
                toast("Demo library restored");
              }}
            >
              Restore demo
            </Button>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Keep mine
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
