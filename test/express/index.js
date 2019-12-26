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

const httpPort = 3000
// const httpsPort = 443
const http = require('http')
let server = http.createServer(app)
server.listen(httpPort, function () {
  console.log('HTTP Server is running on: http://localhost:%s', httpPort)
})
