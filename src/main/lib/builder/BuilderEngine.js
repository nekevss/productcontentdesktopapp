const electron = require('electron');
const { BrowserWindow } = electron;
const { conditionTests } = require("../conditions/condition-tests.js");
const { getSkuCallValue, prepareIndexableSkuContent, decimalToFraction, fractionToDecimal } = require("../utils/index.js");


function builderEngine(sku, tokens, config) {
    let activeWindow = BrowserWindow.getFocusedWindow()
    let runReport = {};
    let failureCount = 0;
    // console.log(tokens)
    // the check is assumed true until proven false.
    // Logic dictates that an assumed false until proven true approach would be best, but
    // but how would result remain persistent across all calls without recording all calls.

    // that being said we are innocent until proven guilty. Perhaps this holds here.

    // init return object
    let builderOutput = {
        check: true, 
        confidence: {
            fails: 0,
            weightedFails:0,
            checks: 0,
            finds: 0
        },
        confidenceGrade: 0,
        name: "", 
        report: {},
        log: []
    }

    const contentIndex = prepareIndexableSkuContent(sku, config);
    
    const PyramidId = config["Excel Mapping"]["Pyramid Id"];
    const skuId = sku[PyramidId];
    

    activeWindow?.webContents?.send("console-log","Logging the generator prior to iterating...")
    activeWindow?.webContents?.send("console-log", tokens);

    let name = "";
    if (!tokens) {
        console.log(`Null generator error at the below sku`)
        console.log(sku)
        return {
            check: false,
            confidence: {
                fails: 0,
                weightedFails: 0,
                checks: 0,
                finds: 0
            },
            confidenceGrade: 0,
            name: "*Error*",
            report: {},
            log:[`${skuId}: Null generator error`]
        }
    }

    tokens.forEach((token, index) => {
        let perCallCheck = true;
        /* Below checks for function, then spec, and defaults to string. On check returning true, */
        if (token.type == "conditionalAttribute") {
            activeWindow.webContents?.send("console-log","Calling on " + token.rootAttribute)
            let conditionalAttributeData = token;
            //TODO: Add call value to function's return object. This would record the name
            let conditionName = conditionalAttributeData.rootAttribute;
            
            let conditionOutput = evalConditions(conditionalAttributeData.conditions, sku, config)
            
            activeWindow.webContents?.send("console-log","The conditionalAttribute output is: " + conditionOutput)

            if (!runReport.hasOwnProperty(conditionName)) {runReport[conditionName] = {attempts: 0, conn: 0}}
            runReport[conditionName].attempts += 1;

            if (conditionOutput || conditionOutput === "") {
                // Handle reporting and confidence checks
                runReport[conditionName].conn += 1
                let [c, f] = confidenceCheck(conditionOutput, contentIndex)
                builderOutput.confidence.checks += c
                builderOutput.confidence.finds += f

                // Add values to output
                if (conditionalAttributeData.commaLed) {
                    name+= ", "
                }
                name += conditionOutput;
            } else {
                if (conditionalAttributeData.report) {
                    activeWindow?.webContents?.send("console-log",`Sku failed report at ${conditionName}`)
                    builderOutput.log.push(`${skuId} failed at ${conditionName} call`);
                    perCallCheck = false;
                    // We're going to weight mandatory attributes here quite a bit. The reason being
                    // that if a mandatory attribute is failed, then the SKU name is guaranteed to 
                    // be off. So confidence in the output should be rock bottom.
                    builderOutput.confidence.weightedFails += 1
                } else {
                    builderOutput.confidence.fails += 1
                }
                // Confidence check should run regardless of mandatory-ness
                builderOutput.confidence.checks += 1; // This is a pretty naive way to weight the confidence lower on failures. Maybe adjust later?
            }   
        } else if (token.type == "attribute") {
            let attributeCall = token.attributeName;

            //Set values for the generator report if not already running
            if (!runReport.hasOwnProperty(attributeCall)) {runReport[attributeCall] = {attempts: 0, conn: 0}}
            
            let specval = getSkuCallValue(sku, attributeCall, config);
            
            //set our attempts
            runReport[attributeCall].attempts += 1;
            
            //validate spec before continuing
            if (specval) {
                runReport[attributeCall].conn += 1;

                //!There needs to be a better way to implement duplication check or move
                //!the references into the config so that Series or Collection is not
                //!hard coded.
                //thought: bring in forEach array, look at value i-1 and compare? At
                //that point might be best to store value in a lastVar

                //test for brand duplicating in Series or Collection
                if (attributeCall == "Series or Collection") {
                    let brand_to_test = sku[config["Excel Mapping"]["Brand"]];
                    if (specval.includes(brand_to_test)) {
                        activeWindow?.webContents?.send("console-log","Sku failed the report at Brand/Series or Collection duplication")
                        builderOutput.log.push(`${skuId} failed due to duplicate value in brand and series or collection`)
                        builderOutput.confidence.checks += 1;
                        builderOutput.confidence.fails += 1;
                        perCallCheck = false;
                    }
                }

                let nameAddition = "";
                if (token.commaLed) {
                    nameAddition += ", "
                }

                // Putting together value to add --> have to check if leadString exists because it wasn't always in use.
                nameAddition += token.leadString
                    ? token.leadString + specval + token.endString
                    : specval + token.endString;

                // confidence check!
                let [c, f] = confidenceCheck(nameAddition, contentIndex)
                builderOutput.confidence.checks += c
                builderOutput.confidence.finds += f
                
                // add the resulting spec value
                
                name += nameAddition;
            } else {
                //Series or Collection is being considered optional for individual level reporting
                if (token.report) {
                    activeWindow?.webContents?.send("console-log",`Sku failed the report at ${attributeCall}`);
                    builderOutput.log.push(`${skuId} failed at ${attributeCall} call`)
                    perCallCheck = false;
                    // Same as above: weighting the mandatory attributes.
                    builderOutput.confidence.weightedFails += 1;
                } else {
                    builderOutput.confidence.fails += 1;
                }
                // Confidence checks should run regardless of reporting mandatory-ness.
                builderOutput.confidence.checks += 1;
            }
        } else if (token.type == "string") {
            //This else statement handles strings
            let [c, f] = confidenceCheck(token.string, contentIndex)
            builderOutput.confidence.checks += c
            builderOutput.confidence.finds += f
            name += token.string;
        } else {
            // This else statement handles errors
            name += "*Error*";
            builderOutput.log.push(`${skuId} contains an unknown call type`)
            perCallCheck = false;
            // Special error -> if this happens we confidence has to be dirt.
            builderOutput.confidence.checks += 1;
            builderOutput.confidence.weightedFails += 1;
        }

        //setting return objects checker to false if null is found
        if (!perCallCheck) {
            builderOutput.check = false;
        }
    })

    // It should be noted: this is a HORRIBLE idea...I love it
    // regex and replace land!!!
    const danglingCommaCheck = new RegExp('\\,\\s*\\(','gi')
    if (danglingCommaCheck.test(name)) {
        name = name.replace(danglingCommaCheck, " (");
    }

    const orphanedCommaCheck = new RegExp('\\s\\,\\s', 'gi')
    while (orphanedCommaCheck.test(name)) {
        name = name.replace(orphanedCommaCheck, ", ");
    }

    const doubleCommaCheck = new RegExp('\\,\\,\\s', 'gi');
    while(doubleCommaCheck.test(name)) {
        name = name.replace(doubleCommaCheck, ", ")
    }

    const doubleSpaceCheck = new RegExp('\\s\\s', 'gi');
    while (doubleSpaceCheck.test(name)) {
        name = name.replace(doubleSpaceCheck, " ");
    }

    //Running one final check to throw Failed flag on ipcMain/query errors
    if (name.includes("Error:")) {
        builderOutput.check = false;
    }

    builderOutput.report = runReport;
    builderOutput.name = name;
    builderOutput.confidenceGrade = calculateConfidenceScore(builderOutput.confidence)
    return builderOutput;
}

