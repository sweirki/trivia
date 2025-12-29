const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  alias: {
    "@": "./src",
    "@app": "./app",
    "@assets": "./assets",
    "@components": "./components",
    "@hooks": "./hooks",
    "@constants": "./constants",
    "@services": "./services",
  },
};

module.exports = config;
