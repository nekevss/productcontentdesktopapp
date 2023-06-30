// This is a pretty horrible name for a file but can't really think of anything better currently.
//
// General idea: host all data fetches in one file, so that they can be easily altered as needed.
//
require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require("electron");
const { app } = electron;
const fsp = require('fs').promises;
const fs = require("fs");
const path = require('path');

// Relevant paths for 
const userDataPath = app.getPath('userData');
const resourcesPath = userDataPath + "/Resources";
const cachePath = resourcesPath + "/cache";

// NOTE: Can return error
async function fetchStyleGuideAsset() {
    let fetchedData = await fsp.readFile(resourcesPath + "/StyleGuide.json", "utf-8");
    return JSON.parse(fetchedData);
}

// NOTE: Can return error
async function fetchAstAssets() {
    let fetchedData = await fsp.readFile(resourcesPath + "/Builders.json", "utf-8");
    return JSON.parse(fetchedData)
}

// NOTE: Can return error
async function fetchConfigAsset() {
    let fetchedData = await fsp.readFile(resourcesPath + "/config.json", "utf-8");
    return JSON.parse(fetchedData)
}

async function fetchStateAsset() {
    let fetchedData = await fsp.readFile(resourcesPath + "/state.json", "utf-8");
    return JSON.parse(fetchedData)
}

async function fetchCurrentData() {
    let fetchedData = await fsp.readFile(resourcesPath + "/current.json", "utf-8");
    return JSON.parse(fetchedData)
}

async function fetchSpecificCachedData(fileName) {
    let fetchedData = await fsp.readFile(path.join(cachePath, fileName), "utf-8");
    return JSON.parse(fetchedData)
}

// Should this be included for handler "request-cache-data"?
async function fetchAllCachedData() {
    let jsonRegex = new RegExp("\\.json$", "gi")
    let data = [];

    let files = await fsp.readdir(cachePath);
    for await (let file of files) {
        //iterate through files in array and verify they are jsons
        if (jsonRegex.test(file)) {
            let fileData = {fileName : file.replace(jsonRegex, "")}
            
            let filePath = path.join(cachePath, file);
            let contents = fs.readFileSync(filePath, {encoding:"utf8"});
            let fileJson = JSON.parse(contents)
            let metadata = fileJson.metadata;
            let metaKeys = Object.keys(metadata);
            metaKeys.forEach((value)=>{
                fileData[value] = metadata[value];
            })

            fileData["length"] = fileJson.data.length;

            data.push(fileData);
        }
    }

    return data
}


module.exports = {
    fetchStyleGuideAsset, fetchAstAssets, fetchConfigAsset, fetchStateAsset,
    fetchCurrentData, fetchSpecificCachedData
}
