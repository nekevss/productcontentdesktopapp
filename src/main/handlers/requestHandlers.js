require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { app, BrowserWindow, dialog, webContents, ipcMain, shell } = electron;
const fsp = require('fs').promises;
const fs = require('fs');
const os = require('os');
const path = require('path');
const { fetchStateAndData, findStyleGuide, checkForCurrent, fetchConfig } = require('../index.js');
const { pleaseSirABuilder } = require('../lib/StyleGuideRunner.js');
const { builderEngine } = require('../lib/BuilderEngine.js');
const { reportRunner } = require('../lib/report-runner.js');
const { fetchAttributesData, fetchAttributes } = require('../lib/fetch-attributes.js');

const activeUser = os.userInfo().username;
const userDataPath = app.getPath('userData'); //C:\Users\<username>\AppData\Roaming\Product Content App
const resourcesPath = userDataPath + "/Resources";

// Table of Contents
// ---------------------
// request-skuset
// request-sku-and-state
// request-class-data
// request-class-details
// request-name
// request-cache-data
// request-sku-report


ipcMain.handle('request-skuset', async(event, arg) => {
    let frame = await fetchStateAndData();
    const current = frame.json;

    console.log("Sending the full skuset as a payload");

    return current.data
})

//main function for determining application state and returning SKU
ipcMain.handle('request-sku-and-state', async(event, arg) => {
    console.log("Making it into the request handler");
    const cachePath = resourcesPath + "/cache";
    const frame = await fetchStateAndData();

    const state = frame.state;
    const current = frame.json;

    console.log("Logging state!")
    console.log(state)

    console.log("Logging Current metadata")
    console.log(current.metadata)

    if (state.type === "history") {
        return {
            type: "history",
            position: arg,
            length: current.data.length,
            sku: current.data[arg]
        }
    }
    //----------------------------------------------------------
    //The below code should run if state type is not history
    let isCurrent = checkForCurrent(current, state);

    let payload;
    if (!isCurrent) {
        // The below code should only run on a new upload
        console.log("Found a new sheet!")
        //write new cache version for the history
        const fileName = current.metadata.name + ".json";
        fs.writeFile(path.join(cachePath, fileName), JSON.stringify(current), (err)=>{
            if (err) {console.log(err)}
        })

        //write new state
        const newState = {
            type: state.type,
            length: current.data.length,
            ...current.metadata 
        }
        fs.writeFile(resourcesPath + '/state.json', JSON.stringify(newState, null, 4), "utf-8", (err) => {
            if (err) {console.log(err)};
        })

        payload = {
            type: "current",
            position: 0,
            length: current.data.length,
            sku: current.data[0]
        }

        console.log("Deliverying the payload now!\n")
        return payload;  
        
    } else {
        payload = {
            type: "current",
            position: arg,
            length: state.length,
            sku: current.data[arg]
        }

        console.log("Sending the payload!\n")
        return payload;
    }
})


ipcMain.handle('request-class-details', async(event, arg) => {
    let activeWindow = BrowserWindow.fromId(1);
    let found_generator;
    let found_SG;

    const config = await fetchConfig()
    //Can I lower the amount of time/load by preloading
    //the generators into an array on new sheet
    const queryConfig = arg.config;
    const queryClass = arg.thisClass;
    const querySku = arg.thisSku;
    const queryPath = arg.thisPath;
    
    try {
        let builders = await fsp.readFile(resourcesPath + '/Builders.json', "utf-8",);
        let buildersContainer = JSON.parse(builders);
        let buildersArray = buildersContainer.data;
        found_generator = pleaseSirABuilder(config, buildersArray, queryClass, querySku)
    } catch (err) {
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Builder Search Error",
            message: `Error during builder query: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
    }
    
    try {
        found_SG = await findStyleGuide(config, resourcesPath, queryClass, querySku);
    } catch (err) {
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Style Guide Search Error",
            message: `Error during style guide formula search: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
    }

    let pph = arg.thisSku[arg.config["Excel Mapping"]["PPH Path"]];
    const pphArray = pph.split(/(?<=[\w.*+?^${}()|[\]\\])\/(?=[\w.*+?^${}()|[\]\\])/gi);
    const attributes = fetchAttributes(pphArray, resourcesPath);
    //const attributes = await fetchAttributesData(queryPath, resourcesPath, queryConfig);
    
    const payload = {styleGuide : found_SG, builder: found_generator, attributes: attributes}

    return payload;
})


ipcMain.handle("request-name", (event, package)=>{
    const output = builderEngine(package.sku, package.generator, package.config);
    return output
})

ipcMain.handle("request-cache-data", async(event, args)=>{
    const activeWindow = BrowserWindow.fromId(1);
    const cachePath = path.join(resourcesPath, "\cache")
    let files;
    let cacheData = [];
    let jsonRegex = new RegExp("\\.json$", "gi")

    try {
        files = await fsp.readdir(cachePath);
        for await (const file of files) {
            //iterate through files in array and verify they are jsons
            if (jsonRegex.test(file)) {
                let fileData = {fileName : file.replace(jsonRegex, "")}
                
                let filePath = path.join(cachePath, file);
                const contents = fs.readFileSync(filePath, {encoding:"utf8"});
                const fileJson = JSON.parse(contents)
                const metadata = fileJson.metadata;
                const metaKeys = Object.keys(metadata);
                metaKeys.forEach((value)=>{
                    fileData[value] = metadata[value];
                })

                fileData["length"] = fileJson.data.length;

                cacheData.push(fileData);
            }
        }
    } catch (err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Cache Read Error",
            message: `Error while reading file cache: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
    }

    return cacheData
})

ipcMain.handle("request-sku-report", async(event, package)=>{
    const activeWindow = BrowserWindow.fromId(1);

    try {
        const report = await reportRunner(package.sku, package.config);
        if(package.sku[package.config["Excel Mapping"]["Prohibited/Conditional Values"]]) {
            report.push({
                test: "Restricted Value(s)",
                field: "col",
                message: package.sku[package.config["Excel Mapping"]["Prohibited/Conditional Values"]]
            })
        }
        return report
    } catch (err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Reporting Error",
            message: `Error while completing report: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
        return []
    }
})
