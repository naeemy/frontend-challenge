import React from "react";
import { Text } from "@/components/ui";
import { clsx } from "clsx";
import type { TemperatureUnit } from "@/types/settings";

export interface TemperatureDisplayProps {
  temperature: number;
  unit?: TemperatureUnit;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  showUnit?: boolean;
  precision?: number;
  className?: string;
  variant?: "default" | "muted" | "primary" | "success" | "warning" | "error";
}

// Temperature conversion utilities
const convertTemperature = (temp: number, unit: TemperatureUnit): number => {
  if (unit === "fahrenheit") {
    return (temp * 9) / 5 + 32;
  }
  return temp; // Assume input is Celsius
};

const getTemperatureColor = (temp: number, unit: TemperatureUnit): string => {
  // Convert to Celsius for consistent color mapping
  const celsius = unit === "fahrenheit" ? ((temp - 32) * 5) / 9 : temp;

  if (celsius >= 35) return "text-red-600"; // Very hot
  if (celsius >= 25) return "text-orange-500"; // Hot
  if (celsius >= 15) return "text-yellow-600"; // Warm
  if (celsius >= 5) return "text-green-600"; // Mild

  if (celsius >= -5) return "text-blue-600"; // Cool
  return "text-purple-600"; // Very cold
};

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",

  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
  "2xl": "text-4xl",
};

const unitSizeClasses = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

export const TemperatureDisplay = React.forwardRef<
  HTMLSpanElement,
  TemperatureDisplayProps
>(
  (
    {
      temperature,
      unit = "celsius",
      size = "md",

      showUnit = true,

      precision = 0,
      className,
      variant = "default",
    },
    ref,
  ) => {
    const convertedTemp = convertTemperature(temperature, unit);
    const roundedTemp =
      Math.round(convertedTemp * Math.pow(10, precision)) /
      Math.pow(10, precision);
    const unitSymbol = unit === "celsius" ? "°C" : "°F";

    const getVariantColor = () => {
      switch (variant) {
        case "muted":
          return "text-gray-600";
        case "primary":
          return "text-blue-600";
        case "success":
          return "text-green-600";
        case "warning":
          return "text-yellow-600";
        case "error":
          return "text-red-600";
        case "default":

        default:
          return getTemperatureColor(roundedTemp, unit);
      }
    };

    return (
      <span
        ref={ref}
        className={clsx(
          "font-bold inline-flex items-baseline gap-0.5",
          sizeClasses[size],
          getVariantColor(),
          className,
        )}
      >
        <span className="tabular-nums">
          {precision > 0
            ? roundedTemp.toFixed(precision)
            : Math.round(roundedTemp)}
        </span>
        {showUnit && (
          <span
            className={clsx("font-normal opacity-75", unitSizeClasses[size])}
          >
            {unitSymbol}
          </span>
        )}
      </span>
    );
  },
);

TemperatureDisplay.displayName = "TemperatureDisplay";

// Preset temperature displays
export const LargeTemperature = (
  props: Omit<TemperatureDisplayProps, "size">,
) => <TemperatureDisplay size="xl" {...props} />;

export const SmallTemperature = (
  props: Omit<TemperatureDisplayProps, "size">,
) => <TemperatureDisplay size="sm" {...props} />;

// Temperature range display
export interface TemperatureRangeProps {
  minTemperature: number;
  maxTemperature: number;
  unit?: TemperatureUnit;
  size?: TemperatureDisplayProps["size"];
  className?: string;
  separator?: string;
}

export const TemperatureRange = React.forwardRef<
  HTMLSpanElement,
  TemperatureRangeProps
>(
  (
    {
      minTemperature,
      maxTemperature,
      unit = "celsius",
      size = "md",
      className,

      separator = " / ",
    },
    ref,
  ) => {
    return (
      <span ref={ref} className={clsx("flex items-baseline", className)}>
        <TemperatureDisplay
          temperature={maxTemperature}
          unit={unit}
          size={size}
          showUnit={false}
        />
        <Text size={size} variant="muted" className="mx-1">
          {separator}
        </Text>
        <TemperatureDisplay
          temperature={minTemperature}
          unit={unit}
          size={size}
          variant="muted"
        />
      </span>
    );
  },
);

TemperatureRange.displayName = "TemperatureRange";

// Temperature with comparison
export interface TemperatureCompareProps {
  temperature: number;
  previousTemperature?: number;
  unit?: TemperatureUnit;
  size?: TemperatureDisplayProps["size"];
  className?: string;
  showDifference?: boolean;
}

export const TemperatureCompare = React.forwardRef<
  HTMLSpanElement,
  TemperatureCompareProps
>(
  (
    {
      temperature,
      previousTemperature,
      unit = "celsius",
      size = "md",
      className,
      showDifference = true,
    },
    ref,
  ) => {
    if (!previousTemperature || !showDifference) {
      return (
        <TemperatureDisplay
          ref={ref}
          temperature={temperature}
          unit={unit}
          size={size}
          className={className}
        />
      );
    }

    const difference = temperature - previousTemperature;
    const absDifference = Math.abs(difference);
    const isIncrease = difference > 0;
    const isDecrease = difference < 0;

    return (
      <span ref={ref} className={clsx("flex items-baseline gap-2", className)}>
        <TemperatureDisplay temperature={temperature} unit={unit} size={size} />

        {absDifference > 0.5 && (
          <span
            className={clsx(
              "text-xs flex items-center gap-0.5",

              isIncrease && "text-red-500",
              isDecrease && "text-blue-500",
            )}
          >
            <span>{isIncrease ? "↗" : "↘"}</span>
            <TemperatureDisplay
              temperature={absDifference}
              unit={unit}
              size="xs"
              variant={isIncrease ? "error" : "primary"}
            />
          </span>
        )}
      </span>
    );
  },
);

TemperatureCompare.displayName = "TemperatureCompare";
