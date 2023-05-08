require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const { ipcMain } = electron;
const spellchecker = require("spellchecker");

ipcMain.handle("complete-spellcheck", async(event, incomingData)=>{
    let _SKU = incomingData.sku;
    let fieldsToClean = incomingData.config["Functional Data"]["Reporting Fields"];
       
    // Adjust html tags for all fields that we complete reporting on for content.
    const ltTag = new RegExp("<lt\\/>", "gi");
    const gtTag = new RegExp("<gt\\/>", "gi");
    const htmlTag = /^<[\w \/]+>[<\w\s]*/gi;
    
    fieldsToClean.forEach((field)=>{
        let fieldValue = _SKU[field];
        if (fieldValue !== null) {
            // First we handle the HTML formatting tags
            fieldValue = fieldValue.replace(ltTag, "<");
            fieldValue = fieldValue.replace(gtTag, ">");

            // Next we need to complete the spellcheck on the fields.
            let output = ""
            const misspelledPositions = spellchecker.checkSpelling(fieldValue);
            if (misspelledPositions.length > 0) {
                //console.log(`Found misspellings in ${field}`)
                misspelledPositions.forEach((mispelling)=>{
                    // We have our misspelling locs here.
                    // First, slice the string from the fieldValue
                    const misspelledString = fieldValue.slice(mispelling.start, mispelling.end+1);
                    // Here we pad the string by a few characters to guarantee that we are getting the entire html tag
                    const paddedMisspelledString = fieldValue.slice(mispelling.start - 1, mispelling.end + 3);
                    // Test a padded version of the string to see if there is a html tag. If not, add highlight span to string
                    if (!paddedMisspelledString.match(htmlTag)) {
                        //console.log("No htmlTag match found")
                        //console.log(paddedMisspelledString);
                        let spannedMispelling = `<span style="color:red">` + misspelledString + "</span>"
                        output = [fieldValue.slice(0, mispelling.start), spannedMispelling, fieldValue.slice(mispelling.end + 1)].join("");
                    }
                })
            } else {
                output = fieldValue
            }

            _SKU[field] = output
        }
    })

    return _SKU
})