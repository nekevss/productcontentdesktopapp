require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { app, BrowserWindow, dialog, webContents, ipcMain, shell } = electron;
const fsp = require('fs').promises;
const fs = require('fs');
const os = require('os');
const { constructDate } = require('../index.js');

const activeUser = os.userInfo().username;
const userDataPath = app.getPath('userData'); //C:\Users\<username>\AppData\Roaming\Product Content App
const resourcesPath = userDataPath + "/Resources";

/*--------------------------------------------------------------------------------------*/
//Style Guide Builder handlers

ipcMain.handle("export-sng-package", async(event, incomingPackage)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let current;

    //the date is created below and then the new Javascript value for the SNG file is created
    const dateString = constructDate()

    try {
        const builders = await fsp.readFile(resourcesPath + '/Builders.json', "utf-8",);
        current = JSON.parse(builders);
    } catch (err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Read File Error",
            message: `There was an error while reading the Sku Name Generators JSON: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
    }

    if (current) {
        let SngArray = current.data;

        //find matching class and replace that value with the incoming package
        //Note: also adds value to end of file if the end of the array is reached and no matching value is found.
        for (let index in SngArray) {
            if (SngArray[index].class == incomingPackage.class) {
                SngArray[index] = incomingPackage;
                break;
            }
    
            if (index == (SngArray.length - 1)) {
                SngArray.push(incomingPackage)
            }
        }
    
        const updatedSNG = {
            metadata: {Updated : dateString},
            data: SngArray
        }
    
        //write new assets into local file
        fs.writeFile(resourcesPath + '/Builders.json', JSON.stringify(updatedSNG, null, 4), "utf-8", (err) => {
            if (err) {
                let errorOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Write File Error",
                    message: `There was an error while writing the Sku Name Generators JSON: ${err}`
                }
                dialog.showMessageBox(activeWindow, errorOptions)
            } else {
                let options = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Export Finished",
                    message: "Sku Name Builder library has been updated with exported asset"
                }
                dialog.showMessageBox(activeWindow, options)
            }
        })
    }  
})

ipcMain.handle('delete-style-guide', async(event, styleGuideToDelete)=>{
    let activeWindow = BrowserWindow.fromId(1);
    console.log("Entered the delete style guide handler")
    let options = {
        type: "question",
        buttons: ["Confirmed, permanently delete style guide", "Nevermind, keep style guide"],
        title: "Delete Confirmation",
        message: "Please confirm if the current style guide should be permanantly deleted. Deleted items will not be recoverable."
    }
    let feedback = await dialog.showMessageBox(activeWindow, options);

    if (feedback.response === 0) {
        console.log("Received confirmation to permanently delete the style guide.")
        //declare variables
        let styleGuideObj;
        let skuNameGenObj;
        try{
            let skuNameGensRaw = await fsp.readFile(resourcesPath + '/Builders.json', "utf-8",);
            skuNameGenObj = JSON.parse(skuNameGensRaw);
        } catch(err) {
            let errorOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Read File Error",
                message: `There was an error while reading the Sku Name Builders JSON: ${err}`
            }
            dialog.showMessageBox(activeWindow, errorOptions)
        }
        try{
            let styleGuideRaw = await fsp.readFile(resourcesPath + '/StyleGuide.json', "utf-8",);
            styleGuideObj = JSON.parse(styleGuideRaw);
        } catch(err) {
            let errorOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Read File Error",
                message: `There was an error while reading the Style Guide JSON: ${err}`
            }
            dialog.showMessageBox(activeWindow, errorOptions)
        }

        //assets read, for deleting, we're just going to create brand new assets from the old
        const gens = skuNameGenObj.data;
        const styleGuides = styleGuideObj.data;

        const newBuildersData = gens.filter((value, index)=>{
            return value.class !== styleGuideToDelete.class;
        })
        const newGuidesData = styleGuides.filter((value, index)=>{
            return value.class !== styleGuideToDelete.class;
        })

        const dateString = constructDate()

        const statusString = styleGuideToDelete.class + " (deleted)"
        let newStyleGuidesObj = {
            metadata: {
                "Updated":dateString,
                "Last Class": statusString
            },
            data: newGuidesData
        }
        const newBuilders = {
            metadata: {Updated:dateString},
            data: newBuildersData
        }
        fs.writeFile(resourcesPath + '/StyleGuide.json', JSON.stringify(newStyleGuidesObj), "utf-8", (err) => {
            if (err) {
                let errorOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Write File Error",
                    message: `There was an error while writing the Style Guide JSON: ${err}`
                }
                dialog.showMessageBox(activeWindow, errorOptions)
            }
        })
        fs.writeFile(resourcesPath + '/Builders.json', JSON.stringify(newBuilders), "utf-8", (err) => {
            if (err) {
                let errorOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Write File Error",
                    message: `There was an error while writing the Builders JSON: ${err}`
                }
                dialog.showMessageBox(activeWindow, errorOptions)
            }
        })
        //caching the version being deleted for restoring;
        if (!fs.existsSync(resourcesPath+"cache/Resources")) {
            fs.mkdir(resourcesPath+"cache/Resources", {recursive: true}, (err) => {
                if (err) {
                    activeWindow.webContents.send("console-log", "Error creating resources cache")
                } else {
                    fs.writeFile(resourcesPath + 'cache/Resources/StyleGuide_revert.json', JSON.stringify(styleGuideObj), "utf-8", (err) => {
                        if (err) {
                            activeWindow.webContents.send("console-log", "Error while writing cached Style Guide")
                        }
                    })
                    fs.writeFile(resourcesPath + '/cache/Resources/Builders_revert.json', JSON.stringify(skuNameGenObj), "utf-8", (err) => {
                        if (err) {
                            activeWindow.webContents.send("console-log", "Error while writing cached Builders")
                        }
                    })
                }
                
            })
        } else {
            fs.writeFile(resourcesPath + 'cache/Resources/StyleGuide_revert.json', JSON.stringify(styleGuideObj), "utf-8", (err) => {
                if (err) {
                    activeWindow.webContents.send("console-log", "Error while writing cached Style Guide")
                }
            })
            fs.writeFile(resourcesPath + '/cache/Resources/Builders_revert.json', JSON.stringify(skuNameGenObj), "utf-8", (err) => {
                if (err) {
                    activeWindow.webContents.send("console-log", "Error while writing cached Builders")
                }
            })
        }

    } else {
        let abortOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Delete Not Confirmed",
            message: `Confirmation not recieved.`
        }
        dialog.showMessageBox(activeWindow, abortOptions)
    }
})

ipcMain.handle('rename-style-guide', async(event, incoming)=>{
    let activeWindow = BrowserWindow.fromId(1);
    let styleGuideObj;
    let skuNameGenObj;

    let options = {
        type: "none",
        buttons: [`Yes, change class name to ${incoming.newName}`, "Nevermind, abort name change"],
        title: "Rename Confirmation",
        message: `Please confirm if you would like to rename the class from ${incoming.previousName} to ${incoming.newName}`
    }
    let feedback = await dialog.showMessageBox(activeWindow, options);

    if (feedback === 0) {
        const dateString = constructDate()

        try{
            let skuNameGensRaw = await fsp.readFile(resourcesPath + '/Builders.json', "utf-8",);
            skuNameGenObj = JSON.parse(skuNameGensRaw);
        } catch(err) {
            let errorOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Read File Error",
                message: `There was an error while reading the Sku Name Generators JSON: ${err}`
            }
            dialog.showMessageBox(activeWindow, errorOptions)
        }
        try{
            let styleGuideRaw = await fsp.readFile(resourcesPath + '/StyleGuide.json', "utf-8",);
            styleGuideObj = JSON.parse(styleGuideRaw);
        } catch(err) {
            let errorOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Read File Error",
                message: `There was an error while reading the Style Guide JSON: ${err}`
            }
            dialog.showMessageBox(activeWindow, errorOptions)
        }
    
        //assets read, for deleting, we're just going to create brand new assets from the old
        const gens = skuNameGenObj.data;
        const styleGuides = styleGuideObj.data;

        for (let i in styleGuides) {
            if (styleGuides[i].class == incoming.previousName) {
                styleGuides[i].class = incoming.newName;
            }
        }

        for (let i in gens) {
            if (gens[i].class == incoming.previousName) {
                gens[i].class = incoming.newName;
            }
        }

        const newGensMeta = {
            Updated: dateString
        }
        const newGuidesMeta = {
            Updated: dateString,
            "Last Class": `${incoming.newName} (renamed from ${incoming.previousName})`
        }
        const newGeneratorsObject = {
            metadata: newGensMeta,
            data: gens
        }
        const newStyleGuidesObj = {
            metadata: newGuidesMeta,
            data: styleGuides
        }
        fs.writeFile(resourcesPath + '/StyleGuide.json', JSON.stringify(newStyleGuidesObj), "utf-8", (err) => {
            if (err) {
                let errorOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Write File Error",
                    message: `There was an error while writing the Style Guide JSON: ${err}`
                }
                dialog.showMessageBox(activeWindow, errorOptions)
            }
        })
        fs.writeFile(resourcesPath + '/Builders.json', JSON.stringify(newGeneratorsObject), "utf-8", (err) => {
            if (err) {
                let errorOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Write File Error",
                    message: `There was an error while writing the Builders JSON: ${err}`
                }
                dialog.showMessageBox(activeWindow, errorOptions)
            }
        })
        //caching the version being deleted for restoring;
        if (!fs.existsSync(resourcesPath+"cache/Resources")) {
            fs.mkdir(resourcesPath+"cache/Resources", {recursive: true}, (err) => {
                if (err) {
                    activeWindow.webContents.send("console-log", "Error creating resources cache")
                } else {
                    fs.writeFile(resourcesPath + 'cache/Resources/StyleGuide_revert.json', JSON.stringify(styleGuideObj), "utf-8", (err) => {
                        if (err) {
                            activeWindow.webContents.send("console-log", "Error while writing cached Style Guide")
                        }
                    })
                    fs.writeFile(resourcesPath + '/cache/Resources/Builders_revert.json', JSON.stringify(skuNameGenObj), "utf-8", (err) => {
                        if (err) {
                            activeWindow.webContents.send("console-log", "Error while writing cached Builders")
                        }
                    })
                }
                
            })
        } else {
            fs.writeFile(resourcesPath + 'cache/Resources/StyleGuide_revert.json', JSON.stringify(styleGuideObj), "utf-8", (err) => {
                if (err) {
                    activeWindow.webContents.send("console-log", "Error while writing cached Style Guide")
                }
            })
            fs.writeFile(resourcesPath + '/cache/Resources/Builders_revert.json', JSON.stringify(skuNameGenObj), "utf-8", (err) => {
                if (err) {
                    activeWindow.webContents.send("console-log", "Error while writing cached Builders")
                }
            })
        }

        return "complete"
    } else {
        return "aborted"
    }
    
})

//rename -> update-formula
//create -> rename-formula & delete-formula
ipcMain.handle('update-formula', async(event, incomingPackage)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let current;

    const date = new Date();
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const dateString = mm + "/" + dd + "/" + yyyy;

    try {
        const styleGuide = await fsp.readFile(resourcesPath + '/StyleGuide.json', "utf-8",);
        current = JSON.parse(styleGuide);
    } catch (err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Read File Error",
            message: `There was an error while reading the Style Guide JSON: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
    }

    //make sure current exists before running the rest of the file
    if (current) {
        let sgArray = current.data;

        for (let index in sgArray) {
            if (sgArray[index].class == incomingPackage.class) {
                sgArray[index].lastUpdate = dateString
                sgArray[index].styleGuide = incomingPackage.formula;
                break;
            }
    
            if (index == (sgArray.length - 1)) {
                sgObject = {class:incomingPackage.class, styleGuide: incomingPackage.formula}
                sgArray.push(sgObject)
            }
        }
    
        let newMeta = {
            "Updated":dateString,
            "Last Class": incomingPackage.class
        }
    
        let updateStyleGuide = {
            metadata: newMeta,
            data: sgArray 
        }
    
        fs.writeFile(resourcesPath + '/StyleGuide.json', JSON.stringify(updateStyleGuide), "utf-8", (err) => {
            if (err) {
                let errorOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Write File Error",
                    message: `There was an error while writing the Style Guide JSON: ${err}`
                }
                dialog.showMessageBox(activeWindow, errorOptions)
            } else {
                let options = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Export Finished",
                    message: "Style Guide library has been updated with exported asset"
                }
                dialog.showMessageBox(activeWindow, options)
            }
        })
    }
})

