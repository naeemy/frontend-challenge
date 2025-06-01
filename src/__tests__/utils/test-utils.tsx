import React from "react";
import { render, RenderOptions, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { City, WeatherData, ForecastData } from "@/types";

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

// Custom render function
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: TestWrapper, ...options }),
  };
};

// Mock data factories
export const createMockCity = (overrides?: Partial<City>): City => ({
  id: "test-city-1",
  name: "Test City",
  country: "US",
  state: "CA",
  coordinates: { lat: 37.7749, lon: -122.4194 },
  timezone: "America/Los_Angeles",

  population: 1000000,
  addedAt: Date.now(),

  ...overrides,
});

export const createMockWeatherData = (
  overrides?: Partial<WeatherData>,
): WeatherData => ({
  dt: Math.floor(Date.now() / 1000),
  temperature: 22,
  feelsLike: 24,
  condition: "clear sky",
  icon: "01d",
  humidity: 65,
  pressure: 1013,
  windSpeed: 5.5,
  windDirection: 180,
  visibility: 10,
  uvIndex: 6,
  cloudCover: 20,
  sunrise: Math.floor(Date.now() / 1000) - 3600,

  sunset: Math.floor(Date.now() / 1000) + 3600,
  ...overrides,
});

export const createMockForecastData = (
  overrides?: Partial<ForecastData>,
): ForecastData => ({
  dt: Math.floor(Date.now() / 1000) + 3600,

  temperature: 25,
  condition: "partly cloudy",
  icon: "02d",
  humidity: 60,

  windSpeed: 4.2,
  precipitation: 10,
  ...overrides,
});

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
};

export const mockFetchError = (error: string) => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(error));
};

// Wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock geolocation
export const mockGeolocation = (coords?: {
  latitude: number;
  longitude: number;
}) => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn((success) => {
      success({
        coords: {
          latitude: coords?.latitude || 37.7749,
          longitude: coords?.longitude || -122.4194,
          accuracy: 10,
        },
      });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  };

  Object.defineProperty(global.navigator, "geolocation", {
    value: mockGeolocation,
    writable: true,
  });

  return mockGeolocation;
};

// Enhanced text matching utilities
export const findTextAnywhere = (text: string) => {
  const container = document.body;
  const fullText = container.textContent || "";
  return fullText.toLowerCase().includes(text.toLowerCase());
};

export const expectTextToExist = (text: string) => {
  const exists = findTextAnywhere(text);

  if (!exists) {
    console.log(`Text "${text}" not found. Available content:`);
    console.log(document.body.textContent);
  }
  expect(exists).toBe(true);
};

// Specific utility for testing temperature displays (which are often split)
export const expectTemperatureDisplay = (
  temperature: number,
  unit: "celsius" | "fahrenheit" = "celsius",
) => {
  const container = document.body;
  const unitSymbol = unit === "celsius" ? "°C" : "°F";

  // Check for temperature number
  expect(container).toHaveTextContent(temperature.toString());

  // Check for unit symbol
  expect(container).toHaveTextContent(unitSymbol);
};

// Utility for finding the main container of a component
export const findComponentContainer = (testId?: string, className?: string) => {
  if (testId) {
    return document.querySelector(`[data-testid="${testId}"]`);
  }
  if (className) {
    return document.querySelector(`.${className}`);
  }
  // Fallback to body
  return document.body;
};

// Specific utility for CityCard tests
export const getCityCardContainer = () => {
  // Look for the card container (has specific classes)
  return (
    document.querySelector(".rounded-xl.border.bg-white") ||
    document.querySelector(".cursor-pointer") ||
    document.body
  );
};

// Utility for finding suggestions with highlighted text
export const findSuggestionWithText = (text: string) => {
  // Look for suggestions container first
  const listbox = screen.queryByRole("listbox");
  if (!listbox) return null;

  // Check if the suggestion contains the text (might be split with highlighting)
  const suggestionButtons = screen.queryAllByRole("option");
  return suggestionButtons.find((button) => {
    const textContent = button.textContent || "";
    return textContent.toLowerCase().includes(text.toLowerCase());
  });
};

// Utility for checking if suggestions are visible
export const expectSuggestionsVisible = () => {
  expect(screen.getByRole("listbox")).toBeInTheDocument();
};

export const expectSuggestionsHidden = () => {
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
};

// Utility for testing weather metrics that might be split
export const expectWeatherMetric = (value: string | number, unit?: string) => {
  const container = getCityCardContainer();

  expect(container).toHaveTextContent(value.toString());
  if (unit) {
    expect(container).toHaveTextContent(unit);
  }
};

// Re-export everything from testing library
export * from "@testing-library/react";
export { screen } from "@testing-library/react";
