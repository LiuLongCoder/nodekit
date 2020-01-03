process.on('uncaughtException', function (err) {
  console.error(err)
})

const express = require('express')
const app = express()

let options = {
  // dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html', 'cpp'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
}

// app.use(express.static(__dirname))
app.use(express.static('F:/opencv研习社', options))
app.use(express.static(__dirname, options))

/// 避免CORS policy
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept')
  next()
})

app.use('/test', function (req, res, next) {
  res.send('{"test": "haha"}')
})

const httpPort = 3000
// const httpsPort = 443
const http = require('http')
let server = http.createServer(app)
server.listen(httpPort, function () {
  console.log('HTTP Server is running on: http://localhost:%s', httpPort)
})
