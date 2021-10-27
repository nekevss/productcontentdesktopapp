import {formulaTypes} from "./formulaTypes.js"

export default function GenerateFormula(thisStyleGuide) {
    let returnGenerator = thisStyleGuide.returnGenerator;
    let lastCall = "";
    let formula = "";

    if (thisStyleGuide.type == "simple") {
        let thisGenerator = returnGenerator[0].thenReturn;
        formula = evaluateGenerator(thisGenerator, "");
    } else if (thisStyleGuide.type == "complex") {
        returnGenerator.forEach((value, index)=>{
            console.log(`Logging current formula for iteration: ${index}`)
            console.log(formula);
            console.log(value);
            let evaluatedObject = evaluateReturnGenerator(value, "top", "", lastCall)
            lastCall = evaluatedObject.last;
            let evaluatedValue = evaluatedObject.output;
            formula += evaluatedValue;
        })
    } else {
        console.log(`Warning! Unexpected Style Guide type: ${thisStyleGuide.type}`)
    }

    return formula;
}

const evaluateReturnGenerator = (incomingReturnGenerator, level, pre, last) => {
    let output = "";
    let lastCall = last;
    let evaluatedObject = {};
    console.log(`Here's last call in the lower level: ${last}`);

    let valid_ops = Object.keys(formulaTypes);

    if (valid_ops.includes(incomingReturnGenerator.type)) {
        let opValues = formulaTypes[incomingReturnGenerator.type];

        if (incomingReturnGenerator.type != "else") {
            let tempString = level == "top" 
                ? "[IF &lt;" + incomingReturnGenerator.spec + "&gt;" + opValues.operand 
                :  pre + "&lt;" + incomingReturnGenerator.spec + "&gt;" + opValues.operand;
            tempString += '"' + incomingReturnGenerator.ifCalled.join(opValues.returnGenJoinClause) + '"';
            if (incomingReturnGenerator.thenReturn) {
                tempString += "]: ";
                lastCall = incomingReturnGenerator.spec;
                output += evaluateGenerator(incomingReturnGenerator.thenReturn, tempString);
                output += "<br><br>";
            } else if (!incomingReturnGenerator.nestedType && !incomingReturnGenerator.thenReturn) {
                //meant to verify if a leaf exists, but has not style guide on the end
                console.log("Found an empty Style Guide.")
                console.log(output)
                output += tempString + "]: "
            } else {
                let nestedConditions = incomingReturnGenerator.nestedConditions;
                tempString += incomingReturnGenerator.nestedType == "AND" ? " and " : " or ";
                console.log(`Here's the output: ${output}`)
                console.log(`Here's the pre: ${pre}`)
                console.log(`Here's the tempString: ${tempString}`)
                nestedConditions.forEach((value)=>{
                    evaluatedObject = evaluateReturnGenerator(value, "lower", tempString, incomingReturnGenerator.spec)
                    lastCall = evaluatedObject.last
                    output += evaluatedObject.output
                })
            }
        } else {
            //handles "else" type

            let tempString = level == "top" 
                ? incomingReturnGenerator.spec
                    ? "[If &lt;" + incomingReturnGenerator.spec + "&gt;" + opValues.operand
                    : "[If &lt;" + lastCall + "&gt;" + opValues.operand
                : incomingReturnGenerator.spec
                    ? pre + "&lt;" + incomingReturnGenerator.spec + "&gt;" + opValues.operand
                    : pre + "&lt;" + lastCall + "&gt;" + opValues.operand;
            if (incomingReturnGenerator.thenReturn) {
                tempString += "]: ";
                output += evaluateGenerator(incomingReturnGenerator.thenReturn, tempString);
                output += "<br><br>";
            } else if (!incomingReturnGenerator.nestedType && !incomingReturnGenerator.thenReturn) {
                //meant to verify if a leaf exists, but has not style guide on the end
                output += tempString + "]: "
            } else {
                let nestedConditions = incomingReturnGenerator.nestedConditions;
                tempString += incomingReturnGenerator.nestedType == "AND" ? " and " : " or ";
                console.log(`Here's the output: ${output}`)
                console.log(`Here's the pre: ${pre}`)
                console.log(`Here's the tempString: ${tempString}`)
                nestedConditions.forEach((value)=>{
                    evaluatedObject = evaluateReturnGenerator(value, "lower", tempString, incomingReturnGenerator.spec)
                    lastCall = evaluatedObject.last
                    output += evaluatedObject.output
                })
            }
        }     
    } else {
        console.log(`Warning: unexpected returnGenerator type found: ${incomingReturnGenerator.type}`)
    }

    return {output: output, last: lastCall}

}



