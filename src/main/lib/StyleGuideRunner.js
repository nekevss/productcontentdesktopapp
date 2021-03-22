const electron = require('electron');
const { BrowserWindow } = electron;
const { cleanSpec } = require("./utils/Cleaner.js");

function pleaseSirAGenerator(SNGsArray, incomingClass, incomingSku) {
    let activeWindow = BrowserWindow.fromId(1);

    //console.log("Beginning to search for generator\n")

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
                    let foundGen = queryGenerator(incomingSku, queryStack[i]);
                    if (foundGen) {
                        console.log("Found the Generator!")
                        //console.log(foundGen)
                        return foundGen
                    };
                }
                console.log("No generator found throwing error")
                return [{"type": "string", "string" : "Error: There was an issue when querying for generator. Null value returned."}];
            }
        }
    }
    return [{"type": "string", "string" : "Error: A SNG was not found for this class"}];
}


function queryGenerator(sku, thisQuery, passed=false) {
    let activeWindow = BrowserWindow.fromId(1);
    let specValue = sku.hasOwnProperty(thisQuery.spec) ? sku[thisQuery.spec] : cleanSpec(sku.Specs[thisQuery.spec]);
    
    //handle error type from excel parser
    if (thisQuery.type == "error") {
        const error = [{ "string" : thisQuery.errorMessage}]
        return error
    };

    //handle already passed --> only true on OR statements
    if (passed && thisQuery.thenReturn) {
        return thisQuery.thenReturn;
    }

    //base case --> else
    if (thisQuery.type == "else") {
        //There are two types of else queries possible:
        //1. The default generator which should be {type: "else", thenReturn: {}}
        //2. The else condition card which should be {type: "else", spec: "random call", thenReturn: {}}
        //Here we need to account for both cases.

        //Quick note: this should probably be fixed. There might be some else cases where
        //nested conditions are needed. Haven't really fully thought through.
        if (thisQuery.spec) {
            if (specValue) {
                activeWindow.webContents.send("console-log", `${specValue} exists in else call`)
                if (thisQuery.thenReturn) {
                    return thisQuery.thenReturn
                } else {
                    //nestedConditions should exists in all cases where thenReturn does not.
                    //Should probably check, but leaving as is. Could be potential bug if not
                    //properly checked for in validation
                    let nestedConditions = thisQuery.nestedConditions;
                    for (let nestedCondition of nestedConditions){
                        let output = queryGenerator(sku, nestedCondition);
                        
                        if (output) {
                            return output;
                        }
                    }
                }
            }
        } else {
            if (thisQuery.thenReturn) {
                return thisQuery.thenReturn
            }
        }
        
        return null
    };

    if (!specValue) {
        //check the whether specValue is valid before continuing into the below logic
        //All below logic types require specValue to be a valid return
        activeWindow.webContents.send("console-log",`Here's specValue ${specValue} and Spec Call ${thisQuery.spec}`)
        return null
    }

    if (thisQuery.type == "if") {
        let expectedValues = thisQuery.ifCalled;

        if (thisQuery.nestedType == "AND") {
            //handle tree traversal
            if (expectedValues.includes(specValue)) {
                let nestedConditions = thisQuery.nestedConditions;
                for (let nestedCondition of nestedConditions){
                    let output = queryGenerator(sku, nestedCondition);
                    
                    if (output) {
                        return output;
                    }
                }
            }
            return null
        }
        if (thisQuery.nestedType == "OR") {
            let passedTest = passed;
            if (expectedValues.includes(specValue)) {
                activeWindow.webContents.send("console-log","SpecValue was found in the expected values!!!")
                passedTest = true;
            }

            let nestedConditions = thisQuery.nestedConditions;
            for (let nestedCondition of nestedConditions){
                let output = queryGenerator(sku, nestedCondition, passedTest);
                
                if (output) {
                    return output;
                }
            }
        }

        if (expectedValues.includes(specValue)) {
            activeWindow.webContents.send("console-log","SpecValue was found in the expected values!!!")
            return thisQuery.thenReturn
        }

        return null
    }

    if (thisQuery.type == "ifNot") {
        let expectedValues = thisQuery.ifCalled;

        if (thisQuery.nestedType == "AND") {
            //handle tree traversal
            if (!expectedValues.includes(specValue)) {
                let nestedConditions = thisQuery.nestedConditions;
                for (let nestedCondition of nestedConditions){
                    let output = queryGenerator(sku, nestedCondition);
                    
                    if (output) {
                        return output;
                    }
                }
            }
            return null
            
        }
        if (thisQuery.nestedType == "OR") {
            let passedTest = passed;

            if (!expectedValues.includes(specValue)) {
                passedTest = true;
            }

            let nestedConditions = thisQuery.nestedConditions;
            for (let nestedCondition of nestedConditions){
                let output = queryGenerator(sku, nestedCondition, passedTest);
                
                if (output) {
                    return output;
                }
            }
        }
        

        if (!expectedValues.includes(specValue)) {
            activeWindow.webContents.send("console-log","SpecValue was found in the expected values!!!")
            return thisQuery.thenReturn
        }
        
        return null
    }

    if (thisQuery.type == "includes") {
        let expectedValues = thisQuery.ifCalled;
        if (thisQuery.nestedType == "AND") {
            //handle tree traversal
            for (let value of expectedValues) {
                if (specValue.includes(value)) {
                    let nestedConditions = thisQuery.nestedConditions;
                    for (let nestedCondition of nestedConditions){
                        let output = queryGenerator(sku, nestedCondition);
                        
                        if (output) {
                            return output;
                        }
                    }
                };
            }
            return null
        }
        if (thisQuery.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expectedValues) {
                if (specValue.includes(value)) {
                    passedTest = true;
                };
            }

            let nestedConditions = thisQuery.nestedConditions;
            for (let nestedCondition of nestedConditions){
                let output = queryGenerator(sku, nestedCondition, passedTest);
                
                if (output) {
                    return output;
                }
            }
        }
        
        for (let value of expectedValues) {
            if (specValue.includes(value)) {return thisQuery.thenReturn};
        }
        
        return null
        
    }
    if (thisQuery.type == "equals") {
        let expectedValues = thisQuery.ifCalled;

        if (thisQuery.nestedType == "AND") {
            //handle tree traversal
            for (let value of expectedValues) {
                let secondarySpec = cleanSpec(sku.Specs[value]) 
                if (secondarySpec && specValue == secondarySpec) {
                    let nestedConditions = thisQuery.nestedConditions;
                    for (let nestedCondition of nestedConditions){
                        let output = queryGenerator(sku, nestedCondition);
                        
                        if (output) {
                            return output;
                        }
                    }
                }
            }

            return null
        }
        if (thisQuery.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expectedValues) {
                let secondarySpec = cleanSpec(sku.Specs[value])
                if (secondarySpec && specValue == secondarySpec) {
                    passedTest = true;
                }
            }

            let nestedConditions = thisQuery.nestedConditions;
            for (let nestedCondition of nestedConditions){
                let output = queryGenerator(sku, nestedCondition, passedTest);
                
                if (output) {
                    return output;
                }
            }
        }

        for (let value of expectedValues) {
            let secondarySpec = cleanSpec(sku.Specs[value])
            if (secondarySpec && specValue == secondarySpec) {
                return thisQuery.thenReturn
            }
        }
        
        return null
    }
    if (thisQuery.type == "notEquals") {
        let expectedValues = thisQuery.ifCalled;

        if (thisQuery.nestedType == "AND") {
            //handle tree traversal
            for (let value of expectedValues) {
                let secondarySpec = cleanSpec(sku.Specs[value]) 
                if (secondarySpec && specValue !== secondarySpec) {
                    let nestedConditions = thisQuery.nestedConditions;
                    for (let nestedCondition of nestedConditions){
                        let output = queryGenerator(sku, nestedCondition);
                        
                        if (output) {
                            return output;
                        }
                    }
                }
            }

            return null
        }
        if (thisQuery.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expectedValues) {
                let secondarySpec = cleanSpec(sku.Specs[value]) 
                if (secondarySpec && specValue !== secondarySpec) {
                    passedTest = true;
                }
            }

            let nestedConditions = thisQuery.nestedConditions;
            for (let nestedCondition of nestedConditions){
                let output = queryGenerator(sku, nestedCondition, passedTest);
                
                if (output) {
                    return output;
                }
            }
        }
        
        for (let value of expectedValues) {
            let secondarySpec = cleanSpec(sku.Specs[value]) 
            if (secondarySpec && specValue !== secondarySpec) {
                activeWindow.webContents.send("console-log",`${specValue} is not equal to ${secondarySpec}`)
                return thisQuery.thenReturn
            }
        }
        
        return null
    }

    if (thisQuery.type == "contains") {
        let expectedValues = thisQuery.ifCalled;

        if (thisQuery.nestedType == "AND") {
            //handle tree traversal
            for (let value of expectedValues) {
                let secondarySpec = cleanSpec(sku.Specs[value]) 
                if (specValue.includes(secondarySpec)) {
                    let nestedConditions = thisQuery.nestedConditions;
                    for (let nestedCondition of nestedConditions){
                        let output = queryGenerator(sku, nestedCondition);
                        
                        if (output) {
                            return output;
                        }
                    }
                }
            }

            return null
        }
        if (thisQuery.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expectedValues) {
                let secondarySpec = cleanSpec(sku.Specs[value]) 
                if (specValue.includes(secondarySpec)) {
                    passedTest = true;
                }
            }

            let nestedConditions = thisQuery.nestedConditions;
            for (let nestedCondition of nestedConditions){
                let output = queryGenerator(sku, nestedCondition, passedTest);
                
                if (output) {
                    return output;
                }
            }
        }
        
        for (let value of expectedValues) {
            let secondarySpec = cleanSpec(sku.Specs[value]) 
            if (specValue.includes(secondarySpec)) {
                return thisQuery.thenReturn
            }
        }
        
        return null
    }

    //throw error!!!
    return null
}

module.exports = {
    pleaseSirAGenerator
}