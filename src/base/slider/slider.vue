<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
        <!-- 插槽，外部组件插入的地方  -->
      </slot>
    </div>
    <!-- 4-5 滚动到某一页是小圆点会 active 的样式-->
    <div class="dots">
      <!-- :class 这种写法。。  是 bind 吗 -->
      <!-- v-for 的这种遍历方法。。 index 表示第几个元素 -->
      <span class="dot" :class="{active: currentPageIndex === index }" v-for="(item, index) in dots"></span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  // 这个东西一引入，轮播图就是规规整整的了
  import {addClass} from 'common/js/dom'
  // import BScroll from 'node_modules/better-scroll'
  var BScroll = require('better-scroll')
  // 用 ES5 的语法就治愈了这个奇怪的插件

  export default {
    name: 'slider',
    //
    // 4-4 props 可以从外部控制这个组件有哪些属性
    props: {
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 2000
      }
    },

    // data 是个 function,它 return 一个对象
    data() {
      return {
        // dots 是个对象，默认是一个空数组
        dots: [],

        // 表示当前是第几页，默认当前是第一页
        currentPageIndex: 0
      }
    },
    // 首先要保证渲染时机等数据时对的
    // 当 DOM ready 的时候初始化
    mounted() {
      // 4-4
      // 保证 dom 成功渲染我们一般要加个延时
      setTimeout(() => {
        // 4-6 一开始这里面是 undefined, 会对 定义的 返回 true
        this._setSliderWidth()
        // 图片只有五张，但是 div 有七个，是因为loop 为 ture 时，左右会克隆两个 dom ,保证循环切换
        // 也就是说，在初始化 slider 之前，就要初始化好 dom
        this._initDots()
        this._initSlider()

        // 在 props 里面有 autoPlay了，所以这里简单判断一下就行了
        // 这里是第一次出现 autoPlay 的判断，下一次是 methods 里的 _initSlider
        if (this.autoPlay) {
          this._play()
        }
      }, 20)//浏览器刷新间隔是 17 ms


      // 4-6 监听窗口大小改变的事件
      window.addEventListener('resize', () => {
        // 如果 slider 还没有初始化的时候，就什么都不做
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        // 4-6 重新计算 better-scroll，当 DOM 结构发生变化的时候务必要调用确保滚动的效果正常。
        this.slider.refresh()
      })
    },

    activated() {
      if (this.autoPlay) {
        this._play()
      }
    },

    // 4-6 在组件里有计时器的时候，关闭这个组件的时候就打碎计时器
    deactivated() {
      clearTimeout(this.timer)
    },
    beforeDestroy() {
      clearTimeout(this.timer)
    },


    methods: {
      // 4-4   isResize 是标志位，表示这个宽度是 resize 过来的，
      // 总的来说:
      // 如果有 isResize： width += sliderWidth
      // 如果没有 isResize： width += 2 * sliderWidth
      _setSliderWidth(isResize) {
        // 统计列表里有多少元素
        this.children = this.$refs.sliderGroup.children
        // width 是父容器的宽度
        let width = 0
        // 拿到父容器 slider 的宽度
        let sliderWidth = this.$refs.slider.clientWidth
        // 每个元素的宽度都与 slider 的宽度相同，所以可以拿到 sliderGroup 的宽度
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]

          // slider-item 是下面已经写好的 css 样式
          // 我们现在要把这个写好的样式加到 child 身上
          // 如果直接把 slider-item 写在 div 里，耦合性太强了，我们需要 slider 组件自己去完成
          // 所以怎么定义 “加” 这个动作很重要，addClass 方法在 common/js/dom.js
          addClass(child, 'slider-item')

          // 设置宽度 child 的宽度就 等于 父容器 的宽度
          child.style.width = sliderWidth + 'px'
          // 高度累加得到父容器 sliderWidth 的宽度 （？？？
          width += sliderWidth
        }

        // 4-6 如果没有 isResize 就执行下面的宽度
        // 4-4 上面的 loop 为 ture 时，左右会克隆两个 dom ,保证循环切换
        if (this.loop && !isResize) {
          // 所有在是宽度为 2倍的
          width += 2 * sliderWidth
        }

        this.$refs.sliderGroup.style.width = width + 'px'
      },

      // 4-4 初始化 slider： 当调用了 BScroll 时，我们就把下面的配置都传进去
      _initSlider() {
        // 第一个参数还是拿到 slider
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,//没有惯性
          snap: true,
          snapLoop: this.loop,
          snapThreshold: 0.3,
          snapSpeed: 400
          // click : true
          // 不允许点击
          // click : true时，手机情况下点击轮播图片不能跳转
          // 是因为 fastclick 和 better-scroll 冲突了
          // 删除以后，a 链接跳转是默认行为，不需要监听 click 了
        })

        // 4-5 将 currentPageIndex 绑定 !!!!
        // 滚动结束时会发生：
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          // 在循环模式下，我们默认第一个元素是一个拷贝，所以要减一啊！
          if (this.loop) {
            // pageIndex 第一次定义在 _play() 里面
            // 劳资都要分不清了！！！！
            // let pageIndex = this.currentPageIndex + 1
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex

          // 这里是第二次出现 autoPlay 的判断，第一次是在 mounted
          if (this.autoPlay) {
            this._play()
          }
        })

        // 4-6 发现只轮播了一遍就停止了，就先清理一下 timer
        this.slider.on('beforeScrollStart', () => {
          if (this.autoPlay) {
            clearTimeout(this.timer)
          }
        })
      },
      // 4-4 在 data 里面定义了 dots：一个长度为 5 的空数组 （？？？
      _initDots() {
        this.dots = new Array(this.children.length)
      },

      // 4-5 自动轮播
      _play() {
        // 目的就是让图片跳到下一张图片
        let pageIndex = this.currentPageIndex + 1
        // 如果是循环，就在当前基础上还 +1
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          // goToPage(X方向,Y方向,时间间隔)
          // 只改变 X 方向上
          this.slider.goToPage(pageIndex, 0, 400)
          // interval 也是上面的一个 props
        }, this.interval)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        // 这种写法太牛逼了！！！
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
