require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { app, BrowserWindow, dialog } = electron;
const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const { builderEngine } = require("./lib/BuilderEngine");

//the below isn't in use. Just practice/test.
//would need to manage passing the reference to the mainWindow and import dialog
const userDataPath = app.getPath('userData'); //C:\Users\<username>\AppData\Roaming\Product Content App
const resourcesPath = userDataPath + "/Resources";

//a super simple function for running post requests
function post(url, data) {
    return fetch(url, {method:'POST', body: JSON.stringify(data)})
}

//This function opens a read write stream at the provided paths.
//Type also determine what type of message is displayed (import vs. export)
async function StreamData(readPath, writePath, type) {
    let activeWindow = BrowserWindow.fromId(1);
    const readStream = fs.createReadStream(readPath, {encoding:"utf8"});
    const writeStream = fs.createWriteStream(writePath, {encoding:"utf8"});

    readStream.on("open", ()=>{
        activeWindow.webContents.send("console-log", "Read stream is open");
        readStream.pipe(writeStream);
    })
    readStream.on("end", ()=>{
        activeWindow.webContents.send("console-log", "Read Stream has ended.")
    })
    readStream.on("close", ()=>{
        activeWindow.webContents.send("console-log", "Read stream has closed")
    })
    readStream.on("error", (err)=>{
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Read File Error",
            message: `There was an error attempting to read file at path ${readPath}: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
    })
    writeStream.on("open", ()=>{
        activeWindow.webContents.send("console-log", "Write stream is open")
    })
    writeStream.on("end", ()=>{
        activeWindow.webContents.send("console-log", "Write Steam has ended.")
    })
    writeStream.on("close", ()=>{
        activeWindow.webContents.send("console-log", "Write Stream has closed")
        if (type == "export") {
            let options = {
                type: "none",
                buttons: ["Okay"],
                title: "Export Finished",
                message: "Export of assets has completed succesfully"
            }
            dialog.showMessageBox(activeWindow, options)
        }
        if (type == "import") {
            let options = {
                type: "none",
                buttons: ["Okay"],
                title: "Import Finished",
                message: "Import of assets has completed succesfully"
            }
            dialog.showMessageBox(activeWindow, options)
        }
    })
    writeStream.on("error", (err)=>{
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Write File Error",
            message: `There was an error attempting to write file at path ${writePath}: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
    })
}

async function findStyleGuide(config, resourcesPath, incomingClass, incomingSku) {
    let styleGuideJSON = await fsp.readFile(resourcesPath + '/StyleGuide.json', "utf-8",);
    
    const ownBrands = config["Functional Data"]["Staples Brands"];
    const thisBrand = incomingSku[config["Excel Mapping"]["Brand"]];
    const isOwnBrand = ownBrands.includes(thisBrand);
    const ownBrandClass = "Own Brands " + incomingClass
    if (isOwnBrand) {console.log("Found an Own Brand SKU")}
    console.log(ownBrandClass)

    let StyleGuides = JSON.parse(styleGuideJSON);
    let SGArray = StyleGuides.data;
    let foundStyleGuide = null;
    for (let index in SGArray) {
        let thisSG = SGArray[index];
        if (thisSG.class === incomingClass || thisSG.class === ownBrandClass) {
            if (!isOwnBrand && thisSG.class.includes("Own Brand")) {continue}
            const activeOwnBrandSearch = isOwnBrand && thisSG.class.includes("Own Brand");

            foundStyleGuide = thisSG.styleGuide
            if ((!isOwnBrand || activeOwnBrandSearch) && foundStyleGuide) {
                //console.log(`Style Guide was found with isOwnBrand:${isOwnBrand}  activeOwnBrand:${activeOwnBrandSearch}  Class:${thisSG.class}`)
                break
            }
        }
    }

    if (foundStyleGuide === null) {return "No style guide was found for this class";}
    return foundStyleGuide
}

//This checks to see if the file is the current file by comparing
//the metadata state (current) to the active state (last)
function checkForCurrent(current, last) {
    if (current.metadata.name == last.name 
        && current.metadata.time == last.time) {
        return true
    } else {
        return false
    }
}

//returns a date string when needed
function constructDate() {
    const dateTime = new Date();
    const dd = String(dateTime.getDate()).padStart(2, '0');
    const mm = String(dateTime.getMonth() + 1).padStart(2, '0');
    const yyyy = dateTime.getFullYear();
    const dateString = mm + "/" + dd + "/" + yyyy;
    return dateString
}

function constructTime() {
    const dateTime = new Date()
    const hh = String(dateTime.getHours()).padStart(2, "0");
    const mm = String(dateTime.getMinutes()).padStart(2, "0");
    const ss = String(dateTime.getSeconds()).padStart(2, "0");
    const timeString = hh + ":" + mm + ":" + ss;
    return timeString
}

//This function opens the state to determine so that we
//can determine if we need to open a file in history or
//open current.json
async function fetchStateAndData() {
    //Gotta be honest, this should be BrowserWindow.activeWindow()...but the active window 
    //is always going to be ID 1, so it feels better to be declarative here
    const activeWindow = BrowserWindow.fromId(1);
    const cachePath = resourcesPath + "/cache";
    let state;

    try {
        let stateJSON = await fsp.readFile(resourcesPath + '/state.json', "utf-8");
        state = JSON.parse(stateJSON);
    } catch(err) {
        let options = {
            type: "none",
            buttons: ["Okay"],
            title: "Read File Error",
            message: "Read file error:" + err
        }
        dialog.showMessageBox(activeWindow, options)
    }

    if (state.type == "history") {
        let fileName = state.name + ".json";

        //checking that the history file exists -> defaults to current if it doesn't
        if (fs.existsSync(path.join(cachePath, fileName))) {
            try {
                let historyJSON = await fsp.readFile(path.join(cachePath, fileName), "utf-8");
                return {
                    state: state,
                    json: JSON.parse(historyJSON)
                };
            } catch(err) {
                let options = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Read File Error",
                    message: "Read file error: " + err
                }
                dialog.showMessageBox(activeWindow, options)
            }
        } else {
            //if they file name doesn't exist, then change the type to current
            state.type = "current";
            try {
                let currentJSON = await fsp.readFile(resourcesPath + '/current.json', "utf-8");
                return {
                    state: state,
                    json: JSON.parse(currentJSON)
                };
            } catch(err) {
                let options = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Read File Error",
                    message: "Read file error: " + err
                }
                dialog.showMessageBox(activeWindow, options)
            }
        }       
    } else if (state.type == "custom") {
        //this block will implement the custom/filtered SKU set fetch
    } else {
        try {
            let currentJSON = await fsp.readFile(resourcesPath + '/current.json', "utf-8");
            return {
                state: state,
                json: JSON.parse(currentJSON)
            };
        } catch(err) {
            let options = {
                type: "none",
                buttons: ["Okay"],
                title: "Read File Error",
                message: "Read file error: " + err
            }
            dialog.showMessageBox(activeWindow, options)
        }
    }
}

async function fetchConfig() {
    let activeWindow = BrowserWindow.fromId(1);
    
    try {
        let rawConfig = await fsp.readFile(path.join(resourcesPath, '/config.json'), "utf-8")
        return JSON.parse(rawConfig)
    } catch(err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "File Fetch Error",
            message: `Error while parsing the Configuration: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
    }
}

module.exports = {
    post, StreamData, constructDate, constructTime, fetchStateAndData, fetchConfig, findStyleGuide, checkForCurrent
}