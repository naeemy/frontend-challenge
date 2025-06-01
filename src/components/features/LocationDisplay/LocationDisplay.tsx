"use client";

import React, { useState, useEffect } from "react";
import { Text, Icon } from "@/components/ui";
import { clsx } from "clsx";
import type { City } from "@/types/location";

export interface LocationDisplayProps {
  city: City;
  showTime?: boolean;
  showCoordinates?: boolean;
  showCountryFlag?: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  className?: string;
}

const sizeConfig = {
  sm: {
    cityName: "sm" as const,
    countryName: "xs" as const,
    time: "xs" as const,
    icon: "xs" as const,
  },
  md: {
    cityName: "lg" as const,
    countryName: "sm" as const,
    time: "sm" as const,
    icon: "sm" as const,
  },
  lg: {
    cityName: "xl" as const,
    countryName: "md" as const,
    time: "md" as const,
    icon: "md" as const,
  },
};

export const LocationDisplay = React.forwardRef<
  HTMLDivElement,
  LocationDisplayProps
>(
  (
    {
      city,
      showTime = false,
      showCoordinates = false,
      showCountryFlag = true,
      size = "md",
      layout = "vertical",

      className,
    },
    ref,
  ) => {
    const [currentTime, setCurrentTime] = useState<string>("");

    const config = sizeConfig[size];

    // Update time every minute if showTime is enabled
    useEffect(() => {
      if (!showTime || !city.timezone) return;

      const updateTime = () => {
        try {
          const now = new Date();
          const timeString = now.toLocaleTimeString("en-US", {
            timeZone: city.timezone,
            hour: "2-digit",
            minute: "2-digit",

            hour12: true,
          });
          setCurrentTime(timeString);
        } catch (error) {
          // Fallback if timezone is invalid
          const now = new Date();

          setCurrentTime(
            now.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          );
        }
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }, [showTime, city.timezone]);

    const getCountryFlag = (countryCode: string) => {
      try {
        return countryCode
          .toUpperCase()
          .split("")
          .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
          .join("");
      } catch {
        return "🌍"; // Fallback emoji
      }
    };

    const formatCoordinates = (lat: number, lon: number) => {
      const latDir = lat >= 0 ? "N" : "S";
      const lonDir = lon >= 0 ? "E" : "W";
      return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
    };

    if (layout === "horizontal") {
      return (
        <div ref={ref} className={clsx("flex items-center gap-3", className)}>
          <Icon name="location" size={config.icon} variant="muted" />

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {showCountryFlag && (
                <span className="text-lg leading-none flex-shrink-0">
                  {getCountryFlag(city.country)}
                </span>
              )}

              <Text
                size={config.cityName}
                weight="semibold"
                className="text-gray-900 truncate"
              >
                {city.name}
              </Text>

              <Text
                size={config.countryName}
                variant="muted"
                className="truncate"
              >
                {city.state ? `${city.state}, ` : ""}
                {city.country}
              </Text>
            </div>

            {showTime && currentTime && (
              <>
                <span className="text-gray-300">•</span>
                <Text
                  size={config.time}
                  variant="muted"
                  className="flex-shrink-0"
                >
                  {currentTime}
                </Text>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx("space-y-1", className)}>
        <div className="flex items-center gap-2">
          <Icon name="location" size={config.icon} variant="muted" />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {showCountryFlag && (
              <span className="text-lg leading-none flex-shrink-0">
                {getCountryFlag(city.country)}
              </span>
            )}
            <Text
              size={config.cityName}
              weight="semibold"
              className="text-gray-900 truncate"
            >
              {city.name}
            </Text>
          </div>
        </div>

        <div className="space-y-0.5">
          <Text size={config.countryName} variant="muted">
            {city.state ? `${city.state}, ` : ""}
            {city.country}
          </Text>

          {showTime && currentTime && (
            <Text
              size={config.time}
              variant="muted"
              className="flex items-center gap-1"
            >
              <Icon name="clock" size="xs" />
              {currentTime}
            </Text>
          )}

          {showCoordinates && city.coordinates && (
            <Text size={config.time} variant="subtle" className="font-mono">
              {formatCoordinates(city.coordinates.lat, city.coordinates.lon)}
            </Text>
          )}
        </div>
      </div>
    );
  },
);

LocationDisplay.displayName = "LocationDisplay";

// Preset location displays
export const CompactLocation = (
  props: Omit<LocationDisplayProps, "size" | "layout">,
) => <LocationDisplay size="sm" layout="horizontal" {...props} />;

export const DetailedLocation = (
  props: Omit<LocationDisplayProps, "showCoordinates" | "showTime">,
) => <LocationDisplay showCoordinates showTime {...props} />;
