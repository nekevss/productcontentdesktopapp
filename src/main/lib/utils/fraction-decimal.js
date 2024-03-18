// I want to note from the jump: this is an absolutely horrible idea...
// ...
// ... but I'm lazy, and it will work
//
// TODO: Use an external library to handle fraction <-> decimal conversion

const fractionToDecimal = {
    " 1/2" : ".5",
    " 1/3" : ".33",
    " 2/3" : ".67",
    " 1/4" : ".25",
    " 3/4" : ".75",
    " 1/5" : ".2",
    " 2/5" : ".4",
    " 3/5" : ".6",
    " 4/5" : ".8",
    " 1/8" : ".13",
    " 3/8" : ".38",
    " 5/8" : ".63",
    " 7/8" : ".88",
    " 1/10" : ".1",
    " 9/10" : ".9",
    " 1/12" : ".08"
}

const decimalToFraction = {
    ".08": " 1/12",
    ".1" : " 1/10",
    ".125" : " 1/8",
    ".13" : " 1/8",
    ".2" : " 1/5",
    ".25" : " 1/4",
    ".33" : " 1/3",
    ".375" : " 3/8",
    ".38" : " 3/8",
    ".4" : " 2/5",
    ".42": " 1/12",
    ".5": " 1/2",
    ".6" : " 3/5",
    ".625" : " 5/8",
    ".63" : " 5/8",
    ".66" : " 2/3",
    ".67" : " 2/3",
    ".75" : " 3/4",
    ".8" : " 4/5",
    ".875" : " 7/8,",
    ".88" : " 7/8,",
    ".9" : " 9/10"
}


module.exports = {
    fractionToDecimal, decimalToFraction
}