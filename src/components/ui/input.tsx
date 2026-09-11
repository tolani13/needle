import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-border bg-elevated px-3 text-base text-fg placeholder:text-subtle",
        "md:h-10 md:text-sm",
        className,
      )}
      {...props}
    />
  );
});
