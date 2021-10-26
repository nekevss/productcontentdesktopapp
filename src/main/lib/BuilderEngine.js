const electron = require('electron');
const { BrowserWindow } = electron;
const { cleanSpec } = require("./utils/Cleaner.js");


function builderEngine(sku, gen, config) {
    let activeWindow = BrowserWindow.fromId(1);
    let genreport = {};
    //the check is assumed true until proven false.
    //Logic dictates that an assumed false until proven true approach would be best, but
    //but how would result remain persistent across all calls without recording all calls.

    //that being said we are innocent until proven guilty. Perhaps this holds here.

    //init return object
    let returnobject = {
        check: true, 
        name: "", 
        report: {},
        log: []
    }
    
    const PyramidId = config["Excel Mapping"]["Pyramid Id"];
    const skuId = sku[PyramidId];

    activeWindow.webContents.send("console-log","Logging the generator prior to iterating...")
    activeWindow.webContents.send("console-log", gen);

    let name = "";
    if (!gen) {
        console.log(`Null generator error at the below sku`)
        console.log(sku)
        return {
            check: false,
            name: "*Error*",
            report: {},
            log:[`${skuId}: Null generator error`]
        }
    }
    gen.forEach((value, index) => {
        let perCallCheck = true;
        /* Below checks for function, then spec, and defaults to string. On check returning true, */
        if (value.type == "function") {
            activeWindow.webContents.send("console-log","Calling on " + value.forAttribute)
            let functionData = value;
            //TODO: Add call value to function's return object. This would record the name
            let funcname = functionData.forAttribute;
            
            let functionOutput = generatorPiston(functionData.conditions, sku, config)
            
            activeWindow.webContents.send("console-log","The function output is: " + functionOutput)

            if (!genreport.hasOwnProperty(funcname)) {genreport[funcname] = {attempts: 0, conn: 0}}
            genreport[funcname].attempts += 1;

            if (functionOutput || functionOutput === "") {
                genreport[funcname].conn += 1
                name += functionOutput;
            } else {
                if (functionData.report) {
                    activeWindow.webContents.send("console-log",`Sku failed report at ${funcname}`)
                    returnobject.log.push(`${skuId} failed at ${funcname} call`)
                    perCallCheck = false;
                }
            }   
        } else if (value.type == "spec") {
            let generatorcall = value.spec;

            //Set values for the generator report if not already running
            if (!genreport.hasOwnProperty(generatorcall)) {genreport[generatorcall] = {attempts: 0, conn: 0}}
            
            let specval = GetSkuCallValue(sku, generatorcall, config);
            
            //set our attempts
            genreport[generatorcall].attempts += 1;
            
            //validate spec before continuing
            if (specval) {
                genreport[generatorcall].conn += 1;

                //!There needs to be a better way to implement duplication check or move
                //!the references into the config so that Series or Collection is not
                //!hard coded.
                //thought: bring in forEach array, look at value i-1 and compare? At
                //that point might be best to store value in a lastVar

                //test for brand duplicating in Series or Collection
                if (generatorcall == "Series or Collection") {
                    let brand_to_test = sku[config["Excel Mapping"]["Brand"]];
                    if (specval.includes(brand_to_test)) {
                        activeWindow.webContents.send("console-log","Sku failed the report at Brand/Series or Collection duplication")
                        returnobject.log.push(`${skuId} failed due to duplicate value in brand and series or collection`)
                        perCallCheck = false;
                    }
                }

                //Putting together value to add --> have to check if leadString exists because it wasn't always in use.
                let nameAddition = value.leadString ? value.leadString + specval + value.endString : specval + value.endString;

                //add the resulting spec value
                name += nameAddition;
            } else {
                //Series or Collection is being considered optional for individual level reporting
                if (value.report) {
                    activeWindow.webContents.send("console-log",`Sku failed the report at ${generatorcall}`);
                    returnobject.log.push(`${skuId} failed at ${generatorcall} call`)
                    perCallCheck = false;
                }
            }
        } else if (value.type == "string") {
            //This else statement handles strings
            name += value.string;
        } else {
            //This else statement handles errors
            name += "*Error*";
            returnobject.log.push(`${skuId} contains an unknown call type`)
            perCallCheck = false;
        }

        //setting return objects checker to false if null is found
        if (!perCallCheck) {
            returnobject.check = false;
        }
    })

    //regex and replace land!!!
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
        returnobject.check = false;
    }

    returnobject.report = genreport;
    returnobject.name = name;
    return returnobject;
}

function generatorPiston(conditions, thisSku, config) {
    let activeWindow = BrowserWindow.fromId(1);
    const returnSpec = (sku, call, leadString, endString) => {
        let spec = GetSkuCallValue(sku, call, config);
        if (spec) {
            return leadString ? leadString + spec + endString : spec + endString
        }
        return null
    };
    const replaceAndReturn = (sku, call, leadString, endString, findValue, replaceValue) => {
        let spec = GetSkuCallValue(sku, call, config);
        if (spec) {
            return leadString 
                ? leadString + spec.replace(findValue, replaceValue) + endString 
                : spec.replace(findValue, replaceValue) + endString;
        }
        return null
    }
    //greater than function should be handled by conditional types
    const conditionalFunctions = {
        returnSpec,
        replaceAndReturn
    }

    for (let i in conditions) {
        let thisCondition = conditions[i];
        
        let evaluatedObject = evaluateConditionals(thisCondition, thisSku, config)

        activeWindow.webContents.send("console-log",`I'm logging the returned evaluated object for condtion ${i}: ${thisCondition.call} `)
        activeWindow.webContents.send("console-display", JSON.stringify(evaluatedObject));

        //below needs to be altered for the new conditional statements
        //should create a test class
        if (evaluatedObject) {
            if (evaluatedObject.type == 'returnString') {
                return evaluatedObject.string;
            }
            if (evaluatedObject.type == 'returnSpec') {
                return conditionalFunctions['returnSpec'](thisSku, evaluatedObject.call, evaluatedObject.leadString, evaluatedObject.endString)
            }
            //Card needed to be complete
            if (evaluatedObject.type == 'replaceAndReturn') {
                return conditionalFunctions['replaceAndReturn'](thisSku, evaluatedObject.call, evaluatedObject.leadString, evaluatedObject.endString, evaluatedObject.find, evaluatedObject.replace)
            }
            if (evaluatedObject.type == 'returnNull') {
                return null
            }
        }
    }

    activeWindow.webContents.send("console-log", "There was an error evaluating function");
    return null;
}

