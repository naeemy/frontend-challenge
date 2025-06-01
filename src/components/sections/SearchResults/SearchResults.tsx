import React from "react";
import {
  Card,
  CardContent,
  Text,
  Button,
  Icon,
  LoadingSpinner,
} from "@/components/ui";
import {
  LocationDisplay,
  WeatherIcon,
  TemperatureDisplay,
} from "@/components/features";
import { useWeatherData, useTemperatureUnit } from "@/hooks";
import { clsx } from "clsx";
import type { City } from "@/types/location";

export interface SearchResultsProps {
  city: City;

  onClear?: () => void;
  onAdd?: (city: City) => void;

  showWeatherPreview?: boolean;
  className?: string;
  isAdding?: boolean;
}

export const SearchResults = React.forwardRef<
  HTMLDivElement,
  SearchResultsProps
>(
  (
    {
      city,
      onClear,
      onAdd,
      showWeatherPreview = true,
      className,
      isAdding = false,
    },
    ref,
  ) => {
    const { unit } = useTemperatureUnit();
    const {
      weatherData,
      isLoading: weatherLoading,
      error: weatherError,
    } = useWeatherData(showWeatherPreview ? city.id : null);

    const handleAdd = () => {
      onAdd?.(city);
    };

    return (
      <div ref={ref} className={clsx("space-y-4", className)}>
        {/* City Information Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            {/* Clear Button */}

            {onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <Icon name="close" size="sm" />
              </Button>
            )}

            {/* Location Details */}

            <div className="space-y-4">
              <LocationDisplay
                city={city}
                showTime={true}
                showCoordinates={true}
                size="lg"
              />

              {/* Additional City Information */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {city.population && city.population > 0 && (
                  <div>
                    <Text size="sm" variant="muted" className="mb-1">
                      Population
                    </Text>
                    <Text weight="medium">
                      {city.population.toLocaleString()}
                    </Text>
                  </div>
                )}

                {city.timezone && (
                  <div>
                    <Text size="sm" variant="muted" className="mb-1">
                      Timezone
                    </Text>
                    <Text weight="medium" className="font-mono">
                      {city.timezone}
                    </Text>
                  </div>
                )}

                {city.coordinates && (
                  <div className="col-span-2">
                    <Text size="sm" variant="muted" className="mb-1">
                      Coordinates
                    </Text>
                    <Text weight="medium" className="font-mono">
                      {city.coordinates.lat.toFixed(4)},{" "}
                      {city.coordinates.lon.toFixed(4)}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Preview Card */}
        {showWeatherPreview && (
          <Card variant="weather" className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Text size="lg" weight="semibold" className="text-gray-900">
                  Current Weather
                </Text>
                {weatherLoading && <LoadingSpinner size="sm" />}
              </div>

              {weatherError ? (
                <div className="text-center py-8">
                  <Icon
                    name="warning"
                    size="lg"
                    variant="muted"
                    className="mx-auto mb-3"
                  />
                  <Text variant="muted" className="mb-2">
                    Weather data unavailable
                  </Text>
                  <Text size="sm" variant="subtle">
                    {weatherError}
                  </Text>
                </div>
              ) : weatherLoading ? (
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
                      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-20 h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : weatherData ? (
                <div className="space-y-4">
                  {/* Main Weather Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <WeatherIcon
                        condition={weatherData.condition}
                        icon={weatherData.icon}
                        size="lg"
                        animated
                      />
                      <div>
                        <Text
                          size="lg"
                          weight="medium"
                          className="text-gray-900 capitalize"
                        >
                          {weatherData.condition}
                        </Text>
                        <Text variant="muted">
                          Feels like{" "}
                          <TemperatureDisplay
                            temperature={
                              weatherData.feelsLike || weatherData.temperature
                            }
                            unit={unit}
                            size="sm"
                          />
                        </Text>
                      </div>
                    </div>

                    <TemperatureDisplay
                      temperature={weatherData.temperature}
                      unit={unit}
                      size="2xl"
                    />
                  </div>

                  {/* Weather Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-100">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icon name="wind" size="xs" />
                        <Text size="sm" variant="muted">
                          Wind
                        </Text>
                      </div>
                      <Text weight="medium">
                        {weatherData.windSpeed}{" "}
                        {unit === "celsius" ? "km/h" : "mph"}
                      </Text>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icon name="humidity" size="xs" />
                        <Text size="sm" variant="muted">
                          Humidity
                        </Text>
                      </div>
                      <Text weight="medium">{weatherData.humidity}%</Text>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Icon name="pressure" size="xs" />
                        <Text size="sm" variant="muted">
                          Pressure
                        </Text>
                      </div>
                      <Text weight="medium">{weatherData.pressure} hPa</Text>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon
                    name="cloud"
                    size="lg"
                    variant="muted"
                    className="mx-auto mb-3"
                  />
                  <Text variant="muted">
                    Weather data will be available after adding this city
                  </Text>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Card */}

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Text weight="semibold" className="text-gray-900 mb-1">
                  Add {city.name} to your cities?
                </Text>
                <Text size="sm" variant="muted">
                  Track weather conditions and get updates for this location
                </Text>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                {onClear && (
                  <Button
                    variant="outline"
                    onClick={onClear}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                )}

                {onAdd && (
                  <Button
                    onClick={handleAdd}
                    disabled={isAdding}
                    loading={isAdding}
                    leftIcon={
                      !isAdding ? <Icon name="add" size="sm" /> : undefined
                    }
                  >
                    {isAdding ? "Adding..." : "Add City"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);

SearchResults.displayName = "SearchResults";
