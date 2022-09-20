
// Input on validateBuilder is the value of props.StyleGuide from the builder state.
//
// Output will return both the outputObject and the error object.
//
//

let output  = {
    errorLog: [],
    validationLog: [],
    passed: false,
    totalErrors: 0,
    fatalErrors: 0,
};

// This is kinda a horrible idea...but it is funny lol
let previousNode = null;
let currentNode = null;
let nextNode = null;

let localNextNode = null;

const validateBuilder = (unvalidatedBuilder) => {
    // Reset all module variables
    output.errorLog = [];
    output.validationLog = [];
    output.passed = false;
    output.totalErrors = 0;
    output.fatalErrors = 0;
    previousNode = null;
    currentNode = null;
    nextNode = null;
    localNextNode = null;
    // Set our default output
    console.log("Beginning to run the validation.")

    addValidationLog("Beginning validation...")

    addValidationLog("Checking for Class Name")
    if (unvalidatedBuilder.class == "") {
        addErrorLog("Class Name is Blank!")
    } else {
        addValidationLog("Class Name is present");
    }


    if (unvalidatedBuilder.type == "simple") {
        addValidationLog("Style Guide Type: Simple")
        let returnGenerator = unvalidatedBuilder.returnGenerator;
        if (returnGenerator.length == 1) {
            addValidationLog("Return Generator has a confirmed length of 1")
            let StyleGuideArray = returnGenerator[0].thenReturn
            RunBuilderValidation(StyleGuideArray, "default");
            if (output.totalErrors > 0) {
                addValidationLog(`There were ${output.totalErrors} errors found during validation. Please see error log`)
            } else {
                addValidationLog("Validation Complete! No errors were found")
            }
        } else {
            addErrorLog(`Abort Error: Simple Type ReturnGenerator has an unexpected length of ${returnGenerator.length}`);
            addValidationLog("Validation aborted. Please see Error Log for more information.");
        }
    } else {
        addValidationLog("Style Guide Type: Complex")
        
        const returnGenerators = unvalidatedBuilder.returnGenerator;
        returnGenerators.forEach((value, index)=>{ 
            RunTopLevelValidation(value, 0, index, "");
        })
    }
    console.log(`Finished validation. There were ${output.totalErrors} errors found!`);
    
    if (output.fatalErrors == 0) {
        output.passed = true
    }

    return output
}

//Below are the central validation functions

const RunTopLevelValidation = (thisGenerator, parentLevel, incomingIndex, runningId) => {
    let thisLevel = parentLevel + 1;
    
    // We by default are checking the ifCalled value when creating the ID. So we should be able to
    // flag a warning on missing expected values. It should still be a warning since we do not know
    // if there will be edge cases.
    let idValue = thisGenerator.type == "else" ? "default" : thisGenerator.ifCalled.join("&");
    let thisID = runningId + idValue
    
    if (idValue == "") {
        addErrorLog(`WARNING! Expected value is blank. Please insure that this is intended.`)
        incrementNonFatalError()
    }

    // Check the case for when no children are present
    if (thisGenerator.nestedConditions.length == 0) {
        // check if our attribute has a value if there are children nested
        if (thisGenerator.spec == "" && thisGenerator.type !== "else") {
            addErrorLog(`Fatal Error in generator selection: empty attribute call at level ${thisLevel} and index ${incomingIndex}`);
            incrementFatalError()
        } else if (thisGenerator.spec == "" && thisGenerator.type === "else") {
            addErrorLog(`WARNING! Attribute call value is recommended for clarity on else statements.`)
            incrementNonFatalError()
        } else {
            addValidationLog(`Valid attribute call found in top level condition at level ${thisLevel} and index ${incomingIndex}`)
        }

        RunBuilderValidation(thisGenerator.thenReturn, thisID);
        return
    }

    // Check here if there is a thenReturn that exists when there is still children to traverse to.

    if (thisGenerator.thenReturn) {
        
        addErrorLog(`Fatal Error: Hidden builder found on element with children at ${thisID}`)
        incrementFatalError()
    } else {
        addValidationLog(`${thisID} does not have a hidden generator.`)
    }

    // recursive nested values
    if (thisGenerator.spec == "" && thisGenerator.type !== "else") {
        addErrorLog(`Fatal Error in drawer card: empty attribute call at ${thisID} with index ${incomingIndex}`);
        incrementFatalError()
    } else if (thisGenerator.spec == "" && thisGenerator.type === "else") {
        addErrorLog(`WARNING! Attribute call value is recommended for clarity on else statements.`)
        incrementNonFatalError()
    } else {
        addValidationLog(`Valid attribute call found in top level condition at level ${thisLevel} and index ${incomingIndex}`)
    }

    let nestedConditions = thisGenerator.nestedConditions;
    nestedConditions.forEach((value, index)=>{
        RunTopLevelValidation(value, thisLevel, index, thisID + "/");
    })
}

