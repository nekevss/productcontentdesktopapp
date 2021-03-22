require("regenerator-runtime/runtime");
require("core-js/stable");
const fs = require('fs');
const path = require('path');
const csvConverter = require('csvtojson');
//goals created a nested JSON structure based off a csv.

//assumptions made: csv MUST have duplicate values in columns that will serve as key

//Initial thoughts:
//Should I run a prepare function on csv to prep for json?

//crazy idea. Hear me out
//create a folder structure:
//attributes:
//  --Office Supplies
//        --Binders
//  --Furniture.json
//  --Etc. etc. super category json

//Each of these files would be much more parsable -> wouldn't
//affect the app performance as much

async function runAttributeImport(activeWindow, resourcesPath, filePath, config) {
    const attributePath = path.join(resourcesPath, "attributes");

    //this function is basically serving as the middle man between the handler and the actual function
    //using this function to make sure directories are created and such

    //run delete of all currently existing folder in attributes folder

    if (!fs.existsSync(attributePath)) {
        fs.mkdirSync(attributePath, {recursive:true})
    }

    activeWindow.webContents.send("import-state", "Beginning to build out structure...")
    createStructuredJson(activeWindow, attributePath, filePath, config).then((data)=>{
        
    }).catch((err)=>{
        console.log(err)
    });
}

async function createStructuredJson(activeWindow, attributionPath, filePath, config) {
    let errorLog = []
    //lets begin by declaring our config values
    const directories = config["Attribution Mapping"]["Directory Structure"];
    const jsonName = config["Attribution Mapping"]["JSON Name"];
    const jsonStruct = config["Attribution Mapping"]["Struct"];
    const topDirectory = directories[0];

    //memory is going to become the issue...is there a better way to manage
    //thought => while loop and unshift the values from the raw to build the new
    //memory should then become an issue of n + M rather than 2n+M, M being any extra data
    csvConverter().fromFile(filePath).then((rawArray)=>{
        //console.log(rawArray);
        //100 thousand plus lines in the array...it's gonna be a big one LOL
        const total = rawArray.length;
        //init path variables
        let currentPathExtension = makePathExtension(rawArray[0], directories)
        let currentPath = path.join(attributionPath, currentPathExtension)
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath, {recursive:true})
        }
        let currentFilename = makeFilename(rawArray[0], jsonName)
    
        //init tracking and blank objects
        let jsonObj = {};
        let pathLog = [];
        let tracker = 0;
        while (rawArray.length > 0) {
            tracker++
            let progress = tracker / total
            activeWindow.webContents.send("import-update", progress);
            let active = rawArray.shift();
            const activePathExtension = makePathExtension(active, directories);
            const activePath = path.join(attributionPath, activePathExtension)
            const activeFilename = makeFilename(active, jsonName);
            
            if (activeFilename !== currentFilename) {
                offloadJson(jsonObj, currentPath, currentFilename);
                pathLog.push({
                    path: currentPathExtension,
                    fileName: currentFilename
                })
                //Now that file Json is different -> check that we are in same path
                if (activePath !== currentPath) {
                    
                    //check if the new path exists and create if it doesn't
                    if (!fs.existsSync(activePath)) {
                        fs.mkdirSync(activePath, {recursive:true})
                    }
                    //set new directory as perserved
                    currentPath = activePath;
                    currentPathExtension = activePathExtension;
                }
                jsonObj = {}
                currentFilename = activeFilename;
                activeWindow.webContents.send("import-status", `In ${active[topDirectory]} and working file: ${currentFilename}`);
            }
            
    
            //how do you navigate a tree structure and create branches...
            //Access the top of the json at before recursive
            const activeKey = "root";
            const rawCalls = jsonStruct[activeKey];
            const levelCalls = rawCalls.split(",");
            const jsonKeys = Object.keys(jsonObj);
    
            for(let i = 0; i < levelCalls.length; i++) {
                const call = levelCalls[i];
                if (!active[call]) {continue}
    
                if (!jsonKeys.includes(call)) {
                    jsonObj[call] = active[call];
                }
            }
    
            if (jsonKeys.includes("children")) {
                const newChildren = buildOutChildren(active, jsonObj.children, jsonStruct, 1)
                jsonObj.children = newChildren;
            } else {
                const newChildren = buildOutChildren(active, [], jsonStruct, 1)
                jsonObj.children = newChildren;
            }

            
        }
        //offload the last json
        offloadJson(jsonObj, currentPath, currentFilename);
        pathLog.push({
            path: currentPathExtension,
            fileName : currentFilename
        });
    
    
        //return all live paths which should include a reference to every end point where JSONs live
        //reference could be used as map to update versions later on?
        if (tracker == total) {
            console.log("Oh, hey! I'm finished :D")
            activeWindow.webContents.send("import-status", "Files finished! Wrapping up tasks.")
            fs.writeFile(path.join(attributionPath, "master.json"), JSON.stringify(pathLog), "utf-8", (err)=>{
                if(err){
                    console.log(err)
                    return 
                }
            });
            return pathLog
        } else {
            console.log(`tracker ${tracker} and total ${total} don't add up`)
            return "Weird"
        }
    });
}

