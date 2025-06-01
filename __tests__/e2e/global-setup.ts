import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global setup for E2E tests...");

  // Create a browser instance to check if the app is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Check if the application is accessible

    const baseURL = config.webServer?.url || "http://localhost:3000";

    console.log(`📡 Checking if app is available at ${baseURL}...`);

    await page.goto(baseURL, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Verify the app loaded correctly
    await page.waitForSelector("body", { timeout: 10000 });

    console.log("✅ Application is running and accessible");

    // Set up any global test data or configurations
    await setupTestEnvironment(page);
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("✅ Global setup completed successfully");
}

async function setupTestEnvironment(page: any) {
  // Clear any existing localStorage to start fresh
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Set up mock API keys in localStorage if needed
  await page.evaluate(() => {
    localStorage.setItem("test-mode", "true");
  });

  console.log("🧹 Test environment cleaned and configured");
}

export default globalSetup;
