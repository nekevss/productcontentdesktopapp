require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { BrowserWindow, dialog, webContents, ipcMain } = electron;
const fs = require('fs');
const path = require('path');
const { StreamData, fetchStateAndData, fetchConfig } = require('../index.js');
const { pleaseSirABuilder, builderEngine, basicContentSearch, recommendedContentSearch, cleanSpec, determineWebClass } = require('../lib/index.js');
const { fetchAstAssets, fetchStyleGuideAsset } = require("../fetch.js");
const { cachePath, configurationFileName, configurationPath, styleGuideFileName, styleGuidePath, astDataFileName, astDataPath, statePath } = require("../applicationPaths.js");
const { mapBuilderObject } = require("../lib/builder/conversion.js");

// Table of Contents
// ------------------
// open-file-dialog
// update-local
// post-local
// run-sku-namer
// register-report
// fetch-configuration
// post-configuration
// fetch-resource
// escape-history
// delete-cache-item
// nuke-history
// run-attribute-search

ipcMain.handle('open-file-dialog', async(event, arg)=>{
    let activeWindow = BrowserWindow.fromId(1);
    let options;

    if (arg == "csv") {
        options = {
            filters: [{name:"CSV", extensions:['csv']}], 
            properties:["openFile", ]
        }
    }

    const dialogReturn = await dialog.showOpenDialog(activeWindow, options);
    return !dialogReturn.canceled ? dialogReturn.filePaths[0] : null;
})

//This listener runs a fetch to the centralized storage for updating local resources
ipcMain.handle("update-local", async(event, package)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let storagePath = package.path;
    let updateType = package.type;

    //treat the path with ternary -> storagePath.includes("https://") || storagePath.includes("http://")
    let fullPath = path.join(storagePath);
    console.log(fullPath);

    if (updateType == "config" || updateType == "all") {
        let configPath = path.join(fullPath, configurationFileName);
        let localPath = configurationPath;
        
        let feedbackValue = updateType == "all" ? "" : "import"
        StreamData(configPath, localPath, feedbackValue).then(()=>{
            console.log(`Stream initialized from ${configPath} to ${localPath}`)
        }).catch((err)=>{
            let errOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Stream Setup Error",
                message: `There was an error while initializing the stream: ${err}`
            }
            dialog.showMessageBox(activeWindow, errOptions)
        })
    }
    if (updateType == "sg" || updateType == "all") {
        let StyleGuidePath = path.join(fullPath, styleGuideFileName);
        let localPath = styleGuidePath
        
        let feedbackValue = updateType == "all" ? "" : "import"
        StreamData(StyleGuidePath, localPath, feedbackValue).then(()=>{
            console.log(`Stream initialized from ${StyleGuidePath} to ${localPath}`)
        }).catch((err)=>{
            let errOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Stream Setup Error",
                message: `There was an error while initializing the stream: ${err}`
            }
            dialog.showMessageBox(activeWindow, errOptions)
        })
    }
    if (updateType == "tokens" || updateType == "all") {
        let builderPath = path.join(fullPath, astDataFileName);
        let localPath = astDataPath;
        // update later
        // LOL this is super hacky, but whatever
        StreamData(builderPath, localPath, "import").then(()=>{
            console.log(`Stream between remote and local has completed successfully.`)
        }).catch((err)=>{
            let errOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Stream Setup Error",
                message: `There was an error while initializing the stream: ${err}`
            }
            dialog.showMessageBox(activeWindow, errOptions)
        }).then(()=>{
            console.log("Beginning to run conversion.")
            // NOTE: This can be removed once all v2 registered builder are 
            // transferred over to the new api.
            //
            // We need to double check run a conversion on the data just read in.
            fetchAstAssets().then((unconvertedBuilders)=>{
                const newDataArray = unconvertedBuilders.data.map((builderObject)=>{
                    return builderObject.hasOwnProperty("returnGenerator") 
                        ? mapBuilderObject(builderObject)
                        : builderObject 
                })
                
                const newTokensObject = {
                    metadata: unconvertedBuilders.metadata,
                    data: newDataArray
                }

                fs.writeFileSync(astDataPath, JSON.stringify(newTokensObject), "utf-8", (err)=>{
                    if (err) {
                        let errorOptions = {
                            type: "none",
                            buttons: ["Okay"],
                            title: "Converted Builder Write Error",
                            message: `Error while writing the new tokens file after conversion: ${err}`
                        }
                        dialog.showMessageBox(activeWindow, errorOptions)
                    }
                })
                console.log("Conversion is complete.")
            }).catch((err)=>{
                console.log("Well this is awkward...")
                console.log(err)
            })
        })
    }
})

