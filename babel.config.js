module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@app": "./app",
            "@assets": "./assets",
            "@components": "./components",
            "@hooks": "./hooks",
            "@constants": "./constants",
            "@services": "./services",
          },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
    ],
  };
};
