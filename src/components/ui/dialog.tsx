import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70" />
      <DialogPrimitive.Content
        className={cn(
          "panel-dialog fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-5 shadow-panel",
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <DialogPrimitive.Title className="font-display text-xl font-medium tracking-tight text-fg">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close asChild>
            <Button variant="quiet" size="iconSm" aria-label="Close">
              <X />
            </Button>
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="sr-only">
          {title}
        </DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
