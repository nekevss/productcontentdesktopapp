import React from 'react';
import './style/SGValidation.scss';

export default function ValidationOverlay(props) {
    const [validationLog, setValidationLog] = React.useState([]);
    const [errorLog, setErrorLog] = React.useState([]);
    const [errorCount, setErrorCount] = React.useState(0);
    const [validationCount, setValidationCount] = React.useState(0);

    React.useEffect(()=>{
        const StyleGuide = props.StyleGuide;
        console.log("Beginning to run the validation.")

        addValidationLog("Beginning validation...")

        addValidationLog("Checking for Class Name")
        if (StyleGuide.class == "") {
            addErrorLog("Class Name is Blank!")
        } else {
            addValidationLog("Class Name is present");
        }
        let errors = {total:0, fatal:0};
        if (StyleGuide.type == "simple") {
            addValidationLog("Style Guide Type: Simple")
            let returnGenerator = StyleGuide.returnGenerator;
            if (returnGenerator.length == 1) {
                addValidationLog("Return Generator has a confirmed length of 1")
                let StyleGuideArray = returnGenerator[0].thenReturn
                errors = RunBuilderValidation(StyleGuideArray, "default");
                if (errors.total > 0) {
                    addValidationLog(`There were ${errors} errors found during validation. Please see error log`)
                } else {
                    addValidationLog("Validation Complete! No errors were found")
                }
            } else {
                addErrorLog(`Abort Error: Simple Type ReturnGenerator has an unexpected length of ${returnGenerator.length}`);
                addValidationLog("Validation aborted. Please see Error Log for more information.");
            }
        } else {
            addValidationLog("Style Guide Type: Complex")
            //needs to be built out
            console.log(StyleGuide.returnGenerator);
            const returnGenerators = StyleGuide.returnGenerator;
            returnGenerators.forEach((value, index)=>{
                let genErrors = {total:0, fatal: 0};
                if (value.type !== "else") {
                    genErrors = RunTopLevelValidation(value, 0, index, "");
                } else {
                    let StyleGuideArray = value.thenReturn;
                    genErrors = RunBuilderValidation(StyleGuideArray, "")
                }
                errors.total += genErrors.total;
                errors.fatal += genErrors.fatal;
            })
        }
        console.log(`Finished validation. There were ${errors.total} errors found!`);
        console.log(errors);
        setErrorCount(errors.total)
        setValidationCount(validationLog.length);
        
        if (errors.fatal == 0) {
            console.log("Validation State updated to Passed")
            props.updateValidationState("Passed");
        } else {
            console.log("Validation State updated to Failed");
            props.updateValidationState("Failed");
        }
    }, [props.StyleGuide])



    //Below are the central validation functions

    const RunTopLevelValidation = (thisGenerator, parentLevel, incomingIndex, runningId) => {
        let errors = {total:0, fatal:0};
        let thisLevel = parentLevel + 1;
        let idValue = thisGenerator.ifCalled.join("&")
        //base case
        if (thisGenerator.nestedConditions.length == 0) {
            if (thisGenerator.spec == "") {
                addErrorLog(`Fatal Error in generator selection: empty attribute call at level ${thisLevel} and index ${incomingIndex}`);
                errors.total += 1;
                errors.fatal += 1;
            } else {
                addValidationLog(`Valid attribute call found in top level condition at level ${thisLevel} and index ${incomingIndex}`)
            }

            let finalId = runningId+idValue;

            let StyleGuideErrors = RunBuilderValidation(thisGenerator.thenReturn, finalId);
            errors.total += StyleGuideErrors.total;
            errors.fatal += StyleGuideErrors.fatal;
            return errors;
        }

        //recursive nested values
        if (thisGenerator.spec == "") {
            addErrorLog(`Fatal Error in generator selection: empty attribute call at level ${thisLevel} and index ${incomingIndex}`)
            errors.total += 1;
            errors.fatal += 1;
        } else {
            addValidationLog(`Valid attribute call found in top level condition at level ${thisLevel} and index ${incomingIndex}`)
        }
        let nestedConditions = thisGenerator.nestedConditions;
        let newRunning = runningId + idValue
        nestedConditions.forEach((value, index)=>{
            let nestedErrors = 0;
            nestedErrors = RunTopLevelValidation(value, thisLevel, index, newRunning + "/");
            errors.total += nestedErrors.total;
            errors.fatal += nestedErrors.fatal;
        })

        return errors;
    }

    const RunBuilderValidation = (StyleGuideArray, runningId) => {
        let errors = {total:0, fatal:0};

        if (!StyleGuideArray) {
            addErrorLog(`Fatal Error in ${runningId} formula: No available Style Guide to validate`)
            errors.total += 1;
            errors.fatal += 1;
            return errors
        }
        StyleGuideArray.forEach((value, index)=>{
            if (value.type == "string") {
                addValidationLog(`In ${runningId} formula: Checking String component at index: ${index}`);
                if (value.string == "") {
                    addErrorLog(`Non-Fatal Error in ${runningId} formula: Blank string value for the component at index ${index}`);
                    errors.total += 1;
                } else {
                    addValidationLog("String value confirmed");
                }
            } else if (value.type == "spec") {
                addValidationLog(`In ${runningId} formula: Checking attribute component at index: ${index}`)
                if (value.spec == "") {
                    addErrorLog(`Fatal Error in ${runningId} formula: Blank attribute value for the component at index ${index}`)
                    errors.total += 1;
                    errors.fatal += 1;
                } else {
                    addValidationLog("Attribute value confirmed")
                }
            } else if (value.type == "function") {
                addValidationLog(`In ${runningId} formula: Checking functional component at index ${index}`)
                //set nestedConditions array
                if (value.forAttribute == "") {
                    addErrorLog(`Fatal Error in ${runningId} formula: Parent attribute not declared for functional attribute call at index ${index}`)
                    errors.total += 1;
                    errors.fatal += 1;
                }
                let functionConditions = value.conditions;
                //loop through nested conditions
                addValidationLog("Beginning validation of functional conditions...")
                functionConditions.forEach((value, index)=>{
                    let conditionErrors = 0;
                    conditionErrors = FunctionalComponentConditionCheck(value, 0, index, runningId);
                    errors.total += conditionErrors.total;
                    errors.fatal += conditionErrors.fatal;
                })
                addValidationLog("Finished functional conditions validation!")
            } else {
                addErrorLog(`Unexpected component at index: ${index}`)
            }
        })
        return errors;
    }

    const FunctionalComponentConditionCheck = (conditionValue, parentLevel, incomingIndex, runningId) => {
        let errors = {total:0, fatal:0};
        let thisLevel = parentLevel + 1;
        addValidationLog(`Beginning validation for condition at level ${thisLevel} and index ${incomingIndex}`);
        //base case
        if (conditionValue.nestedConditions.length == 0) {
            //check basic values
            if (conditionValue.type !== "else") {
                if (conditionValue.call == "") {
                    addErrorLog(`Fatal Error in ${runningId} formula: null attribute call for condition at level ${thisLevel} and index ${incomingIndex}`);
                    errors.total += 1;
                    errors.fatal += 1;
                } else {
                    addValidationLog(`Valid attribute call found for condition at level ${thisLevel} and index ${incomingIndex}`)
                }
            }
            //insure that a return object exists
            setValidationLog("Checking for return object on end node")
            if (conditionValue.thenReturn) {
                addValidationLog("Return object was found!")
                //run return object validation -> only need to check spec call currently
                let returnObject = conditionValue.thenReturn
                if (returnObject.type == "returnSpec" && returnObject.call == "") {
                    addErrorLog(`Fatal Error in ${runningId} formula: return object has a null attribute call`);
                    errors.total += 1;
                    errors.fatal += 1;
                } else if (returnObject.type == "replaceAndReturn") {
                    if (returnObject.call == "") {
                        addErrorLog(`Fatal Error in ${runningId} formula: return object has a null attribute call`);
                        errors.total += 1;
                        errors.fatal += 1;
                    }
                    if (returnObject.find == "") {
                        addErrorLog(`Fatal Error in ${runningId} formula: return object has a null find call`);
                        errors.total += 1;
                        errors.fatal += 1;
                    }
                } else {
                    addValidationLog(`In ${runningId} formula: Return object validated!`);
                }
            } else {
                addErrorLog(`Fatal Error in ${runningId} formula: No return value designated at level ${thisLevel} and index ${incomingIndex}`);
                errors.total += 1;
                errors.fatal += 1;
            }
            return errors;
        }

        //non-base case
        setValidationLog('Nested Conditions were found!')
        if (conditionValue.type !== "else") {
            if (conditionValue.call == "") {
                addErrorLog(`Fatal Error in ${runningId} formula: null attribute call for condition at level ${thisLevel} and index ${incomingIndex}`)
                errors.total += 1;
                errors.fatal += 1;
            } else {
                addValidationLog(`Valid attribute call found for condition at level ${thisLevel} and index ${incomingIndex}`)
            }
        }
        let nestedArray = conditionValue.nestedConditions;
        setValidationLog('Beginning to validate nested conditions!')
        nestedArray.forEach((value, index)=>{
            let nestedErrors = 0
            nestedErrors = FunctionalComponentConditionCheck(value, thisLevel, index, runningId);
            errors.total += nestedErrors.total;
            errors.fatal += nestedErrors.fatal;
        })
        return errors;
    }

    //Validation and Error Log Entry functions

    const addValidationLog = (message) => {
        let log = validationLog;
        log.push(<tr key={"Entry-" + (log.length + 1)}><td>{message}</td></tr>)
        setValidationLog(log);
    }

    const addErrorLog = (message) => {
        let log = errorLog;
        log.push(<tr key={"Error-" + (log.length + 1)}><td>{message}</td></tr>)
        setErrorLog(log)
    }

    return (
        <div className="validation-overlay" onClick={()=>{props.setOverlay("")}}>
            <div className="validation-interface" onClick={(evt)=>{evt.stopPropagation()}}>
                <div className="result-container">
                    {errorCount == 0 
                    ? "Validation Complete! No Errors were found!"
                    : `Validation Complete! There were ${errorCount} errors found. Please see the error log.`}
                </div>
                {errorCount !== 0
                ?<div className="error-log">
                    <table>
                        <tbody><tr><th>Error Log</th></tr>{errorLog}</tbody>
                    </table>
                </div>
                :null}
                {validationCount !== 0
                ?<div className="validation-log">
                    <table>
                        <tbody><tr><th>Validation Log</th></tr>{validationLog}</tbody>
                    </table>
                </div>
                :null}
            </div>
        </div>
    )
}