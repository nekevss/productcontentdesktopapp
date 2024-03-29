require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { BrowserWindow, dialog, webContents, ipcMain } = electron;
const fs = require('fs');
const path = require('path');
const { fetchStateAndData, findStyleGuide, checkForCurrent, fetchConfig } = require('../index.js');
const { pleaseSirABuilder, builderEngine, reportRunner, fetchAttributes, determineWebClass, generateFormula } = require('../lib/index.js');
const { fetchAstAssets, fetchAllCachedData } = require("../fetch.js");
const { resourcesPath, cachePath, statePath } = require("../applicationPaths.js");

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
    const frame = await fetchStateAndData();

    const state = frame.state;
    const current = frame.json;

    // console.log("Logging state!")
    // console.log(state)
    // console.log("Logging Current metadata")
    // console.log(current.metadata)

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
        // write new cache version for the history
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

        fs.writeFile(statePath, JSON.stringify(newState, null, 4), "utf-8", (err) => {
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
    let found_builder;
    let found_SG;

    const config = await fetchConfig()
    //Can I lower the amount of time/load by preloading
    //the generators into an array on new sheet
    const querySku = arg.thisSku;
    const queryPath = arg.thisPath;
    
    const skuIdentifer = querySku[config["Excel Mapping"]["Sku Number"]] ? querySku[config["Excel Mapping"]["Sku Number"]] : querySku[config["Excel Mapping"]["Wholesaler Number"]];
    const determinedClass = determineWebClass(queryPath, skuIdentifer);
    
    console.log(determinedClass)

    try {
        let builders = await fetchAstAssets()
        let buildersArray = builders.data;
        found_builder = pleaseSirABuilder(config, buildersArray, determinedClass, querySku)
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
        found_SG = await findStyleGuide(config, resourcesPath, determinedClass, querySku);
    } catch (err) {
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Style Guide Search Error",
            message: `Error during style guide formula search: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
    }

    const pphArray = queryPath.split(/(?<=[\w.*+?^${}()|[\]\\])\/(?=[\w.*+?^${}()|[\]\\])/gi);
    const attributes = fetchAttributes(pphArray, resourcesPath);
    //const attributes = await fetchAttributesData(queryPath, resourcesPath, queryConfig);
    
    const payload = {
        styleGuide : found_SG, 
        builder: found_builder, 
        attributes: attributes, 
        webClass: determinedClass 
    }

    return payload;
})


ipcMain.handle("request-name", (event, package)=>{
    const output = builderEngine(package.sku, package.skuNameBuilder, package.config);
    return output
})

ipcMain.handle("request-formula", async(event, requestStyleGuide)=>{
    let config = await fetchConfig();

    let formulaTypes = {};
    let context = {};

    // Carry over the Style Guide Builder Object and values from config
    context["Style Guide Builder"] = config["Style Guide Builder"];

    let configTypes = config["Formula Types"];
    for (const [key, value] of Object.entries(configTypes)) {
        // I'm only doing the below because I know there is only one space...
        // AKA YOLO LOL
        const [type, op] = key.split(" ");

        if (Object.keys(formulaTypes).includes(type)) {
            formulaTypes[type][op] = value;
        } else {
            formulaTypes[type] = {};
            formulaTypes[type][op] = value;
        }
    }
    context.formulaTypes = formulaTypes;

    return generateFormula(context, requestStyleGuide)
})

ipcMain.handle("request-cache-data", async(event, args)=>{
    const activeWindow = BrowserWindow.fromId(1);
    let cacheData = [];

    try {
        cacheData = await fetchAllCachedData();
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
