require("regenerator-runtime/runtime");
require("core-js/stable");
const electron = require('electron');
const fs = require('fs');
const path = require('path');
const { app, Menu, BrowserWindow, ipcMain, shell } = electron;
const nativeImage = electron.nativeImage;
require('./main/handlers/ipcMainHandle.js');
require('./main/ipcMainOn.js');
require('./main/handlers/builderHandlers.js');

//Unanswered questions
//TODO: handle logs when in production

//Roadmap to Stable Environment
//1. Create Settings/Configuration handler --> complete
//2. Setup centralized data storage --> complete (frafile enabled, but would be best for Azure server)
//3. Access Style Guide values/backwards compatibility --> complete
//4. Support export history --> complete
//5. Base feature/reporting build out
//6. Generator error log report (Pat's idea)

//TODO list
//1. Add attribute reporting and recommending
//2. Bring style guide parser and registry into application
//3. Get this thing on a server???
//4. Add 30 day auto delete to history


//globals
let mainWindow;
let secondaryWindow;
const appIcon = nativeImage.createFromPath(__dirname + '/assets/ProductContentApp_PixelLogo.png')
const userDataPath = app.getPath('userData'); //C:\Users\<username>\AppData\Roaming\productcontentdesktopapp
const resourcesPath = userDataPath + "/Resources";

console.log("This application's User Data Path is: " + userDataPath)
console.log("This application's Resources Path is: " + resourcesPath);


//Initialization functions
if (!fs.existsSync(resourcesPath)) {
    console.log('Did not find ' + resourcesPath)
    console.log('Creating resources directory now...')
    
    //once functioning from resources files. Change resources to test in
    //application directory

    //TODO: switch from callbacks to Async/Await
    //NOTE: don't like the idea of tons of try catch blocks
    fs.mkdir(resourcesPath + '/cache', {recursive: true}, (err) => {
        if (err) {
            console.log(err);
        } else {
            fs.readFile(path.join(__dirname, '/resources/current.json'), 'utf-8', (err, data)=> {
                if (err) {
                    console.log(err);
                } else {
                    const parsedData = JSON.parse(data);
                    fs.writeFile(resourcesPath + '/current.json', JSON.stringify(parsedData), 'utf-8', (err)=> {
                        if (err) {console.log(err)};
                    });
                    const metaData = {...parsedData.metadata, length: parsedData.data.length}
                    fs.writeFile(resourcesPath + '/state.json', JSON.stringify(metaData), 'utf-8', (err)=> {
                        if (err) {console.log(err)};
                    })
                }   
            })
            //TODO: fetch centrally stored config when supported
            fs.readFile(path.join(__dirname,  '/resources/config.json'), 'utf-8', (err, data)=> {
                if (err) {
                    console.log(err)
                } else {
                    const parsedData = JSON.parse(data);
                    fs.writeFile(resourcesPath + '/config.json', JSON.stringify(parsedData), 'utf-8', (err)=> {
                        if (err) {console.log(err)};
                    })
                }
            })
            //TODO: add SNG fetch here when supported
            fs.readFile(path.join(__dirname,  '/resources/SNGs.json'), 'utf-8', (err, data)=> {
                if (err) {
                    console.log(err)
                } else {
                    const parsedData = JSON.parse(data);
                    fs.writeFile(resourcesPath + '/SNGs.json', JSON.stringify(parsedData), 'utf-8', (err)=> {
                        if (err) {console.log(err)};
                    })
                }
            })
            //TODO: add style guide file fetch here when supported
            fs.readFile(path.join(__dirname,  '/resources/StyleGuide.json'), 'utf-8', (err, data)=> {
                if (err) {
                    console.log(err)
                } else {
                    const parsedData = JSON.parse(data);
                    fs.writeFile(resourcesPath + '/StyleGuide.json', JSON.stringify(parsedData), 'utf-8', (err)=> {
                        if (err) {console.log(err)};
                    })
                }
            })
        }
        
        console.log('Resources directory and example files created\n\n')
    })
} else {
    console.log('Resources directory found!\n\n')
    console.log('Checking for files to exist...')

    if (!fs.existsSync(resourcesPath + '/SNGs.json')) {
        console.log("Did not find a SNGs.json file, loading the one from storage")
        fs.readFile(path.join(__dirname,  '/resources/SNGs.json'), 'utf-8', (err, data)=> {
            if (err) {
                console.log(err)
            } else {
                const parsedData = JSON.parse(data);
                fs.writeFile(resourcesPath + '/SNGs.json', JSON.stringify(parsedData), 'utf-8', (err)=> {
                    if (err) {console.log(err)};
                })
            }
        })
    }
    if (!fs.existsSync(resourcesPath + '/StyleGuide.json')) {
        console.log("Did not find a StyleGuide.json file, loading the one from storage")
        fs.readFile(path.join(__dirname,  '/resources/StyleGuide.json'), 'utf-8', (err, data)=> {
            if (err) {
                console.log(err)
            } else {
                const parsedData = JSON.parse(data);
                fs.writeFile(resourcesPath + '/StyleGuide.json', JSON.stringify(parsedData), 'utf-8', (err)=> {
                    if (err) {console.log(err)};
                })
            }
        })
    }
    if (!fs.existsSync(resourcesPath + '/config.json')) {
        console.log("Did not find a config.json file, loading the one from storage")
        fs.readFile(path.join(__dirname,  '/resources/config.json'), 'utf-8', (err, data)=> {
            if (err) {
                console.log(err)
            } else {
                const parsedData = JSON.parse(data);
                fs.writeFile(resourcesPath + '/config.json', JSON.stringify(parsedData), 'utf-8', (err)=> {
                    if (err) {console.log(err)};
                })
            }
        })
    }
    //run fetchs below
    console.log("File check completed!")
}

