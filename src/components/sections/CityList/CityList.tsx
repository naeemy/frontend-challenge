"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Text, Button, Icon, Select } from "@/components/ui";

import { CityCard } from "@/components/features";

import { useWeatherData, useCityList } from "@/hooks";
import { clsx } from "clsx";
import type { City } from "@/types/location";
import type { TemperatureUnit } from "@/types/settings";

export interface CityListProps {
  cities: City[];

  temperatureUnit?: TemperatureUnit;
  className?: string;
  layout?: "grid" | "list";
  sortBy?: "name" | "temperature" | "added" | "country";
  onLayoutChange?: (layout: "grid" | "list") => void;
  onSortChange?: (sortBy: string) => void;
}

const sortOptions = [
  { value: "name", label: "City Name" },
  { value: "country", label: "Country" },
  { value: "temperature", label: "Temperature" },
  { value: "added", label: "Recently Added" },
];

export const CityList = React.forwardRef<HTMLDivElement, CityListProps>(
  (
    {
      cities,
      temperatureUnit = "celsius",
      className,
      layout: controlledLayout,
      sortBy: controlledSortBy = "name",
      onLayoutChange,
      onSortChange,
    },
    ref,
  ) => {
    const router = useRouter();
    const { removeCity } = useCityList();

    // Internal state for uncontrolled usage
    const [internalLayout, setInternalLayout] = useState<"grid" | "list">(
      "grid",
    );
    const [internalSortBy, setInternalSortBy] = useState(controlledSortBy);
    const [removingCityId, setRemovingCityId] = useState<string | null>(null);

    // Use controlled or uncontrolled values
    const layout = controlledLayout || internalLayout;
    const sortBy = controlledSortBy || internalSortBy;

    const setLayout = (newLayout: "grid" | "list") => {
      if (onLayoutChange) {
        onLayoutChange(newLayout);
      } else {
        setInternalLayout(newLayout);
      }
    };

    const setSortBy = (newSortBy: string) => {
      if (onSortChange) {
        onSortChange(newSortBy);
      } else {
        setInternalSortBy(newSortBy);
      }
    };

    // Sort cities based on selected criteria
    const sortedCities = useMemo(() => {
      const sorted = [...cities].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "country":
            return (
              a.country.localeCompare(b.country) || a.name.localeCompare(b.name)
            );
          case "added":
            return (b.addedAt || 0) - (a.addedAt || 0);

          case "temperature":
            // This would need weather data to sort properly
            // For now, fallback to name sorting
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
      return sorted;
    }, [cities, sortBy]);

    const handleCityClick = (city: City) => {
      const citySlug = `${city.name}-${city.country}`
        .toLowerCase()
        .replace(/\s+/g, "-");
      router.push(`/city/${encodeURIComponent(citySlug)}`);
    };

    const handleRemoveCity = async (city: City) => {
      setRemovingCityId(city.id);
      try {
        await removeCity(city.id);
      } catch (error) {
        console.error("Failed to remove city:", error);
        // You might want to show an error toast here
      } finally {
        setRemovingCityId(null);
      }
    };

    if (cities.length === 0) {
      return (
        <div ref={ref} className={clsx("text-center py-12", className)}>
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <Icon name="location" size="xl" className="mx-auto" />
            </div>
            <Text size="lg" weight="medium" className="text-gray-600 mb-2">
              No cities added yet
            </Text>
            <Text variant="muted" className="mb-6">
              Add your first city to start tracking weather conditions
            </Text>
            <Button
              onClick={() => router.push("/search")}
              leftIcon={<Icon name="add" size="sm" />}
            >
              Add Your First City
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx("space-y-6", className)}>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Text weight="medium" className="text-gray-700">
              {cities.length} {cities.length === 1 ? "city" : "cities"}
            </Text>

            <Select
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value as string)}
              size="sm"
              placeholder="Sort by..."
              className="w-40"
            />
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center gap-2">
            <Text size="sm" variant="muted">
              View:
            </Text>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={layout === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLayout("grid")}
                className="px-3"
              >
                <Icon name="grid" size="sm" />
              </Button>
              <Button
                variant={layout === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setLayout("list")}
                className="px-3"
              >
                <Icon name="list" size="sm" />
              </Button>
            </div>
          </div>
        </div>

        {/* Cities Grid/List */}
        <div
          className={clsx(
            "gap-4",
            layout === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col",
          )}
        >
          {sortedCities.map((city) => (
            <CityCardWithWeather
              key={city.id}
              city={city}
              temperatureUnit={temperatureUnit}
              onClick={() => handleCityClick(city)}
              onRemove={() => handleRemoveCity(city)}
              isRemoving={removingCityId === city.id}
              size={layout === "list" ? "sm" : "md"}
              layout={layout}
            />
          ))}
        </div>

        {/* Add More Cities CTA */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Text weight="medium" className="text-gray-700 mb-1">
                Want to track more cities?
              </Text>
              <Text size="sm" variant="muted">
                Add cities from around the world to compare weather conditions
              </Text>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/search")}
              leftIcon={<Icon name="add" size="sm" />}
            >
              Add Another City
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

CityList.displayName = "CityList";

// Individual city card with weather data integration
interface CityCardWithWeatherProps {
  city: City;
  temperatureUnit: TemperatureUnit;
  onClick: () => void;
  onRemove: () => void;
  isRemoving: boolean;
  size: "sm" | "md";
  layout: "grid" | "list";
}

const CityCardWithWeather: React.FC<CityCardWithWeatherProps> = ({
  city,
  temperatureUnit,
  onClick,
  onRemove,
  isRemoving,
  size,
  layout,
}) => {
  const { weatherData, isLoading, error } = useWeatherData(city.id);

  return (
    <CityCard
      city={city}
      weather={weatherData}
      temperatureUnit={temperatureUnit}
      isLoading={isLoading || isRemoving}
      error={error}
      onClick={onClick}
      onRemove={onRemove}
      size={size}
      showTime={layout === "list"}
      className={clsx(
        layout === "list" && "hover:bg-gray-50",
        isRemoving && "opacity-50 pointer-events-none",
      )}
    />
  );
};
