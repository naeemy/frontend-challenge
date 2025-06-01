import React from "react";
import { Card, CardContent, Text } from "@/components/ui";
import {
  WeatherIcon,
  TemperatureDisplay,
  TemperatureRange,
} from "@/components/features";
import { clsx } from "clsx";
import type { ForecastData } from "@/types/forecast";
import type { TemperatureUnit } from "@/types/settings";

export interface ForecastCardProps {
  forecast: ForecastData;
  temperatureUnit?: TemperatureUnit;

  layout?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
  timeFormat?: "12h" | "24h";
}

const sizeConfig = {
  sm: {
    padding: "p-2",
    icon: "sm" as const,
    time: "xs" as const,
    temp: "sm" as const,
    details: "xs" as const,
  },
  md: {
    padding: "p-3",

    icon: "md" as const,
    time: "sm" as const,

    temp: "md" as const,
    details: "xs" as const,
  },
  lg: {
    padding: "p-4",
    icon: "lg" as const,
    time: "md" as const,
    temp: "lg" as const,
    details: "sm" as const,
  },
};

export const ForecastCard = React.forwardRef<HTMLDivElement, ForecastCardProps>(
  (
    {
      forecast,
      temperatureUnit = "celsius",
      layout = "vertical",
      size = "md",
      showDetails = false,
      className,
      timeFormat = "12h",
    },
    ref,
  ) => {
    const config = sizeConfig[size];

    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp * 1000);

      if (timeFormat === "24h") {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });
    };

    const formatDate = (timestamp: number) => {
      const date = new Date(timestamp * 1000);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      // Check if it's today
      if (date.toDateString() === now.toDateString()) {
        return "Today";
      }

      // Check if it's tomorrow
      if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      }

      // Otherwise show day of week
      return date.toLocaleDateString("en-US", { weekday: "short" });
    };

    const isToday = () => {
      const forecastDate = new Date(forecast.dt * 1000);
      const today = new Date();
      return forecastDate.toDateString() === today.toDateString();
    };

    const getCardVariant = () => {
      if (isToday()) return "primary";
      return "default";
    };

    if (layout === "horizontal") {
      return (
        <Card
          ref={ref}
          variant={getCardVariant()}
          padding="none"
          className={clsx(
            "transition-all duration-200 hover:shadow-md",
            className,
          )}
        >
          <CardContent className={config.padding}>
            <div className="flex items-center justify-between gap-3">
              {/* Time/Date */}
              <div className="flex-shrink-0">
                <Text
                  size={config.time}
                  weight="medium"
                  className="text-gray-900"
                >
                  {formatTime(forecast.dt)}
                </Text>
                {size !== "sm" && (
                  <Text size="xs" variant="muted">
                    {formatDate(forecast.dt)}
                  </Text>
                )}
              </div>

              {/* Weather Icon */}
              <WeatherIcon
                condition={forecast.condition}
                icon={forecast.icon}
                size={config.icon}
                className="flex-shrink-0"
              />

              {/* Temperature */}
              <div className="flex-shrink-0 text-right">
                {forecast.maxTemp !== undefined &&
                forecast.minTemp !== undefined ? (
                  <TemperatureRange
                    maxTemperature={forecast.maxTemp}
                    minTemperature={forecast.minTemp}
                    unit={temperatureUnit}
                    size={config.temp}
                  />
                ) : (
                  <TemperatureDisplay
                    temperature={forecast.temperature}
                    unit={temperatureUnit}
                    size={config.temp}
                  />
                )}

                {showDetails && forecast.precipitation !== undefined && (
                  <Text size={config.details} variant="muted" className="mt-1">
                    {forecast.precipitation}% rain
                  </Text>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        ref={ref}
        variant={getCardVariant()}
        padding="none"
        className={clsx(
          "transition-all duration-200 hover:shadow-md",
          className,
        )}
      >
        <CardContent className={config.padding}>
          <div className="text-center space-y-2">
            {/* Time/Date */}
            <div>
              <Text
                size={config.time}
                weight="medium"
                className="text-gray-900"
              >
                {formatTime(forecast.dt)}
              </Text>
              <Text size="xs" variant="muted">
                {formatDate(forecast.dt)}
              </Text>
            </div>

            {/* Weather Icon */}

            <WeatherIcon
              condition={forecast.condition}
              icon={forecast.icon}
              size={config.icon}
              className="mx-auto"
            />

            {/* Temperature */}
            <div>
              {forecast.maxTemp !== undefined &&
              forecast.minTemp !== undefined ? (
                <TemperatureRange
                  maxTemperature={forecast.maxTemp}
                  minTemperature={forecast.minTemp}
                  unit={temperatureUnit}
                  size={config.temp}
                  className="justify-center"
                />
              ) : (
                <TemperatureDisplay
                  temperature={forecast.temperature}
                  unit={temperatureUnit}
                  size={config.temp}
                />
              )}
            </div>

            {/* Additional Details */}
            {showDetails && (
              <div className="space-y-1 pt-1 border-t border-gray-100">
                {forecast.condition && (
                  <Text
                    size={config.details}
                    variant="muted"
                    className="capitalize"
                  >
                    {forecast.condition}
                  </Text>
                )}

                <div className="flex justify-center gap-3 text-xs text-gray-500">
                  {forecast.precipitation !== undefined && (
                    <span>☔ {forecast.precipitation}%</span>
                  )}
                  {forecast.windSpeed !== undefined && (
                    <span>
                      💨 {forecast.windSpeed}{" "}
                      {temperatureUnit === "celsius" ? "km/h" : "mph"}
                    </span>
                  )}
                  {forecast.humidity !== undefined && (
                    <span>💧 {forecast.humidity}%</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
);

ForecastCard.displayName = "ForecastCard";

// Preset forecast card variants
export const HourlyForecastCard = (
  props: Omit<ForecastCardProps, "layout" | "size">,
) => <ForecastCard layout="horizontal" size="sm" {...props} />;

export const DailyForecastCard = (
  props: Omit<ForecastCardProps, "layout" | "showDetails">,
) => <ForecastCard layout="vertical" showDetails {...props} />;

export const CompactForecastCard = (
  props: Omit<ForecastCardProps, "size" | "showDetails">,
) => <ForecastCard size="sm" showDetails={false} {...props} />;
