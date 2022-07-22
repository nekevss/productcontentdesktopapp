const { getSkuCallValue } = require('../utils/index.js');

// Let's go over the tests that are in the conditionTests object
// if - implemented and live
// ifNot - implemented and live
// includes - implemented and live
// equals - implemented and live
// notEquals - implemented and live
// contains - implemented and live
// lessThan - partially implemented
// greaterThan - partially implemented
// else - implemented and live
// ifNull - implemented and live

// run test -> return bool of test result
const conditionTests = {
    "if" : (specValue, expectedArray, thisSku={}, config={}) => {
        return expectedArray.includes(specValue) ? true : false
    },
    "ifNot" : (specValue, expectedArray, thisSku={}, config={}) => {
        return !expectedArray.includes(specValue) ? true : false
    },
    "includes" : (specValue, expectedArray, thisSku={}, config={}) => {
        if (specValue) {
            for (let value of expectedArray) {
                if (specValue.includes(value)) {
                    return true
                }
            }
        }
        return false
    },
    "equals" : (specValue, expectedArray, thisSku, config) => {
        for (let value of expectedArray) {
            let secondarySpec = getSkuCallValue(thisSku, value, config)
            if (secondarySpec && specValue == secondarySpec) {
                return true
            }
        }
        return false
    },
    "notEquals" : (specValue, expectedArray, thisSku, config) => {
        for (let value of expectedArray) {
            let secondarySpec = getSkuCallValue(thisSku, value, config)
            if (secondarySpec && specValue !== secondarySpec) {
                return true
            }
        }
        return false
    },
    "contains" : (specValue, expectedArray, thisSku, config) => {
        if (specValue) {
            for (let value of expectedArray) {
                let secondarySpec = getSkuCallValue(thisSku, value, config)
                if (specValue.includes(secondarySpec)) {
                    return true
                }
            }
        }
        return false
    },
    "lessThan" : (specValue, expectedArray, thisSku, config) => {
        if (specValue && !isNaN(specValue)) {
            let numberSpec = Number(specValue);
            let testValue = expectedArray[0];
            if (!isNaN(testValue)) {
                let expectedNumber = Number(testValue);
                if (numberSpec < expectedNumber) {
                    return true
                }
            }
        }
        return false
    },
    "greaterThan" : (specValue, expectedArray, thisSku, config) => {
        if (specValue && !isNaN(specValue)) {
            let numberSpec = Number(specValue);
            let testValue = expectedArray[0];
            if (!isNaN(testValue)) {
                let expectedNumber = Number(testValue);
                if (numberSpec > expectedNumber) {
                    return true
                }
            }
        }
        return false
    },
    "else" : (specValue, expectedArray=[], thisSku={}, config={}) => {return specValue ? true : false},
    "ifNull" : (specValue, expectedArray=[], thisSku={}, config={}) => {return !specValue ? true : false }
}

module.exports = {
    conditionTests
}