const electron = require('electron');
const { BrowserWindow } = electron;
const { conditionTests } = require("../conditions/condition-tests.js");
const { getSkuCallValue } = require('../utils/index.js');

// Okay, I super regret naming these Generators. They're basically just some AST nodes
// of sorts, and nowadays we call them Builders.

function pleaseSirABuilder(config, buildersArray, incomingClass, incomingSku) {
    let activeWindow = BrowserWindow.getFocusedWindow();

    //console.log("Beginning to search for generator\n")
    const ownBrands = config["Functional Data"]["Staples Brands"];
    const thisBrand = incomingSku[config["Excel Mapping"]["Brand"]];
    const isOwnBrand = ownBrands.includes(thisBrand);
    if (isOwnBrand) {activeWindow.send("console.log", `SKU is an Own Brands SKU`)}
    const ownBrandsClass = "Own Brands " + incomingClass
    // YIKES
    // TODO: update this
    if (incomingClass == "Primary Products") {
        return [{"type": "string", "string" : "Error: No Style Guide exists for Primary Products"}]
    }

    let builderOutput = null;
    for (let index in buildersArray) {
        let builder = buildersArray[index];
        // Okay, so below we are searching and comparing incomingClass to the builder class. We will also flag
        // own brand style guides. But since we cannot gaurantee the builder order, we need to make sure to
        // validate storing builders and handle exiting
        if (builder.class === incomingClass || builder.class === ownBrandsClass) {
            // We can prevent non-own brand SKUs from storing an own brand generator here
            if (!isOwnBrand && builder.class.includes("Own Brand")) {continue}

            const activeOwnBrandSearch = isOwnBrand && builder.class.includes("Own Brand");
            activeWindow.webContents.send("console-log", "A matching class was found!")
            //name should change to generatorQueries
            // console.log(builder);
            const ast = builder.skuNameAst;
            
            if (ast.length == 1) {
                if (ast[0].type == "Error") {
                    builderOutput = [{"string" : ast[0].errorMessage}]  
                } else {
                    builderOutput = ast[0].tokens
                }
                if (!isOwnBrand || activeOwnBrandSearch) {break}
            } else {
                for (let i = 0 ; i <= ast.length - 1; i++) {
                    let foundTokens = queryBuilder(config, incomingSku, ast[i]);
                    if (foundTokens) {
                        // console.log("Found the Tokens!")
                        //console.log(foundGen)
                        builderOutput = foundTokens;
                        break;
                    };
                }
                // If we made it to this point, then we assume that a null value was returned for the determining attribute
                if (builderOutput === null) {
                    builderOutput = [{"type": "string", "string" : "Error: No value provided for determining attribute."}];
                    
                    if (!isOwnBrand || activeOwnBrandSearch) {break}
                }
            }
        }
    }

    if (builderOutput === null) {
        return [{"type": "string", "string" : "Error: A Builder was not found for this class"}];
    }
    return builderOutput
}

// FML why did I call the one value ifCalled and spec -> Fixed :)
// And I'm leaving this comment because it was true hell, so pay respects.

function queryBuilder(config, sku, condition, passed=false) {
    const attributeValue = getSkuCallValue(sku, condition.attributeName, config);
    // handle error types
    if (condition.type == "error") {
        const error = [{ "string" : condition.errorMessage}]
        return error
    };

    // Here we are checking if the type is else and there is no spec call and whether 
    // the returnGenerator is present. These should all only occur when there is a simple
    // Style Guide Builder
    if (condition.type === "else" && !condition.attributeName && condition.tokens) {
        return condition.tokens
    }

    // check if passed has already been evaluated as true and if there is a return
    if (passed && condition.tokens) {
        return condition.tokens
    }

    const passedTest = conditionTests[condition.type](attributeValue, condition.conditionTargets, sku, config);

    if (condition.nestedType == "OR") {
        let consolidatedPassedValue = passedTest === true || passed === true ? true : false;
        
        let nestedConditions = condition.nestedConditions;
        for (let nestedCondition of nestedConditions){
            let output = queryBuilder(config, sku, nestedCondition, consolidatedPassedValue);
            
            if (output) {
                return output;
            }
        }
    }
    
    if (passedTest && condition.nestedType === "AND") {
        let nestedConditions = condition.nestedConditions;
        for (let nestedCondition of nestedConditions){
            let output = queryBuilder(config, sku, nestedCondition);
            
            if (output) {
                return output;
            }
        }
    } 
    
    if (passedTest) {
        if (condition.tokens) {
            return condition.tokens
        }
    }

    // Throw error in default situations
    return null
}

module.exports = {
    pleaseSirABuilder
}