import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { TrackRow } from "@/components/track-row";
import { Button } from "@/components/ui/button";
import { getTracks } from "@/lib/needle/catalog";
import { formatDuration } from "@/lib/needle/format";
import { totalDuration } from "@/lib/needle/catalog";
import { useNeedle } from "@/lib/needle/store";

export function QueuePanel() {
  const open = useNeedle((s) => s.queueOpen);
  const setOpen = useNeedle((s) => s.setQueueOpen);
  const queue = useNeedle((s) => s.queue);
  const queueIndex = useNeedle((s) => s.queueIndex);
  const playback = useNeedle((s) => s.playback);
  const playNow = useNeedle((s) => s.playNow);
  const removeFromQueue = useNeedle((s) => s.removeFromQueue);
  const reorderQueue = useNeedle((s) => s.reorderQueue);
  const clearQueue = useNeedle((s) => s.clearQueue);
  const tracks = getTracks(queue);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/60" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-panel">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <Dialog.Title className="font-display text-xl">Queue</Dialog.Title>
              <p className="text-xs text-muted">
                {tracks.length} items · {formatDuration(totalDuration(queue))}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="quiet"
                size="sm"
                onClick={() => setConfirmClear(true)}
                disabled={queue.length === 0}
              >
                Clear
              </Button>
              <Dialog.Close asChild>
                <Button variant="quiet" size="iconSm" aria-label="Close queue">
                  <X />
                </Button>
              </Dialog.Close>
            </div>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto px-2 pb-6">
            {tracks.length === 0 ? (
              <p className="px-3 py-8 text-sm text-muted">
                The queue is empty. Play something, or add next from Search.
              </p>
            ) : (
              tracks.map((track, index) => (
                <TrackRow
                  key={`${track.id}-${index}`}
                  track={track}
                  index={index}
                  current={index === queueIndex}
                  playing={index === queueIndex && playback.playing}
                  onPlay={() => playNow(track.id)}
                  draggable
                  onDragStart={() => setDragFrom(index)}
                  onDrop={() => {
                    if (dragFrom !== null) reorderQueue(dragFrom, index);
                    setDragFrom(null);
                  }}
                  trailing={
                    <Button
                      variant="quiet"
                      size="iconSm"
                      aria-label={`Remove ${track.title} from queue`}
                      onClick={() => removeFromQueue(index)}
                    >
                      <Trash2 />
                    </Button>
                  }
                />
              ))
            )}
          </div>
          {confirmClear && (
            <div className="border-t border-border px-4 py-3">
              <p className="mb-3 text-sm">Clear the whole queue?</p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    clearQueue();
                    setConfirmClear(false);
                  }}
                >
                  Clear queue
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmClear(false)}
                >
                  Keep it
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
