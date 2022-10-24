
function indexSkuContent(sku, config) {
    
    let indexableFields = config["Functional Data"]["Reporting Fields"];
    
    let contentToIndex = indexableFields.map((field) => sku[field] ? sku[field] : "");
    let filteredIndex = contentToIndex.filter(field=>field.length > 0);
    let fullContent = filteredIndex.join(" ");
    const allSpaces = /\s/i
    let fullContentArray = fullContent.split(allSpaces);

    let seen = {};
    let nonDuplicateContent = fullContentArray.filter((word)=>{
        return seen.hasOwnProperty(word) ? false : (seen[word] = true)
    })

    return nonDuplicateContent.join("").toLowerCase()
}



module.exports = {
    indexSkuContent
}