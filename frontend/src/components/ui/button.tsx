import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-md text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2",
          {
            "bg-primary text-white hover:bg-primary/90 shadow-md active:scale-[0.98]":
              variant === "primary",
            "bg-zinc-800 text-white hover:bg-zinc-700": variant === "secondary",
            "bg-destructive text-white hover:bg-destructive/95":
              variant === "destructive",
            "border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900":
              variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
