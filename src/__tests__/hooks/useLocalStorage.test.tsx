import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// Create proper Jest mocks for localStorage
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

const mockClear = jest.fn();

// Mock localStorage with proper Jest functions
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: mockGetItem,

    setItem: mockSetItem,

    removeItem: mockRemoveItem,
    clear: mockClear,
  },

  writable: true,
});

describe("useLocalStorage Hook", () => {
  beforeEach(() => {
    // Clear localStorage mock
    mockGetItem.mockClear();
    mockSetItem.mockClear();
    mockRemoveItem.mockClear();
    mockClear.mockClear();
  });

  it("returns initial value when localStorage is empty", () => {
    mockGetItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("returns stored value from localStorage", () => {
    mockGetItem.mockReturnValue(JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("updates localStorage when value changes", () => {
    mockGetItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(mockSetItem).toHaveBeenCalledWith("test-key", '"new-value"');
  });

  it("handles function updater", () => {
    mockGetItem.mockReturnValue(JSON.stringify(10));

    const { result } = renderHook(() => useLocalStorage("test-key", 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(mockSetItem).toHaveBeenCalledWith("test-key", "15");
  });

  it("removes value from localStorage", () => {
    mockGetItem.mockReturnValue(JSON.stringify("value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe("initial");
    expect(mockRemoveItem).toHaveBeenCalledWith("test-key");
  });

  it("handles JSON parse errors gracefully", () => {
    mockGetItem.mockReturnValue("invalid-json");

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "fallback"),
    );

    expect(result.current[0]).toBe("fallback");
  });

  it("works with complex objects", () => {
    const complexObject = {
      name: "test",
      items: [1, 2, 3],

      nested: { value: true },
    };
    mockGetItem.mockReturnValue(JSON.stringify(complexObject));

    const { result } = renderHook(() => useLocalStorage("test-key", {}));
    expect(result.current[0]).toEqual(complexObject);
  });

  it("handles arrays correctly", () => {
    const testArray = ["item1", "item2", "item3"];
    mockGetItem.mockReturnValue(JSON.stringify(testArray));

    const { result } = renderHook(() => useLocalStorage("test-key", []));
    expect(result.current[0]).toEqual(testArray);

    act(() => {
      result.current[1]([...testArray, "item4"]);
    });

    expect(result.current[0]).toEqual(["item1", "item2", "item3", "item4"]);
  });

  it("handles null and undefined values", () => {
    mockGetItem.mockReturnValue(JSON.stringify(null));

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1](undefined);
    });

    expect(mockSetItem).toHaveBeenCalledWith("test-key", undefined);
  });

  it("handles storage errors gracefully", () => {
    mockSetItem.mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    // Should not crash when storage fails
    act(() => {
      result.current[1]("new-value");
    });

    // Value should still be updated in component state
    expect(result.current[0]).toBe("new-value");
  });

  it("handles getItem errors gracefully", () => {
    mockGetItem.mockImplementation(() => {
      throw new Error("Storage access denied");
    });

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "fallback"),
    );

    // Should fall back to initial value when localStorage fails
    expect(result.current[0]).toBe("fallback");
  });

  it("calls localStorage.getItem with correct key", () => {
    mockGetItem.mockReturnValue(null);

    renderHook(() => useLocalStorage("my-test-key", "initial"));

    expect(mockGetItem).toHaveBeenCalledWith("my-test-key");
  });
});
