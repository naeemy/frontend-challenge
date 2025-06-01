import React from "react";
import { Card, CardContent, Text, Button, Icon } from "@/components/ui";
import {
  WeatherIcon,
  TemperatureDisplay,
  LocationDisplay,
} from "@/components/features";
import { clsx } from "clsx";
import type { City } from "@/types/location";

import type { WeatherData } from "@/types/weather";
import type { TemperatureUnit } from "@/types/settings";

export interface CityCardProps {
  city: City;
  weather?: WeatherData;
  temperatureUnit?: TemperatureUnit;
  isLoading?: boolean;

  error?: string;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";

  showRemoveButton?: boolean;
  showTime?: boolean;
}

export const CityCard = React.forwardRef<HTMLDivElement, CityCardProps>(
  (
    {
      city,
      weather,
      temperatureUnit = "celsius",
      isLoading = false,
      error,
      onClick,
      onRemove,
      className,
      size = "md",
      showRemoveButton = true,
      showTime = true,
    },
    ref,
  ) => {
    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    };

    const getWeatherCardVariant = (condition?: string) => {
      if (!condition) return "default";

      const lowerCondition = condition.toLowerCase();
      if (lowerCondition.includes("clear") || lowerCondition.includes("sunny"))
        return "weather";
      if (lowerCondition.includes("rain")) return "default";
      if (lowerCondition.includes("cloud")) return "default";
      if (lowerCondition.includes("snow")) return "default";

      return "default";
    };

    const cardSizes = {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <Card
        ref={ref}
        variant={error ? "error" : getWeatherCardVariant(weather?.condition)}
        padding="none"
        className={clsx(
          cardSizes[size],
          "transition-all duration-200 cursor-pointer group",
          "hover:shadow-md hover:scale-[1.02]",
          error && "border-red-200 bg-red-50",
          className,
        )}
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* Header with location and remove button */}
          <div className="flex items-start justify-between mb-3">
            <LocationDisplay
              city={city}
              showTime={showTime}
              size={size === "sm" ? "sm" : "md"}
              className="flex-1 min-w-0"
            />

            {showRemoveButton && onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className={clsx(
                  "opacity-0 group-hover:opacity-100 transition-opacity p-1",
                  "text-gray-400 hover:text-red-500 hover:bg-red-50",
                )}
                aria-label={`Remove ${city.name}`}
              >
                <Icon name="close" size="sm" />
              </Button>
            )}
          </div>

          {/* Weather Content */}

          <div className="space-y-3">
            {error ? (
              <div className="flex items-center gap-2 text-red-600">
                <Icon name="warning" size="sm" />

                <Text size="sm" className="text-red-600">
                  Failed to load weather
                </Text>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : weather ? (
              <div className="flex items-center justify-between">
                {/* Weather Icon and Condition */}
                <div className="flex items-center gap-3">
                  <WeatherIcon
                    condition={weather.condition}
                    icon={weather.icon!}
                    size={size === "sm" ? "md" : "lg"}
                  />
                  <div>
                    <Text
                      weight="medium"
                      className="text-gray-900 capitalize"
                      size={size === "sm" ? "sm" : "md"}
                    >
                      {weather.condition}
                    </Text>
                    <Text
                      size="sm"
                      variant="muted"
                      className="flex items-center gap-1"
                    >
                      <Icon name="wind" size="xs" />
                      {weather.windSpeed}{" "}
                      {temperatureUnit === "celsius" ? "km/h" : "mph"}
                    </Text>
                  </div>
                </div>

                {/* Temperature */}
                <TemperatureDisplay
                  temperature={weather.temperature}
                  unit={temperatureUnit}
                  size={size === "sm" ? "md" : "lg"}
                  className="text-right"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <Icon name="cloud" size="sm" />
                <Text size="sm">Weather data unavailable</Text>
              </div>
            )}

            {/* Additional Weather Info */}
            {weather && !isLoading && !error && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Icon name="humidity" size="xs" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="pressure" size="xs" />
                    <span>{weather.pressure} hPa</span>
                  </div>
                </div>

                {weather.feelsLike !== undefined && (
                  <Text size="sm" variant="muted">
                    Feels like{" "}
                    <TemperatureDisplay
                      temperature={weather.feelsLike}
                      unit={temperatureUnit}
                      size="sm"
                      showUnit={false}
                    />
                    °
                  </Text>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },
);

CityCard.displayName = "CityCard";
