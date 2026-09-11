import { Link } from "@tanstack/react-router";
import {
  Clock3,
  Heart,
  Home,
  Library,
  ListMusic,
  Search,
  Settings,
} from "lucide-react";
import { NeedleMark } from "@/components/mock-player";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Library", icon: Library },
  { to: "/playlists", label: "Playlists", icon: ListMusic },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/history", label: "History", icon: Clock3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-5 py-6">
        <NeedleMark className="size-7 text-accent" />
        <div>
          <p className="font-display text-xl font-medium italic tracking-tight">
            Needle
          </p>
          <p className="text-xs tracking-widest text-subtle uppercase">
            Listening library
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Main">
        {NAV.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm",
                active
                  ? "bg-elevated text-fg"
                  : "text-muted hover:bg-elevated hover:text-fg",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-5 py-4 text-xs leading-relaxed text-subtle">
        Offline demo catalog. YouTube stays disconnected.
      </p>
    </aside>
  );
}

export function MobileNav({ pathname }: { pathname: string }) {
  const items = [
    NAV[0],
    NAV[1],
    NAV[2],
    NAV[3],
    NAV[6],
  ];
  return (
    <nav
      className="flex border-t border-border bg-surface md:hidden"
      aria-label="Main"
    >
      {items.map((item) => {
        const active =
          item.to === "/"
            ? pathname === "/"
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs",
              active ? "text-fg" : "text-muted",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
