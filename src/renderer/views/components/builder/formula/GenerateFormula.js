// GenerateFormula is going to be the first and ideally only instance of a context object.
// 
// I've avoided using context where possible in favor of passing a config, because while it 
// seems to be the standard from what I've been able to tell over the course of some open 
// source contributions. I find it too abstract and always needing some type of context in 
// and of itself. When your context needs context, you're being too abstract. You know the 
// application config is global, but is a context scoped locally or globally? Who knows.
// I typically don't. I also didn't get a degree in comp sci...so I could just be wrong. 

// Context below refers to an object to be passed in with two distinct values
// {"Style Guide Builder": {...}, formulaTypes:{...}}
//
// Style Guide Builder should just carry over the values of the config object,
// so that's easy, but Formula Types will need to be looped over the config object
// and reassembled into nested objects...should be fun :)

export default function GenerateFormula(context, thisStyleGuide) {
    let returnGenerator = thisStyleGuide.returnGenerator;
    let lastCall = "";
    let formula = "";


    console.log("Here's the context for this formula generation")
    console.log(context);

    if (thisStyleGuide.type == "simple") {
        let thisGenerator = returnGenerator[0].thenReturn;
        formula = evaluateBuilder(context, thisGenerator, "");
    } else if (thisStyleGuide.type == "complex") {
        returnGenerator.forEach((value, index)=>{
            console.log(`Logging current formula for iteration: ${index}`)
            console.log(formula);
            console.log(value);
            let evaluatedObject = walkReturnGenerator(context, value, true, "", lastCall)
            lastCall = evaluatedObject.last;
            let evaluatedValue = evaluatedObject.output;
            formula += evaluatedValue;
        })
    } else {
        console.log(`Warning! Unexpected Style Guide type: ${thisStyleGuide.type}`)
    }

    return formula;
}

