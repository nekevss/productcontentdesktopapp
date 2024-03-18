// # Style Guide formula generation
//
// generateFormula is going to be the first and ideally only instance of a context object.
// 
// I've avoided using context where possible in favor of passing a config, because while it 
// seems to be the standard from what I've been able to tell over the course of some open 
// source contributions. I find it too abstract and always needing some type of context in 
// and of itself. When your context needs context, you're being too abstract. You know the 
// application config is global, but is a context scoped locally or globally? Who knows.
// I typically don't. I also didn't get a degree in comp sci...so I could just be wrong. 
//
// Context below refers to an object to be passed in with two distinct values
// {"Style Guide Builder": {...}, formulaTypes:{...}}
//
// Style Guide Builder should just carry over the values of the config object,
// so that's easy, but Formula Types will need to be looped over the config object
// and reassembled into nested objects...should be fun :)
//
//
// Configuration Rules pertaining to formulas:
//   - Phrases can include spaces
//   - Keywords, Operators, and Separators are not responsible for their spaces.
//

function generateFormula(context, thisStyleGuide) {
    let skUNameAst = thisStyleGuide.skuNameAst;
    let lastCall = "";
    let formula = "";

    // console.log("Here's the context for this formula generation")
    // console.log(context);

    if (thisStyleGuide.type == "simple") {
        let thisBuilder = skUNameAst[0].tokens;
        formula = evaluateBuilder(context, thisBuilder, "");
    } else if (thisStyleGuide.type == "complex") {
        skUNameAst.forEach((value, index)=>{
            // console.log(`Logging current formula for iteration: ${index}`)
            // console.log(formula);
            // console.log(value);
            let evaluatedObject = walkSkuNameAst(context, value, true, "", lastCall)
            lastCall = evaluatedObject.last;
            let evaluatedValue = evaluatedObject.output;
            formula += evaluatedValue;
        })
    } else {
        console.log(`Warning! Unexpected Style Guide type: ${thisStyleGuide.type}`)
    }

    return formula;
}

const walkSkuNameAst = (context, incomingSkuNameAst, isFirstLevel, pre, last) => {
    let output = "";
    let lastCall = last;
    let evaluatedObject = {};
    const lexicalValues = context["Style Guide Builder"];
    const formulaTypes = context.formulaTypes;

    // console.log(`Here's last call in the lower level: ${last}`);

    let valid_ops = Object.keys(formulaTypes);

    if (valid_ops.includes(incomingSkuNameAst.type)) {
        let operationValues = formulaTypes[incomingSkuNameAst.type];

        if (incomingSkuNameAst.type != "else") {
            let tempString = isFirstLevel 
                ? lexicalValues["Conditional Guide Open Separator"] + " " + lexicalValues["Call Open Separator"] + incomingSkuNameAst.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator 
                :  pre + lexicalValues["Call Open Separator"] + incomingSkuNameAst.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator;
            
            const SpecToSpec = ["equals", "notEquals","contains"];
            if (SpecToSpec.includes(incomingSkuNameAst.type)){
                tempString += lexicalValues["Call Open Separator"] + incomingSkuNameAst.conditionTargets.join(lexicalValues["Call Close Separator"] + operationValues.returnGenJoinClause + lexicalValues["Call Open Separator"]) + lexicalValues["Call Close Separator"];
            } else {
                tempString += '"' + incomingSkuNameAst.conditionTargets.join('"' + operationValues.returnGenJoinClause+'"') + '"';
            }
            
            if (incomingSkuNameAst.tokens) {
                tempString += lexicalValues["Conditional Guide Close Separator"] + " ";
                lastCall = incomingSkuNameAst.attributeName;
                output += evaluateBuilder(context, incomingSkuNameAst.tokens, tempString);
                output += "<br><br>";
            } else if (!incomingSkuNameAst.nestedType && !incomingSkuNameAst.tokens) {
                //meant to verify if a leaf exists, but has not style guide on the end
                console.log("Found an empty Style Guide.")
                console.log(output)
                output += tempString + lexicalValues["Conditional Guide Close Separator"] + " ";
            } else {
                let nestedConditions = incomingSkuNameAst.nestedConditions;
                tempString += incomingSkuNameAst.nestedType == "AND" ? " and " : " or ";
                // Debug prints. Keeping in case needed in the future
                //console.log(`Here's the output: ${output}`)
                //console.log(`Here's the pre: ${pre}`)
                //console.log(`Here's the tempString: ${tempString}`)
                nestedConditions.forEach((value)=>{
                    evaluatedObject = walkSkuNameAst(context, value, false, tempString, incomingSkuNameAst.attributeName)
                    lastCall = evaluatedObject.last
                    output += evaluatedObject.output
                })
            }
        } else {
            //handles "else" type

            let tempString = isFirstLevel
                ? incomingSkuNameAst.attributeName
                    ? lexicalValues["Conditional Guide Open Separator"] + " " + lexicalValues["Call Open Separator"] + incomingSkuNameAst.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator + lexicalValues["Else Phrase"]
                    : lexicalValues["Conditional Guide Open Separator"] + " " + lexicalValues["Call Open Separator"] + lastCall + lexicalValues["Call Close Separator"] + operationValues.operator + lexicalValues["Else Phrase"]
                : incomingSkuNameAst.attributeName
                    ? pre + lexicalValues["Call Open Separator"] + incomingSkuNameAst.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator
                    : pre + lexicalValues["Call Open Separator"] + lastCall + lexicalValues["Call Close Separator"] + operationValues.operator;
            if (incomingSkuNameAst.tokens) {
                tempString += lexicalValues["Conditional Guide Close Separator"] + " ";
                output += evaluateBuilder(context, incomingSkuNameAst.tokens, tempString);
                output += "<br><br>";
            } else if (!incomingSkuNameAst.nestedType && !incomingSkuNameAst.tokens) {
                //meant to verify if a leaf exists, but has not style guide on the end
                output += tempString + lexicalValues["Conditional Guide Close Separator"] + " ";
            } else {
                let nestedConditions = incomingSkuNameAst.nestedConditions;
                tempString += incomingSkuNameAst.nestedType == "AND" ? " and " : " or ";
                // Debug prints. Keeping in case needed in the future
                //console.log(`Here's the output: ${output}`)
                //console.log(`Here's the pre: ${pre}`)
                //console.log(`Here's the tempString: ${tempString}`)
                nestedConditions.forEach((value)=>{
                    evaluatedObject = walkSkuNameAst(context, value, false, tempString, incomingSkuNameAst.attributeName)
                    lastCall = evaluatedObject.last
                    output += evaluatedObject.output
                })
            }
        }     
    } else {
        console.log(`Warning: unexpected skUNameAst type found: ${incomingSkuNameAst.type}`)
    }

    return {output: output, last: lastCall}

}