const RunBuilderValidation = (StyleGuideArray, runningId) => {

    if (!StyleGuideArray) {
        addErrorLog(`Fatal Error in ${runningId} formula: No available Style Guide to validate`)
        incrementFatalError()
        return
    }

    StyleGuideArray.forEach((value, index, arr)=>{
        currentNode = value
        previousNode = index !== 0 ? arr[index - 1] : null;
        nextNode = index !==  arr.length - 1 ? arr[index + 1] : null;

        // String type validation checks
        if (value.type == "string") {
            addValidationLog(`In ${runningId} formula: Checking String component at index: ${index}`);
            if (value.string == "") {
                addErrorLog(`WARNING! In ${runningId} formula: Blank string value for the component at index ${index}`);
                incrementNonFatalError()
            } else {
                addValidationLog("String value confirmed");
            }
        // Attribute type validation checks
        } else if (value.type == "spec") {
            addValidationLog(`In ${runningId} formula: Checking attribute component at index: ${value.spec}`)
            if (value.spec == "") {
                addErrorLog(`Fatal Error in ${runningId} formula: Blank attribute value for the component at index ${index}`)
                incrementFatalError()
            } else {
                addValidationLog("Attribute value confirmed")
            }
            if (previousNode) {
                if (!value.report && previousNode.type == "string") {
                    if (previousNode.string.includes(",")) {
                        addErrorLog(`WARNING! In ${runningId} formula at ${value.spec}: Non-mandatory attribute does not own its preceeding comma`);
                        incrementNonFatalError()
                    }
                }
                if (previousNode.type == "function") {
                    if (previousNode.forAttribute == value.spec) {
                        addErrorLog(`WARNING! In ${runningId} formula at $${value.spec}: Double attribute conditions found`);
                        incrementNonFatalError()
                    }
                }
            }
            if (nextNode) {
                if (value.endString.includes(",") && nextNode.type == "string") {
                    if (nextNode.string.includes(",")) {
                        addErrorLog(`WARNING! in ${runningId} formula at ${value.spec}: Potential double comma found`)
                        incrementNonFatalError()
                    }
                }
                if (nextNode.type == "function") {
                    if (nextNode.forAttribute == value.spec) {
                        addErrorLog(`WARNING! In ${runningId} formula at $${value.spec}: Double attribute conditions found`);
                        incrementNonFatalError()
                    }
                }
            }
        } else if (value.type == "function") {
            addValidationLog(`In ${runningId} formula: Checking functional component ${currentNode.forAttribute}`)
            //set nestedConditions array
            if (value.forAttribute == "") {
                addErrorLog(`Fatal Error in ${runningId} formula: Parent attribute not declared for functional attribute ${currentNode.forAttribute}`)
                incrementFatalError()
            }
            let functionConditions = value.conditions;
            //loop through nested conditions
            addValidationLog("Beginning validation of functional conditions...")
            functionConditions.forEach((value, index, arr)=>{
                localNextNode = index !==  arr.length - 1 ? arr[index + 1] : null;
                checkFunctionalComponentCondition(value, 0, index, runningId);
            })
            addValidationLog("Finished functional conditions validation!")
        } else {
            addErrorLog(`Unexpected component at index: ${index}`)
        }
    })
}

