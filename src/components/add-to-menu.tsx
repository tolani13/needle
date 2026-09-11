import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Heart, ListMusic, ListPlus, ListEnd, ListStart, FolderPlus } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useNeedle } from "@/lib/needle/store";
import { cn } from "@/lib/utils";

export function AddToMenu({
  trackId,
  align = "end",
  label = "More actions",
}: {
  trackId: string;
  align?: "start" | "end";
  label?: string;
}) {
  const playlists = useNeedle((s) => s.playlists);
  const playlistOrder = useNeedle((s) => s.playlistOrder);
  const favorites = useNeedle((s) => s.favorites);
  const library = useNeedle((s) => s.library);
  const addNext = useNeedle((s) => s.addNext);
  const addToEnd = useNeedle((s) => s.addToEnd);
  const toggleFavorite = useNeedle((s) => s.toggleFavorite);
  const saveToLibrary = useNeedle((s) => s.saveToLibrary);
  const addToPlaylist = useNeedle((s) => s.addToPlaylist);
  const createPlaylist = useNeedle((s) => s.createPlaylist);
  const inLibrary = library.some((i) => i.trackId === trackId);
  const liked = favorites.includes(trackId);

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <Button variant="quiet" size="iconSm" aria-label={label}>
          <ListPlus />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-52 rounded-md border border-border bg-surface p-1 shadow-panel"
        >
          <Item
            onSelect={() => {
              addNext(trackId);
              toast("Playing next");
            }}
          >
            <ListStart /> Play next
          </Item>
          <Item
            onSelect={() => {
              addToEnd(trackId);
              toast("Added to the end of the queue");
            }}
          >
            <ListEnd /> Add to end of queue
          </Item>
          <Item
            onSelect={() => {
              toggleFavorite(trackId);
              toast(liked ? "Removed from favorites" : "Added to favorites");
            }}
          >
            <Heart className={liked ? "fill-fg" : ""} />
            {liked ? "Remove favorite" : "Add to favorites"}
          </Item>
          {!inLibrary && (
            <Item
              onSelect={() => {
                saveToLibrary([trackId]);
                toast("Saved to library");
              }}
            >
              <FolderPlus /> Save to library
            </Item>
          )}
          <Dropdown.Separator className="my-1 h-px bg-border" />
          <Dropdown.Label className="px-2 py-1 text-xs text-subtle">
            Playlists
          </Dropdown.Label>
          {playlistOrder.length === 0 && (
            <p className="px-2 py-1 text-xs text-muted">No playlists yet</p>
          )}
          {playlistOrder.map((id) => {
            const pl = playlists.find((p) => p.id === id);
            if (!pl) return null;
            return (
              <Item
                key={id}
                onSelect={() => {
                  addToPlaylist(id, [trackId]);
                  toast(`Added to ${pl.name}`);
                }}
              >
                <ListMusic /> {pl.name}
              </Item>
            );
          })}
          <Item
            onSelect={() => {
              const name = window.prompt("Playlist name");
              if (!name) return;
              const id = createPlaylist(name, [trackId]);
              if (id) toast(`Created ${name.trim()}`);
            }}
          >
            <ListPlus /> New playlist
          </Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

function Item({
  children,
  onSelect,
  className,
}: {
  children: ReactNode;
  onSelect: () => void;
  className?: string;
}) {
  return (
    <Dropdown.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm text-fg outline-none data-[highlighted]:bg-elevated",
        className,
      )}
    >
      {children}
    </Dropdown.Item>
  );
}
