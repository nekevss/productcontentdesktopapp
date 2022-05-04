const electron = require('electron');
const { app, Menu, MenuItem, BrowserWindow, dialog, ipcMain, shell } = electron;
const fs = require('fs');
const path = require('path');

const userDataPath = app.getPath('userData'); //C:\Users\<username>\AppData\Roaming\Product Content App
const resourcesPath = userDataPath + "/Resources";

ipcMain.on('post-message', (event, incomingMessage)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let options = {
        type: "none",
        buttons: ["Okay"],
        title: "Staples Product Content",
        message: incomingMessage
    }
    dialog.showMessageBox(activeWindow, options)
})

ipcMain.on("send-alert", (event, incomingMessage)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    let options = {
        type: "none",
        buttons: ["Okay"],
        title: "Application Warning",
        message: incomingMessage
    }
    dialog.showMessageBox(activeWindow, options)
})

ipcMain.on("open-in-browser", (event, href)=>{
    shell.openExternal(href)
})

ipcMain.on("fetch-context-menu", (event, target)=>{
    let activeWindow = BrowserWindow.getFocusedWindow()
    const contextMenu = new Menu();
    const baseItems = new MenuItem({role: 'copy'})
    contextMenu.append(baseItems);
    if (target.tagName == "INPUT") {
        contextMenu.append(new MenuItem({role: 'paste'}));
    }

    contextMenu.append(new MenuItem({type: 'separator'}));

    if (target.tagName == "IMG") {
        if (target.tagName == "IMG") {
            let imageSource = target.src;
            contextMenu.append(new MenuItem(
                {
                    label: "Open in browser",
                    click: ()=>{
                        shell.openPath(imageSource);
                    }
                }
            ))
        }
    }
    
    contextMenu.append(new MenuItem({
        label: "Open Console",
        click: ()=>{
            activeWindow.webContents.openDevTools();
        }
    }));

    contextMenu.popup();
})

ipcMain.on("set-history-state", (event, args)=>{
    let activeWindow = BrowserWindow.fromId(1);

    const state = {
        type: "history",
        name: args.fileName,
        time: args.time,
        length: args.length,
    }

    fs.writeFile(path.join(resourcesPath, "/state.json"), JSON.stringify(state, null, 4), (err)=> {
        if (err){activeWindow.webContents.send("console.log", err)}
        activeWindow.webContents.send("change-interface", "main")
    })
    
})