const checkFunctionalComponentCondition = (conditionValue, parentLevel, incomingIndex, runningId) => {
    let thisLevel = parentLevel + 1;
    addValidationLog(`Beginning validation for condition at level ${thisLevel} and index ${incomingIndex}`);
    //base case
    if (conditionValue.nestedConditions.length == 0) {
        //check basic values
        if (conditionValue.type !== "else") {
            if (conditionValue.call == "") {
                addErrorLog(`Fatal Error in ${runningId} formula: null attribute call for condition at level ${thisLevel} and index ${incomingIndex}`);
                incrementFatalError()
            } else {
                addValidationLog(`Valid attribute call found for condition at level ${thisLevel} and index ${incomingIndex}`)
            }
        } else {
            if (localNextNode) {
                addErrorLog(`WARNING! In ${runningId}, an unreachable condition was found after an else condition`)
                incrementNonFatalError()
            }
        }

        //insure that a return object exists
        addValidationLog("Checking for return object on end node")
        if (conditionValue.thenReturn) {
            addValidationLog("Return object was found!")
            //run return object validation -> only need to check spec call currently
            let returnObject = conditionValue.thenReturn
            if (returnObject.type == "returnSpec") {
                // Validation Checks on returning a spec
                if (returnObject.call == "") {
                    addErrorLog(`Fatal Error in ${runningId} formula at ${currentNode.forAttribute}: return object has a null attribute call`);
                    incrementFatalError()
                }
                
                if (previousNode) {
                    if (!currentNode.report && previousNode.type == "string") {
                        if (previousNode.string.includes(",")) {
                            addErrorLog(`WARNING! in ${runningId} formula at ${currentNode.forAttribute}: Potential hanging comma -> non-mandatory attribute does not own its preceeding comma`)
                            incrementNonFatalError()
                        }
                    }
                }

                if (nextNode) {
                    if (returnObject.endString.includes(",") && nextNode.type == "string") {
                        if (nextNode.string.includes(",")) {
                            addErrorLog(`WARNING! in ${runningId} formula at ${currentNode.forAttribute}: Potential double comma found`)
                            incrementNonFatalError()
                        }
                    }
                }

            } else if (returnObject.type == "replaceAndReturn") {
                if (returnObject.call == "") {
                    addErrorLog(`Fatal Error in ${runningId} formula at ${currentNode.forAttribute}: return object has a null attribute call`);
                    incrementFatalError()
                }
                if (returnObject.find == "") {
                    addErrorLog(`Fatal Error in ${runningId} formula at ${currentNode.forAttribute}: return object has a null find call`);
                    incrementFatalError()
                }
                if (previousNode) {
                    if (!currentNode.report && previousNode.type == "string") {
                        if (previousNode.string.includes(",")) {
                            addErrorLog(`WARNING! in ${runningId} formula at ${currentNode.forAttribute}: Potential hanging comma -> non-mandatory attribute does not own its preceeding comma`)
                            incrementNonFatalError()
                        }
                    }
                }
                if (nextNode) {
                    if (returnObject.endString.includes(",") && nextNode.type == "string") {
                        if (nextNode.string.includes(",")) {
                            addErrorLog(`WARNING! in ${runningId} formula at ${currentNode.forAttribute}: Potential double comma found`)
                            incrementNonFatalError()
                        }
                    }
                }
            } else {
                addValidationLog(`In ${runningId} formula at ${currentNode.forAttribute}: Return object validated!`);
            }
        } else {
            addErrorLog(`Fatal Error in ${runningId} formula: No return value designated at level ${thisLevel} and index ${incomingIndex}`);
            incrementFatalError()
        }
    }

    //non-base case
    addValidationLog('Nested Conditions were found!')
    if (conditionValue.type !== "else") {
        if (conditionValue.call == "") {
            addErrorLog(`Fatal Error in ${runningId} formula at ${currentNode.forAttribute}: null attribute call for condition at level ${thisLevel} and index ${incomingIndex}`)
            incrementFatalError()
        } else {
            addValidationLog(`Valid attribute call found for ${currentNode.forAttribute} condition at level ${thisLevel} and index ${incomingIndex}`)
        }
    }

    let nestedArray = conditionValue.nestedConditions;
    addValidationLog('Beginning to validate nested conditions!')
    nestedArray.forEach((value, index, arr)=>{
        localNextNode = index !==  arr.length - 1 ? arr[index + 1] : null;
        checkFunctionalComponentCondition(value, thisLevel, index, runningId);
    })
}

//Validation and Error Log Entry functions

const addValidationLog = (message) => {
    output.validationLog.push(message)
}

const addErrorLog = (message) => {
    output.errorLog.push(message)
}

const incrementNonFatalError = () => {
    output.totalErrors += 1;
}

const incrementFatalError = () => {
    output.fatalErrors += 1;
    output.totalErrors += 1;
}


module.exports = {
    validateBuilder,
}