function evalConditions(conditions, thisSku, config) {
    let activeWindow = BrowserWindow.getFocusedWindow();
    
    // Implementation of return Specification builderOutput
    const returnSpec = (sku, call, leadString, endString) => {
        let attributeValue = getSkuCallValue(sku, call, config);
        if (attributeValue) {
            return leadString ? leadString + attributeValue + endString : attributeValue + endString
        }
        return null
    };
    
    // Implementation of Replace and Return builderOutput
    const replaceAndReturn = (sku, call, leadString, endString, findValue, replaceValue) => {
        // TODO: CLEAN THIS UP lol
        let attributeValue = getSkuCallValue(sku, call, config);
        // NOTE: is it worth implementing the below as a regex???
        if (attributeValue) {
            let regexedFindValue = RegExp(findValue, "g");
            return leadString 
                ? leadString + attributeValue.replace(regexedFindValue, replaceValue) + endString 
                : attributeValue.replace(regexedFindValue, replaceValue) + endString;
        }
        return null
    }

    for (let i in conditions) {
        let thisCondition = conditions[i];
        
        let evaluatedObject = evalNestedConditions(thisCondition, thisSku, config)

        activeWindow?.webContents?.send("console-log",`I'm logging the returned evaluated object for condtion ${i}: ${thisCondition.attributename} `)
        activeWindow?.webContents?.send("console-display", JSON.stringify(evaluatedObject));

        //below needs to be altered for the new conditional statements
        //should create a test class
        if (evaluatedObject) {
            if (evaluatedObject.type == 'returnString') {
                return evaluatedObject.string;
            }
            if (evaluatedObject.type == 'returnSpec') {
                return returnSpec(thisSku, evaluatedObject.attributeName, evaluatedObject.leadString, evaluatedObject.endString)
            }
            //Card needed to be complete
            if (evaluatedObject.type == 'replaceAndReturn') {
                return replaceAndReturn(thisSku, evaluatedObject.attributeName, evaluatedObject.leadString, evaluatedObject.endString, evaluatedObject.find, evaluatedObject.replace)
            }
            if (evaluatedObject.type == 'returnNull') {
                return null
            }
        }
    }

    activeWindow.webContents?.send("console-log", "There was an error evaluating function");
    return null;
}

