require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { app, BrowserWindow, dialog, webContents, ipcMain, shell } = electron;
const os = require('os');
const { fetchConfig } = require('../index.js');
//const { runAttributeImport } = require('../lib/attribute-mapper.js');
const { runSkuDataImport } = require('../sku-importer/index.js');
const { runAttributeImport } = require('../attribute-importer/index.js');



const activeUser = os.userInfo().username;
const userDataPath = app.getPath('userData'); //C:\Users\<username>\AppData\Roaming\Product Content App
const resourcesPath = userDataPath + "/Resources";

// the below handler takes an incoming package:
// 
// -incomingPackage
// --type
// --filePath

ipcMain.handle("run-import", async(event, importPackage)=>{
    const activeWindow = BrowserWindow.fromId(1);

    const config = await fetchConfig()

    if (importPackage.type === "sku-data") {
        // SKU data is going a more involved import.
        console.log("Recieved a request to import SKUs.")
        try {
            let result = runSkuDataImport(activeWindow, resourcesPath, importPackage.filePath, config);
            return result
        } catch (err) {
            let errOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "SKU Data Import Error",
                message: `There was an issue importing SKU data: ${err}`
            }
            dialog.showMessageBox(activeWindow, errOptions)
        }
    }

    if (importPackage.type === "attribute") {
        // This import is pretty stripped down. We need the file path and then we
        // plug and chug.
        runAttributeImport(activeWindow, resourcesPath, importPackage.filePath, config).then(()=>{
            return "finished";
        }).catch((err)=>{
            console.log(err)
        })
    }
})