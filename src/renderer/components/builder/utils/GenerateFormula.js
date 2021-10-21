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
            console.log(`Here's last call in the top level ${evaluatedObject.last}`)
            console.log(evaluatedObject)
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
    console.log(`Here's last call in the lower level: ${last}`)

    //LOL there has to be a better way to do this. Can't figure it out currently...maybe nested terenaries?
    if (incomingReturnGenerator.type == "if") {
        let tempString = level == "top" 
            ? "[IF &lt;" + incomingReturnGenerator.spec + "&gt; = " 
            :  pre + "&lt;" + incomingReturnGenerator.spec + "&gt; = ";
        tempString += '"' + incomingReturnGenerator.ifCalled.join('", "') + '"';
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
    } else if (incomingReturnGenerator.type == "ifNot") {
        let tempString = level == "top" 
            ? "[IF &lt;" + incomingReturnGenerator.spec + "&gt; != " 
            : pre + "&lt;" + incomingReturnGenerator.spec + "&gt; != ";
        tempString += '"' + incomingReturnGenerator.ifCalled.join('", "') + '"';
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
            nestedConditions.forEach((value)=>{
                evaluatedObject = evaluateReturnGenerator(value, "lower", tempString, incomingReturnGenerator.spec)
                lastCall = evaluatedObject.last
                output += evaluatedObject.output
            })
        }
    } else if (incomingReturnGenerator.type == "includes") {
        let tempString = level == "top" 
            ? "[IF &lt;" + incomingReturnGenerator.spec + "&gt; includes " 
            : pre + "&lt;" + incomingReturnGenerator.spec + "&gt; includes ";
        tempString += '"' + incomingReturnGenerator.ifCalled.join('", "') + '"';
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
            nestedConditions.forEach((value)=>{
                evaluatedObject = evaluateReturnGenerator(value, "lower", tempString, incomingReturnGenerator.spec)
                lastCall = evaluatedObject.last
                output += evaluatedObject.output
            })
        }
    } else if (incomingReturnGenerator.type == "equals") {
        let tempString = level == "top" 
            ? "[IF &lt;" + incomingReturnGenerator.spec + "&gt; = " 
            : pre + "&lt;" + incomingReturnGenerator.spec + "&gt; = ";
        tempString += '&lt;' + incomingReturnGenerator.ifCalled.join('&gt;, &lt;') + '&gt;';
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
            nestedConditions.forEach((value)=>{
                evaluatedObject = evaluateReturnGenerator(value, "lower", tempString, incomingReturnGenerator.spec)
                lastCall = evaluatedObject.last
                output += evaluatedObject.output
            })
        }
    } else if (incomingReturnGenerator.type == "notEquals") {
        let tempString = level == "top" 
            ? "[If &lt;" + incomingReturnGenerator.spec + "&gt; != " 
            : pre + "&lt;" + incomingReturnGenerator.spec + "&gt; != ";
        tempString += '&lt;' + incomingReturnGenerator.ifCalled.join('&gt;, &lt;') + '&gt;';
        if (incomingReturnGenerator.thenReturn) {
            tempString += "]: ";
            lastCall = incomingReturnGenerator.spec;
            output += evaluateGenerator(incomingReturnGenerator.thenReturn, tempString);
            output += "<br><br>";
        } else if (!incomingReturnGenerator.nestedType && !incomingReturnGenerator.thenReturn) {
            //meant to verify if a leaf exists, but has not style guide on the end
            output += tempString + "]: "
        } else {
            let nestedConditions = incomingReturnGenerator.nestedConditions;
            tempString += incomingReturnGenerator.nestedType == "AND" ? " and " : " or ";
            nestedConditions.forEach((value)=>{
                evaluatedObject = evaluateReturnGenerator(value, "lower", tempString, incomingReturnGenerator.spec)
                lastCall = evaluatedObject.last
                output += evaluatedObject.output
            })
        }
    } else if (incomingReturnGenerator.type == "else") {
        let tempString = level == "top" 
            ? incomingReturnGenerator.spec
                ? "[If &lt;" + incomingReturnGenerator.spec + "&gt; = All Other Values" 
                : "[If &lt;" + lastCall + "&gt; = All Other Values" 
            : incomingReturnGenerator.spec
                ? pre + "&lt;" + incomingReturnGenerator.spec + "&gt; =  All Other Values "
                : pre + "&lt;" + lastCall + "&gt; = All Other Values ";
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
                let conditionString = evaluateCondition(condition, "top", "");
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

const evaluateCondition = (condition, level, pre) => {
    //first step -> set string from the declared pre-existing
    let conditionString = pre;
    //second step -> iterate through types to determine central operator

    if (condition.type == "if") {
        let tempString = level == "top" ? "If &lt;" + condition.call + "&gt; = ": "&lt;" + condition.call + "&gt; = ";
        tempString +=  condition.expectedValue.join(', ');
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn)
            conditionString += tempString;
        }
    } else if (condition.type == "ifNull") {
        let tempString = level == "top" ? "If &lt;" + condition.call + "&gt; is null": "&lt;" + condition.call + "&gt; is null";
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn)
            conditionString += tempString;
        }
    } else if (condition.type == "ifNot") {
        let tempString = level == "top" ? "If &lt;" + condition.call + "&gt; != ": "&lt;" + condition.call + "&gt; != ";
        console.log(condition.expectedValue);
        tempString += condition.expectedValue.join(', ');
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn)
            conditionString += tempString;
        }
    } else if (condition.type == "includes") {
        let tempString = level == "top" ? "If &lt;" + condition.call + "&gt;  includes " : "&lt;" + condition.call + "&gt;  includes ";
        tempString += condition.expectedValue.join(', ');
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn)
            conditionString += tempString;
        }
    } else if (condition.type == "equals") {
        let tempString = level == "top" ? "If &lt;" + condition.call + "&gt; = " : "&lt;" + condition.call + "&gt; = ";
        tempString += '&lt;' + condition.expectedValue.join('&gt; or &lt;') + '&gt;';
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn)
            conditionString += tempString;
        }
    } else if (condition.type == "notEquals") {
        let tempString = level == "top" ? "If &lt;" + condition.call + "&gt; != " : "&lt;" + condition.call + "&gt; != ";
        tempString += '&lt;' + condition.expectedValue.join('&gt; or &lt;') + '&gt;';
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn)
            conditionString += tempString;
        }
    } else if (condition.type == "contains") {
        let tempString = level == "top" ? "If &lt;" + condition.call + "&gt; contains " : "&lt;" + condition.call + "&gt; contains ";
        tempString += '&lt;' + condition.expectedValue.join('&gt; or &lt;') + '&gt;';
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn)
            conditionString += tempString;
        }
    } else if (condition.type == "else") {
        let tempString = condition.call ? "If &lt;" + condition.call + "&gt; = All Other Values" : " If All Other Values";
        if (condition.nestedType == "AND" || condition.nestedType == "OR") {
            let nestedConditions = condition.nestedConditions;
            nestedConditions.forEach((value, index)=>{
                let nestedTemp = "";
                nestedTemp = condition.nestedType == "AND" ? tempString + " and " : tempString + " or "; ;
                conditionString += evaluateCondition(value, "lower", nestedTemp);
            })
        } else {
            tempString += parseReturnObject(condition.thenReturn);
            conditionString += tempString;
        }
        
    } else {
        console.log(`Warning unexpected condition type found: ${condition.type}`)
    }

    return conditionString
}

const parseReturnObject = (returnObject) => {
    let returnObjectString = "";
    if (!returnObject) {console.log("There was an error!!!"); return "*ERROR*"}
    if (returnObject.type == "returnString") {
        returnObjectString = returnObject.string !== "" ? ', include "' + returnObject.string + '". ' : ", Leave Blank. ";
    } else if (returnObject.type == "returnSpec") {
        returnObjectString = ", return &lt;" + returnObject.call + '&gt;';
        returnObjectString += returnObject.leadString ? ' include "' + returnObject.leadString + '" before' : "";
        returnObjectString += returnObject.leadString && returnObject.endString ? " and" : "";
        returnObjectString += returnObject.endString !== "" ? ' include "' + returnObject.endString + '" after. '  : ". ";
    } else if (returnObject.type == "returnNull") {
        returnObjectString = ", return error. ";
    } else {
        console.log(`Unexpected returnObject type found: ${returnObject.type}`)
    }

    return returnObjectString
}