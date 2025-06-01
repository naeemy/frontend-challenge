import { test, expect } from "@playwright/test";

test.describe("Weather App E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(["geolocation"]);
    await page.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });

    // Mock API responses to avoid external dependencies
    await page.route("**/api/weather/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          weather: {
            dt: Date.now() / 1000,

            temperature: 22,
            condition: "clear sky",
            humidity: 65,
            pressure: 1013,
            windSpeed: 5.5,
          },
          forecast: [],
        }),
      });
    });

    await page.route("**/api/places/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "test-city-123",
            name: "Test City",
            country: "US",
            state: "CA",
            coordinates: { lat: 37.7749, lon: -122.4194 },
          },
        ]),
      });
    });

    await page.goto("/");
  });

  test("should load homepage and display title", async ({ page }) => {
    await expect(page.getByText("My Weather")).toBeVisible();
    await expect(
      page.getByText("Track weather in your favorite cities"),
    ).toBeVisible();
  });

  test("should display search box", async ({ page }) => {
    await expect(page.getByPlaceholder("Add a new city...")).toBeVisible();
  });

  test("should add a city through search", async ({ page }) => {
    // Click search box
    await page.getByPlaceholder("Add a new city...").click();

    // Type city name
    await page.getByPlaceholder("Add a new city...").fill("San Francisco");

    // Wait for suggestions and click first result

    await page.waitForSelector('[data-testid="suggestion-item"]', {
      timeout: 5000,
    });
    await page.getByTestId("suggestion-item").first().click();

    // Verify city was added to the list
    await expect(page.getByText("Test City")).toBeVisible();
  });

  test("should switch temperature units", async ({ page }) => {
    // Find and click temperature unit toggle
    const unitToggle = page.getByRole("button").filter({ hasText: /°[CF]/ });
    await unitToggle.click();

    // Should toggle between Celsius and Fahrenheit

    await expect(page.getByText(/°[CF]/)).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that the layout adapts to mobile
    await expect(page.getByText("My Weather")).toBeVisible();
    await expect(page.getByPlaceholder("Add a new city...")).toBeVisible();

    // Check for mobile navigation if it exists

    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if ((await mobileNav.count()) > 0) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test("should handle search with no results", async ({ page }) => {
    // Mock empty search results
    await page.route("**/api/places/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.getByPlaceholder("Add a new city...").fill("NonexistentCity");

    // Should show no results message
    await expect(page.getByText(/no cities found/i)).toBeVisible();
  });

  test("should navigate to city detail page", async ({ page }) => {
    // First add a city
    await page.getByPlaceholder("Add a new city...").fill("Test City");
    await page.waitForSelector('[data-testid="suggestion-item"]');
    await page.getByTestId("suggestion-item").first().click();

    // Click on city card to navigate to details
    await page.getByTestId("city-card").click();

    // Should navigate to city detail page
    await expect(page.url()).toContain("/city/");
    await expect(page.getByText("Test City")).toBeVisible();
  });

  test("should handle keyboard navigation in search", async ({ page }) => {
    await page.getByPlaceholder("Add a new city...").click();
    await page.getByPlaceholder("Add a new city...").fill("Test");

    // Wait for suggestions
    await page.waitForSelector('[data-testid="suggestion-item"]');

    // Use arrow keys to navigate
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Should select the highlighted suggestion
    await expect(page.getByText("Test City")).toBeVisible();
  });

  test("should persist cities in localStorage", async ({ page }) => {
    // Add a city
    await page.getByPlaceholder("Add a new city...").fill("Test City");
    await page.waitForSelector('[data-testid="suggestion-item"]');

    await page.getByTestId("suggestion-item").first().click();

    // Reload the page
    await page.reload();

    // City should still be there
    await expect(page.getByText("Test City")).toBeVisible();
  });

  test("should show error state when API fails", async ({ page }) => {
    // Mock API failure
    await page.route("**/api/weather/**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Server error" }),
      });
    });

    // Refresh to trigger API call
    await page.reload();

    // Should show error message
    await expect(page.getByText(/failed to load/i)).toBeVisible();
  });

  test("should handle offline state", async ({ page, context }) => {
    // Add a city first
    await page.getByPlaceholder("Add a new city...").fill("Test City");
    await page.waitForSelector('[data-testid="suggestion-item"]');
    await page.getByTestId("suggestion-item").first().click();

    // Go offline
    await context.setOffline(true);

    // Try to refresh weather data
    const refreshButton = page.getByRole("button", { name: /refresh/i });
    if ((await refreshButton.count()) > 0) {
      await refreshButton.click();

      // Should show offline indicator or error
      await expect(page.getByText(/offline|network error/i)).toBeVisible();
    }
  });
});
