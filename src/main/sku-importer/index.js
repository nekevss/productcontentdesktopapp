const electron = require('electron');
const { app, dialog } = electron;
const xlsx = require("xlsx");
const fs = require("fs");
const path = require('path');
const { constructDate, constructTime } = require("../index.js");

function runSkuDataImport(activeWindow, resourcesPath, filePath, config) {
    // 1. Determine the real file path.
    let importPath = "";
    let mostRecentFile = ""
    if (filePath === "default") {
        // We default to the most recent file in the downloads folder.
        // a. Get download folder path
        const dPath = app.getPath("downloads");
        // b. read download directory filter and sort based on file stat mtime
        let files = fs.readdirSync(dPath)
            .filter(file => fs.lstatSync(path.join(dPath, file)).isFile())
            .map(file => ({ file, mtime: fs.lstatSync(path.join(dPath, file)).mtime }))
            .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

        // c. set most recent file to the file value on the sorted files at index 0
        mostRecentFile = files[0].file;
        // d. clean any ghost file indicators or whatever its called
        mostRecentFile = mostRecentFile.includes("~$") ? mostRecentFile.replace("~$", "") : mostRecentFile;
        // e. set import path
        importPath = path.join(dPath, mostRecentFile);
    } else {
        // We assume here that the file path is a valid selected path that is being fed, so we set import path to file path
        importPath = filePath
    }
    
    // 2. validate that the file path is indeed an .xlsm file
    let fileTypeRegex = new RegExp('\\.xlsm$', 'gi');
    
    if (!importPath.match(fileTypeRegex)) {
        // 3.1 We have determined that the file is not an .xlsm file, so we throw an error
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "SKU Data Import Error",
            message: `File selected for import is not a .xlsm file`
        }
        dialog.showMessageBox(activeWindow, errOptions)
        return "error"
    } else {
        // 3. Run excel file import
        const skuData = ImportExcelData(importPath, config);

        // 4. We need to create the storage object for SKU data (displayed below)
        // -metadata
        // --name
        // --time
        // -data
        // --skuData

        // Get metadata fields
        const importPathArray = importPath.split("\\");
        const fileName = importPathArray[importPathArray.length - 1].replace(fileTypeRegex, "");
        //console.log(fileName)
        // lol
        const currentDate = constructDate();
        const currentTime = constructTime()

        // clean the file name 

        // Create the metadata object
        const metadataObject = {
            name: fileName,
            time: currentTime,
            date: currentDate
        }

        // Finally, create the storage object
        const importObject = {
            metadata: metadataObject,
            data: skuData
        }

        // 5. Write import data object to current.json file in resources folder
        fs.writeFile(resourcesPath + "/current.json", JSON.stringify(importObject, null, 4), "utf8", (err)=>{
            if(err){
                console.log(err)
            }
        })
    }
    return "finished"
}

function ImportExcelData(importPath, config) {
    // 1. Read in file as buffer
    const fileBuffer = fs.readFileSync(importPath);
    // 2. Read buffer into workbook object
    const workbook = xlsx.read(fileBuffer);

    // 3. Curate an array of worksheets by removing the sheets we don't want
    let utilityWorksheet = new RegExp("Cover$|STEP|Sheet[0-9]+", "g");

    const curatedSheets = workbook.SheetNames.filter(name=>!name.match(utilityWorksheet));
    // console.log(curatedSheets)
    
    // Declare the current SKU array
    let currentSKUs = [];

    curatedSheets.forEach((sheetName, index)=>{
        // 1. Identify sheet using incoming sheet name
        const thisSheet = workbook.Sheets[sheetName];
        // 2. Read sheet to JSON with utility function.
        // NOTE: range should be made a configuration value at some point
        //       so that it can be altered
        const json = xlsx.utils.sheet_to_json(thisSheet, {defval: "", range: 9});
    
        // 3. Loop through the sheet and map the SKUs into new data object.
        json.forEach((sku)=>{
            let mapped_sku = new Object();
            let fields = Object.keys(sku);
            for (i = 0; i <= fields.length - 1; i++) {
                let activeField = fields[i];
                // Keywords should be in config file as Attribution Entry point
                if (activeField == config["Import Mapping"]["Attribute Entry Point"]) {
                    console.log('Found an entry point for importing.')
                    mapped_sku[activeField] = sku[activeField];
                    mapped_sku.Specs = new Object();
                    for (j = i + 1; j <= fields.length - 2; j++) {
                        activeField = fields[j]
                        mapped_sku.Specs[activeField] = sku[activeField] ? sku[activeField] : null;
                        // Proprietary Code should be in config file as Attribution Exit Point
                        if (fields[j+1] == config["Import Mapping"]["Attribute Exit Point"]) {
                            i = j;
                            break;
                        }
                    }
                } else {
                    mapped_sku[activeField] = sku[activeField];
                }    
            }
            // While we are handling the import, we can predetermine the class for the SKU using the PPH field
            let determinedClass = "";
            const pph= sku[config["Excel Mapping"]["PPH Path"]];
            let pphArray = pph.split(/(?<=[\w.*+?^${}()|[\]\\])\/(?=[\w.*+?^${}()|[\]\\])/gi);
            for (let i = pphArray.length-1; i>=0; i=i-1) {
                // this finds the class based of the SKU being in a normal area
                if (pphArray[i].includes("Items")) {
                    determinedClass = pphArray[i-1];
                    break;
                }
    
                // The below is going to be super greedy. In most cases, the 4th PPH value should be the class.
                // Above we handle based off finding "Items", because we can verify the return is 
                // 100% valid.
                // Here, we are going to make a broad assumption that if we have made it to index 3, then
                // the value at that point is the class. This is being implemented primarily for SKU sets
                // and we will leave it be.
    
                if (i === 3) {
                    determinedClass = pphArray[i];
                    break;
                }
            }
            mapped_sku["Class"] = determinedClass;
            // Push mapped SKU into the current SKUs object

            // console.log(mapped_sku)
            currentSKUs.push(mapped_sku)
        })
    })

    return currentSKUs
}

module.exports = {
    runSkuDataImport
}