function evalNestedConditions(conditional, thisSku, config, passed=false) {
    // need to better build out OR case -> test if value is true and send bool that to indicate PASSED
    let activeWindow = BrowserWindow.getFocusedWindow();
    let thisType = conditional.type;

    let call = conditional.attributeName;
    let attributeValue = getSkuCallValue(thisSku, call, config);

    // Couple base cases: 
    //    - if a passed = true value exists from a previously passed OR clause, then return
    //    - if an else type exists then, return a conditionOutput or call nestedConditions
    //
    // This function returns null by default.

    // handle passed variable if a return object is present
    if (passed && conditional.conditionOutput) {
        return conditional.conditionOutput
    }

    const passedTest = conditionTests[thisType](attributeValue, conditional.conditionTargets, thisSku, config)

    // first we check if the nestedType is OR since we do not care about the passedTest value result for OR
    if (conditional.nestedType == "OR") {
        // consolidate the parents passed value with this evals value
        let consolidatedPassedValues = passedTest === true || passed === true ? true : false;
        
        let nestedConditions = conditional.nestedConditions;
        for (let nestedCondition of nestedConditions) {
            let output = evalNestedConditions(nestedCondition, thisSku, config, consolidatedPassedValues);

            if (output) {
                return output
            }
        }
    } else if (passedTest && conditional.nestedType == "AND") {
        let nestedConditions = conditional.nestedConditions;
        for (let nestedCondition of nestedConditions) {
            let output = evalNestedConditions(nestedCondition, thisSku, config);

            if (output) {
                return output
            }
        }
    } else if (passedTest) {
        if (conditional.conditionOutput) {
            return conditional.conditionOutput;
        }
    } else {
        activeWindow?.webContents?.send("console-log","Did not find a valid matching type")
        return null
    }
}

