require("regenerator-runtime/runtime");
require("core-js/stable");
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

function ContentAnalyzer(skuSet, config, type="default") {
    
    const analysisSettings = config["Content Analyzer"];
    //first we should build the content asset

    
    const contentData = tokenizeContent()
}


function tokenizeContent() {

}


module.exports = {
    ContentAnalyzer
}