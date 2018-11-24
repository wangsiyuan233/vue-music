require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var webpack = require('webpack')
var proxyMiddleware = require('http-proxy-middleware')
var webpackConfig = require('./webpack.dev.conf')
var axios = require('axios')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

// 4-7 自己加的代理请求
// 也就是说在 recommend.js 里请求的 url 就
var app = express()


// 4-8
var apiRoutes = express.Router()

// 这里用到了 axios 库
// 与服务端 http 和 ajax 相关的内容都用 axios

// 4-8
// 定义一个路由，它的作用是通过一个真实的 qq 服务器地址（https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg），通过 axios 发送一个 http 请求
// 同时修改 headers（伪装成 qq 音乐里的 host 和 referer）,加上 浏览器端发来的请求参数（recommend.js里的 const data 里的数据）
// 原封不动的传给qq的服务端，qq服务端收到请求后会给我们正确的响应

// 括号里的 res 是我们此时此刻写的后端接口的 response
apiRoutes.get('/getDiscList', function (req, res) {
  // recommend.js 里请求的 地址写在这里了！！
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    // 浏览器请求 /getDiscList 接口所带的参数
    // 取到的参数原封不动的放到 url 里面 (qq 服务端)
    // （recommend.js里的 const data 里的数据）
    params: req.query
    // 括号里的 response 的数据是 response.data，它是扣扣返回给我们的
  }).then((response) => {
    // 如果成功的话就回调 then，把qq给我们的数据response，变成我们现在写的这个后端的接口res里
    // 把响应的内容通过 res.json 输出给浏览器端
    // 这样前端就可以接收到这些数据
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})


apiRoutes.get('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios.get(url, {
    headers: {
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    params: req.query
  }).then((response) => {
    var ret = response.data
    if (typeof ret === 'string') {
      var reg = /^\w+\(({[^()]+})\)$/
      var matches = ret.match(reg)
      if (matches) {
        ret = JSON.parse(matches[1])
      }
    }
    res.json(ret)
  }).catch((e) => {
    console.log(e)
  })
})

// 4-8 ues 一下
app.use('/api', apiRoutes)
// 4-7 结束


var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {}
})
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

var uri = 'http://localhost:' + port

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

console.log('> Starting dev server...')
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
  // when env is testing, don't need open it
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
