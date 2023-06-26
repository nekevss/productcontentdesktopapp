const { determineWebClass } = require('./determine-web-class.js');
const { getSkuCallValue, cleanSpec } =  require('./get-sku-call-value.js');
const { prepareIndexableSkuContent } = require("./content-indexing.js");
const { fractionToDecimal, decimalToFraction } = require("./fraction-decimal.js");

module.exports = {
    cleanSpec, determineWebClass, getSkuCallValue, prepareIndexableSkuContent, fractionToDecimal, decimalToFraction,
}