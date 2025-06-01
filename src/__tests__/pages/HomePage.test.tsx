import {
  renderWithProviders,
  screen,
  createMockCity,
} from "../utils/test-utils";
import HomePage from "@/app/page";

// Mock the hooks
const mockCities = [createMockCity()];
const mockAddCity = jest.fn();
const mockRemoveCity = jest.fn();

jest.mock("@/hooks/useCityList", () => ({
  useCityList: () => ({
    cities: mockCities,
    isLoading: false,
    error: null,
    addCity: mockAddCity,
    removeCity: mockRemoveCity,
    hasCities: mockCities.length > 0,
    cityCount: mockCities.length,
  }),
}));

const mockSetUnit = jest.fn();

jest.mock("@/hooks/useTemperatureUnit", () => ({
  useTemperatureUnit: () => ({
    unit: "celsius",
    setUnit: mockSetUnit,
  }),
}));

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page title and description", () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText("My Weather")).toBeInTheDocument();
    expect(
      screen.getByText(/track weather in your favorite cities/i),
    ).toBeInTheDocument();
  });

  it("renders search box", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByPlaceholderText(/add a new city/i)).toBeInTheDocument();
  });

  it("renders temperature unit selector", () => {
    renderWithProviders(<HomePage />);
    // Look for the temperature unit selector component
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows city list when cities exist", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("Test City")).toBeInTheDocument();
  });

  it("shows city count in footer", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/1 city/)).toBeInTheDocument();
  });

  it("shows last updated time", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
  });
});

// Test empty state
describe("HomePage - Empty State", () => {
  beforeEach(() => {
    // Mock empty cities list
    jest.doMock("@/hooks/useCityList", () => ({
      useCityList: () => ({
        cities: [],
        isLoading: false,
        error: null,
        addCity: mockAddCity,
        removeCity: mockRemoveCity,
        hasCities: false,
        cityCount: 0,
      }),
    }));
  });

  it("shows empty state when no cities", async () => {
    // Need to dynamically import to get the mocked hook
    const { default: HomePage } = await import("@/app/page");

    renderWithProviders(<HomePage />);
    expect(screen.getByText(/no cities added yet/i)).toBeInTheDocument();
    expect(screen.getByText(/use the search box above/i)).toBeInTheDocument();
  });
});

// Test loading state
describe("HomePage - Loading State", () => {
  beforeEach(() => {
    jest.doMock("@/hooks/useCityList", () => ({
      useCityList: () => ({
        cities: [],
        isLoading: true,
        error: null,
        addCity: mockAddCity,

        removeCity: mockRemoveCity,
        hasCities: false,

        cityCount: 0,
      }),
    }));
  });

  it("shows loading state", async () => {
    const { default: HomePage } = await import("@/app/page");

    renderWithProviders(<HomePage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });
});

// Test error state

describe("HomePage - Error State", () => {
  beforeEach(() => {
    jest.doMock("@/hooks/useCityList", () => ({
      useCityList: () => ({
        cities: [],
        isLoading: false,
        error: "Failed to load cities",
        addCity: mockAddCity,
        removeCity: mockRemoveCity,
        hasCities: false,
        cityCount: 0,
      }),
    }));
  });

  it("shows error state", async () => {
    const { default: HomePage } = await import("@/app/page");

    renderWithProviders(<HomePage />);
    expect(screen.getByText(/failed to load cities/i)).toBeInTheDocument();
    expect(screen.getByText("Failed to load cities")).toBeInTheDocument();
  });
});

// Test interactions
describe("HomePage - Interactions", () => {
  it("handles temperature unit change", async () => {
    const { user } = renderWithProviders(<HomePage />);

    // Find and click temperature unit selector
    const unitSelector = screen.getByRole("button");
    await user.click(unitSelector);

    // Should call setUnit function
    expect(mockSetUnit).toHaveBeenCalled();
  });

  it("handles search box interactions", async () => {
    const { user } = renderWithProviders(<HomePage />);

    const searchInput = screen.getByPlaceholderText(/add a new city/i);
    await user.type(searchInput, "London");

    expect(searchInput).toHaveValue("London");
  });
});
