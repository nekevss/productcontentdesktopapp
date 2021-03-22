//Below can be run in CLI with the below command
//concurrently -k "\"yarn dev\" \"electron .\""
//HOWEVER, it is producing an error "Command failed
//with exit code 1"

const concurrently = require('concurrently');

concurrently([
    "yarn dev",
    "electron ."
], {
    prefix: 'name',
    killOthers: ['failure', 'success'],
    restartTries: 0
}).then(
    function onSuccess(exitInfo) {
        process.exit();
    },
    function onFailure(exitInfo) {
        process.exit();
    }
);