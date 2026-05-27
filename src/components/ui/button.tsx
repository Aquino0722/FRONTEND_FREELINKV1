import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-brand text-white hover:bg-[#5149ed]",
        secondary: "border bg-white text-slate-700 hover:bg-slate-50",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
      },
      size: { default: "h-10 px-4", sm: "h-9 rounded-lg px-3", lg: "h-12 px-6" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