function evaluateConditionals(conditional, thisSku, config, passed=false) {
    //need to better build out OR case -> test if value is true and send bool that to indicate PASSED
    let activeWindow = BrowserWindow.fromId(1);
    let thisType = conditional.type;

    let call = conditional.call;
    let spec = GetSkuCallValue(thisSku, call, config);

    // Couple base cases: 
    //    - if a passed = true value exists from a previously passed OR clause, then return
    //    - if an else type exists then, return a thenReturn or call nestedConditions
    //
    // This function returns null by default.

    //handle passed variable if thenReturn is present
    if (passed && conditional.thenReturn) {
        return conditional.thenReturn
    }

    const passedTest = conditionTests[thisType](spec, conditional.expectedValue, thisSku, config)

    if (passedTest && conditional.nestedType == "AND") {
        let nestedConditions = conditional.nestedConditions;
        for (let nestedCondition of nestedConditions) {
            let output = evaluateConditionals(nestedCondition, thisSku, config);

            if (output) {
                return output
            }
        }
    } else if (passedTest && conditional.nestedType == "OR") {
        let nestedConditions = conditional.nestedConditions;
        for (let nestedCondition of nestedConditions) {
            let output = evaluateConditionals(nestedCondition, thisSku, config, passedTest);

            if (output) {
                return output
            }
        }
    } else if (passedTest) {
        if (conditional.thenReturn) {
            return conditional.thenReturn;
        }
    } else {
        activeWindow.webContents.send("console-log","Did not find a valid matching type")
        return null
    }
}

//should the below be separated into a module and imported into the Style Guide Runner as well...
function GetSkuCallValue (sku, generatorCall, config) {
    //slow af. Think it added like 40 seconds on bulk run of 27k skus.
    //But safety and utility over speed in this case. If I was worried
    //about speed, then this should be rebuilt in rust and compiled to wasm.
    const mappedCalls = config["Functional Data"]["Style Guide Call Mapping"];
    const mappedCallsKeys = Object.keys(mappedCalls);
    let call = "";

    //first determine if the generator call is a mapped call
    if (mappedCallsKeys.includes(generatorCall)) {
        call = mappedCalls[generatorCall];
    } else {
        call = generatorCall;
    }

    //need to make a decision on how to handle brand calls.
    if (call == config["Excel Mapping"]["Brand"]) {
        const copyrightedBrands = config["Exempted Brands"]["Copyright Brands"];
        const trademarkBrands = config["Exempted Brands"]["Trademark Brands"];
        const registeredBrands = config["Exempted Brands"]["Registered Brands"];

        if (trademarkBrands.includes(sku[call])) {
            return sku[call] + "&trade;";
        } else if (copyrightedBrands.includes(sku[call])) {
            return sku[call] + "&copy;";
        } else if(registeredBrands.includes(sku[call])) {
            return sku[call] + "&reg;";
        } else {
            return sku[call];
        }
    } else {
        //return value of call. Always clean the spec coming from the Specs object of sku.
        return sku.hasOwnProperty(call) ? sku[call] : cleanSpec(sku.Specs[call]);
        //really the above works, but it might be best to check the value and insure that
        //null is being returned rather than undefined. But Fijis vs. Granny Smiths
    }
}

//to be implemented
//run test -> return bool of test result
const conditionTests = {
    "if" : (specValue, expectedArray, thisSku={}, config={}) => {
        return expectedArray.includes(specValue) ? true : false
    },
    "ifNot" : (specValue, expectedArray, thisSku={}, config={}) => {
        return !expectedArray.includes(specValue) ? true : false
    },
    "includes" : (specValue, expectedArray, thisSku={}, config={}) => {
        for (let value of expectedArray) {
            if (specValue.includes(value)) {
                return true
            }
        }
        return false
    },
    "equals" : (specValue, expectedArray, thisSku, config) => {
        for (let value of expectedArray) {
            let secondarySpec = GetSkuCallValue(thisSku, value, config)
            if (secondarySpec && specValue == secondarySpec) {
                return true
            }
        }
        return false
    },
    "notEquals" : (specValue, expectedArray, thisSku, config) => {
        for (let value of expectedArray) {
            let secondarySpec = GetSkuCallValue(thisSku, value, config)
            if (secondarySpec && specValue !== secondarySpec) {
                return true
            }
        }
        return false
    },
    "contains" : (specValue, expectedArray, thisSku, config) => {
        for (let value of expectedArray) {
            let secondarySpec = GetSkuCallValue(thisSku, value, config)
            if (specValue.includes(secondarySpec)) {
                return true
            }
        }
        return false
    },
    "else" : (specValue, expectedArray=[], thisSku={}, config={}) => {return specValue ? true : false},
    "ifNull" : (specValue, expectedArray=[], thisSku={}, config={}) => {return !specValue ? true : false }
}

module.exports = {
    builderEngine
}