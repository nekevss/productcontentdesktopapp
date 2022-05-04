const oldEvaluateCondition = (condition, level, pre) => {
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
        let tempString = level == "top" 
        ? "If &lt;" + condition.call + "&gt; contains " 
        : "&lt;" + condition.call + "&gt; contains ";
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


const oldEvaluateReturnGenerator = (incomingReturnGenerator, level, pre, last) => {
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