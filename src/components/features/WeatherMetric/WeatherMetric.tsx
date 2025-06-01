import React from "react";
import { Card, CardContent, Text, Icon } from "@/components/ui";
import { clsx } from "clsx";
import type { IconName } from "@/components/ui/Icon";

export interface WeatherMetricProps {
  label: string;
  value: string | number;
  unit?: string;

  icon?: IconName;

  trend?: "up" | "down" | "stable";
  trendValue?: string | number;
  description?: string;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
  layout?: "horizontal" | "vertical";
}

const sizeConfig = {
  sm: {
    icon: "sm" as const,
    value: "lg" as const,
    label: "sm" as const,
    padding: "p-3",
  },
  md: {
    icon: "md" as const,
    value: "xl" as const,
    label: "sm" as const,
    padding: "p-4",
  },
  lg: {
    icon: "lg" as const,
    value: "2xl" as const,
    label: "md" as const,
    padding: "p-6",
  },
};

const variantConfig = {
  default: {
    card: "border-gray-200",
    icon: "text-gray-600",
    value: "text-gray-900",
    label: "text-gray-600",
  },
  primary: {
    card: "border-blue-200 bg-blue-50",
    icon: "text-blue-600",
    value: "text-blue-900",
    label: "text-blue-700",
  },
  success: {
    card: "border-green-200 bg-green-50",
    icon: "text-green-600",
    value: "text-green-900",
    label: "text-green-700",
  },
  warning: {
    card: "border-yellow-200 bg-yellow-50",
    icon: "text-yellow-600",
    value: "text-yellow-900",
    label: "text-yellow-700",
  },

  error: {
    card: "border-red-200 bg-red-50",

    icon: "text-red-600",
    value: "text-red-900",
    label: "text-red-700",
  },
};

export const WeatherMetric = React.forwardRef<
  HTMLDivElement,
  WeatherMetricProps
>(
  (
    {
      label,
      value,
      unit,
      icon,
      trend,
      trendValue,
      description,
      variant = "default",
      size = "md",
      className,
      layout = "vertical",
    },
    ref,
  ) => {
    const config = sizeConfig[size];
    const colors = variantConfig[variant];

    const renderTrend = () => {
      if (!trend || !trendValue) return null;

      const trendIcons = {
        up: "chevron-up",
        down: "chevron-down",
        stable: "minus",
      } as const;

      const trendColors = {
        up: "text-green-600",
        down: "text-red-600",
        stable: "text-gray-600",
      };

      return (
        <div className={clsx("flex items-center gap-1", trendColors[trend])}>
          <Icon name={trendIcons[trend] as any} size="xs" />
          <Text size="xs" className={trendColors[trend]}>
            {trendValue}
            {unit && ` ${unit}`}
          </Text>
        </div>
      );
    };

    const formatValue = (val: string | number) => {
      if (typeof val === "number") {
        // Format numbers with appropriate decimal places
        if (val % 1 === 0) return val.toString();
        return val.toFixed(1);
      }
      return val;
    };

    if (layout === "horizontal") {
      return (
        <Card
          ref={ref}
          className={clsx(
            "transition-all duration-200",
            colors.card,
            className,
          )}
          padding="none"
        >
          <CardContent className={config.padding}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className={clsx("flex-shrink-0", colors.icon)}>
                    <Icon name={icon} size={config.icon} />
                  </div>
                )}
                <div>
                  <Text size={config.label} className={colors.label}>
                    {label}
                  </Text>
                  {description && (
                    <Text size="xs" variant="muted">
                      {description}
                    </Text>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <Text
                    size={config.value}
                    weight="bold"
                    className={colors.value}
                  >
                    {formatValue(value)}
                  </Text>
                  {unit && (
                    <Text size="sm" className={colors.label}>
                      {unit}
                    </Text>
                  )}
                </div>
                {renderTrend()}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        className={clsx("transition-all duration-200", colors.card, className)}
        padding="none"
      >
        <CardContent className={config.padding}>
          <div className="text-center space-y-2">
            {icon && (
              <div className={clsx("flex justify-center", colors.icon)}>
                <Icon name={icon} size={config.icon} />
              </div>
            )}

            <div>
              <div className="flex items-baseline justify-center gap-1">
                <Text
                  size={config.value}
                  weight="bold"
                  className={colors.value}
                >
                  {formatValue(value)}
                </Text>
                {unit && (
                  <Text size="sm" className={colors.label}>
                    {unit}
                  </Text>
                )}
              </div>

              {renderTrend()}
            </div>

            <div>
              <Text size={config.label} className={colors.label}>
                {label}
              </Text>

              {description && (
                <Text size="xs" variant="muted" className="mt-1">
                  {description}
                </Text>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

WeatherMetric.displayName = "WeatherMetric";

// Preset metric components for common weather metrics
export const WindMetric = (
  props: Omit<WeatherMetricProps, "icon" | "label">,
) => <WeatherMetric icon="wind" label="Wind Speed" {...props} />;

export const HumidityMetric = (
  props: Omit<WeatherMetricProps, "icon" | "label">,
) => <WeatherMetric icon="humidity" label="Humidity" {...props} />;

export const PressureMetric = (
  props: Omit<WeatherMetricProps, "icon" | "label">,
) => <WeatherMetric icon="pressure" label="Pressure" {...props} />;

export const VisibilityMetric = (
  props: Omit<WeatherMetricProps, "icon" | "label">,
) => <WeatherMetric icon={"eye" as any} label="Visibility" {...props} />;

export const UVIndexMetric = (
  props: Omit<WeatherMetricProps, "icon" | "label">,
) => <WeatherMetric icon="sun" label="UV Index" {...props} />;
