import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Text,
} from "@/components/ui";
import {
  WeatherIcon,
  TemperatureDisplay,
  WeatherMetric,
  WindMetric,
  HumidityMetric,
  PressureMetric,
} from "@/components/features";
import { clsx } from "clsx";
import type { WeatherData } from "@/types/weather";
import type { City } from "@/types/location";
import type { TemperatureUnit } from "@/types/settings";

export interface WeatherDetailsProps {
  weather: WeatherData;
  city: City;
  temperatureUnit?: TemperatureUnit;

  className?: string;
  showExtendedMetrics?: boolean;
}

export const WeatherDetails = React.forwardRef<
  HTMLDivElement,
  WeatherDetailsProps
>(
  (
    {
      weather,
      city,
      temperatureUnit = "celsius",
      className,
      showExtendedMetrics = true,
    },
    ref,
  ) => {
    const formatTime = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: city.timezone,
      });
    };

    const formatDate = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",

        month: "long",
        day: "numeric",
        timeZone: city.timezone,
      });
    };

    const getWindDirection = (degrees?: number) => {
      if (degrees === undefined) return "N/A";

      const directions = [
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
      ];
      const index = Math.round(degrees / 22.5) % 16;
      return directions[index];
    };

    const getUVLevel = (uvIndex?: number) => {
      if (uvIndex === undefined) return { level: "Unknown", color: "gray" };

      if (uvIndex <= 2) return { level: "Low", color: "green" };
      if (uvIndex <= 5) return { level: "Moderate", color: "yellow" };

      if (uvIndex <= 7) return { level: "High", color: "orange" };
      if (uvIndex <= 10) return { level: "Very High", color: "red" };
      return { level: "Extreme", color: "purple" };
    };

    const getAQILevel = (aqi?: number) => {
      if (aqi === undefined) return { level: "Unknown", color: "gray" };

      if (aqi <= 50) return { level: "Good", color: "green" };
      if (aqi <= 100) return { level: "Moderate", color: "yellow" };
      if (aqi <= 150)
        return { level: "Unhealthy for Sensitive Groups", color: "orange" };
      if (aqi <= 200) return { level: "Unhealthy", color: "red" };
      if (aqi <= 300) return { level: "Very Unhealthy", color: "purple" };
      return { level: "Hazardous", color: "red" };
    };

    return (
      <div ref={ref} className={clsx("space-y-6", className)}>
        {/* Main Weather Card */}
        <Card variant="weather" size="lg">
          <CardContent>
            <div className="text-center space-y-6">
              {/* Current Conditions */}
              <div className="space-y-4">
                <WeatherIcon
                  condition={weather.condition}
                  size="xl"
                  animated
                  className="mx-auto"
                />

                <div>
                  <TemperatureDisplay
                    temperature={weather.temperature}
                    unit={temperatureUnit}
                    size="2xl"
                    className="block mb-2"
                  />

                  <Text
                    size="lg"
                    weight="medium"
                    className="text-gray-700 capitalize mb-1"
                  >
                    {weather.condition}
                  </Text>
                  {weather.feelsLike !== undefined && (
                    <Text variant="muted">
                      Feels like{" "}
                      <TemperatureDisplay
                        temperature={weather.feelsLike}
                        unit={temperatureUnit}
                        size="md"
                      />
                    </Text>
                  )}
                </div>
              </div>

              {/* Last Updated */}
              <div className="pt-4 border-t border-blue-100">
                <Text size="sm" variant="muted">
                  Last updated: {formatTime(weather.dt)} on{" "}
                  {formatDate(weather.dt)}
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Weather Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <WindMetric
            value={weather.windSpeed}
            unit={temperatureUnit === "celsius" ? "km/h" : "mph"}
          />

          <HumidityMetric value={weather.humidity} unit="%" />

          <PressureMetric value={weather.pressure} unit="hPa" />

          {weather.visibility !== undefined && (
            <WeatherMetric
              icon={"eye" as any}
              label="Visibility"
              value={weather.visibility}
              unit={temperatureUnit === "celsius" ? "km" : "mi"}
            />
          )}
        </div>

        {/* Extended Metrics */}
        {showExtendedMetrics && (
          <div className="space-y-6">
            {/* Sun & Moon */}
            {(weather.sunrise || weather.sunset) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WeatherIcon condition="sunny" size="sm" />
                    Sun & Moon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {weather.sunrise && (
                      <div className="text-center">
                        <Text size="sm" variant="muted" className="mb-1">
                          Sunrise
                        </Text>
                        <Text weight="medium">
                          {formatTime(weather.sunrise)}
                        </Text>
                      </div>
                    )}

                    {weather.sunset && (
                      <div className="text-center">
                        <Text size="sm" variant="muted" className="mb-1">
                          Sunset
                        </Text>
                        <Text weight="medium">
                          {formatTime(weather.sunset)}
                        </Text>
                      </div>
                    )}

                    {weather.uvIndex !== undefined && (
                      <div className="text-center">
                        <Text size="sm" variant="muted" className="mb-1">
                          UV Index
                        </Text>
                        <div className="space-y-1">
                          <Text weight="medium">{weather.uvIndex}</Text>
                          <Text
                            size="xs"
                            className={`text-${getUVLevel(weather.uvIndex).color}-600`}
                          >
                            {getUVLevel(weather.uvIndex).level}
                          </Text>
                        </div>
                      </div>
                    )}

                    {weather.cloudCover !== undefined && (
                      <div className="text-center">
                        <Text size="sm" variant="muted" className="mb-1">
                          Cloud Cover
                        </Text>
                        <Text weight="medium">{weather.cloudCover}%</Text>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Air Quality */}
            {weather.airQuality !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WeatherIcon condition="wind" size="sm" />
                    Air Quality
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text size="lg" weight="bold" className="mb-1">
                        {weather.airQuality} AQI
                      </Text>
                      <Text
                        className={`text-${getAQILevel(weather.airQuality).color}-600`}
                      >
                        {getAQILevel(weather.airQuality).level}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text size="sm" variant="muted">
                        Air Quality Index
                      </Text>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {weather.dewPoint !== undefined && (
                    <div>
                      <Text size="sm" variant="muted" className="mb-1">
                        Dew Point
                      </Text>
                      <TemperatureDisplay
                        temperature={weather.dewPoint}
                        unit={temperatureUnit}
                        size="md"
                      />
                    </div>
                  )}

                  {weather.windGust !== undefined && (
                    <div>
                      <Text size="sm" variant="muted" className="mb-1">
                        Wind Gust
                      </Text>
                      <Text weight="medium">
                        {weather.windGust}{" "}
                        {temperatureUnit === "celsius" ? "km/h" : "mph"}
                      </Text>
                    </div>
                  )}

                  {weather.precipitation !== undefined && (
                    <div>
                      <Text size="sm" variant="muted" className="mb-1">
                        Precipitation
                      </Text>
                      <Text weight="medium">
                        {weather.precipitation}{" "}
                        {temperatureUnit === "celsius" ? "mm" : "in"}
                      </Text>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  },
);

WeatherDetails.displayName = "WeatherDetails";
