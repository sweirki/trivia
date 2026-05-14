/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/app/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@constants/(.*)$": "<rootDir>/constants/$1",
    "^@services/(.*)$": "<rootDir>/services/$1"
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/firebase/**",
    "!src/theme/**"
  ]
};
