
const electron = require("electron");
const { app } = electron;
const path = require("path");

// Relevant Application Directories
const userDataPath = app.getPath('userData');
const resourcesPath = path.join(userDataPath, "/Resources");
const cachePath = path.join(resourcesPath, "/cache");

// Relevant Application File Names
const configurationFileName = "config.json";
const styleGuideFileName = "StyleGuide.json";
const astDataFileName = "tokens.json";

// Relevant Application File Paths
const currentDataPath = path.join(resourcesPath, "current.json");
const statePath = path.join(resourcesPath, "state.json");
const configurationPath = path.join(resourcesPath, configurationFileName);
const astDataPath = path.join(resourcesPath, astDataFileName);
const styleGuidePath = path.join(resourcesPath, styleGuideFileName)

module.exports = {
    resourcesPath, cachePath, currentDataPath, astDataPath, configurationPath, statePath, styleGuidePath,
    configurationFileName, styleGuideFileName, astDataFileName
};
