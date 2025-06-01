import {
  renderWithProviders,
  screen,
  createMockCity,
  createMockWeatherData,
  expectTemperatureDisplay,
  expectWeatherMetric,
  getCityCardContainer,
} from "../../utils/test-utils";
import { CityCard } from "@/components/features";

describe("CityCard Component", () => {
  const mockCity = createMockCity();
  const mockWeather = createMockWeatherData();

  it("renders city information correctly", () => {
    renderWithProviders(<CityCard city={mockCity} weather={mockWeather} />);

    expect(screen.getByText(mockCity.name)).toBeInTheDocument();
    expect(screen.getByText(/CA, US/)).toBeInTheDocument();
  });

  it("displays weather data when available", () => {
    renderWithProviders(<CityCard city={mockCity} weather={mockWeather} />);

    // Use utility function for temperature

    expectTemperatureDisplay(22, "celsius");

    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    renderWithProviders(<CityCard city={mockCity} isLoading={true} />);

    // Check for loading skeleton elements
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("displays error state", () => {
    renderWithProviders(
      <CityCard city={mockCity} error="Failed to load weather" />,
    );

    expect(screen.getByText(/failed to load weather/i)).toBeInTheDocument();
  });

  it("handles remove button click", async () => {
    const handleRemove = jest.fn();
    const { user } = renderWithProviders(
      <CityCard city={mockCity} onRemove={handleRemove} />,
    );

    // Find the remove button - it should have an aria-label
    const removeButton = screen.getByLabelText(/remove test city/i);
    await user.click(removeButton);

    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it("handles card click", async () => {
    const handleClick = jest.fn();
    const { user } = renderWithProviders(
      <CityCard city={mockCity} onClick={handleClick} />,
    );

    // When onClick is provided, the CityCard should be clickable
    // Find the main container - it should have cursor-pointer class
    const cityCard = document.querySelector(".cursor-pointer");
    expect(cityCard).toBeInTheDocument();

    if (cityCard) {
      await user.click(cityCard as Element);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it("displays weather metrics correctly", () => {
    renderWithProviders(<CityCard city={mockCity} weather={mockWeather} />);

    // Use utility functions for metrics
    expectWeatherMetric(65, "%"); // humidity
    expectWeatherMetric(1013, "hPa"); // pressure
    expectWeatherMetric(5.5, "km/h"); // wind speed
  });

  it("shows feels like temperature", () => {
    renderWithProviders(<CityCard city={mockCity} weather={mockWeather} />);

    // Get the CityCard container
    const cityCard = getCityCardContainer();

    // Check that feels like temperature is displayed
    expect(cityCard).toHaveTextContent(/feels like/i);
    expect(cityCard).toHaveTextContent("24");
    expect(cityCard).toHaveTextContent("°");

    // Also verify the elements exist individually
    expect(screen.getByText(/feels like/i)).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = renderWithProviders(
      <CityCard city={mockCity} size="sm" />,
    );

    expect(document.querySelector(".p-3")).toBeInTheDocument();

    rerender(<CityCard city={mockCity} size="lg" />);
    expect(document.querySelector(".p-6")).toBeInTheDocument();
  });

  it("shows time when enabled", () => {
    renderWithProviders(<CityCard city={mockCity} showTime={true} />);

    // Should display current time for the city's timezone

    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it("does not show remove button when showRemoveButton is false", () => {
    renderWithProviders(<CityCard city={mockCity} showRemoveButton={false} />);

    expect(screen.queryByLabelText(/remove/i)).not.toBeInTheDocument();
  });

  // Test for edge cases
  describe("Edge Cases", () => {
    it("handles missing weather data gracefully", () => {
      renderWithProviders(<CityCard city={mockCity} weather={undefined} />);

      expect(screen.getByText(mockCity.name)).toBeInTheDocument();
      expect(screen.getByText(/weather data unavailable/i)).toBeInTheDocument();
    });

    it("handles weather data without feels like temperature", () => {
      const weatherWithoutFeelsLike = { ...mockWeather, feelsLike: undefined };

      renderWithProviders(
        <CityCard city={mockCity} weather={weatherWithoutFeelsLike} />,
      );

      // Use utility function for temperature
      expectTemperatureDisplay(22, "celsius");

      // Should not crash or show feels like if it's not available
      expect(screen.queryByText(/feels like/i)).not.toBeInTheDocument();
    });

    it("handles very long city names", () => {
      const longNameCity = createMockCity({
        name: "This Is A Very Long City Name That Should Be Handled Properly",
      });

      renderWithProviders(
        <CityCard city={longNameCity} weather={mockWeather} />,
      );

      expect(screen.getByText(longNameCity.name)).toBeInTheDocument();
    });
  });
});
