import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
// 引入 new Router 的实例
import router from './router'
import fastclick from 'fastclick'
// 4-12 懒加载
import VueLazyload from 'vue-lazyload'
import store from './store'
import 'common/stylus/index.styl'

Vue.config.productionTip = false

fastclick.attach(document.body)

// 4-12 懒加载
Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})

new Vue({
  el: '#app',
  store,
  // 把 element 挂载到 app 上面
  render: h => h(App),
  // h 是 createElment 方法
  router
})