//This listener will post local data to the centralized storage
ipcMain.handle("post-local", async(event, package)=>{
    let activeWindow = BrowserWindow.fromId(1);
    let storagePath = package.path;
    let updateType = package.type;

    //treat the path with ternary -> storagePath.includes("https://") || storagePath.includes("http://")
    let fullPath = path.join(storagePath);
    console.log(fullPath);

    let options = {
        type: "none",
        buttons: ["Yes, confirmed!","No, not confirmed."],
        cancelId: 1,
        title: "Local Assets Post Confirmation",
        message: `Please confirm that you would like to post the local sources to: ${fullPath}`
    }
    let feedback = await dialog.showMessageBox(activeWindow, options)

    if (feedback.response === 0) {
        if (updateType == "config" || updateType == "all") {
            let remoteConfigPath = path.join(fullPath, configurationFileName);
            let localPath = configurationPath;
            
            let feedbackValue = updateType == "all" ? "" : "export"
            StreamData(localPath, remoteConfigPath, feedbackValue).then(()=>{
                console.log(`Stream initialized from ${localPath} to ${remoteConfigPath}`)
            }).catch((err)=>{
                let errOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Stream Setup Error",
                    message: `There was an error while initializing the stream: ${err}`
                }
                dialog.showMessageBox(activeWindow, errOptions)
            })
        }
        if (updateType == "sg" || updateType == "all") {
            let remoteStyleGuidePath = path.join(fullPath, styleGuideFileName);
            let localPath = styleGuidePath;
            
            let feedbackValue = updateType == "all" ? "" : "export"
            StreamData(localPath, remoteStyleGuidePath, feedbackValue).then(()=>{
                console.log(`Stream initialized from ${localPath} to ${remoteStyleGuidePath}`)
            }).catch((err)=>{
                let errOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Stream Setup Error",
                    message: `There was an error while initializing the stream: ${err}`
                }
                dialog.showMessageBox(activeWindow, errOptions)
            })
        }
        if (updateType == "tokens" || updateType == "all") {
            let remoteBuilderPath = path.join(fullPath, astDataFileName);
            let localPath = astDataPath;
    
            StreamData(localPath, remoteBuilderPath, "export").then(()=>{
                console.log(`Stream initialized from ${localPath} to ${remoteBuilderPath}`)
            }).catch((err)=>{
                let errOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "Stream Setup Error",
                    message: `There was an error while initializing the stream: ${err}`
                }
                dialog.showMessageBox(activeWindow, errOptions)
            })      
        }
    } else {
        let abortOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Post Aborted!",
            message: `Confirmation not recieved. Post was not completed.`
        }
        dialog.showMessageBox(activeWindow, abortOptions)
    }
})


