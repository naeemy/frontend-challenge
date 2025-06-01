import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { TemperatureUnit } from "@/types/settings";

/**
 * Hook for managing temperature unit preference
 */
export function useTemperatureUnit() {
  const [unit, setUnit] = useLocalStorage<TemperatureUnit>(
    "temperatureUnit",
    "celsius",
  );

  // Convert temperature between units
  const convertTemperature = useCallback(
    (
      temperature: number,
      fromUnit: TemperatureUnit,
      toUnit: TemperatureUnit,
    ): number => {
      if (fromUnit === toUnit) return temperature;

      if (fromUnit === "celsius" && toUnit === "fahrenheit") {
        return (temperature * 9) / 5 + 32;
      }

      if (fromUnit === "fahrenheit" && toUnit === "celsius") {
        return ((temperature - 32) * 5) / 9;
      }

      return temperature;
    },
    [],
  );

  // Convert temperature to current unit
  const toCurrentUnit = useCallback(
    (temperature: number, fromUnit: TemperatureUnit = "celsius"): number => {
      return convertTemperature(temperature, fromUnit, unit);
    },
    [unit, convertTemperature],
  );

  // Convert temperature from current unit
  const fromCurrentUnit = useCallback(
    (temperature: number, toUnit: TemperatureUnit = "celsius"): number => {
      return convertTemperature(temperature, unit, toUnit);
    },
    [unit, convertTemperature],
  );

  // Get unit symbol
  const getUnitSymbol = useCallback(
    (unitType: TemperatureUnit = unit): string => {
      return unitType === "celsius" ? "°C" : "°F";
    },
    [unit],
  );

  // Get unit label
  const getUnitLabel = useCallback(
    (unitType: TemperatureUnit = unit): string => {
      return unitType === "celsius" ? "Celsius" : "Fahrenheit";
    },
    [unit],
  );

  // Toggle between units
  const toggleUnit = useCallback(() => {
    setUnit((current) => (current === "celsius" ? "fahrenheit" : "celsius"));
  }, [setUnit]);

  // Check if current unit is celsius
  const isCelsius = unit === "celsius";

  // Check if current unit is fahrenheit
  const isFahrenheit = unit === "fahrenheit";

  return {
    unit,
    setUnit,
    convertTemperature,
    toCurrentUnit,
    fromCurrentUnit,
    getUnitSymbol,

    getUnitLabel,
    toggleUnit,
    isCelsius,
    isFahrenheit,
  };
}

/**
 * Hook for getting temperature preferences for API calls
 */
export function useTemperaturePreferences() {
  const { unit, getUnitSymbol } = useTemperatureUnit();

  // Get units for API calls (some APIs use different unit names)
  const getApiUnits = useCallback(
    (apiType: "openweather" | "weatherapi" = "openweather"): string => {
      switch (apiType) {
        case "openweather":
          return unit === "celsius" ? "metric" : "imperial";
        case "weatherapi":
          return unit === "celsius" ? "metric" : "imperial";
        default:
          return "metric";
      }
    },
    [unit],
  );

  // Get speed unit based on temperature unit
  const getSpeedUnit = useCallback((): string => {
    return unit === "celsius" ? "km/h" : "mph";
  }, [unit]);

  // Get distance unit based on temperature unit
  const getDistanceUnit = useCallback((): string => {
    return unit === "celsius" ? "km" : "mi";
  }, [unit]);

  // Get precipitation unit based on temperature unit
  const getPrecipitationUnit = useCallback((): string => {
    return unit === "celsius" ? "mm" : "in";
  }, [unit]);

  return {
    unit,
    symbol: getUnitSymbol(),
    getApiUnits,
    getSpeedUnit,
    getDistanceUnit,
    getPrecipitationUnit,
  };
}
