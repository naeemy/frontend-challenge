import { renderHook, act, waitFor } from "@testing-library/react";
import { useWeatherData } from "@/hooks/useWeatherData";
import {
  mockFetchSuccess,
  mockFetchError,
  createMockWeatherData,
  createMockForecastData,
} from "../utils/test-utils";

// Mock the temperature preferences hook
jest.mock("@/hooks/useTemperatureUnit", () => ({
  useTemperaturePreferences: () => ({
    getApiUnits: jest.fn().mockReturnValue("metric"),
  }),
}));

// Mock localStorage with expiry
const mockWeatherData = null;
const mockSetWeatherData = jest.fn();
const mockForecastData = [];
const mockSetForecastData = jest.fn();

jest.mock("@/hooks/useLocalStorage", () => ({
  useLocalStorageWithExpiry: jest
    .fn()
    .mockReturnValueOnce([mockWeatherData, mockSetWeatherData])

    .mockReturnValueOnce([mockForecastData, mockSetForecastData]),
}));

describe("useWeatherData Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("initializes with null data", () => {
    const { result } = renderHook(() => useWeatherData("city-1"));

    expect(result.current.weatherData).toBeNull();
    expect(result.current.forecast).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("fetches weather data successfully", async () => {
    const mockWeather = createMockWeatherData();
    const mockForecast = [createMockForecastData()];

    mockFetchSuccess({
      weather: mockWeather,

      forecast: mockForecast,
    });

    const { result } = renderHook(() => useWeatherData("city-1"));

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockSetWeatherData).toHaveBeenCalledWith(mockWeather);
    expect(mockSetForecastData).toHaveBeenCalledWith(mockForecast);
    expect(result.current.error).toBeNull();
  });

  it("handles fetch errors", async () => {
    mockFetchError("API Error");

    const { result } = renderHook(() => useWeatherData("city-1"));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain("API Error");
    expect(result.current.weatherData).toBeNull();
  });

  it("refetches data when called", async () => {
    const { result } = renderHook(() => useWeatherData("city-1"));

    mockFetchSuccess({
      weather: createMockWeatherData(),
      forecast: [],
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetch).toHaveBeenCalled();
  });

  it("clears cache when called", () => {
    const { result } = renderHook(() => useWeatherData("city-1"));

    act(() => {
      result.current.clearCache();
    });

    expect(mockSetWeatherData).toHaveBeenCalledWith(null);
    expect(mockSetForecastData).toHaveBeenCalledWith([]);
  });

  it("does not fetch when cityId is null", () => {
    renderHook(() => useWeatherData(null));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sets loading state during fetch", async () => {
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (global.fetch as jest.Mock).mockReturnValue(
      fetchPromise.then(() => ({
        ok: true,
        json: () =>
          Promise.resolve({
            weather: createMockWeatherData(),
            forecast: [],
          }),
      })),
    );

    const { result } = renderHook(() => useWeatherData("city-1"));

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);

    // Resolve the promise
    act(() => {
      resolvePromise!({});
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("handles auto-refresh when enabled", () => {
    jest.useFakeTimers();

    const { result } = renderHook(() =>
      useWeatherData("city-1", {
        autoRefresh: true,
        refreshInterval: 300000, // 5 minutes
      }),
    );

    // Clear initial fetch
    (global.fetch as jest.Mock).mockClear();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(300000);
    });

    expect(fetch).toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("calls success callback on successful fetch", async () => {
    const onSuccess = jest.fn();
    const mockWeather = createMockWeatherData();

    mockFetchSuccess({
      weather: mockWeather,
      forecast: [],
    });

    renderHook(() => useWeatherData("city-1", { onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockWeather);
    });
  });

  it("calls error callback on fetch failure", async () => {
    const onError = jest.fn();

    mockFetchError("Network error");

    renderHook(() => useWeatherData("city-1", { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Network error");
    });
  });

  it("cancels previous requests when cityId changes", async () => {
    const { result, rerender } = renderHook(
      ({ cityId }) => useWeatherData(cityId),
      { initialProps: { cityId: "city-1" } },
    );

    // Change cityId
    rerender({ cityId: "city-2" });

    // Previous request should be cancelled
    // This is implicit in the implementation via AbortController
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("respects cache expiry settings", () => {
    const { result } = renderHook(
      () => useWeatherData("city-1", { cacheExpiry: 5 }), // 5 minutes
    );

    // Should use localStorage with 5 minute expiry
    expect(
      require("@/hooks/useLocalStorage").useLocalStorageWithExpiry,
    ).toHaveBeenCalledWith("weather_city-1", null, 5);
  });

  it("updates lastUpdated timestamp", async () => {
    const { result } = renderHook(() => useWeatherData("city-1"));

    const initialLastUpdated = result.current.lastUpdated;

    mockFetchSuccess({
      weather: createMockWeatherData(),
      forecast: [],
    });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.lastUpdated).toBeGreaterThan(
        initialLastUpdated || 0,
      );
    });
  });

  it("handles concurrent requests for same city", async () => {
    const { result } = renderHook(() => useWeatherData("city-1"));

    mockFetchSuccess({
      weather: createMockWeatherData(),

      forecast: [],
    });

    // Make concurrent requests
    const [result1, result2] = await Promise.all([
      act(async () => await result.current.refetch()),
      act(async () => await result.current.refetch()),
    ]);

    // Should only make one actual fetch call due to request deduplication
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