function buildOutChildren(active, children, struct, level) {
    let newChildren = children;
    
    const structKeys = Object.keys(struct);
    const levelCount = structKeys.length;
    const activeKey = "level_" + level;
    const rawCalls = struct[activeKey];
    const levelCalls = rawCalls.split(",");

    //"base" case
    if (levelCount - 1 == level) {
        const newObj = {}
        for (let i = 0; i < levelCalls.length; i++) {
            const call = levelCalls[i];
            newObj[call] = active[call] ? active[call] : null;
        }
        newChildren.push(newObj);
        return newChildren
    }

    //every case below this needs to work on it's child

    //first, lets remove the case where children is length 0
    if (children.length == 0) {
        const newObj = {}
        for (let i = 0; i < levelCalls.length; i++) {
            let call = levelCalls[i];
            newObj[call] = active[call] ? active[call] : null;
        }
        newObj.children = buildOutChildren(active, [], struct, level+1);
        newChildren.push(newObj)
        return newChildren
    }
    //I'm going to be greedy assume that the csv is ALWAYS in some sort of sequential order;
    //So we will only check the last object in children.
    const last = children[children.length - 1];
    let childrenObject = last[levelCalls[0]] == active[levelCalls[0]] ? children.pop() : {"children": []};
    const objectKeys = Object.keys(childrenObject)

    for (let i = 0; i < levelCalls.length; i++) {
        const call = levelCalls[i];
        if (!active[call]) {continue}

        if (!objectKeys.includes(call)) {
            childrenObject[call] = active[call];
        }
    }

    childrenObject.children = buildOutChildren(active, childrenObject.children, struct, level+1)
    newChildren.push(childrenObject)
    return newChildren
}

function offloadJson(jsonObj, directoryPath, fileName) {
    fs.writeFile(path.join(directoryPath, fileName), JSON.stringify(jsonObj), "utf-8", (err)=>{
        if (err) {console.log(err)}
    })
}

function makePathExtension(active, directories) {
    let mutPath = "";
    directories.forEach((value)=>{
        mutPath += "/" + active[value];
    })
    return mutPath;
}

function makeFilename(active, jsonName) {
    return active[jsonName] + ".json"
}


/*config file value,
const SuperCat = "SuperCategory_Name";
const initCat = "Category_Name";
const levels = ["level_0","level_1","level_2","level_3","level_4"];
const attributionStruct = {
    "level_0": ["Category_Name"],
    "level_1": ["Dept_Name"],
    "level_2": ["Class_Name", "Class_ID"],
    "level_3": ["Attribute_Name", "Attribute_ID","Type", "Filter","Mandatory"],
    "level_4": ["Attribute_Value_Name", "Attribute_Value_ID", "Attribute_Description"]
}

const struct = {
        "Category": "value",
        "children": [{

        }]
    }
*/
module.exports = {
    runAttributeImport
}