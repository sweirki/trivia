module.exports = [
  {
    ignores: [
      ".expo/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      // Phase 1 cleanup: legacy dynamic game/state boundaries are allowed while Phase 2 type-hardening replaces them with domain models.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];