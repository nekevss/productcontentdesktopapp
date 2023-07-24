require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { app, dialog } = electron;
const xlsx = require("xlsx");
const fs = require("fs");
const path = require('path');
const { resourcesPath } = require("../applicationPaths.js");

async function runAttributeImport(activeWindow, filePath, config) {
    activeWindow.webContents.send("import-status", "Beginning Attribute Import");
    console.log("Beginning Attribute Import")
    const attributesPath = path.join(resourcesPath, "attributes")
    // 1. Make sure that the attributes file exists.
    if (!fs.existsSync(path.join(attributesPath))) {
        fs.mkdirSync(attributesPath);
    }

   // 2. Use import function to import and create output items.
   try {
       // There should be only 2 outputs to my knowledge.
       // -object
       // -null

       const SomeimportedReport = importSpecAttributeReport(activeWindow, filePath, config);
           
        if (SomeimportedReport.result === "success") {
            const importedReport = SomeimportedReport.output;
            const superCats = Object.keys(importedReport);

            console.log("Beginning writing files");
            activeWindow.webContents.send("import-status", `Writing JSONs to attributes directory.`);
            superCats.forEach((superCatKey)=>{
                const newFile = path.join(attributesPath, superCatKey + ".json");
                try {
                    fs.writeFileSync(newFile, JSON.stringify(importedReport[superCatKey], null, 4),'utf-8')
                } catch (err) {
                    let errOptions = {
                        type: "none",
                        buttons: ["Okay"],
                        title: "Attribute File Write Error",
                        message: `There was an issue writing attribute JSON: ${err}`
                    }
                    dialog.showMessageBox(activeWindow, errOptions)
                }
                
            })
            activeWindow.webContents.send("import-status", `Finished importing!`);
        } else {
            console.log(`There was an error importing report.`)
        }
   } catch (err) {
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Attribute Import Error",
            message: `There was an issue importing attributes: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
   }
   
   return "finished"
}

// We are going to make some assumptions that Super_Cat, Cat, and Dept will stay stable

function importSpecAttributeReport(activeWindow, importPath, config) {
    let reportOutput = new Object();
    // 1. Read in file as buffer
    activeWindow.webContents.send("import-status", "Beginning to read file");
    const fileBuffer = fs.readFileSync(importPath);
    // 2. Read buffer into workbook object
    activeWindow.webContents.send("import-status", "Reading buffer into workbook");
    const workbook = xlsx.read(fileBuffer);
    activeWindow.webContents.send("import-status", `Finished reading, beginning mapping...`);
    // 3. Check that there is only one sheet.
    if (workbook.SheetNames.length == 1) {
        console.log(workbook.SheetNames);
        let reportRaw = workbook.Sheets[workbook.SheetNames[0]];
        const reportJSON = xlsx.utils.sheet_to_json(reportRaw, {defval: ""});

        // 4. Iterate through the sheet to create our objects.
        // NOTE: unshift and while loop instead of a for loop,
        // since ideally if we consume the array, we may save memory
        const superCategoryCall = config["Attribution Mapping"]["Super Category Node"];
        const categoryCall = config["Attribution Mapping"]["Category Node"]
        const departmentCall = config["Attribution Mapping"]["Department Node"];

        let categoryKeys = [];
        let superCatKeys = [];
        let departmentKeys = [];
        let lastClass = "None";
        let lastAttribute = "None";

        const total = reportJSON.length
        console.log(reportJSON[0]);
        while (reportJSON.length > 0) {
            let currentRow = reportJSON.shift();
            //let progress = (total - reportJSON.length) / total

            let thisSuperCat = currentRow[superCategoryCall];
            let thisCategory = currentRow[categoryCall];
            let thisDept = currentRow[departmentCall];
            let thisClass = currentRow[config["Attribution Mapping"]["Class Primary Field"]];
            let thisAttribute = currentRow[config["Attribution Mapping"]["Attribute Primary Field"]];
            
            //console.log(reportOutput)
            if (lastClass === thisClass) {
                if (lastAttribute === thisAttribute) {
                    let valueObject = createAttributeValueObject(currentRow, config);
                    let childrenLength = reportOutput[thisSuperCat][thisCategory][thisDept][thisClass]["children"].length;
                    reportOutput[thisSuperCat][thisCategory][thisDept][thisClass]["children"][childrenLength-1]["children"].push(valueObject)
                } else {
                    let newAttribute = createAttributeObject(currentRow, config);
                    reportOutput[thisSuperCat][thisCategory][thisDept][thisClass]["children"].push(newAttribute);
                }
                
                lastAttribute = thisAttribute;
                lastClass = thisClass;
                continue;
            }


            if (!superCatKeys.includes(thisSuperCat)) {
                reportOutput[thisSuperCat] = new Object();
                superCatKeys.push(thisSuperCat);
                //console.log(superCatKeys)
            }

            let uniqueCatKey = thisSuperCat + "/" + thisCategory
            if (!categoryKeys.includes(uniqueCatKey)) {
                reportOutput[thisSuperCat][thisCategory] = new Object();
                categoryKeys.push(uniqueCatKey)
                //console.log(categoryKeys)
            }

            let uniqueDeptKey = thisSuperCat + "/" + thisCategory + "/" + thisDept
            if (!departmentKeys.includes(uniqueDeptKey)) {
                reportOutput[thisSuperCat][thisCategory][thisDept] = new Object();
                departmentKeys.push(uniqueDeptKey);
                //console.log(departmentKeys)
            }

            // create the new class object
            let addFields = config["Attribution Mapping"]["Class Fields"];

            let newClassObject = {};
            addFields.forEach((value)=>{
                newClassObject[value] = currentRow[value]
            })

            const attributeObject = createAttributeObject(currentRow, config);
            newClassObject["children"] = new Array(attributeObject);

            reportOutput[thisSuperCat][thisCategory][thisDept][thisClass] = newClassObject

            lastAttribute = thisAttribute;
            lastClass = thisClass;
        }

        activeWindow.webContents.send("import-status", `Finished mapping...`);
        console.log("Done!!!")
        return {
            result: "success",
            output: reportOutput
        }
    }
    return {
        result: "fail",
        output: null
    }
}


function createAttributeValueObject(data, config) {
    let newAttributeValueObject = {};

    const addFields = config["Attribution Mapping"]["Attribute Value Fields"];

    addFields.forEach((field, index)=>{
        newAttributeValueObject[field] = data[field];
    });
    
    return newAttributeValueObject
}


function createAttributeObject(data, config) {
    let newAttributeObject = {};

    const addFields = config["Attribution Mapping"]["Attribute Fields"];
    const testField = config["Attribution Mapping"]["Attribute Value Primary"];

    addFields.forEach((field, index)=>{
        newAttributeObject[field] = data[field];
    });
    
    if (data[testField]) {
        let valueObject = createAttributeValueObject(data, config);
        newAttributeObject["children"] = new Array(valueObject)
    }

    return newAttributeObject
}

module.exports = {
    runAttributeImport
}