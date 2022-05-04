const electron = require('electron');
const { BrowserWindow } = electron;
const { cleanSpec } = require("./utils/Cleaner.js");
const { conditionTests } = require("./condition-tests.js");
const { GetSkuCallValue } = require('./fetch-sku-value.js');

// Okay, I super regret naming these Generators. They're basically just an AST Node
// stack of sorts, and nowadays we call them Builders.

function pleaseSirAGenerator(config, SNGsArray, incomingClass, incomingSku) {
    let activeWindow = BrowserWindow.fromId(1);

    //console.log("Beginning to search for generator\n")

    // YIKES
    // TODO: update this
    if (incomingClass == "Primary Products") {
        return [{"type": "string", "string" : "Error: No Style Guide exists for Primary Products"}]
    }

    for (let index in SNGsArray) {
        let SNG = SNGsArray[index];
        if (SNG.class == incomingClass) {
            activeWindow.webContents.send("console-log", "I found a matching class!")
            //name should change to generatorQueries
            const queryStack = SNG.returnGenerator;
            
            if (queryStack.length == 1) {
                if (queryStack[0].type == "Error") {
                    const error = {"string1" : queryStack[0].errorMessage}
                    return error;
                }
                return queryStack[0].thenReturn
            } else {
                for (let i = 0 ; i <= queryStack.length - 1; i++) {
                    let foundGen = queryBuilder(config, incomingSku, queryStack[i]);
                    if (foundGen) {
                        console.log("Found the Generator!")
                        //console.log(foundGen)
                        return foundGen
                    };
                }
                console.log("No generator found throwing error")
                return [{"type": "string", "string" : "Error: Null value returned for determining attribute."}];
            }
        }
    }
    return [{"type": "string", "string" : "Error: A Builder was not found for this class"}];
}

// FML why did I call the one value ifCalled and spec

function queryBuilder(config, sku, condition, passed=false) {
    const specValue = GetSkuCallValue(sku, condition.spec, config);
    // handle error types
    if (condition.type == "error") {
        const error = [{ "string" : condition.errorMessage}]
        return error
    };

    // Here we are checking if the type is else and there is no spec call and whether 
    // the returnGenerator is present. These should all only occur when there is a simple
    // Style Guide Builder
    if (condition.type === "else" && !condition.spec && condition.thenReturn) {
        return condition.thenReturn
    }

    // check if passed has already been evaluated as true and if there is a return
    if (passed && condition.thenReturn) {
        return condition.thenReturn
    }

    const passedTest = conditionTests[condition.type](specValue, condition.ifCalled, sku, config);

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
            let output = queryBuilder(config, sku, nestedCondition, consolidatedPassedValue);
            
            if (output) {
                return output;
            }
        }
    } 
    
    if (passedTest) {
        if (condition.thenReturn) {
            return condition.thenReturn
        }
    }

    // Throw error in default situations
    return null
}

module.exports = {
    pleaseSirAGenerator
}