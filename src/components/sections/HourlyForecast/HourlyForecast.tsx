"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
  Button,
  Icon,
} from "@/components/ui";
import { ForecastCard, HourlyForecastCard } from "@/components/features";
import { clsx } from "clsx";
import type { ForecastData } from "@/types/forecast";
import type { TemperatureUnit } from "@/types/settings";

export interface HourlyForecastProps {
  forecast: ForecastData[];
  temperatureUnit?: TemperatureUnit;
  className?: string;

  title?: string;
  showDays?: number;
  layout?: "horizontal" | "grid";
  timeFormat?: "12h" | "24h";
}

export const HourlyForecast = React.forwardRef<
  HTMLDivElement,
  HourlyForecastProps
>(
  (
    {
      forecast,
      temperatureUnit = "celsius",
      className,
      title = "24-Hour Forecast",
      showDays = 1,
      layout = "horizontal",
      timeFormat = "12h",
    },
    ref,
  ) => {
    const [selectedDay, setSelectedDay] = useState(0);
    const [showExtended, setShowExtended] = useState(false);

    // Group forecast by days
    const groupedForecast = React.useMemo(() => {
      const groups: { [key: string]: ForecastData[] } = {};

      forecast.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();

        if (!groups[dayKey]) {
          groups[dayKey] = [];
        }
        groups[dayKey].push(item);
      });

      return Object.entries(groups)
        .slice(0, showDays)
        .map(([dateString, items]) => ({
          date: new Date(dateString),
          items: items.slice(0, showExtended ? 24 : 8), // Show 8 or 24 hours
        }));
    }, [forecast, showDays, showExtended]);

    const formatDayHeader = (date: Date) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
      } else {
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
      }
    };

    if (forecast.length === 0) {
      return (
        <Card ref={ref} className={className}>
          <CardContent className="py-12 text-center">
            <Icon
              name="cloud"
              size="lg"
              variant="muted"
              className="mx-auto mb-3"
            />
            <Text variant="muted">No forecast data available</Text>
          </CardContent>
        </Card>
      );
    }

    return (
      <div ref={ref} className={clsx("space-y-4", className)}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name={"clock" as any} size="sm" />
                {title}
              </CardTitle>

              <div className="flex items-center gap-2">
                {forecast.length > 8 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExtended(!showExtended)}
                  >
                    {showExtended ? "Show Less" : "Show More"}
                  </Button>
                )}

                {groupedForecast.length > 1 && layout === "horizontal" && (
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {groupedForecast.map((group, index) => (
                      <Button
                        key={index}
                        variant={selectedDay === index ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedDay(index)}
                        className="px-3"
                      >
                        {formatDayHeader(group.date)}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {layout === "horizontal" ? (
              // Horizontal scrolling layout
              <div className="space-y-6">
                {groupedForecast.map((group, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={clsx(
                      "space-y-3",
                      groupedForecast.length > 1 &&
                        selectedDay !== dayIndex &&
                        "hidden",
                    )}
                  >
                    {groupedForecast.length > 1 && (
                      <Text size="sm" weight="medium" variant="muted">
                        {formatDayHeader(group.date)}
                      </Text>
                    )}

                    <div className="overflow-x-auto pb-2">
                      <div className="flex gap-3 min-w-max">
                        {group.items.map((item, index) => (
                          <div
                            key={`${dayIndex}-${index}`}
                            className="flex-shrink-0 w-32"
                          >
                            <HourlyForecastCard
                              forecast={item}
                              temperatureUnit={temperatureUnit}
                              timeFormat={timeFormat}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grid layout
              <div className="space-y-6">
                {groupedForecast.map((group, dayIndex) => (
                  <div key={dayIndex} className="space-y-3">
                    <Text size="lg" weight="semibold" className="text-gray-900">
                      {formatDayHeader(group.date)}
                    </Text>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                      {group.items.map((item, index) => (
                        <ForecastCard
                          key={`${dayIndex}-${index}`}
                          forecast={item}
                          temperatureUnit={temperatureUnit}
                          size="sm"
                          timeFormat={timeFormat}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forecast Summary */}
        {groupedForecast.length > 0 && (
          <Card variant="ghost">
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing{" "}
                  {groupedForecast.reduce(
                    (acc, group) => acc + group.items.length,
                    0,
                  )}{" "}
                  hours
                  {groupedForecast.length > 1 &&
                    ` across ${groupedForecast.length} days`}
                </span>

                <span>
                  Updated{" "}
                  {new Date(forecast[0]!?.dt * 1000).toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  },
);

HourlyForecast.displayName = "HourlyForecast";

// Preset forecast components
export const TodayForecast = (
  props: Omit<HourlyForecastProps, "title" | "showDays">,
) => <HourlyForecast title="Today's Forecast" showDays={1} {...props} />;

export const WeekForecast = (
  props: Omit<HourlyForecastProps, "title" | "showDays" | "layout">,
) => (
  <HourlyForecast
    title="7-Day Forecast"
    showDays={7}
    layout="grid"
    {...props}
  />
);

export const CompactForecast = (
  props: Omit<HourlyForecastProps, "layout" | "showDays">,
) => <HourlyForecast layout="horizontal" showDays={1} {...props} />;
