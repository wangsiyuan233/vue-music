<!-- 4-10  -->
<template>
  <div ref="wrapper">
    <!--slot里面可以套任何的 dom  -->
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  // import BScroll from 'better-scroll'
  //
  // 在这里引用 better-scroll，就不用在每一个组件里面初始化它了，引用一下就行了
  // 就相当于抽象化它，达到了直接引用的目的
  var BScroll = require('better-scroll')

  export default {
    // 下面的这些属性的具体作用要去 better-scroll 官网里面看
    props: {
      //1 滚动的时候会派发scroll事件，会截流。
      //2 滚动的时候实时派发scroll事件，不会截流。
      //3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
      probeType: {
        type: Number,
        default: 1
      },
      // 手动派发点击事件
      click: {
        type: Boolean,
        default: true
      },
      // 是否派发滚动事件
      listenScroll: {
        type: Boolean,
        default: false
      },
      // 动态变化的列表数据，要不然忘记refresh，数据图就会滚不动
      data: {
        type: Array,
        default: null
      },
      pullup: {
        type: Boolean,
        default: false
      },
      // 是否派发列表滚动开始的事件
      beforeScroll: {
        type: Boolean,
        default: false
      },
      // 当数据更新后，刷新scroll的延时。
      refreshDelay: {
        type: Number,
        default: 20
      }
    },
    mounted() {
      // 在 mounted 里用 setTimeout 定时保证 dom 渲染了
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      // 4-10 scroll 初始化
      _initScroll() {
        // 没有 wrapper
        if (!this.$refs.wrapper) {
          return
        }
        // 如果有 wrapper, 就初始化
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click
        })

        if (this.listenScroll) {
          let me = this
          this.scroll.on('scroll', (pos) => {
            me.$emit('scroll', pos)
          })
        }

        if (this.pullup) {
          this.scroll.on('scrollEnd', () => {
            if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
              this.$emit('scrollToEnd')
            }
          })
        }

        if (this.beforeScroll) {
          this.scroll.on('beforeScrollStart', () => {
            this.$emit('beforeScroll')
          })
        }
      },
      // 4-10 scroll 的方法代理
      disable() {
        this.scroll && this.scroll.disable()
      },

      // 4-10 scroll 的方法代理
      enable() {
        this.scroll && this.scroll.enable()
      },
      // 4-10 scroll 的方法代理 重新计算高度
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
      }
    },

    // 4-10 watch data 的变化
    watch: {
      // 如果 data 变化了就 refresh
      // 如果 refresh 在调用方触发的话，那就在每个调用方都要关心数据变化+手动调用sroll.refresh()
      // 这就算是命令式的语法了，很不友好，我们肯定希望组件内部自己刷新啊！
      data() {
        setTimeout(() => {
          this.refresh()
        }, this.refreshDelay)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
