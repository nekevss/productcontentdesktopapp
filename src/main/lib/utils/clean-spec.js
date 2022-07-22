//shared function used between Generator and Style Guide Engine

function cleanSpec(spec) {
    const regex = /\s\((\d*|\w*|\s)\)/g;
    //console.log(`${spec} is the spec to be tested`)
    if (regex.test(spec)) {
        return spec.replace(regex, "");
    }
    const regex2 = /\s\&lpar\;(\d*|\w*|\s)\&rpar\;/g;
    if (regex2.test(spec)) {
        return spec.replace(regex2, "");
    }
    return spec
}

module.exports = {
    cleanSpec
}