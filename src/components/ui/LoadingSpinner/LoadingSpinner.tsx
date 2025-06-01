import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-blue-600",

      muted: "text-gray-400",
      white: "text-white",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export interface LoadingSpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export const LoadingSpinner = React.forwardRef<
  SVGSVGElement,
  LoadingSpinnerProps
>(({ className, size, variant, label = "Loading...", ...props }, ref) => {
  return (
    <div className="inline-flex items-center gap-2">
      <svg
        className={clsx(spinnerVariants({ size, variant }), className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        ref={ref}
        aria-label={label}
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      <span className="sr-only">{label}</span>
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

// Additional spinner variants for different use cases
export const LoadingDots = React.forwardRef<
  HTMLDivElement,
  { className?: string; size?: "sm" | "md" | "lg" }
>(({ className, size = "md" }, ref) => {
  const dotSizes = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3",
  };

  return (
    <div ref={ref} className={clsx("flex space-x-1", className)}>
      <div
        className={clsx(
          "rounded-full bg-current animate-bounce",
          dotSizes[size],
        )}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={clsx(
          "rounded-full bg-current animate-bounce",
          dotSizes[size],
        )}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={clsx(
          "rounded-full bg-current animate-bounce",
          dotSizes[size],
        )}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
});

LoadingDots.displayName = "LoadingDots";

export const LoadingPulse = React.forwardRef<
  HTMLDivElement,
  { className?: string; size?: "sm" | "md" | "lg" }
>(({ className, size = "md" }, ref) => {
  const pulseSizes = {
    sm: "h-8 w-8",

    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div ref={ref} className={clsx("relative", pulseSizes[size], className)}>
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping" />
      <div className="relative rounded-full bg-blue-500 h-full w-full" />
    </div>
  );
});

LoadingPulse.displayName = "LoadingPulse";
