// Context on webclass searching. There is no clear deterministic value due to all the spaghetti and different systems/encodings happening.
// For the sake of speed and correctness. We make assumptions on how the systems are currently functioning. This will be against my past
// approach of always future proofing and leaving the code functionality in the configuration file.

function determineWebClass(pph, itemIdentifier) {
    // 1. we split our pph string into an array based on whether we are able to find spaces or characters around a "/"
    // "first/second" -> should be split
    // "first / second" -> should preserve the string and not split
    const pphArray = pph.split(/(?<=[\w.*+?^${}()|[\]\\])\/(?=[\w.*+?^${}()|[\]\\]|$)/gi);

    // A class should always be the 4th value (ProductCatLevel4) in the pphArray.
    let productCatLevelFour = pphArray[3];

    // Here's were our issues begin. At some point, somebody ensured that productCatLevel4 never had a / without spaces 
    // isolating it (hence the above split), but this opinion changed somewhere and also got kicked out the door when
    // considering SKU Set names. So we need to do some testing to determine whether productCatLevelFour is valid.
    
    console.log(`Checking if ${productCatLevelFour} === ${pphArray[4]}`)
    if (productCatLevelFour + " Items" === pphArray[4]) {
        // Base case is that the value after ProductCatLevel4 is the items folder, which should be == productCatLevelFour + " Items" 
        return productCatLevelFour
    }

    // If we've made it this far, something is wrong. The 5th value isn't the items folder
    let basePosition = 3;
    let slashCounter = 1;
    let itemsStartPosition = basePosition + slashCounter + 1;
    let potentialCatLevelFour = productCatLevelFour;
    while (itemsStartPosition + slashCounter <= pphArray.length - 1) {
        potentialCatLevelFour = potentialCatLevelFour + "/" + pphArray[basePosition + slashCounter];
        
        let potentialItemsFolder = pphArray[itemsStartPosition];
        for (let i = itemsStartPosition + 1; i <= itemsStartPosition + slashCounter; i++) {
            potentialItemsFolder += "/" + pphArray[i];
        }
        
        console.log(`Checking if ${potentialCatLevelFour + " Items"} === ${potentialItemsFolder}`)
        if (potentialCatLevelFour + " Items" === potentialItemsFolder) {
            return potentialCatLevelFour
        }

        slashCounter++
        itemsStartPosition++
    }

    // But this also doesn't capture SKU Sets. So we need to check if the SKU Number is located at the end of the path.
    if (pphArray[pphArray.length - 1] == itemIdentifier ) {
        return productCatLevelFour
    }

    
    // Honestly, if we make it this far in the function. Than something has most likely gone horribly wrong and we need to return a null
    return "Undeterminable Class"
}

module.exports = {
    determineWebClass
}

/*

For reference, here was the first approach to fetch the web class

let pphArray = pph.split(/(?<=[\w.*+?^${}()|[\]\\])\/(?=[\w.*+?^${}()|[\]\\])/gi);
for (let i=pphArray.length-1; i>=0; i=i-1) {
    if (pphArray[i].includes("Items")) {
        activeClass = pphArray[i-1];
        break;
    }

    //Taking greedy guess
    if (i === 3) {
        functionalClass = pphArray[i];
        break;
    }
}
*/