/*-----------------------------------------------------------------*/
//Window Functions

function createWindow() {

    console.log("I've receieved a message to create a window!\n")

    let win = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration:false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload:__dirname + '/preload.js'
        }
    });

    //set application icon with already created NativeImage
    win.setIcon(appIcon)

    //for production...
    win.loadURL(path.join(__dirname, "/dist/index.html"))
    //for development...
    //win.loadURL('http://localhost:8080/');

    win.on('closed', () => {
        if (secondaryWindow) {
            secondaryWindow.close();
        }
        mainWindow = null;
    })

    //below is a bit of a hack since the 'ready-to-show' event firing is inconsistent
    //should look into switching back to electron@v9.3.1
    win.webContents.on('did-finish-load', ()=> {
        console.log("Webcontents finished loading!\n")
        //win.maximize()
        //win.show()
    })

    //below is proper form. But it is very inconsistent
    win.once('ready-to-show', () => {
        console.log("Recieved the message that the window is ready to show!\n")
        win.maximize()
        win.show()
    })

    return win
}

function createSecondaryWindow() {

    let second = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration:false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: __dirname + '/preload.js'
        }
    })

    second.setIcon(appIcon);

    second.loadURL(path.join(__dirname, "/dist/secondary.html"))

    second.on('closed', () => {
        secondaryWindow = null;
    })

    second.webContents.on('did-finish-load', ()=> {
        console.log("Webcontents finished loading!\n")
    })

    second.once('ready-to-show', () => {
        console.log("Recieved the message that the window is ready to show!\n")
        second.maximize()
        second.show()
    })

    return second
}

function OpenSecondaryWindow() {
    if (!secondaryWindow) {
        secondaryWindow = createSecondaryWindow()
        secondaryWindow.setMenuBarVisibility(false);
    } else {
        secondaryWindow.focus()
    }
}

//secondary window handler
ipcMain.on("open-secondary-window", (event, args)=>{
    console.log(event.senderId)
    OpenSecondaryWindow();
})



/*--------------------------------------------------------------------------------------*/

//Application Menu build out
//pulled default from Electron Menu page and further built out

const isMac = process.platform === 'darwin'

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
            label: "History",
            click: function() {
                mainWindow.webContents.send("change-interface", "history")
            }
        },
        {
            label: "Configure",
            click: function() {
                mainWindow.webContents.send("change-interface", "configure")
            }
        },
        
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    // {role : 'interfaceMenu'}
    {
        label: 'Applications',
        submenu: [
            {
                label: 'Default App',
                click: function() {
                    mainWindow.webContents.send("change-interface", 'main')
                }
            },
            {
                label: 'Legacy App',
                click: function() {
                    mainWindow.webContents.send("change-interface", 'legacy')
                }
            },
            {
                label: 'Bulk Sku Namer',
                click: function() {
                    mainWindow.webContents.send("change-interface", 'bulk-sku-namer')
                }
            }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Style Guides',
        submenu: [
            {
                label: "View",
                click: function() {
                    OpenSecondaryWindow()
                }
            },
            {
                label: "Build",
                click: function() {
                    mainWindow.webContents.send("change-interface", 'sng-builder')
                }
            }
        ]
    },
    {
        label: "Resources",
        submenu:[
            {
                label: "Manage",
                click: function() {
                    mainWindow.webContents.send("change-interface", "manage-resources")
                }
            },
            {
                label: "Import",
                click: function() {
                    mainWindow.webContents.send("change-interface", "import")
                }
            }
        ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
            label: 'Learning Resources',
            submenu: [
                {
                    label: 'Javascript',
                    click: async () => {
                        await shell.openExternal('https://www.w3schools.com/js/DEFAULT.asp')
                    }

                },
                {
                    label: 'Reactjs',
                    click: async () => {
                        await shell.openExternal('https://reactjs.org/')
                    }
                },
                {
                    label: 'Electronjs',
                    click: async () => {
                        await shell.openExternal('https://electronjs.org')
                    }
                },
                {
                    label: 'Webpack',
                    click: async () => {
                        await shell.openExternal('https://webpack.js.org/')
                    }
                },
                {
                    label: 'Sass',
                    click: async () => {
                        await shell.openExternal('https://sass-lang.com/')
                    }
                }
            ]
        },
        
      ]
    }
  ]


/*--------------------------------------------------------------------------------------*/

//The below declarations should be the last lines of code on this file
//Last note: this app has the bare minimum basis for Mac. But I cannot
// claim with any certainty that this will function cross platform.

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
    }
})

app.on('ready', () => {
    mainWindow = createWindow();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
})