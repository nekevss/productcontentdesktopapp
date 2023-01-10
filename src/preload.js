const {ipcRenderer, contextBridge} = require('electron');

//For reference on the preload file
//https://github.com/electron/electron/issues/9920
//https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send/

contextBridge.exposeInMainWorld(
    "api", {
        invoke: async (channel, data) => {
            //whitelist channels
            //TODO: consolidate/refactor ipcMain.handle channels
            let validChannels = [
                'open-file-dialog',
                'request-sku-and-state', 
                'request-class-details',
                'request-class-data',
                'request-skuset',
                'request-name',
                'request-sku-report',
                "request-cache-data",
                "export-sng-package",
                "update-formula",
                "fetch-resource",
                "fetch-class-index",
                "fetch-configuration",
                "post-configuration",
                "update-local",
                "post-local",
                "run-sku-namer",
                "register-report",
                "delete-style-guide",
                "rename-style-guide",
                "escape-history",
                "delete-cache-item",
                "run-import",
                "run-attribute-search",
                "complete-spellcheck",
                'validate-builder',
                "nuke-history"
            ];
            if (validChannels.includes(channel)) {
                return await ipcRenderer.invoke(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = [
                "change-interface", 
                "change-overlay",
                "context-menu",
                "sku-namer-batch",
                "sku-namer-finished",
                "console-log",
                "console-display",
                "import-status",
                "import-update"
            ];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        removeListener: (channel) => {
            let validChannels = [
                "change-interface",
                "change-overlay", 
                "context-menu",
                "sku-namer-batch",
                "sku-namer-finished",
                "console-log",
                "console-display",
                "import-status",
                "import-update"
            ];
            if (validChannels.includes(channel)) {
                ipcRenderer.removeAllListeners(channel)
            }
        },
        alert: (channel, message)=> {
            let validChannels = ['send-alert'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, message);
            }
        },
        message: (channel, message)=> {
            let validChannels = [
                "post-message",
                "fetch-context-menu",
                "open-in-browser",
                "open-secondary-window",
                "set-history-state"
            ]
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, message)
            }
        },
    }
);