const evaluateBuilder = (context, incomingBuilder, pre) => {
    let output = pre;
    const lexicalValues = context["Style Guide Builder"];

    incomingBuilder.forEach((value, index)=>{
        if (value.type == "string") {
            output += value.string;
        } else if (value.type == "attribute") {
            let thisValue = "";

            if (value.commaLed) {
                thisValue += ", ";
            }
            
            thisValue += lexicalValues["Call Open Separator"] + value.attributeName;
            if (value.endString || value.leadString) {
                thisValue += " " + lexicalValues["Condition Open Separator"];
                // separating these out for the addition of value.startString
                thisValue += lexicalValues["Present Attribute Phrase"]

                if (value.leadString || value.endString) {
                    thisValue += " " + lexicalValues["Conditional Clause Separator"] + " "
                }

                if (value.leadString) {
                    thisValue += lexicalValues["Conditional String Keyword"] + ' "' + value.leadString + '" ' + lexicalValues["Leading String Keyword"]; 
                }

                if (value.endString) {
                    thisValue += value.leadString
                        ? " and " + lexicalValues["Conditional String Keyword"].toLowerCase() + ' "' + value.endString + '" ' + lexicalValues["Subsequent String Keyword"]
                        : lexicalValues["Conditional String Keyword"] + ' "' + value.endString + '" ' + lexicalValues["Subsequent String Keyword"];
                }

                thisValue += lexicalValues["Statement Separator"] + lexicalValues["Condition Close Separator"]
            }

            thisValue += lexicalValues["Call Close Separator"];
            output += thisValue
        } else if (value.type == "conditionalAttribute") {
            let thisValue = "";
            if (value.commaLed) {
                thisValue += ", "
            }

            thisValue += lexicalValues["Call Open Separator"] + value.rootAttribute + " " + lexicalValues["Condition Open Separator"]
            let conditions = value.conditions;
            conditions.forEach((condition, index)=>{
                let conditionString = evaluateCondition(context, condition, index, value.rootAttribute, true, "");
                thisValue += conditionString
            })

            // We trim here to remove the space after the period in ".)"
            thisValue = thisValue.trim() + lexicalValues["Condition Close Separator"] + lexicalValues["Call Close Separator"];
            output += thisValue;
        } else {
            console.warn("There was an unexpected sub-generator type")
        }
    })

    return output;
}

