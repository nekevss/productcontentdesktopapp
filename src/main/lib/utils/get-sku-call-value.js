const { cleanSpec }  = require('./clean-spec.js');

// should the below be separated into a module and imported into the Style Guide Runner as well...
function getSkuCallValue (sku, generatorCall, config) {
    // slow af. Think it added like 40 seconds on bulk run of 27k skus.
    // But safety and utility over speed in this case. If I was worried
    // about speed, then this should be rebuilt in rust and compiled to wasm.
    const mappedCalls = config["Functional Data"]["Style Guide Call Mapping"];
    const mappedCallsKeys = Object.keys(mappedCalls);
    let call = "";

    // first determine if the generator call is a mapped call
    if (mappedCallsKeys.includes(generatorCall)) {
        call = mappedCalls[generatorCall];
    } else {
        call = generatorCall;
    }

    // need to make a decision on how to handle brand calls.
    if (call == config["Excel Mapping"]["Brand"]) {
        const copyrightedBrands = config["Exempted Brands"]["Copyright Brands"];
        const trademarkBrands = config["Exempted Brands"]["Trademark Brands"];
        const registeredBrands = config["Exempted Brands"]["Registered Brands"];

        if (trademarkBrands.includes(sku[call])) {
            return sku[call] + "&trade;";
        } else if (copyrightedBrands.includes(sku[call])) {
            return sku[call] + "&copy;";
        } else if(registeredBrands.includes(sku[call])) {
            return sku[call] + "&reg;";
        } else {
            return sku[call];
        }
    } else {
        // Return value of call. Always clean the spec coming from the Specs object of sku.
        return sku.hasOwnProperty(call) ? sku[call] : cleanSpec(sku.Specs[call]);
        // Really the above works, but it might be best to check the value and insure that
        // null is being returned rather than undefined. But Fijis vs. Granny Smiths
    }
}

module.exports = {
    getSkuCallValue, cleanSpec
}