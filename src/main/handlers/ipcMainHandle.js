require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { app, BrowserWindow, dialog, webContents, ipcMain, shell } = electron;
const fsp = require('fs').promises;
const fs = require('fs');
const os = require('os');
const path = require('path');
const { post, StreamData, constructDate, fetchStateAndData, fetchConfig, findStyleGuide, checkForCurrent } = require('../index.js');
const { pleaseSirAGenerator } = require('../lib/StyleGuideRunner.js');
const { generatorEngine } = require('../lib/GeneratorEngine.js');
const { reportRunner, basicContentSearch, recommendedContentSearch } = require('../lib/report-runner.js');
const { runAttributeImport } = require('../lib/attribute-mapper.js');
const { fetchAttributesData } = require('../lib/fetch-attributes.js');
const { cleanSpec } = require("../lib/utils/Cleaner.js");

const activeUser = os.userInfo().username;
const userDataPath = app.getPath('userData'); //C:\Users\<username>\AppData\Roaming\Product Content App
const resourcesPath = userDataPath + "/Resources";

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

ipcMain.handle('request-sku-and-state', async(event, arg) => {
    const cachePath = resourcesPath + "/cache";
    const frame = await fetchStateAndData();

    const state = frame.state;
    const current = frame.json;

    console.log("Logging state!\n")
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
        //The below code should only run on a new upload
        console.log("Found a new sheet!")
        //write new cache version for the history
        const fileName = current.metadata.name + ".json";
        fs.writeFile(path.join(cachePath, fileName), JSON.stringify(current), (err)=>{
            if (err) {console.log(err)}
        })

        //write new state
        const newMetadata = {...current.metadata, length: current.data.length}
        fs.writeFile(resourcesPath + '/state.json', JSON.stringify(newMetadata), "utf-8", (err) => {
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

ipcMain.handle('request-class-data', async(event, arg)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let SNGs;
    try {
        SNGs = await fsp.readFile(resourcesPath + '/SNGs.json', "utf-8",);
    } catch (err) {
        let options = {
            type: "none",
            buttons: ["Okay"],
            title: "Read File Error",
            message: err
        }
        dialog.showMessageBox(activeWindow, options)
    }


    let SNGsContainer = JSON.parse(SNGs);
    let SNGsArray = SNGsContainer.data;

    for (let index in SNGsArray) {
        if (SNGsArray[index].class == arg) {
            return SNGsArray[index];
        }
    }

    //return null if no value is found
    return null;
})

ipcMain.handle('request-class-details', async(event, arg) => {
    let activeWindow = BrowserWindow.fromId(1);
    let found_generator;
    let found_SG;
    //Can I lower the amount of time/load by preloading
    //the generators into an array on new sheet
    const queryConfig = arg.config;
    const queryClass = arg.thisClass;
    const querySku = arg.thisSku;
    const queryPath = arg.thisPath;
    
    try {
        let SNGs = await fsp.readFile(resourcesPath + '/SNGs.json', "utf-8",);
        let SNGsContainer = JSON.parse(SNGs);
        let SNGsArray = SNGsContainer.data;
        found_generator = pleaseSirAGenerator(SNGsArray, queryClass, querySku)
    } catch (err) {
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Generator Query Error",
            message: `Error during generator query: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
    }
    
    try {
        found_SG = await findStyleGuide(resourcesPath, queryClass);
    } catch (err) {
        let errOptions = {
            type: "none",
            buttons: ["Okay"],
            title: "Generator Query Error",
            message: `Error during style guide formula query: ${err}`
        }
        dialog.showMessageBox(activeWindow, errOptions)
    }

    const attributes = await fetchAttributesData(queryPath, resourcesPath, queryConfig);
    
    const payload = {styleGuide : found_SG, SNG: found_generator, attributes: attributes}

    return payload;
})


ipcMain.handle("request-name", (event, package)=>{
    const output = generatorEngine(package.sku, package.generator, package.config);
    return output
})

ipcMain.handle("request-cache-data", async(event, args)=>{
    const activeWindow = BrowserWindow.fromId(1);
    const cachePath = path.join(resourcesPath, "\cache")
    let files;
    let cacheData = [];
    let jsonRegex = new RegExp("\.json$", "gi")

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


//This listener runs a fetch to the centralized storage for updating local resources
ipcMain.handle("update-local", async(event, package)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let storagePath = package.path;
    let updateType = package.type;

    //treat the path with ternary -> storagePath.includes("https://") || storagePath.includes("http://")
    let fullPath = path.join(storagePath);
    console.log(fullPath);

    if (updateType == "config" || updateType == "all") {
        let configPath = path.join(fullPath, "\config.json");
        let localPath = path.join(resourcesPath, "\config.json");
        
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
        let StyleGuidePath = path.join(fullPath, "\StyleGuide.json");
        let localPath = path.join(resourcesPath, "\StyleGuide.json");
        
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
    if (updateType == "sng" || updateType == "all") {
        let builderPath = path.join(fullPath, "\SNGs.json");
        let localPath = path.join(resourcesPath, "\SNGs.json");
        //update later
        StreamData(builderPath, localPath, "import").then(()=>{
            console.log(`Stream initialized from ${builderPath} to ${localPath}`)
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
        title: "Local Assets Post Confirmation",
        message: `Please confirm that you would like to post the local sources to: ${fullPath}`
    }
    let feedback = await dialog.showMessageBox(activeWindow, options)

    if (feedback.response === 0) {
        if (updateType == "config" || updateType == "all") {
            let configPath = path.join(fullPath, "\config.json");
            let localPath = path.join(resourcesPath, "\config.json");
            
            let feedbackValue = updateType == "all" ? "" : "export"
            StreamData(localPath, configPath, feedbackValue).then(()=>{
                console.log(`Stream initialized from ${localPath} to ${configPath}`)
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
            let StyleGuidePath = path.join(fullPath, "\StyleGuide.json");
            let localPath = path.join(resourcesPath, "\StyleGuide.json");
            
            let feedbackValue = updateType == "all" ? "" : "export"
            StreamData(localPath, StyleGuidePath, feedbackValue).then(()=>{
                console.log(`Stream initialized from ${localPath} to ${StyleGuidePath}`)
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
        if (updateType == "sng" || updateType == "all") {
            let builderPath = path.join(fullPath, "\SNGs.json");
            let localPath = path.join(resourcesPath, "\SNGs.json");
    
            StreamData(localPath, builderPath, "export").then(()=>{
                console.log(`Stream initialized from ${localPath} to ${builderPath}`)
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
    let SngArray;
    
    //loading in config and SkuData
    const config = await fetchConfig()

    const frame = await fetchStateAndData();
    const state = frame.state;
    const FullSkuSet = frame.json;

    try {
        let SNGs = await Promise.resolve(fsp.readFile(resourcesPath + '/SNGs.json', "utf-8"));
        let SNGsFull = JSON.parse(SNGs);
        SngArray = SNGsFull.data
        //console.log(SngArray)
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

    do {
        let batchData = SkuData.length > 500 ? SkuData.splice(0, 500) : SkuData.splice(0, SkuData.length);
        rendererData = [];
        //running for pure speed
        for (let i = 0; i < batchData.length; ++i) {
            let sku = batchData[i];
            gen = pleaseSirAGenerator(SngArray, sku[config["Excel Mapping"]["Sku Class"]], sku);
            let generatorReturn = generatorEngine(sku, gen, config)
            rendererData.push({
                pyramidId: sku[config["Excel Mapping"]["Pyramid Id"]],
                skuClass: sku[config["Excel Mapping"]["Sku Class"]],
                generatedName: generatorReturn.name,
                check: generatorReturn.check
            })
            //calculate for the report
            let activeClass = sku[config["Excel Mapping"]["Sku Class"]];
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
        let rawData = await fsp.readFile(path.join(resourcesPath, '/StyleGuide.json'), "utf-8")
        styleGuides = JSON.parse(rawData)
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

        fs.writeFile(path.join(resourcesPath, '/StyleGuide.json'), JSON.stringify(newStyleGuide), "utf-8", (err)=>{
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
    fs.writeFile(path.join(resourcesPath, '/config.json'), JSON.stringify(arg), "utf-8", (err) => {
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
ipcMain.handle('request-skuset', async(event, arg) => {
    let frame = await fetchStateAndData();
    const current = frame.json;

    console.log("Sending the full skuset as a payload");

    return current.data
})

ipcMain.handle("fetch-resource", async(event, incoming)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let thisResource;
    if (incoming == "style guide") {
        try {
            let styleGuideJSON = await fsp.readFile(resourcesPath + '/StyleGuide.json', "utf-8");
            thisResource = JSON.parse(styleGuideJSON);
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
            let sngJSON = await fsp.readFile(resourcesPath + '/SNGs.json', "utf-8");
            thisResource = JSON.parse(sngJSON);
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

    const newState = {...current.metadata, length: current.data.length, type: "current"}

    fs.writeFile(resourcesPath + '/state.json', JSON.stringify(newState), "utf-8", (err) => {
        if (err) {console.log(err)};
    })

    return "complete!"
})

ipcMain.handle("delete-cache-item", async(event, args)=>{
    const cachePath = resourcesPath + "/cache"
    const fileName = args.fileName + ".json";

    fs.unlink(path.join(cachePath, fileName), (err)=>{
        if (err){console.log(err)}
        return "complete"
    })   
})

/*--------------------------------------------------------*/
//Runners

ipcMain.handle("run-import", async(event, arg)=>{
    const activeWindow = BrowserWindow.fromId(1);

    const config = await fetchConfig()

    if (arg.type = "attribute") {
        runAttributeImport(activeWindow, resourcesPath, arg.filePath, config).then(()=>{
            return "finished"
        }).catch((err)=>{
            console.log(err)
        })
    }
})

ipcMain.handle("run-attribute-search", async(event, arg)=>{
    const activeWindow = BrowserWindow.fromId(1);
    //So basically we have to do three checks.
    //use attributes as source.
    const config = arg.config;
    const contentFields = config["Functional Data"]["Reporting Fields"];
    const classAttributes = arg.attributes;
    const skuData = arg.sku;
    const specs = skuData.Specs;

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