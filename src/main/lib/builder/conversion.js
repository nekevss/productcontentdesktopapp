// Going from the 2.0 -> 3.0 version, there will be a change in the 
// structure/API of the builder ASTs. As a result, all the assets that
// we're created and "registered" under 2.0 will need to be converted
// to the new API.
//
// Once old assets are converted over, this function can be removed.

// NOTE: In hindsight, probably should've just created a walk function that took a callback function and ran it...
// but whatever.

function mapBuilderObject(oldObject) {
    
    // First, let's bring over the stable fields
    let newItem = {
        class: oldObject.class,
        type: oldObject.type,
        skuNameAst: []
    };


    // before assigning the value, we need to convert it.
    let newAst = mapToSkuNameAst(oldObject.returnGenerator);

    newItem.skuNameAst = newAst;

    return newItem;
}

function mapToSkuNameAst(oldReturnGeneratorArray) {
    // SKU Name ASTs function with an array of wrapping objects that represent a decision tree moving to
    // a set of tokens. In theory, we should be able to convert recursively.
    const newAstArray = oldReturnGeneratorArray.map((oldItem)=> {
        if (oldItem.type === "else") {
            let newItem = {
                type: "else",
            }

            // Else cards can come with all field options or a default of just { type, tokens };
            if (oldItem.spec) {
                newItem["attributeName"] = oldItem.spec;
                newItem["conditionTargets"] = oldItem.ifCalled;
                newItem["nestedType"] = oldItem.nestedType;
                
                if (oldItem.nestedConditions.length > 0) {
                    newItem["nestedConditions"] = mapToSkuNameAst(oldItem.nestedConditions);
                } else {
                    newItem["nestedConditions"] = [];
                }
            }
            
            if (oldItem.thenReturn) {
                let newTokens = mapToTokens(oldItem.thenReturn);
                newItem.tokens = newTokens
            }

            return newItem;
        } else {
            let newItem = {
                type: oldItem.type,
                attributeName: oldItem.spec,
                nestedType: oldItem.nestedType,
                conditionTargets: oldItem.ifCalled,
                nestedConditions: []
            };

            if (oldItem.nestedConditions.length > 0) {
                let convertedNested = mapToSkuNameAst(oldItem.nestedConditions);
                newItem.nestedConditions = convertedNested;
            };

            if (oldItem.thenReturn) {
                let newTokens = mapToTokens(oldItem.thenReturn);
                newItem["tokens"] = newTokens;
            }

            return newItem;
        }

    })

    return newAstArray;
}

function mapToTokens(oldThenReturnArray) {
    // Converting the tokens array is primarily concerned with the changes around 
    // the new "attribute" and "conditionalAttribute".
    //console.log(oldThenReturnArray);

    const newTokensArray = oldThenReturnArray.map((item)=>{
        if (item.type === "spec") {
            let newItem = {
                type: "attribute",
                attributeName: item.spec,
                leadString: item.leadString,
                endString: item.endString,
                report: item.report,
                commaLed: item.commaLed ? item.commaLed : false
            };

            return newItem;
        } else if (item.type === "function") {
            let newItem = {
                type: "conditionalAttribute",
                rootAttribute: item.forAttribute,
                report: item.report,
                commaLed: item.commaLed ? item.commaLed : false,
                conditions: []
            };

            let newConditions = convertAttributeConditions(item.conditions);

            newItem.conditions = newConditions;

            return newItem;
        } else {
            return item;
        }
    })

    return newTokensArray
}

function convertAttributeConditions(oldConditionsArray) {
    const newConditionArray = oldConditionsArray.map((condition)=>{
        let newCondition = { 
            type: condition.type,
            attributeName: condition.call,
            conditionTargets: condition.expectedValue,
            nestedType: condition.nestedType,
            nestedConditions: []
        };

        if (condition.nestedConditions.length > 0) {
            let newNested = convertAttributeConditions(condition.nestedConditions)
            newCondition.nestedConditions = newNested;
        }

        if (condition.thenReturn) {
            // Need to double check that the return objects weren't altered.
            let newOutput = convertToConditionOutput(condition.thenReturn);
            newCondition["conditionOutput"] = newOutput;
        }

        return newCondition;
    })

    return newConditionArray
}

function convertToConditionOutput(returnObject) {
    if (returnObject.type === "returnSpec") {
        return {
            type: "returnSpec",
            attributeName: returnObject.call,
            leadString: returnObject.leadString,
            endString: returnObject.endString
        }
    } else if (returnObject.type === "replaceAndReturn") {
        return {
            type: "replaceAndReturn",
            attributeName: returnObject.call,
            find: returnObject.find,
            replace: returnObject.replace,
            leadString: returnObject.leadString,
            endString: returnObject.endString
        }
    } else {
        return returnObject
    }
}

module.exports = { mapBuilderObject }