function confidenceCheck(addValue, indexedContent) {
    let checks = 0;
    let finds = 0;

    const punctuationCleaner = /[,()]/g
    const decimalCheck = /[0-9]+\.[0-9]+/;
    const fractionCheck = /[0-9]+\/[0-9]+/;

    // remove the space from test value as the index has no spaces
    const punctionationFreeValue = addValue.replaceAll(punctuationCleaner, "");
    const testValue = punctionationFreeValue.replaceAll(" ", "");

    checks += 1
    if (decimalCheck.test(testValue)) {
        let decimalValue = addValue;
        let fractionValue = addValue;
        Object.keys(decimalToFraction).forEach((decimal, index)=>{
            if (fractionValue.includes(decimal)) {
                fractionValue = fractionValue.replaceAll(decimal, decimalToFraction[decimal])
            }
        })

        let decimalTest = decimalValue.replaceAll(" ", "");
        let fractionTest = fractionValue.replaceAll(" ", "");

        if (indexedContent.includes(decimalTest)) {
            finds += 1;

            const separateValues = decimalValue.split(" ")

            separateValues.forEach((value)=>{
                checks += 1;
                if (indexedContent.includes(value)) {
                    finds += 1
                }
            })

        } else if (indexedContent.includes(fractionTest)) {
            finds += 1;
            
            const separateValues = fractionValue.split(" ")

            separateValues.forEach((value)=>{
                checks += 1;
                if (indexedContent.includes(value)) {
                    finds += 1
                }
            })

        } else {
            if (indexedContent.includes(testValue)) {
                finds += 1
            }
            const separateValues = addValue.split(" ");

            separateValues.forEach((value)=>{ 
                checks += 1;
                 if (indexedContent.includes(value)) {
                    finds += 1
                 }
            })
        }
    } else if (fractionCheck.test(testValue)) {
        let decimalValue = addValue;
        let fractionValue = addValue;
        Object.keys(fractionToDecimal).forEach((fraction, index)=>{
            if (decimalValue.includes(fraction)) {
                decimalValue = decimalValue.replaceAll(fraction, fractionToDecimal[fraction])
            }
        })

        let decimalTest = decimalValue.replaceAll(" ", "");
        let fractionTest = fractionValue.replaceAll(" ", "");

        if (indexedContent.includes(fractionTest)) {
            finds += 1;

            const separateValues = fractionValue.split(" ")

            separateValues.forEach((value)=>{
                checks += 1;
                if (indexedContent.includes(value)) {
                    finds += 1
                }
            })
        } else if (indexedContent.includes(decimalTest)) {
                finds += 1;
    
                const separateValues = decimalValue.split(" ")
    
                separateValues.forEach((value)=>{
                    checks += 1;
                    if (indexedContent.includes(value)) {
                        finds += 1
                    }
                })
    
            } else {
                if (indexedContent.includes(testValue)) {
                    finds += 1
                }

                const separateValues = addValue.split(" ");
    
                separateValues.forEach((value)=>{ 
                    checks += 1;
                     if (indexedContent.includes(value)) {
                        finds += 1
                     }
                })
            }
    } else { 
        if (indexedContent.includes(testValue.toLowerCase())) {
            finds += 1
        }

        const separateValues = addValue.split(" ");

        separateValues.forEach((value)=>{ 
            checks += 1;
             if (indexedContent.includes(value.toLowerCase())) {
                finds += 1
             }
        })
    }

    return [checks, finds]
}

function calculateConfidenceScore(confidence) {
    let failureWeight = 2 ** (confidence.fails + (confidence.weightedFails * 4));
    let score = (confidence.finds / (confidence.checks + failureWeight)) * 100
    return score.toPrecision(4);
}

module.exports = {
    builderEngine
}