const walkReturnGenerator = (context, incomingReturnGenerator, isFirstLevel, pre, last) => {
    let output = "";
    let lastCall = last;
    let evaluatedObject = {};
    const formulaValues = context["Style Guide Builder"];
    const formulaTypes = context.formulaTypes;

    // console.log(`Here's last call in the lower level: ${last}`);

    let valid_ops = Object.keys(formulaTypes);

    if (valid_ops.includes(incomingReturnGenerator.type)) {
        let operationValues = formulaTypes[incomingReturnGenerator.type];

        if (incomingReturnGenerator.type != "else") {
            let tempString = isFirstLevel 
                ? formulaValues["Conditional SG Open"] + " " + formulaValues["Call Open"] + incomingReturnGenerator.spec + formulaValues["Call Close"] + operationValues.operator 
                :  pre + formulaValues["Call Open"] + incomingReturnGenerator.spec + formulaValues["Call Close"] + operationValues.operator;
            
            const SpecToSpec = ["equals", "notEquals","contains"];
            if (SpecToSpec.includes(incomingReturnGenerator.type)){
                tempString += formulaValues["Call Open"] + incomingReturnGenerator.ifCalled.join(formulaValues["Call Close"] + operationValues.returnGenJoinClause + formulaValues["Call Open"]) + formulaValues["Call Close"];
            } else {
                tempString += '"' + incomingReturnGenerator.ifCalled.join('"' + operationValues.returnGenJoinClause+'"') + '"';
            }
            
            if (incomingReturnGenerator.thenReturn) {
                tempString += formulaValues["Conditional SG Close"] + " ";
                lastCall = incomingReturnGenerator.spec;
                output += evaluateBuilder(context, incomingReturnGenerator.thenReturn, tempString);
                output += "<br><br>";
            } else if (!incomingReturnGenerator.nestedType && !incomingReturnGenerator.thenReturn) {
                //meant to verify if a leaf exists, but has not style guide on the end
                console.log("Found an empty Style Guide.")
                console.log(output)
                output += tempString + formulaValues["Conditional SG Close"] + " ";
            } else {
                let nestedConditions = incomingReturnGenerator.nestedConditions;
                tempString += incomingReturnGenerator.nestedType == "AND" ? " and " : " or ";
                // Debug prints. Keeping in case needed in the future
                //console.log(`Here's the output: ${output}`)
                //console.log(`Here's the pre: ${pre}`)
                //console.log(`Here's the tempString: ${tempString}`)
                nestedConditions.forEach((value)=>{
                    evaluatedObject = walkReturnGenerator(context, value, false, tempString, incomingReturnGenerator.spec)
                    lastCall = evaluatedObject.last
                    output += evaluatedObject.output
                })
            }
        } else {
            //handles "else" type

            let tempString = isFirstLevel
                ? incomingReturnGenerator.spec
                    ? formulaValues["Conditional SG Open"] + " " + formulaValues["Call Open"] + incomingReturnGenerator.spec + formulaValues["Call Close"] + operationValues.operator
                    : formulaValues["Conditional SG Open"] + " " + formulaValues["Call Open"] + lastCall + formulaValues["Call Close"] + operationValues.operator
                : incomingReturnGenerator.spec
                    ? pre + formulaValues["Call Open"] + incomingReturnGenerator.spec + formulaValues["Call Close"] + operationValues.operator
                    : pre + formulaValues["Call Open"] + lastCall + formulaValues["Call Close"] + operationValues.operator;
            if (incomingReturnGenerator.thenReturn) {
                tempString += formulaValues["Conditional SG Close"] + " ";
                output += evaluateBuilder(context, incomingReturnGenerator.thenReturn, tempString);
                output += "<br><br>";
            } else if (!incomingReturnGenerator.nestedType && !incomingReturnGenerator.thenReturn) {
                //meant to verify if a leaf exists, but has not style guide on the end
                output += tempString + formulaValues["Conditional SG Close"] + " ";
            } else {
                let nestedConditions = incomingReturnGenerator.nestedConditions;
                tempString += incomingReturnGenerator.nestedType == "AND" ? " and " : " or ";
                // Debug prints. Keeping in case needed in the future
                //console.log(`Here's the output: ${output}`)
                //console.log(`Here's the pre: ${pre}`)
                //console.log(`Here's the tempString: ${tempString}`)
                nestedConditions.forEach((value)=>{
                    evaluatedObject = walkReturnGenerator(context, value, false, tempString, incomingReturnGenerator.spec)
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



const evaluateBuilder = (context, incomingGen, pre) => {
    let output = pre;

    incomingGen.forEach((value, index)=>{
        if (value.type == "string") {
            output += value.string;
        } else if (value.type == "spec") {
            let thisValue = "";
            thisValue = context["Style Guide Builder"]["Call Open"] + value.spec;
            if (value.endString || value.leadString) {
                thisValue += " " + context["Style Guide Builder"]["Condition Phrase Open"];
                //separating these out for the addition of value.startString
                thisValue += context["Style Guide Builder"]["Present Attribute Phrase"]
                thisValue += value.leadString ? context["Style Guide Builder"]["Conditional String Keyword"] + '"' + value.leadString + '" ' + context["Style Guide Builder"]["Leading String Keyword"] : "";
                thisValue += value.leadString && value.endString ? " and" : "";
                thisValue += value.endString ? context["Style Guide Builder"]["Conditional String Keyword"] + '"' + value.endString + '" ' + context["Style Guide Builder"]["Subsequent String Keyword"] : "";
                thisValue += context["Style Guide Builder"]["Conditional Phrase Close"]
            }

            thisValue += context["Style Guide Builder"]["Call Close"];
            output += thisValue
        } else if (value.type == "function") {
            let thisValue = context["Style Guide Builder"]["Call Open"] + value.forAttribute + " " + context["Style Guide Builder"]["Condition Phrase Open"]
            let conditions = value.conditions;
            conditions.forEach((condition, index)=>{
                let conditionString = evaluateCondition(context, condition, value.forAttribute, true, "");
                thisValue += conditionString
            })
            thisValue = thisValue.trim() + context["Style Guide Builder"]["Conditional Phrase Close"] + context["Style Guide Builder"]["Call Close"];
            output += thisValue;
        } else {
            console.log("There was an unexpected sub-generator type")
        }
    })

    return output;
}

// Need a setup that allows us to pass conditional strings down and return values we expect
const evaluateCondition = (context, condition, parentAttribute, isFirstLevel, pre) => {
    let conditionString = pre;
    let tempString = "";
    const formulaTypes = context.formulaTypes;
    let valid_ops = Object.keys(formulaTypes);
    

    if (valid_ops.includes(condition.type)) {

        let operationValues = formulaTypes[condition.type];
        //console.log("Here's the operation values")
        //console.log(operationValues);
        if (condition.type != "else") {
            // Initiate the temporary string that stores the initial value of this evaluation
            tempString = parentAttribute === condition.call && context["Style Guide Builder"]["Assumptive Formula"]
                ? context["Style Guide Builder"]["Conditional Statement Keyword"] + operationValues.parentOp
                : isFirstLevel 
                    ? context["Style Guide Builder"]["Conditional Statement Keyword"] + " " + context["Style Guide Builder"]["Call Open"] + condition.call + context["Style Guide Builder"]["Call Close"] + operationValues.operator
                    : context["Style Guide Builder"]["Call Open"] + condition.call + context["Style Guide Builder"]["Call Close"] + operationValues.operator;

            const SpecToSpec = ["equals", "notEquals","contains"];

            // Add expected values to the temporary string that will be evaluated for
            // Will need to check if spec-spec comparison vs spec-value comparison 
            if (SpecToSpec.includes(condition.type)){
                tempString += context["Style Guide Builder"]["Call Open"] + condition.expectedValue.join(context["Style Guide Builder"]["Call Open"] + operationValues.conditionJoinClause + context["Style Guide Builder"]["Call Close"]) + context["Style Guide Builder"]["Call Close"];
            } else {
                tempString += condition.expectedValue.join(operationValues.conditionJoinClause);
            }
            
            if (condition.nestedType == "AND" || condition.nestedType == "OR") {
                let nestedConditions = condition.nestedConditions;
                nestedConditions.forEach((value, index)=>{
                    let nestedTemp = "";
                    nestedTemp = condition.nestedType == "AND" 
                        ? tempString + context["Style Guide Builder"]["Nested AND Phrase"] 
                        : tempString + context["Style Guide Builder"]["Nested OR Phrase"];
                    conditionString += evaluateCondition(context, value, parentAttribute, false, nestedTemp);
                })
            } else {
                tempString += parseReturnObject(context, condition.thenReturn, parentAttribute)
                conditionString += tempString;
            }
        } else {
            //if condition.type is else
            tempString = parentAttribute == condition.call && context["Style Guide Builder"]["Assumptive Formula"]
                    ? context["Style Guide Builder"]["Conditional Statement Keyword"] + " " + operationValues.parentOp
                    : isFirstLevel 
                        ? context["Style Guide Builder"]["Conditional Statement Keyword"] + " " + context["Style Guide Builder"]["Call Open"] + condition.call + context["Style Guide Builder"]["Call Close"] + operationValues.operator
                        : context["Style Guide Builder"]["Call Open"] + condition.call + context["Style Guide Builder"]["Call Close"] + operationValues.operator;
            if (condition.nestedType == "AND" || condition.nestedType == "OR") {
                let nestedConditions = condition.nestedConditions;
                nestedConditions.forEach((value, index)=>{
                    let nestedTemp = "";
                    nestedTemp = condition.nestedType == "AND" 
                        ? tempString + context["Style Guide Builder"]["Nested AND Phrase"] 
                        : tempString + context["Style Guide Builder"]["Nested OR Phrase"];
                    conditionString += evaluateCondition(context, value, parentAttribute, false, nestedTemp);
                })
            } else {
                if (condition.thenReturn.type == "returnSpec" && condition.thenReturn.call == parentAttribute && isFirstLevel) {
                    if (condition.thenReturn.endString.length !== 0 || condition.thenReturn.leadString.length !== 0) {
                        // Yes, this is nested. But have to validate this is a returnSpec to check endString and leadString
                        tempString += parseReturnObject(context, condition.thenReturn, parentAttribute);
                        conditionString += tempString;
                    }
                } else {
                    // May have to validate whether parseReturnObject is a valid addition
                    tempString += parseReturnObject(context, condition.thenReturn, parentAttribute);
                    conditionString += tempString;  
                }
            }
        }
    } else {
        console.log(`No valid operation found at ${condition.type}`)
    }

    return conditionString

}


const parseReturnObject = (context, returnObject, parentAttribute) => {
    let returnObjectString = "";

    if (!returnObject) {console.log("There was an error!!!"); return "*ERROR*"}
    if (returnObject.type == "returnString") {
        // In this section we create the string for when a string is to be returned.
        returnObjectString = returnObject.string !== "" 
            ? context["Style Guide Builder"]["Conditional Clause Separator"] + context["Style Guide Builder"]["Conditional String Keyword"] + ' "' + returnObject.string + '"' + context["Style Guide Builder"]["Statement Separator"] + " " 
            : context["Style Guide Builder"]["Conditional Clause Separator"] + context["Style Guide Builder"]["Return Blank Keyword"] + context["Style Guide Builder"]["Statement Separator"] + " ";
    } else if (returnObject.type == "returnSpec") {
        // This section is rather dense. Mainly it contains the logic the determines the string
        // for when an attribute is simply returned.
         // First we determine the wording for the attribute itself.
        returnObjectString = parentAttribute === returnObject.call && context["Style Guide Builder"]["Assumptive Return"]
            ? context["Style Guide Builder"]["Conditional Clause Separator"] + context["Style Guide Builder"]["Return Assumptive Phrase"]
            : context["Style Guide Builder"]["Conditional Clause Separator"] + " "+ context["Style Guide Builder"]["Return Call Keyword"] + " " + context["Style Guide Builder"]["Call Open"] + returnObject.call + context["Style Guide Builder"]["Call Close"];
        
        // Below commences the section that adds the wording for the leading and ending string.
        returnObjectString += returnObject.leadString 
            ? " " + context["Style Guide Builder"]["Conditional String Keyword"] + ' "' + returnObject.leadString + '" ' + context["Style Guide Builder"]["Leading String Keyword"] 
            : "";
        returnObjectString += returnObject.leadString && returnObject.endString 
            ? " and" 
            : "";
        returnObjectString += returnObject.endString !== "" 
            ? " " + context["Style Guide Builder"]["Conditional String Keyword"] + ' "' + returnObject.endString + '" '+ context["Style Guide Builder"]["Subsequent String Keyword"] + context["Style Guide Builder"]["Statement Separator"] + " "
            : context["Style Guide Builder"]["Statement Separator"] + " ";
    } else if (returnObject.type == "replaceAndReturn") {
        // First we determine the attribute wording
        returnObjectString = parentAttribute === returnObject.call && context["Style Guide Builder"]["Assumptive Return"]
            ? context["Style Guide Builder"]["Conditional Clause Separator"] + context["Style Guide Builder"]["Return Assumptive Phrase"]
            : context["Style Guide Builder"]["Conditional Clause Separator"] + " "+ context["Style Guide Builder"]["Return Call Keyword"] + " " + context["Style Guide Builder"]["Call Open"] + returnObject.call + context["Style Guide Builder"]["Call Close"];
        
        // This is the section specific to replace and return where we state the value that we find and the
        // value we replace with.
        returnObjectString += context["Style Guide Builder"]["Return Find Phrase"] + "\"" + returnObject.find + "\"";
        returnObjectString += context["Style Guide Builder"]["Return Replace Phrase"] + "\"" + returnObject.replace + "\"";
        // Below we determine the wording for the leading string and ending string.
        returnObjectString += returnObject.leadString 
            ? " " + context["Style Guide Builder"]["Conditional String Keyword"] + ' "' + returnObject.leadString + '" ' + context["Style Guide Builder"]["Leading String Keyword"] 
            : "";
        returnObjectString += returnObject.leadString && returnObject.endString 
            ? " and" 
            : "";
        returnObjectString += returnObject.endString !== "" 
            ? " " + context["Style Guide Builder"]["Conditional String Keyword"] + ' "' + returnObject.endString + '" '+ context["Style Guide Builder"]["Subsequent String Keyword"] + context["Style Guide Builder"]["Statement Separator"] + " "
            : context["Style Guide Builder"]["Statement Separator"] + " ";
    } else if (returnObject.type == "returnNull") {
        returnObjectString = context["Style Guide Builder"]["Conditional Clause Separator"] + context["Style Guide Builder"]["Return Error Phrase"] + context["Style Guide Builder"]["Statement Separator"] + " ";
    } else {
        console.log(`Unexpected returnObject type found: ${returnObject.type}`)
    }

    return returnObjectString
}