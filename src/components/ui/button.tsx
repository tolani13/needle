import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        secondary:
          "border border-border bg-elevated text-fg hover:bg-surface",
        ghost: "text-fg hover:bg-elevated",
        quiet: "text-muted hover:bg-elevated hover:text-fg",
        danger: "bg-danger text-fg hover:opacity-90",
      },
      size: {
        sm: "h-8 rounded-sm px-3 text-sm",
        md: "h-10 rounded-md px-4 text-sm",
        lg: "h-11 rounded-md px-5 text-base",
        icon: "size-11 rounded-md",
        iconSm: "size-8 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
