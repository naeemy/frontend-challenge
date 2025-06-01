import { renderHook, act, waitFor } from "@testing-library/react";
import { useCityList } from "@/hooks/useCityList";
import { createMockCity } from "../utils/test-utils";

// Mock useLocalStorage
const mockLocalStorageValue = [];
const mockSetLocalStorage = jest.fn();
const mockRemoveLocalStorage = jest.fn();

jest.mock("@/hooks/useLocalStorage", () => ({
  useLocalStorage: () => [
    mockLocalStorageValue,
    mockSetLocalStorage,
    mockRemoveLocalStorage,
  ],
}));

describe("useCityList Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorageValue.length = 0; // Clear the mock array
  });

  it("initializes with empty cities list", () => {
    const { result } = renderHook(() => useCityList());
    expect(result.current.cities).toEqual([]);
    expect(result.current.hasCities).toBe(false);
    expect(result.current.cityCount).toBe(0);
  });

  it("adds a city successfully", async () => {
    const { result } = renderHook(() => useCityList());
    const mockCity = createMockCity();

    await act(async () => {
      await result.current.addCity(mockCity);
    });

    expect(mockSetLocalStorage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          ...mockCity,
          addedAt: expect.any(Number),
        }),
      ]),
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("prevents adding duplicate cities", async () => {
    const mockCity = createMockCity();

    // Mock that city already exists
    mockLocalStorageValue.push(mockCity);

    const { result } = renderHook(() => useCityList());

    await expect(
      act(async () => {
        await result.current.addCity(mockCity);
      }),
    ).rejects.toThrow(/already in your city list/);

    expect(result.current.error).toContain("already in your city list");
  });

  it("removes a city successfully", async () => {
    const mockCity = createMockCity();
    mockLocalStorageValue.push(mockCity);

    const { result } = renderHook(() => useCityList());

    await act(async () => {
      await result.current.removeCity(mockCity.id);
    });

    expect(mockSetLocalStorage).toHaveBeenCalledWith([]);
  });

  it("throws error when removing non-existent city", async () => {
    const { result } = renderHook(() => useCityList());

    await expect(
      act(async () => {
        await result.current.removeCity("non-existent-id");
      }),
    ).rejects.toThrow("City not found in your list");
  });

  it("checks if city is already added", () => {
    const mockCity = createMockCity();
    mockLocalStorageValue.push(mockCity);

    const { result } = renderHook(() => useCityList());

    expect(result.current.isCityAdded(mockCity.id)).toBe(true);
    expect(result.current.isCityAdded("non-existent-id")).toBe(false);
  });

  it("enforces maximum cities limit", async () => {
    const { result } = renderHook(() => useCityList({ maxCities: 2 }));

    // Add two cities first
    mockLocalStorageValue.push(
      createMockCity({ id: "city1", name: "City 1" }),
      createMockCity({ id: "city2", name: "City 2" }),
    );

    await expect(
      act(async () => {
        await result.current.addCity(
          createMockCity({ id: "city3", name: "City 3" }),
        );
      }),
    ).rejects.toThrow(/Maximum 2 cities allowed/);
  });

  it("updates city successfully", async () => {
    const mockCity = createMockCity();
    mockLocalStorageValue.push(mockCity);

    const { result } = renderHook(() => useCityList());

    await act(async () => {
      await result.current.updateCity(mockCity.id, { isFavorite: true });
    });

    expect(mockSetLocalStorage).toHaveBeenCalledWith([
      expect.objectContaining({
        ...mockCity,
        isFavorite: true,
      }),
    ]);
  });

  it("clears all cities", async () => {
    const { result } = renderHook(() => useCityList());

    await act(async () => {
      await result.current.clearAllCities();
    });

    expect(mockSetLocalStorage).toHaveBeenCalledWith([]);
  });

  it("reorders cities correctly", () => {
    const cities = [
      createMockCity({ id: "city1", name: "City 1" }),
      createMockCity({ id: "city2", name: "City 2" }),
      createMockCity({ id: "city3", name: "City 3" }),
    ];

    mockLocalStorageValue.push(...cities);

    const { result } = renderHook(() => useCityList());

    act(() => {
      result.current.reorderCities(0, 2); // Move first city to third position
    });

    expect(mockSetLocalStorage).toHaveBeenCalledWith([
      cities[1], // City 2 now first
      cities[2], // City 3 now second
      cities[0], // City 1 now third
    ]);
  });

  it("gets city by ID", () => {
    const mockCity = createMockCity();
    mockLocalStorageValue.push(mockCity);

    const { result } = renderHook(() => useCityList());

    expect(result.current.getCityById(mockCity.id)).toEqual(mockCity);
    expect(result.current.getCityById("non-existent")).toBeUndefined();
  });

  it("gets city by name and country", () => {
    const mockCity = createMockCity({ name: "San Francisco", country: "US" });
    mockLocalStorageValue.push(mockCity);

    const { result } = renderHook(() => useCityList());

    expect(result.current.getCityByName("San Francisco", "US")).toEqual(
      mockCity,
    );
    expect(result.current.getCityByName("San Francisco")).toEqual(mockCity);
    expect(result.current.getCityByName("Non-existent")).toBeUndefined();
  });

  it("validates city data before adding", async () => {
    const { result } = renderHook(() => useCityList());

    // Test missing required fields
    await expect(
      act(async () => {
        await result.current.addCity({} as any);
      }),
    ).rejects.toThrow(/missing required fields/);

    await expect(
      act(async () => {
        await result.current.addCity({
          id: "",
          name: "Test",
          country: "US",
        } as any);
      }),
    ).rejects.toThrow(/missing required fields/);
  });

  it("calls lifecycle callbacks", async () => {
    const onCityAdded = jest.fn();

    const onCityRemoved = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useCityList({
        onCityAdded,
        onCityRemoved,
        onError,
      }),
    );

    const mockCity = createMockCity();

    // Test add callback
    await act(async () => {
      await result.current.addCity(mockCity);
    });

    expect(onCityAdded).toHaveBeenCalledWith(expect.objectContaining(mockCity));

    // Test remove callback
    mockLocalStorageValue.push(mockCity);
    await act(async () => {
      await result.current.removeCity(mockCity.id);
    });

    expect(onCityRemoved).toHaveBeenCalledWith(mockCity);

    // Test error callback

    await act(async () => {
      try {
        await result.current.addCity(mockCity); // Duplicate
      } catch (error) {
        // Expected to throw
      }
    });

    expect(onError).toHaveBeenCalled();
  });
});
