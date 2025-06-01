import { renderHook, act, waitFor } from "@testing-library/react";
import { useCityList } from "@/hooks/useCityList";
import { createMockCity } from "../utils/test-utils";

// Simple mock that just tracks calls
const mockSetLocalStorage = jest.fn();
const mockRemoveLocalStorage = jest.fn();

// Mock useLocalStorage with a simple implementation
jest.mock("@/hooks/useLocalStorage", () => ({
  useLocalStorage: jest.fn(() => [
    [], // Always start with empty array
    mockSetLocalStorage,
    mockRemoveLocalStorage,
  ]),
}));

describe("useCityList Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetLocalStorage.mockClear();
    mockRemoveLocalStorage.mockClear();
  });

  it("initializes with empty cities list", () => {
    const { result } = renderHook(() => useCityList());

    expect(result.current).toBeDefined();
    expect(result.current.cities).toEqual([]);
    expect(result.current.hasCities).toBe(false);
    expect(result.current.cityCount).toBe(0);
  });

  it("adds a city successfully", async () => {
    const { result } = renderHook(() => useCityList());
    const mockCity = createMockCity();

    expect(result.current).toBeDefined();

    await act(async () => {
      await result.current.addCity(mockCity);
    });

    // Check that localStorage setter was called
    expect(mockSetLocalStorage).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("prevents adding duplicate cities", async () => {
    // Mock that useLocalStorage returns a city already
    const mockCity = createMockCity();
    const mockUseLocalStorage =
      require("@/hooks/useLocalStorage").useLocalStorage;
    mockUseLocalStorage.mockReturnValue([
      [mockCity], // Return array with existing city
      mockSetLocalStorage,
      mockRemoveLocalStorage,
    ]);

    const { result } = renderHook(() => useCityList());
    expect(result.current).toBeDefined();

    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.addCity(mockCity);
      } catch (error) {
        thrownError = error as Error;
      }
    });

    expect(thrownError).not.toBeNull();
    expect(thrownError?.message).toContain("already in your city list");
  });

  it("removes a city successfully", async () => {
    const mockCity = createMockCity();
    const mockUseLocalStorage =
      require("@/hooks/useLocalStorage").useLocalStorage;
    mockUseLocalStorage.mockReturnValue([
      [mockCity], // Return array with existing city

      mockSetLocalStorage,
      mockRemoveLocalStorage,
    ]);

    const { result } = renderHook(() => useCityList());
    expect(result.current).toBeDefined();

    await act(async () => {
      await result.current.removeCity(mockCity.id);
    });

    expect(mockSetLocalStorage).toHaveBeenCalled();
  });

  it("throws error when removing non-existent city", async () => {
    const { result } = renderHook(() => useCityList());
    expect(result.current).toBeDefined();

    await expect(
      act(async () => {
        await result.current.removeCity("non-existent-id");
      }),
    ).rejects.toThrow("City not found in your list");
  });

  it("checks if city is already added", () => {
    const mockCity = createMockCity();
    const mockUseLocalStorage =
      require("@/hooks/useLocalStorage").useLocalStorage;
    mockUseLocalStorage.mockReturnValue([
      [mockCity], // Return array with existing city
      mockSetLocalStorage,
      mockRemoveLocalStorage,
    ]);

    const { result } = renderHook(() => useCityList());

    expect(result.current).toBeDefined();

    expect(result.current.isCityAdded(mockCity.id)).toBe(true);
    expect(result.current.isCityAdded("non-existent-id")).toBe(false);
  });

  it("enforces maximum cities limit", async () => {
    const cities = [
      createMockCity({ id: "city1", name: "City 1" }),
      createMockCity({ id: "city2", name: "City 2" }),
    ];

    const mockUseLocalStorage =
      require("@/hooks/useLocalStorage").useLocalStorage;
    mockUseLocalStorage.mockReturnValue([
      cities, // Return array with 2 cities
      mockSetLocalStorage,
      mockRemoveLocalStorage,
    ]);

    const { result } = renderHook(() => useCityList({ maxCities: 2 }));

    expect(result.current).toBeDefined();

    await expect(
      act(async () => {
        await result.current.addCity(
          createMockCity({ id: "city3", name: "City 3" }),
        );
      }),
    ).rejects.toThrow(/Maximum 2 cities allowed/);
  });

  it("validates city data before adding", async () => {
    const { result } = renderHook(() => useCityList());
    expect(result.current).toBeDefined();

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
});