ipcMain.handle('run-sku-namer', async(event, args)=>{
    let activeWindow = BrowserWindow.fromId(1);
    let buildersArray;
    
    //loading in config and SkuData
    const config = await fetchConfig()

    const frame = await fetchStateAndData();
    const _state = frame.state;
    const FullSkuSet = frame.json;

    try {
        let builders = await Promise.resolve(fetchAstAssets());
        buildersArray = builders.data
    } catch(err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "File Fetch Error",
            message: `Error while parsing the Current Skuset JSON: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
    }

    let SkuData = FullSkuSet.data;
    //running old school and stripped for speed
    console.log(SkuData.length)
    //console.log(SkuData)

    let rendererData = [];
    let gen;
    let report = {};
    // find class of the first SKU since over a batch job finding the right class is going to get expensive.
    let firstSku = SkuData[0];
    let pph = firstSku[config["Excel Mapping"]["PPH Path"]];
    let identifier = firstSku[config["Excel Mapping"]["Sku Number"]] ? firstSku[config["Excel Mapping"]["Sku Number"]] : firstSku[config["Excel Mapping"]["Wholesaler Number"]]
    let activeClass = determineWebClass(pph, identifier);

    do {
        let batchData = SkuData.length > 500 ? SkuData.splice(0, 500) : SkuData.splice(0, SkuData.length);
        rendererData = [];
        //running for pure speed
        for (let i = 0; i < batchData.length; ++i) {
            let sku = batchData[i];
            // Check if the activeClass is different. If so, we have to determine the class.
            if (!activeClass.includes(sku[config["Excel Mapping"]["Sku Class"]])) {
                let pph = sku[config["Excel Mapping"]["PPH Path"]];
                let identifier = sku[config["Excel Mapping"]["Sku Number"]] ? sku[config["Excel Mapping"]["Sku Number"]] : sku[config["Excel Mapping"]["Wholesaler Number"]]
                activeClass = determineWebClass(pph, identifier);
            }
            gen = pleaseSirABuilder(config, buildersArray, activeClass, sku);
            let generatorReturn = builderEngine(sku, gen, config)
            rendererData.push({
                pyramidId: sku[config["Excel Mapping"]["Pyramid Id"]],
                skuClass: activeClass,
                generatedName: generatorReturn.name,
                confidence: generatorReturn.confidence,
                confidenceGrade: generatorReturn.confidenceGrade,
                check: generatorReturn.check
            })
            //calculate for the report
            if (report[activeClass]) {
                let currentReport = report[activeClass].report;
                let amount = report[activeClass].SkuAmount;
                let attributes = Object.keys(generatorReturn.report);
                for (let key of attributes) {
                    if (!currentReport.hasOwnProperty(key)) {
                        currentReport[key] = {
                            attempts:0, 
                            conn:0
                        }
                    }
                    if (generatorReturn.report[key].conn) {
                        currentReport[key].conn += generatorReturn.report[key].conn;
                    }
                    if (generatorReturn.report[key].attempts) {
                        currentReport[key].attempts += generatorReturn.report[key].attempts;
                    }
                }
                const newReport = {
                    report: currentReport,
                    SkuAmount: amount + 1
                }
                report[activeClass] = newReport;
            } else {
                report[activeClass] = {report: generatorReturn.report, SkuAmount: 1}
            }
        }

        activeWindow.webContents.send("sku-namer-batch", JSON.stringify(rendererData))

    } while (SkuData.length > 0)

    console.log("Sending the below report!\n")
    console.log(report);

    setTimeout(()=>{
        activeWindow.webContents.send("sku-namer-finished", report);
    }, 2000)
    
})

ipcMain.handle('register-report', async(event, incomingReport)=>{
    let activeWindow = BrowserWindow.fromId(1);
    let styleGuides;
    
    try {
        styleGuides = await fetchStyleGuideAsset()
    } catch (err) {
        let errorOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "File Fetch Error",
            message: `Error while parsing the Style Guide: ${err}`
        }
        dialog.showMessageBox(activeWindow, errorOptions)
    }

    if (styleGuides) {
        console.log("Logging incoming report");
        console.log(incomingReport);

        let sgArray = styleGuides.data;

        let reportedClasses = Object.keys(incomingReport);

        let count = 0;
        for (let index in sgArray) {
            let guide = sgArray[index];
            if (reportedClasses.includes(guide.class)) {
                console.log("Found a matching style guide for the report")
                sgArray[index]["report"] = incomingReport[guide.class];
                count += 1; 
            }

            if (count == reportedClasses.length) {
                break;
            }
        }

        //no new metadata, as this is a ghost process
        let newStyleGuide = {metadata:styleGuides.metadata, data:sgArray}

        fs.writeFile(styleGuidePath, JSON.stringify(newStyleGuide), "utf-8", (err)=>{
            if (err) {
                let errorOptions = {
                    type: "none",
                    buttons: ["Okay"],
                    title: "File Write Error",
                    message: `Error while writing the Style Guide: ${err}`
                }
                dialog.showMessageBox(activeWindow, errorOptions)
            }
        })
    }
})

/*------------------------------------------------------------------------*/
//Configuration handlers
ipcMain.handle('fetch-configuration', async(event, arg)=>{
    const config = await fetchConfig();
    //console.log(config);
    return config;
})

ipcMain.handle('post-configuration', async(event, arg)=>{
    let activeWindow = BrowserWindow.fromId(1);
    fs.writeFile(configurationPath, JSON.stringify(arg, null, 4), "utf-8", (err) => {
        if (err) {console.log(err)};
    })

    let options = {
        type: "none",
        buttons: ["Okay"],
        title: "Configuration Posted",
        message: "The application configuration has been updated."
    }
    dialog.showMessageBox(activeWindow, options)
})


/*---------------------------------------------------------------------------------------*/
//Resource fetchers

ipcMain.handle("fetch-resource", async(event, incoming)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let thisResource;
    if (incoming == "style guide") {
        try {
            thisResource = await fetchStyleGuideAsset()
        } catch(err) {
            let errorOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "File Fetch Error",
                message: `Error while parsing the Style Guides: ${err}`
            }
            dialog.showMessageBox(activeWindow, errorOptions)
        }
    }
    if (incoming == "generators") {
        try {
            thisResource = await fetchAstAssets()
        } catch(err) {
            let errorOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "File Fetch Error",
                message: `Error while parsing the Sku Name Builders: ${err}`
            }
            dialog.showMessageBox(activeWindow, errorOptions)
        }
    }
    return thisResource;
})

//-----------------------------------------------------------------
//History handlers

ipcMain.handle("escape-history", async(event, args)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    const frame = await fetchStateAndData();
    const current = frame.json;

    const newState = {
        type: "current",         
        length: current.data.length, 
        ...current.metadata
    }

    fs.writeFile(statePath, JSON.stringify(newState, null, 4), "utf-8", (err) => {
        if (err) {console.log(err)};
    })

    return "complete!"
})

ipcMain.handle("delete-cache-item", async(event, args)=>{
    const fileName = args.fileName + ".json";

    fs.unlink(path.join(cachePath, fileName), (err)=>{
        if (err){console.log(err)}
        return "complete"
    })   
})

ipcMain.handle("nuke-history", async(event, _args)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()

    let options = {
        type: "question",
        buttons: ["Do not delete", "Confirm, delete all"],
        title: "Remove files confirmation",
        message: "Please confirm that all history files should be deleted"
    }

    let removeFeedback = await dialog.showMessageBox(activeWindow, options);

    console.log(removeFeedback)
    if (removeFeedback.response === 1) {
        try {
            fs.rm(cachePath, {recursive: true, force: true}, ()=>{
                fs.mkdirSync(cachePath);
            });
            return "nuked"
        } catch(err) {
            let errorOptions = {
                type: "none",
                buttons: ["Okay"],
                title: "Nuke History Error",
                message: `Error while removing the history directory: ${err}`
            }
            dialog.showMessageBox(activeWindow, errorOptions)
        }
    } else {
        return "nothing was done"
    }
})


/*--------------------------------------------------------*/
//Runners

ipcMain.handle("run-attribute-search", async(event, arg)=>{
    const activeWindow = BrowserWindow.fromId(1);
    //So basically we have to do three checks.
    //use attributes as source.
    const config = arg.config;
    const contentFields = config["Functional Data"]["Reporting Fields"];
    const classAttributes = arg.attributes;
    const skuData = arg.sku;
    const specs = skuData.skuAttributes;

    //need to handle null attributes value before moving forward
    if (!classAttributes) {return []}

    const attributes = classAttributes.children;

    //checking content fields in the below seems a tad expensive
    const attributeFeedback = attributes.map((value, index) => {
        const attributeName = value["Attribute_Name"];
        //first, let's see if the value exists in sku
        let currentValue = "";
        if (specs[attributeName]) {
            currentValue = cleanSpec(specs[attributeName]);   
        }

        //okay we have the current value if it exists,
        //we should be able to check for the current as we look for others.
        //before that, we need to check the types.
        const attributeType = value["Type"];
        const contentFeedback = attributeType == "List Of Values"
            ? recommendedContentSearch(currentValue, value.children, arg.sku, contentFields)     //more advanced LOV run through
            : basicContentSearch(currentValue, arg.sku, contentFields)    //basic run through of content fields

        thisReturn = {
            attribute: attributeName,
            current: currentValue
        }

        for (let key in contentFeedback) {
            thisReturn[key] = contentFeedback[key];
        }

        return thisReturn
    })

    return attributeFeedback
})