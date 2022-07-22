require("regenerator-runtime/runtime");
require("core-js/stable");

async function reportRunner(sku, config) {
    const report = [];

    // 1. Pull in the test fields
    const reportingFields = config["Functional Data"]["Reporting Fields"];
    // 2. Pull in the configurable test fields
    const patternSet = config["Reporting Build"]["Pattern"];
    const flagSet = config["Reporting Build"]["Flags"];
    const exclusionSet = config["Reporting Build"]["Exclusions"];
    const validChars = config["Reporting Build"]["Valid Characters"];

    // 3. Find available configurable test patterns
    const currentTests = Object.keys(patternSet);

    // 4. Iterate through the reporting fields and test
    //console.log(currentTests);
    reportingFields.forEach((fieldKey, index)=>{
        let content = fieldKey ? sku[fieldKey] : null;
        // a. Ensure content is not null
        if (content) {
            // b. Run configurable tests.
            try {
                currentTests.forEach((testValue, index)=>{
                    const pattern = patternSet[testValue];
                    const flags = flagSet[testValue] ? flagSet[testValue] : "gi";
                    const exclusions = exclusionSet[testValue] ? exclusionSet[testValue].split(",") : null;
    
                    const regex = new RegExp(pattern, flags);

                    if (regex.test(content)) {
                        //console.log(`Found ${value} in ${fieldKey}`)
                        report.push({
                            test: testValue,
                            field: fieldKey,
                            message: "Test failed in field: " + fieldKey
                        })
        
                        //if exclusion exists test for it and pop it off
                        if (exclusions) {
                            for (let ex of exclusions) {
                                if (content.includes(ex)) {
                                    report.pop()
                                    break;
                                }
                            }
                        }
                    }
                })

                // c. Run valid character checks
                const validCharsTest = new RegExp(validChars, "gi");
                const invalidChars = content.replace(validCharsTest, "");

                for (let i = 0; i < invalidChars.length; i++) {
                    while (content.includes(invalidChars[i])) {
                        const locationIndex = content.indexOf(invalidChars[i])
                        const locationSlice = content.slice(locationIndex - 3, locationIndex + 5);
                        report.push({
                            test: "Invalid Character",
                            field: fieldKey,
                            message: `Unexpected Character "${invalidChars[i]}" in field ${fieldKey} in section "${locationSlice}"`
                        })

                        // We will basically remove the characters from the content so that we can test again,
                        // whether the value still exists...might not be the best approach, but it's the one
                        // that comes to mind now
                        let contentArray = [...content];
                        contentArray[locationIndex] = " ";
                        content = contentArray.join("");
                    }
                }
            } catch(err) {
                report.push({
                    test: "Test Error",
                    field: "error",
                    message: `${err}`
                })
            }   
        }
    })

    return report;
}

function recommendedContentSearch(searchValue, potentialValues, sku, searchFields) {
    //need to handle yes/no values in algorithm -> pass in attributeName, search name instead of value
    let returnValue = {
        currentFields: [],
        rec: [],
        recFields: []
    }
    for (let i = 0; i < searchFields.length; i++) {
        const activeField = sku[searchFields[i]];
        if (!activeField) {continue}
        if (activeField.includes(searchValue)) {
            returnValue.currentFields.push(searchFields[i]);
        }
        //check for potentials here
        for (let value of potentialValues) {
            const potential = value["Attribute_Value_Name"];
            if (activeField.includes(potential)) {
                if (!returnValue.rec.includes(potential)) {
                    returnValue.rec.push(potential);
                }
                returnValue.recFields.push(searchFields[i]);
            }
        }
    }
    return returnValue;
}

function basicContentSearch(searchValue, sku, searchFields) {
    //need to handle yes/no values in algorithm
    //we should be able to derive the count and etc. from the array
    //returning an object to keep the values consistent across like functions
    let returnValue = {
        currentFields: []
    };
    if (!searchValue) {return returnValue}
    for (let i = 0; i < searchFields.length; i++) {
        const activeField = sku[searchFields[i]];
        if (activeField && activeField.includes(searchValue)) {
            returnValue.currentFields.push(searchFields[i])
        }
    }
    return returnValue;
}

module.exports = {
    reportRunner, basicContentSearch, recommendedContentSearch
}