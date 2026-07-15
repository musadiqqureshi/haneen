import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans text-[0.78rem] font-medium uppercase tracking-[0.18em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-300 text-white hover:bg-gold-500 shadow-[0_1px_0_rgba(0,0,0,0.02)]",
        dark: "bg-ink text-ivory hover:bg-gold-600",
        outline:
          "border border-gold-400 text-gold-700 hover:bg-gold-300 hover:text-white hover:border-gold-300",
        ghost: "text-ink hover:text-gold-600",
        blush: "bg-blush text-ink hover:bg-gold-300 hover:text-white",
      },
      size: {
        sm: "h-9 px-5",
        md: "h-11 px-8",
        lg: "h-13 px-10 py-4",
        icon: "h-10 w-10 p-0 tracking-normal",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
