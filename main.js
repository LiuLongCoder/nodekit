process.on('uncaughtException', function (err) {
  console.error('>>>>> note ', err)
})

const { app, BrowserWindow, shell, ipcMain } = require('electron')
const glob = require('glob')
const path = require('path')

let win = null

const windowConfig = {
  width: 1000,
  height: 800,
  minWidth: 320,
  webPreferences: {
    // contextIsolation: true,         // 为远程内容开启上下文隔离
    //     nodeIntegration: false,  // 禁止Node.js集成远程内容
    // allowRunningInsecureContent: true    // 允许https站点执行http脚本， 不推荐
    // experimentalFeatures: true       // 开启实验室特性， 不推荐
    //     // preload: './preload.js'
  }
}

function initialize () {
  makeSingleInstance()
  function createWindow () {
    win = new BrowserWindow(windowConfig)
    // win.loadURL(`file://${__dirname}/bookstore/index.html`)
    win.loadURL(`http://www.baidu.com`)
    // 开启调试工具
    // win.webContents.openDevTools();
    win.once('ready-to-show', () => {
      win.show()
    })
    win.on('close', () => {
      // 回收BrowserWindow对象
      win = null
    })
    win.on('resize', () => {
      // win.reload();
    })
    win.on('closed', () => {
      win = null
    })
  }


  app.on('ready', () => {
    createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (win == null) {
      createWindow()
    }
  })

  // 强调一下，这份列表只是将风险降到最低，并不会完全屏蔽风险。 如果您的目的是展示一个网站，浏览器将是一个更安全的选择。
  app.on('web-contents-created', (event, contents) => {
    // 创建WebView前确认其选项
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Strip away preload scripts if unused or verify their location is legitimate
      delete webPreferences.preload
      delete webPreferences.preloadURL

      // Disable Node.js integration
      webPreferences.nodeIntegration = false

      // Verify URL being loaded
      if (!params.src.startsWith('https://yourapp.com/')) {
        event.preventDefault()
      }
    })

    // 链接http开头的，直接用浏览器打开
    contents.on('new-window', (event, navigationUrl) => {
      // In this example, we'll ask the operating system
      // to open this event's url in the default browser.
      console.log('>>>> test', navigationUrl)
      if (navigationUrl.indexOf('http') === 0) {
        event.preventDefault()
        shell.openExternal(navigationUrl)
      }
    })
    // Disable or limit navigation
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)

      if (parsedUrl.origin !== 'https://my-own-server.com') {
        event.preventDefault()
        shell.openExternal(navigationUrl)
      }
    })
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}

initialize()

function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
}

loadDemos()

if (process.platform === 'darwin') {
// app.setBadgeCount(10)
  app.dock.bounce('critical') // macOS 会在激活前跳一直跳
}
