const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
const platformPath = path.resolve(
  __dirname,
  "node_modules/react-native-web/dist/vendor/react-native/Utilities/Platform.js"
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    if (
      moduleName === "../../Utilities/Platform" ||
      moduleName === "../Utilities/Platform" ||
      moduleName.endsWith("Utilities/Platform")
    ) {
      return { filePath: platformPath, type: "sourceFile" };
    }

    if (moduleName === "@stripe/stripe-react-native") {
      return { type: "empty" };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
