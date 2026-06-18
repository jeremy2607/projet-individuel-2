import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // URL du front : dockerisé sur 8081 (surchargeable via CYPRESS_BASE_URL)
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:8081",
    supportFile: false,
    video: false,
  },
});
