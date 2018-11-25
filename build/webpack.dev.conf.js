'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

// 我从 dev-server.js 来。。
// 后端代理 绕过 host 和 referer
const express = require('express')
const axios = require('axios')
const app = express()
var apiRoutes = express.Router()
app.use('/api', apiRoutes)
// 后端代理 绕过 host 和 referer

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    // 后端代理 绕过 host 和 referer
    before(apiRoutes){
      // 4-8
      // 定义一个路由，它的作用是通过一个真实的 qq 服务器地址（https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg），通过 axios 发送一个 http 请求
      // 同时修改 headers（伪装成 qq 音乐里的 host 和 referer）,加上 浏览器端发来的请求参数（recommend.js里的 const data 里的数据）
      // 原封不动的传给qq的服务端，qq服务端收到请求后会给我们正确的响应

      // 括号里的 res 是我们此时此刻写的后端接口的 response
      apiRoutes.get('/api/getDiscList', function (req, res) {
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
      // app.use('/api', apiRoutes)
      // 4-7 结束

      // 配置结束
    },
    // 后端代理 绕过 host 和 referer



    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
