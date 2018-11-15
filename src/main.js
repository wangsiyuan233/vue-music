import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
// import router from './router'
// import fastclick from 'fastclick'
// import './common/stylus/index.styl'

Vue.config.productionTip = false

// fastclick.attach(document.body)

/* eslint-disable no-new */
// eslint-disable-next-line
/* eslint-disable */

new Vue({
  el: '#app',
  // 把 element 挂载到 app 上面
  // router,
  render: h => h(App)
  // h 是 createElment 方法
})
