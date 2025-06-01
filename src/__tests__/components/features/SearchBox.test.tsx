import {
  renderWithProviders,
  screen,
  waitFor,
  createMockCity,
  waitForAsync,
  expectSuggestionsVisible,
  expectSuggestionsHidden,
  findSuggestionWithText,
} from "../../utils/test-utils";
import { SearchBox } from "@/components/features";

// Mock the city search hook

const mockSearchCities = jest.fn();
const mockClearSuggestions = jest.fn();

jest.mock("@/hooks/useCitySearch", () => ({
  useCitySearch: () => ({
    suggestions: [createMockCity({ name: "San Francisco" })],

    isLoading: false,
    error: null,
    searchCities: mockSearchCities,

    clearSuggestions: mockClearSuggestions,
  }),
}));

describe("SearchBox Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input", () => {
    renderWithProviders(<SearchBox />);
    expect(
      screen.getByPlaceholderText(/search for a city/i),
    ).toBeInTheDocument();
  });

  it("handles input changes", async () => {
    const handleChange = jest.fn();
    const { user } = renderWithProviders(<SearchBox onChange={handleChange} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "San Francisco");
    expect(input).toHaveValue("San Francisco");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows suggestions when typing", async () => {
    const { user } = renderWithProviders(<SearchBox showSuggestions={true} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "San");

    await waitFor(() => {
      expect(mockSearchCities).toHaveBeenCalledWith("San");
    });

    // Use utility functions
    expectSuggestionsVisible();

    // Check that the suggestion contains "San Francisco" text (even if highlighted)
    const suggestion = findSuggestionWithText("San Francisco");
    expect(suggestion).toBeInTheDocument();
  });

  it("handles city selection", async () => {
    const handleCitySelect = jest.fn();

    const { user } = renderWithProviders(
      <SearchBox onCitySelect={handleCitySelect} showSuggestions={true} />,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, "San");

    // Wait for suggestions container
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Click on the suggestion option (button with role="option")
    const suggestionOption = screen.getByRole("option");
    await user.click(suggestionOption);

    expect(handleCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "San Francisco" }),
    );
  });

  it("handles keyboard navigation", async () => {
    const { user } = renderWithProviders(<SearchBox showSuggestions={true} />);

    const input = screen.getByRole("textbox");

    await user.type(input, "San");

    // Wait for suggestions
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Test arrow down navigation
    await user.keyboard("{ArrowDown}");

    // Check that the option is now selected (aria-selected="true")
    const suggestionOption = screen.getByRole("option");
    expect(suggestionOption).toHaveAttribute("aria-selected", "true");

    // Test enter to select
    await user.keyboard("{Enter}");
  });

  it("clears input when clear button is clicked", async () => {
    const { user } = renderWithProviders(<SearchBox />);
    const input = screen.getByRole("textbox");

    await user.type(input, "test");
    expect(input).toHaveValue("test");

    // Find and click clear button (should appear when there's text)
    const clearButton = screen.getByRole("button", { name: "" });
    await user.click(clearButton);

    expect(input).toHaveValue("");
    expect(mockClearSuggestions).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    // Mock loading state
    jest.doMock("@/hooks/useCitySearch", () => ({
      useCitySearch: () => ({
        suggestions: [],
        isLoading: true,
        error: null,
        searchCities: mockSearchCities,
        clearSuggestions: mockClearSuggestions,
      }),
    }));

    renderWithProviders(<SearchBox />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("displays error state", () => {
    // Mock error state
    jest.doMock("@/hooks/useCitySearch", () => ({
      useCitySearch: () => ({
        suggestions: [],
        isLoading: false,
        error: "Search failed",
        searchCities: mockSearchCities,
        clearSuggestions: mockClearSuggestions,
      }),
    }));

    renderWithProviders(<SearchBox />);
    expect(screen.getByText("Search failed")).toBeInTheDocument();
  });

  it("closes suggestions on escape key", async () => {
    const { user } = renderWithProviders(<SearchBox showSuggestions={true} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "San");

    // Wait for suggestions using utility
    await waitFor(() => {
      expectSuggestionsVisible();
    });

    await user.keyboard("{Escape}");

    // Suggestions should be hidden using utility
    await waitFor(() => {
      expectSuggestionsHidden();
    });
  });

  it("does not show suggestions when showSuggestions is false", async () => {
    const { user } = renderWithProviders(<SearchBox showSuggestions={false} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "San");

    // Wait a bit to ensure no suggestions appear
    await waitForAsync();

    // Should not display suggestions listbox even if hook returns them
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByText("San")).toBeInTheDocument(); // Should only be in the input
    expect(screen.queryByText(/Francisco/)).not.toBeInTheDocument();
  });

  it("handles controlled value", () => {
    const { rerender } = renderWithProviders(<SearchBox value="controlled" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("controlled");

    rerender(<SearchBox value="updated" />);

    expect(input).toHaveValue("updated");
  });
});
