import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
  webServer: {
    command: "python3 -m http.server 8080",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 20000,
  },
  projects: [
    { name: "mobile", use: { ...devices["iPhone 12"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
