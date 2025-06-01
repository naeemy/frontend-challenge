import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage Hook", () => {
  beforeEach(() => {
    // Clear localStorage mock
    (localStorage.getItem as jest.Mock).mockClear();
    (localStorage.setItem as jest.Mock).mockClear();
    (localStorage.removeItem as jest.Mock).mockClear();
    (localStorage.clear as jest.Mock).mockClear();
  });

  it("returns initial value when localStorage is empty", () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("returns stored value from localStorage", () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify("stored-value"),
    );

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("updates localStorage when value changes", () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(result.current[0]).toBe("new-value");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "test-key",
      '"new-value"',
    );
  });

  it("handles function updater", () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(10));

    const { result } = renderHook(() => useLocalStorage("test-key", 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorage.setItem).toHaveBeenCalledWith("test-key", "15");
  });

  it("removes value from localStorage", () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify("value"),
    );

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe("initial");
    expect(localStorage.removeItem).toHaveBeenCalledWith("test-key");
  });

  it("handles JSON parse errors gracefully", () => {
    (localStorage.getItem as jest.Mock).mockReturnValue("invalid-json");

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
    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify(complexObject),
    );

    const { result } = renderHook(() => useLocalStorage("test-key", {}));
    expect(result.current[0]).toEqual(complexObject);
  });

  it("handles arrays correctly", () => {
    const testArray = ["item1", "item2", "item3"];
    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify(testArray),
    );

    const { result } = renderHook(() => useLocalStorage("test-key", []));
    expect(result.current[0]).toEqual(testArray);

    act(() => {
      result.current[1]([...testArray, "item4"]);
    });

    expect(result.current[0]).toEqual(["item1", "item2", "item3", "item4"]);
  });

  it("handles null and undefined values", () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(null));

    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1](undefined);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("test-key", "undefined");
  });

  it("handles storage errors gracefully", () => {
    (localStorage.setItem as jest.Mock).mockImplementation(() => {
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
});
