require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { BrowserWindow, dialog, webContents, ipcMain } = electron;
const { fetchConfig } = require('../index.js');
//const { runAttributeImport } = require('../lib/attribute-mapper.js');
const { runSkuDataImport } = require('../sku-importer/index.js');
const { runAttributeImport } = require('../attribute-importer/index.js');

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
            let result = runSkuDataImport(activeWindow, importPackage.filePath, config);
            return result
        } catch (err) {
            let errOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "SKU Data Import Error",
                message: `There was an issue importing SKU data: ${err}`
            }
            dialog.showMessageBox(activeWindow, errOptions)
            return "error"
        }
    }

    if (importPackage.type === "attribute") {
        // This import is pretty stripped down. We need the file path and then we
        // plug and chug.
        runAttributeImport(activeWindow, importPackage.filePath, config).then(()=>{
            return "finished";
        }).catch((err)=>{
            console.log(err)
        })
    }
})