// metro.config.js
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

// this is your project folder
const projectRoot = __dirname;

// this tells Expo to only look inside your project
const config = getDefaultConfig(projectRoot);
config.watchFolders = [projectRoot];

// this creates the "@theme" shortcut for theme.ts
config.resolver.alias = {
  "@theme": path.resolve(projectRoot, "theme.ts"),
};

module.exports = config;
