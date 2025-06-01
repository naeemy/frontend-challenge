import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",

  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        secondary:
          "border-transparent bg-gray-600 text-white hover:bg-gray-700",
        destructive:
          "border-transparent bg-red-100 text-red-900 hover:bg-red-200",
        success:
          "border-transparent bg-green-100 text-green-900 hover:bg-green-200",
        warning:
          "border-transparent bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
        info: "border-transparent bg-blue-100 text-blue-900 hover:bg-blue-200",

        outline: "border-gray-300 text-gray-700 hover:bg-gray-50",
        weather:
          "border-transparent bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900",
      },

      size: {
        sm: "px-1.5 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  removable?: boolean;

  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,

      size,
      icon,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={clsx(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {icon && <span className="mr-1 flex-shrink-0">{icon}</span>}

        {children}

        {removable && onRemove && (
          <button
            type="button"
            className="ml-1 flex-shrink-0 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-gray-500"
            onClick={onRemove}
            aria-label="Remove"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

Badge.displayName = "Badge";

// Weather-specific badge variants
export const WeatherBadge = React.forwardRef<
  HTMLDivElement,
  Omit<BadgeProps, "variant"> & { condition?: string }
>(({ condition, className, ...props }, ref) => {
  const getWeatherVariant = (condition?: string): BadgeProps["variant"] => {
    if (!condition) return "weather";

    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes("rain") || lowerCondition.includes("storm"))
      return "info";

    if (lowerCondition.includes("snow")) return "default";
    if (lowerCondition.includes("cloud")) return "secondary";
    if (lowerCondition.includes("clear") || lowerCondition.includes("sunny"))
      return "warning";

    return "weather";
  };

  return (
    <Badge
      ref={ref}
      variant={getWeatherVariant(condition)}
      className={className}
      {...props}
    />
  );
});

WeatherBadge.displayName = "WeatherBadge";