// Need a setup that allows us to pass conditional strings down and return values we expect
const evaluateCondition = (context, condition, conditionIndex, rootAttribute, isFirstLevel, pre) => {
    let conditionString = pre;
    let tempString = "";
    const formulaTypes = context.formulaTypes;
    const lexicalValues = context["Style Guide Builder"];
    let valid_ops = Object.keys(formulaTypes);
    

    if (valid_ops.includes(condition.type)) {

        let operationValues = formulaTypes[condition.type];
        //console.log("Here's the operation values")
        //console.log(operationValues);
        if (condition.type != "else") {
            // Initiate the temporary string that stores the initial value of this evaluation
            tempString = rootAttribute === condition.attributeName && lexicalValues["Assumptive Formula Flag"]
                ? lexicalValues["Conditional Statement Keyword"] + operationValues.assumptiveOperator
                : isFirstLevel 
                    ? lexicalValues["Conditional Statement Keyword"] + " " + lexicalValues["Call Open Separator"] + condition.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator
                    : lexicalValues["Call Open Separator"] + condition.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator;

            const SpecToSpec = ["equals", "notEquals","contains"];

            // Add expected values to the temporary string that will be evaluated for
            // Will need to check if spec-spec comparison vs spec-value comparison 
            if (SpecToSpec.includes(condition.type)){
                tempString += lexicalValues["Call Open Separator"] + condition.conditionTargets.join(lexicalValues["Call Open Separator"] + operationValues.conditionJoinClause + lexicalValues["Call Close Separator"]) + lexicalValues["Call Close Separator"];
            } else {
                tempString += condition.conditionTargets.join(operationValues.conditionJoinClause);
            }
            
            if (condition.nestedType == "AND" || condition.nestedType == "OR") {
                let nestedConditions = condition.nestedConditions;
                nestedConditions.forEach((value, index)=>{
                    let nestedTemp = "";
                    nestedTemp = condition.nestedType == "AND" 
                        ? tempString + lexicalValues["Nested AND Phrase"] 
                        : tempString + lexicalValues["Nested OR Phrase"];
                    conditionString += evaluateCondition(context, value, index, rootAttribute, false, nestedTemp);
                })
            } else {
                tempString += parseReturnObject(context, condition.conditionOutput, rootAttribute)
                conditionString += tempString;
            }
        } else {
            // if condition.type is else
            // FIrst check involves checking a contiditional attribute with an immediate else statement.
            tempString = conditionIndex === 0
                ? lexicalValues["Present Attribute Phrase"]
                : rootAttribute == condition.attributeName && lexicalValues["Assumptive Formula Flag"]
                    ? lexicalValues["Conditional Statement Keyword"] + operationValues.assumptiveOperator + lexicalValues["Else Phrase"]
                    : isFirstLevel 
                        ? lexicalValues["Conditional Statement Keyword"] + " " + lexicalValues["Call Open Separator"] + condition.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator + lexicalValues["Else Phrase"]
                        : lexicalValues["Call Open Separator"] + condition.attributeName + lexicalValues["Call Close Separator"] + operationValues.operator + lexicalValues["Else Phrase"]
            if (condition.nestedType == "AND" || condition.nestedType == "OR") {
                let nestedConditions = condition.nestedConditions;
                nestedConditions.forEach((value, index)=>{
                    let nestedTemp = "";
                    nestedTemp = condition.nestedType == "AND" 
                        ? tempString + lexicalValues["Nested AND Phrase"] 
                        : tempString + lexicalValues["Nested OR Phrase"];
                    conditionString += evaluateCondition(context, value, index, rootAttribute, false, nestedTemp);
                })
            } else {
                if (condition.conditionOutput.type == "returnSpec" && condition.conditionOutput.attributeName == rootAttribute && isFirstLevel) {
                    if (condition.conditionOutput.endString.length !== 0 || condition.conditionOutput.leadString.length !== 0) {
                        // Yes, this is nested. But have to validate this is a returnSpec to check endString and leadString
                        tempString += parseReturnObject(context, condition.conditionOutput, rootAttribute);
                        conditionString += tempString;
                    }
                } else {
                    // May have to validate whether parseReturnObject is a valid addition
                    tempString += parseReturnObject(context, condition.conditionOutput, rootAttribute);
                    conditionString += tempString;  
                }
            }
        }
    } else {
        console.log(`No valid operation found at ${condition.type}`)
    }

    return conditionString

}


