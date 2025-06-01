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

const mockSearchCities = jest.fn();
const mockClearSuggestions = jest.fn();

// Mock the hook with default return values
const mockUseCitySearch = jest.fn(() => ({
  suggestions: [createMockCity({ name: "San Francisco" })],
  isLoading: false,
  error: null,
  searchCities: mockSearchCities,
  clearSuggestions: mockClearSuggestions,
}));

jest.mock("@/hooks/useCitySearch", () => ({
  useCitySearch: () => mockUseCitySearch(),
}));

describe("SearchBox Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset to default mock implementation
    mockUseCitySearch.mockReturnValue({
      suggestions: [createMockCity({ name: "San Francisco" })],
      isLoading: false,
      error: null,

      searchCities: mockSearchCities,
      clearSuggestions: mockClearSuggestions,
    });
  });

  it("renders search input", () => {
    renderWithProviders(<SearchBox />);
    expect(
      screen.getByPlaceholderText(/search for a city/i),
    ).toBeInTheDocument();
  });

  it("handles input changes", async () => {
    const { user } = renderWithProviders(<SearchBox />);
    const input = screen.getByRole("textbox");

    await user.type(input, "San Francisco");
    expect(input).toHaveValue("San Francisco");
  });

  it("handles controlled value changes", async () => {
    const handleChange = jest.fn();
    const { user } = renderWithProviders(
      <SearchBox value="" onChange={handleChange} />,
    );
    const input = screen.getByRole("textbox");

    await user.type(input, "S");

    // When the component is controlled, onChange should be called
    await waitFor(
      () => {
        expect(handleChange).toHaveBeenCalledWith("S");
      },
      { timeout: 500 },
    );
  });

  it("shows suggestions when typing", async () => {
    const { user } = renderWithProviders(<SearchBox showSuggestions={true} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "San");

    await waitFor(() => {
      expect(mockSearchCities).toHaveBeenCalledWith("San");
    });

    expectSuggestionsVisible();

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

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

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

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    await user.keyboard("{ArrowDown}");

    const suggestionOption = screen.getByRole("option");
    expect(suggestionOption).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Enter}");
  });

  it("clears input when clear button is clicked", async () => {
    const { user } = renderWithProviders(<SearchBox />);
    const input = screen.getByRole("textbox");

    await user.type(input, "test");
    expect(input).toHaveValue("test");

    // Find clear button - it should be visible when there's text
    const clearButton = screen.getByRole("button");
    await user.click(clearButton);

    expect(input).toHaveValue("");
    expect(mockClearSuggestions).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    // Mock loading state
    mockUseCitySearch.mockReturnValue({
      suggestions: [],
      isLoading: true,
      error: null,
      searchCities: mockSearchCities,
      clearSuggestions: mockClearSuggestions,
    });

    renderWithProviders(<SearchBox />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("displays error state", () => {
    // Mock error state
    mockUseCitySearch.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: "Search failed",
      searchCities: mockSearchCities,
      clearSuggestions: mockClearSuggestions,
    });

    renderWithProviders(<SearchBox />);
    expect(screen.getByText("Search failed")).toBeInTheDocument();
  });

  it("closes suggestions on escape key", async () => {
    const { user } = renderWithProviders(<SearchBox showSuggestions={true} />);
    const input = screen.getByRole("textbox");

    await user.type(input, "San");

    await waitFor(() => {
      expectSuggestionsVisible();
    });

    await user.keyboard("{Escape}");

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

    // Check that the input has the typed value
    expect(input).toHaveValue("San");

    // Should not show suggestion text outside the input
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