const evaluateGenerator = (incomingGen, pre) => {
    let output = pre;

    incomingGen.forEach((value, index)=>{
        if (value.type == "string") {
            output += value.string;
        } else if (value.type == "spec") {
            let thisValue = "";
            thisValue = "&lt;" + value.spec;
            if (value.endString || value.leadString) {
                thisValue += " ("
                //separating these out for the addition of value.startString
                thisValue += 'If Applicable,'
                thisValue += value.leadString ? ' include "' + value.leadString + '" before' : "";
                thisValue += value.leadString && value.endString ? " and" : "";
                thisValue += value.endString ? ' include "' + value.endString + '" after' : "";
                thisValue += ")"
            }

            thisValue += "&gt;";
            output += thisValue
        } else if (value.type == "function") {
            let thisValue = "&lt;" + value.forAttribute + " ("
            let conditions = value.conditions;
            conditions.forEach((condition, index)=>{
                let conditionString = evaluateCondition(condition, value.forAttribute, "top", "");
                thisValue += conditionString
            })
            thisValue = thisValue.trim() + ")&gt;";
            thisValue = thisValue.replace(".)&gt;", ")&gt;");
            output += thisValue;
        } else {
            console.log("There was an unexpected sub-generator type")
        }
    })

    return output;
}

const evaluateCondition = (condition, parentAttribute, level, pre) => {
    let conditionString = pre;
    let tempString = "";
    let valid_ops = Object.keys(formulaTypes);
    

    if (valid_ops.includes(condition.type)) {
        let opValues = formulaTypes[condition.type];
        console.log("Here's the operation values")
        console.log(opValues);
        if (condition.type != "else") {
            tempString = parentAttribute == condition.call
                ? "If" + opValues.parentOp
                : level == "top" 
                    ? "If &lt;" + condition.call + "&gt; " + opValues.operand
                    : "&lt;" + condition.call + "&gt; " + opValues.operand;
            tempString +=  condition.expectedValue.join(opValues.conditionJoinClause);
            if (condition.nestedType == "AND" || condition.nestedType == "OR") {
                let nestedConditions = condition.nestedConditions;
                nestedConditions.forEach((value, index)=>{
                    let nestedTemp = "";
                    nestedTemp = condition.nestedType == "AND" ? tempString + " AND " : tempString + " OR "; ;
                    conditionString += evaluateCondition(value, parentAttribute, "lower", nestedTemp);
                })
            } else {
                tempString += parseReturnObject(condition.thenReturn, parentAttribute)
                conditionString += tempString;
            }
        } else {
            //if condition.type is else
            tempString = parentAttribute == condition.call
                    ? "If" + opValues.parentOp
                    : level == "top" 
                        ? "If &lt;" + condition.call + "&gt;" + opValues.operand
                        : " &lt;" + condition.call + "&gt;" + opValues.operand;
            if (condition.nestedType == "AND" || condition.nestedType == "OR") {
                let nestedConditions = condition.nestedConditions;
                nestedConditions.forEach((value, index)=>{
                    let nestedTemp = "";
                    nestedTemp = condition.nestedType == "AND" ? tempString + " AND " : tempString + " OR "; ;
                    conditionString += evaluateCondition(value, parentAttribute, "lower", nestedTemp);
                })
            } else {
                if (condition.thenReturn.type == "returnSpec" && condition.thenReturn.call == parentAttribute) {
                    if (condition.thenReturn.endString.length !== 0 || condition.thenReturn.leadString.length !== 0) {
                        //Yes, this is nested. But have to validate this is a returnSpec to check endString and leadString
                        tempString += parseReturnObject(condition.thenReturn, parentAttribute);
                        conditionString += tempString;
                    }
                } else {
                    tempString += parseReturnObject(condition.thenReturn, parentAttribute);
                    conditionString += tempString;  
                }
            }
        }
    } else {
        console.log(`No valid operation found at ${condition.type}`)
    }

    return conditionString

}


const parseReturnObject = (returnObject, parentAttribute) => {
    let returnObjectString = "";
    if (!returnObject) {console.log("There was an error!!!"); return "*ERROR*"}
    if (returnObject.type == "returnString") {
        returnObjectString = returnObject.string !== "" 
            ? ', include "' + returnObject.string + '". ' 
            : ", Leave Blank. ";
    } else if (returnObject.type == "returnSpec") {
        returnObjectString = parentAttribute === returnObject.call 
            ? "," 
            : ", return &lt;" + returnObject.call + '&gt;';
        returnObjectString += returnObject.leadString 
            ? ' include "' + returnObject.leadString + '" before' 
            : "";
        returnObjectString += returnObject.leadString && returnObject.endString 
            ? " and" 
            : "";
        returnObjectString += returnObject.endString !== "" 
            ? ' include "' + returnObject.endString + '" after. ' 
            : ". ";
    } else if (returnObject.type == "returnNull") {
        returnObjectString = ", return error. ";
    } else {
        console.log(`Unexpected returnObject type found: ${returnObject.type}`)
    }

    return returnObjectString
}