const parseReturnObject = (context, returnObject, rootAttribute) => {
    let returnObjectString = "";
    const lexicalValues = context["Style Guide Builder"];

    if (!returnObject) {console.log("There was an error!!!"); return "*ERROR*"}
    if (returnObject.type == "returnString") {
        // In this section we create the string for when a string is to be returned.
        returnObjectString = returnObject.string !== "" 
            ? " " + lexicalValues["Conditional Clause Separator"] + " " + lexicalValues["Conditional String Keyword"] + ' "' + returnObject.string + '"' + lexicalValues["Statement Separator"] + " " 
            : " " + lexicalValues["Conditional Clause Separator"] + " " + lexicalValues["Return Blank Keyword"] + lexicalValues["Statement Separator"] + " ";
    } else if (returnObject.type == "returnSpec") {
        // This section is rather dense. Mainly it contains the logic the determines the string
        // for when an attribute is simply returned.
        //
        // First we determine the wording for the attribute itself.
        // NOTE: Assumptive Return Flag is not a lexical string value, but a boolean that determines a lexical setting
        returnObjectString = rootAttribute === returnObject.attributeName && lexicalValues["Assumptive Return Flag"]
            ? " " + lexicalValues["Conditional Clause Separator"] + " " + lexicalValues["Return Assumptive Phrase"]
            : " " + lexicalValues["Conditional Clause Separator"] + " " + lexicalValues["Return Attribute Call Keyword"] + " " + lexicalValues["Call Open Separator"] + returnObject.attributeName + lexicalValues["Call Close Separator"];
        
        if (returnObject.leadString || returnObject.endString) {
            returnObjectString += " and ";
        }

        // Below commences the section that adds the wording for the leading and ending string.
        returnObjectString += returnObject.leadString 
            ? lexicalValues["Conditional String Keyword"].toLowerCase() + ' "' + returnObject.leadString + '" ' + lexicalValues["Leading String Keyword"] 
            : "";
        
        // Handle adding the endstring if it exists.
        if (returnObject.endString) {
            returnObjectString += returnObject.leadString
                ? " and " + lexicalValues["Conditional String Keyword"].toLowerCase() + ' "' + returnObject.endString + '" '+ lexicalValues["Subsequent String Keyword"]
                : lexicalValues["Conditional String Keyword"].toLowerCase() + ' "' + returnObject.endString + '" '+ lexicalValues["Subsequent String Keyword"]
        }

        // Add statement separator
        returnObjectString += lexicalValues["Statement Separator"] + " ";
    } else if (returnObject.type == "replaceAndReturn") {
        // First we determine the attribute wording
        returnObjectString = rootAttribute === returnObject.attributeName && lexicalValues["Assumptive Return Flag"]
            ? " " + lexicalValues["Conditional Clause Separator"] + " " + lexicalValues["Return Assumptive Phrase"]
            : " " + lexicalValues["Conditional Clause Separator"] + " " + lexicalValues["Return Attribute Call Keyword"] + " " + lexicalValues["Call Open Separator"] + returnObject.attributeName + lexicalValues["Call Close Separator"];
        
        // This is the section specific to replace and return where we state the value that we find and the
        // value we replace with.
        returnObjectString += lexicalValues["Return Find Phrase"] + "\"" + returnObject.find + "\"";
        returnObjectString += lexicalValues["Return Replace Phrase"] + "\"" + returnObject.replace + "\"";
        // Below we determine the wording for the leading string and ending string.
        returnObjectString += returnObject.leadString 
            ? " " + lexicalValues["Conditional String Keyword"] + ' "' + returnObject.leadString + '" ' + lexicalValues["Leading String Keyword"] 
            : "";

        returnObjectString += returnObject.leadString && returnObject.endString 
            ? " and" 
            : "";

        returnObjectString += returnObject.endString !== "" 
            ? " " + lexicalValues["Conditional String Keyword"] + ' "' + returnObject.endString + '" '+ lexicalValues["Subsequent String Keyword"] + lexicalValues["Statement Separator"] + " "
            : lexicalValues["Statement Separator"] + " ";

    } else if (returnObject.type == "returnNull") {
        returnObjectString = lexicalValues["Conditional Clause Separator"] + lexicalValues["Return Error Phrase"] + lexicalValues["Statement Separator"] + " ";
    } else {
        console.log(`Unexpected returnObject type found: ${returnObject.type}`)
    }

    return returnObjectString
}

module.exports = { generateFormula };
