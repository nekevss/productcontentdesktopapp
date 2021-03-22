require("regenerator-runtime/runtime");
require("core-js/stable");
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

async function fetchAttributesData(webPath, resourcesPath, config) {
    //okay, so we get the webpath. We first need to figure out where we are going
    const attributionPath = path.join(resourcesPath, "/attributes");
    //catch whether the attributes folder doesn't even exist
    if (!fs.existsSync(attributionPath)) {return null}
    //bring in the directories to find the length... directory length should correspond with web path splits
    const directories = config["Attribution Mapping"]["Directory Structure"];
    //we have the count to the directory name, so we increment n+1 to get the file name
    const dirDepth = directories.length + 1;

    const pathArray = webPath.split("/");

    let extension = createExtension(pathArray, dirDepth);

    let activePath = path.join(attributionPath, extension);
    
    if (!fs.existsSync(activePath)) {
        //if the file doesn't exist, we are going to enter into error handling territory and try to force it to
        let errorCheck = 1;
        while (dirDepth + errorCheck < pathArray.length - 1) {
            extension = createExtension(pathArray, dirDepth, errorCheck)
            activePath = path.join(attributionPath, extension);

            if (fs.existsSync(activePath)) {
                const attributes = await fsp.readFile(activePath, "utf-8")
                return JSON.parse(attributes)
            }
            //increment the error check number
            errorCheck++
        }
    } else {
        const attributes = await fsp.readFile(activePath, "utf-8")
        return JSON.parse(attributes)
    }
    //return a null if we somehow make it to the end
    return null
}

function createExtension(pathArray, depth, errorChecking=0) {
    let extension = "";
    for (let i =0; i < depth + errorChecking; i++) {
        //we are always checking if the path array value exists just in case
        extension += pathArray[i] ? "/" + pathArray[i] : ""
    }
    return extension + ".json";
}

module.exports = {
    fetchAttributesData
}