const oldEvaluateConditionals() => {
    
    //else is base case
    if (thisType == "else") {
        if (spec) {
            if (conditional.thenReturn) {
                return conditional.thenReturn
            }
            let nestedConditions = conditional.nestedConditions;
            if (nestedConditions.length > 0) {
                for (let nestedCondition of nestedConditions) {
                    let output = evaluateConditionals(nestedCondition, thisSku, config);
        
                    if (output) {
                        return output
                    }
                }
            }
        }
        return null
    }

    //run ifNull check prior to the running the error value check
    if (thisType == "ifNull") {
        if (conditional.nestedType == "AND") {
            if (!spec) {
                console.log(`${conditional.call} is null!`)
                let nestedConditions = conditional.nestedConditions;
                for (let nestedCondition of nestedConditions) {
                    let output = evaluateConditionals(nestedCondition, thisSku, config);

                    if (output) {
                        return output
                    }
                }
            }
            return null
        }
        if (conditional.nestedType == "OR") {
            let passedTest = passed;
            //run type check
            if (!spec) {
                activeWindow.webContents.send("console-log",`${conditional.call} is null!`)
                passedTest = true;
            }
            let nestedConditions = conditional.nestedConditions;
            for (let nestedCondition of nestedConditions) {
                let output = evaluateConditionals(nestedCondition, thisSku, config, passedTest);

                if (output) {
                    return output
                }
            }
        }

        if (!spec) {
            //should i check for empty string?
            activeWindow.webContents.send("console-log",`${conditional.call} is null!`)
            return conditional.thenReturn;
        }
        return null
    }

    //run for error, prior to the below
    if (!spec) {return null}

    if (thisType == "if") {
        let expectedValues = conditional.expectedValue;
        if (conditional.nestedType == "AND") {
            if (expectedValues.includes(spec)) {
                activeWindow.webContents.send("console-log",`${spec} has been found in ${expectedValues.join(", ")}`)
                let nestedConditions = conditional.nestedConditions;
                for (let nestedCondition of nestedConditions) {
                    let output = evaluateConditionals(nestedCondition, thisSku, config);

                    if (output) {
                        return output
                    }
                }
            }
            return null
        }
        if (conditional.nestedType == "OR") {
            let passedTest = passed;

            if (expectedValues.includes(spec)) {
                activeWindow.webContents.send("console-log",`Found that ${spec} equals ${conditional.expectedValue}`)
                passedTest = true;
            }

            let nestedConditions = conditional.nestedConditions;
            for (let nestedCondition of nestedConditions) {
                let output = evaluateConditionals(nestedCondition, thisSku, config, passedTest);

                if (output) {
                    return output
                }
            }
        }
        if (expectedValues.includes(spec)) {
            activeWindow.webContents.send("console-log",`Found that ${spec} equals ${conditional.expectedValue}`)
            return conditional.thenReturn
        }
        
        return null
    }

    if (thisType == "ifNot") {
        let expectedValues = conditional.expectedValue;
        if (conditional.nestedType == "AND") {
            if (!expectedValues.includes(spec)) {
                let nestedConditions = conditional.nestedConditions;
                for (let nestedCondition of nestedConditions) {
                    let output = evaluateConditionals(nestedCondition, thisSku, config);

                    if (output) {
                        return output
                    }
                }
            }

            return null
        }
        if (conditional.nestedType == "OR") {
            let passedTest = passed;

            if (!expectedValues.includes(spec)) {
                passedTest = true;
            }
            
            let nestedConditions = conditional.nestedConditions;
            for (let nestedCondition of nestedConditions) {
                let output = evaluateConditionals(nestedCondition, thisSku, config, passedTest);

                if (output) {
                    return output
                }
            }
        }
        if (!expectedValues.includes(spec)) {
            return conditional.thenReturn
        }
        return null
    }


    if (thisType == "includes") {
        let expected = conditional.expectedValue;
        if (conditional.nestedType == "AND") {
            for (let value of expected) {
                activeWindow.webContents.send("console-log",`The value being includes searched is ${value}`)
                if (spec.includes(value)) {
                    let nestedConditions = conditional.nestedConditions;
                    for (let nestedCondition of nestedConditions) {
                        let output = evaluateConditionals(nestedCondition, thisSku, config);
    
                        if (output) {
                            return output
                        }
                    }
                }
            }
            return null
        }
        if (conditional.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expected) {
                activeWindow.webContents.send("console-log",`The value being includes searched is ${value}`)
                if (spec.includes(value)) {
                    passedTest = true;
                }
            }

            let nestedConditions = conditional.nestedConditions;
            for (let nestedCondition of nestedConditions) {
                let output = evaluateConditionals(nestedCondition, thisSku, config, passedTest);

                if (output) {
                    return output
                }
            }
        }
        
        for (let value of expected) {
            activeWindow.webContents.send("console-log",`The value being includes searched is ${value}`)
            if (spec.includes(value)) {
                return conditional.thenReturn
            }
        }
        return null
    }

    if (thisType == "equals") {
        let expected = conditional.expectedValue;
        if (conditional.nestedType == "AND") {
            for (let value of expected) {
                let secondarySpec = GetSkuCallValue(thisSku, value, config) 
                if (secondarySpec && spec == secondarySpec) {
                    let nestedConditions = conditional.nestedConditions;
                    for (let nestedCondition of nestedConditions) {
                        let output = evaluateConditionals(nestedCondition, thisSku, config);
    
                        if (output) {
                            return output
                        }
                    }
                }
            }
            return null 
        }
        if (conditional.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expected) {
                let secondarySpec = GetSkuCallValue(thisSku, value, config)
                if (secondarySpec && spec == secondarySpec) {
                    passedTest = true;
                }
            }

            let nestedConditions = conditional.nestedConditions;
            for (let nestedCondition of nestedConditions) {
                let output = evaluateConditionals(nestedCondition, thisSku, config,passedTest);

                if (output) {
                    return output
                }
            }
        }
        for (let value of expected) {
            let secondarySpec = GetSkuCallValue(thisSku, value, config)
            if (secondarySpec && spec == secondarySpec) {
                return conditional.thenReturn
            }
        }
        return null
    }

    if (thisType == "notEquals") {
        let expected = conditional.expectedValue;
        if (conditional.nestedType == "AND") {
            expected.forEach((value, index)=>{
                let secondarySpec = GetSkuCallValue(thisSku, value, config)
                if (secondarySpec && spec !== secondarySpec) {
                    let nestedConditions = conditional.nestedConditions;
                    for (let nestedCondition of nestedConditions) {
                        let output = evaluateConditionals(nestedCondition, thisSku, config);
    
                        if (output) {
                            return output
                        }
                    }
                }
            })
            return null  
        }
        if (conditional.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expected) {
                let secondarySpec = GetSkuCallValue(thisSku, value, config)
                if (secondarySpec && spec !== secondarySpec) {
                    passedTest = true;
                }
            }

            let nestedConditions = conditional.nestedConditions;
            for (let nestedCondition of nestedConditions) {
                let output = evaluateConditionals(nestedCondition, thisSku, config, passedTest);

                if (output) {
                    return output
                }
            }
        }
        
        for (let value of expected) {
            let secondarySpec = GetSkuCallValue(thisSku, value, config)
            if (secondarySpec && spec !== secondarySpec) {
                return conditional.thenReturn
            }
        }
        return null
    }

    if (thisType == "contains") {
        let expected = conditional.expectedValue;
        if (conditional.nestedType == "AND") {
            for (let value of expected) {
                let secondarySpec = GetSkuCallValue(thisSku, value, config) 
                if (spec.includes(secondarySpec)) {
                    let nestedConditions = conditional.nestedConditions;
                    for (let nestedCondition of nestedConditions) {
                        let output = evaluateConditionals(nestedCondition, thisSku, config);
    
                        if (output) {
                            return output
                        }
                    }
                }
            }
            return null
        }
        if (conditional.nestedType == "OR") {
            let passedTest = passed;

            for (let value of expected) {
                let secondarySpec = GetSkuCallValue(thisSku, value, config)
                if (spec.includes(secondarySpec)) {
                    passedTest = true;
                }
            }

            let nestedConditions = conditional.nestedConditions;
            for (let nestedCondition of nestedConditions) {
                let output = evaluateConditionals(nestedCondition, thisSku, config, passedTest);

                if (output) {
                    return output
                }
            }
        }
        
        for (let value of expected) {
            let secondarySpec = GetSkuCallValue(thisSku, value, config)
            if (spec.includes(secondarySpec)) {
                return conditional.thenReturn
            }
        }
        return null
    }

    /* not active -> dead -> not gonna implement this because of parsing to integer feature
    if (thisType == "GT") {
        if (conditional.nestedType == "AND") {
            if (parseInt(spec) > parseInt(conditional.expectedValue)) {
                let nestedConditions = conditional.nestedConditions;
                for (let i in nestedConditions) {
                    let output = evaluateConditionals(nestedConditions[i], thisSku);

                    if (output) {
                        return output
                    }
                }
            } else {
                return null
            }
            
        }
        if (parseInt(spec) > parseInt(conditional.expectedValue)) {
            return conditional.thenReturn
        }
        return null
    }*/

    activeWindow.webContents.send("console-log","Did not find a valid matching type")
    return null
}