const { determineWebClass } = require('./determine-web-class.js');
const { getSkuCallValue, cleanSpec } =  require('./get-sku-call-value.js');

module.exports = {
    cleanSpec, determineWebClass, getSkuCallValue
}