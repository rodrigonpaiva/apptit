const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "../../dist/apps/gateway"),
    clean: true,
    ...(process.env.NODE_ENV !== "production" && {
      devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: "node",
      compiler: "swc",
      main: join(__dirname, "src/main.ts"),
      tsConfig: join(__dirname, "tsconfig.app.json"),
      optimization: false,
      outputHashing: "none",
      generatePackageJson: false,
      sourceMap: true,
    }),
  ],
};
