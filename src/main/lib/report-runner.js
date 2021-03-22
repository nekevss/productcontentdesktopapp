require("regenerator-runtime/runtime");
require("core-js/stable");

async function reportRunner(sku, config) {
    const report = [];

    //pulling in the test fields
    const reportingFields = config["Functional Data"]["Reporting Fields"];
    //pulling in the report build outs
    const patternSet = config["Reporting Build"]["Pattern"];
    const flagSet = config["Reporting Build"]["Flags"];
    const exclusionSet = config["Reporting Build"]["Exclusions"];

    //finding available test patterns
    const currentTests = Object.keys(patternSet);

    //console.log(currentTests);
    //need to invert -> iterate through reporting fields and run currentTests on each
    currentTests.forEach((value,index)=>{
        //wrapping in try catch block cause I'm worried about that RegExp failing out, don't want it to mess up the others
        try {
            const pattern = patternSet[value];
            const flags = flagSet[value] ? flagSet[value] : "gi";
            const exclusions = exclusionSet[value] ? exclusionSet[value].split(",") : null;
    
            const regex = new RegExp(pattern, flags);
    
    
            for (const fieldKey of reportingFields) {
                const field = sku[fieldKey] ? sku[fieldKey] : "";
    
                //testing vs. regex
                if (regex.test(field)) {
                    //console.log(`Found ${value} in ${fieldKey}`)
                    report.push({
                        test: value,
                        field: fieldKey,
                        message: "Test failed in field: " + fieldKey
                    })
    
                    //if exclusion exists test for it and pop it off
                    if (exclusions) {
                        for (let ex of exclusions) {
                            if (field.includes(ex)) {
                                report.pop()
                                break;
                            }
                        }
                    }
                }
            }
        } catch (err) {
            report.push({
                test: "Test Error",
                field: "error",
                message: err
            })
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