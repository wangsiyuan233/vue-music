import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
// 引入 new Router 的实例
import fastclick from 'fastclick'

import 'common/stylus/index.styl'

Vue.config.productionTip = false

fastclick.attach(document.body)

new Vue({
  el: '#app',
  // 把 element 挂载到 app 上面
  render: h => h(App),
  // h 是 createElment 方法
  router
})
