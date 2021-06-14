const { app, BrowserWindow, Menu, ipcMain, dialog  } = require('electron')
const path = require('path');
const fs = require('fs');

let win;
function createWindow () {
    
  win = new BrowserWindow({
    width: 1260,
    height: 960,
    webPreferences: {
      nodeIntegration: true
    }
  })


  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  win.loadFile('electron.html')
  win.webContents.openDevTools()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

const isMac = process.platform === 'darwin'

const template = [
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' },
      {
        label: "Save webstrate",
        click: function(){
          win.webContents.send('saveAutomerge', {'SAVED': 'File Saved'});
        }
      }
    ]
  },
  // { role: 'editMenu' }
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
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
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
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
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
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]


ipcMain.on('saveDialog', (event, arg) => {  
	dialog.showSaveDialog({
		title: 'Select the File Path to save',
		defaultPath: path.join(__dirname, '/savedWebstrates/savedDoc.automerge'),
		// defaultPath: path.join(__dirname, '../assets/'),
		buttonLabel: 'Save',
		// Restricting the user to only Text Files.
		filters: [
			{
				name: 'Automerge Files',
				extensions: ['automerge']
			}, ],
		properties: []
	}).then(file => {
		// Stating whether dialog operation was cancelled or not.
		console.log(file.canceled);
		if (!file.canceled) {
			console.log(file.filePath.toString());
				  
			// Creating and Writing to the sample.txt file
			fs.writeFile(file.filePath.toString(), 
							 arg, function (err) {
					if (err) throw err;
					console.log('Saved!');
				});
		}
	}).catch(err => {
		console.log(err);
	});
})

ipcMain.on('loadDialog', (event, arg) => {
  if (process.platform !== 'darwin') {
    // Resolves to a Promise<Object>
    dialog.showOpenDialog({
        title: 'Select the File to be uploaded',
        defaultPath: path.join(__dirname, '../assets/'),
        buttonLabel: 'Upload',
        // Restricting the user to only Text Files.
        filters: [
            {
              name: 'Automerge Files',
              extensions: ['automerge']
            }, ],
        // Specifying the File Selector Property
        properties: ['openFile']
    }).then(file => {
        // Stating whether dialog operation was
        // cancelled or not.
        if (!file.canceled) {
          // Updating the GLOBAL filepath variable 
          // to user-selected file.
          global.filepath = file.filePaths[0].toString();  
          if (global.filepath && !file.canceled) {
            fs.readFile(global.filepath, {encoding: 'utf-8'}, function(err,data) {
              if (!err) {
                    //win.webContents.send('loadAutomerge', data);
                    event.returnValue = data;
              } else {
                  event.returnValue = 'error';
                }
            });
          } else {
            event.returnValue = 'error';
          }
        }  else {
          event.returnValue = 'error';
        }
    }).catch(err => {
        console.log(err);
        event.returnValue = 'error';
    });
}
else {
    // If the platform is 'darwin' (macOS)
    dialog.showOpenDialog({
        title: 'Select the File to be uploaded',
        defaultPath: path.join(__dirname, '../assets/'),
        buttonLabel: 'Upload',
        filters: [
            {
              name: 'Automerge Files',
              extensions: ['automerge']
            }, ],
        // Specifying the File Selector and Directory 
        // Selector Property In macOS
        properties: ['openFile', 'openDirectory']
    }).then(file => {
        console.log(file.canceled);
        if (!file.canceled) {                    
          global.filepath = file.filePaths[0].toString();  
          if (global.filepath && !file.canceled) {
            fs.readFile(global.filepath, {encoding: 'utf-8'}, function(err,data) {
              if (!err) {
                    console.log('received data: ' + data);
              } else {
                    console.log(err);
                }
            });
          }
        }  
    }).catch(err => {
        console.log(err)
    });
}
})

app.whenReady().then(createWindow)