ipcMain.handle("fetch-class-index", async(event, args)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let current;

    try {
        const styleGuide = await fsp.readFile(resourcesPath + '/StyleGuide.json', "utf-8",);
        current = JSON.parse(styleGuide);
    } catch (err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Read File Error",
            message: `There was an error while reading the Style Guide JSON: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
    }

    //verify that current does indeed exist
    if (current) {
        let styleGuideArray = current.data;

        if (styleGuideArray.length == 0) {return []}
        const classIndex = styleGuideArray.map((value)=>{return value.class})
        return classIndex 
    }
    return []
})

// TODO: Rename to "request-builder-data"
// The below is only called when importing data into the Style Guide Builder in the ImportOverlay

ipcMain.handle('request-class-data', async(event, arg)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let builders;
    try {
        builders = await fsp.readFile(resourcesPath + '/Builders.json', "utf-8",);
    } catch (err) {
        let options = {
            type: "none",
            buttons: ["Okay"],
            title: "Read File Error",
            message: err
        }
        dialog.showMessageBox(activeWindow, options)
    }


    let buildersContainer = JSON.parse(builders);
    let buildersArray = buildersContainer.data;

    for (let index in buildersArray) {
        if (buildersArray[index].class == arg) {
            return buildersArray[index];
        }
    }

    //return null if no value is found
    return null;
})
