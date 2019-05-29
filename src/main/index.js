const { app, BrowserWindow, dialog, globalShortcut } = require('electron');
const { autoUpdater } = require("electron-updater");
const log = require('electron-log');
const path = require('path');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


let win;

function sendStatusToWindow(text) {
  log.info(text);
  if (win) {
    win.webContents.send('message', text);
  }
}


function createDefaultWindow() {
  win = new BrowserWindow({
    title: '趣护帮',
    icon: path.resolve('resources/logo-128.ico'),
    show: false,
    backgroundColor: '#F8F8F8',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.maximize();

  win.on('ready-to-show', function () {
    win.show();
    win.focus();
  });

  win.on('closed', () => {
    win = null;
  });

  win.loadURL('https://www.quhubang.com');

  return win;
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent.toFixed(2) + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
  const userChoice = dialog.showMessageBox({
    type: 'question',
    title: '版本更新',
    defaultId: 1,
    buttons: ['稍后再说', '马上更新'],
    message: '新版本已下载完毕, 是否退出并更新?'
  });

  sendStatusToWindow(`userChoice = ${userChoice}`);

  if (userChoice > 0) {
    autoUpdater.quitAndInstall();
  }
});

app.on('ready', function () {
  createDefaultWindow();

  sendStatusToWindow('App Is Ready');
  autoUpdater.checkForUpdates();

  // 注册快捷键打开chrome调试窗口
  globalShortcut.register('CommandOrControl+F12', () => {
    win.webContents.openDevTools();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
