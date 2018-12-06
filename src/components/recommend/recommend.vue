<template>
  <div class="recommend" ref="recommend">
    <!-- 4-10 这里绑定的 data 特别重要 歌单渲染了 scroll 就会监听到歌单的变化 就会调用refresh 方法-->
    <!-- 4-11  ref="scroll"-->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <!-- 4-4 为了确保 slot 里面的值是有的，我们需要加上 v-if -->
        <div v-if="recommends.length" class="slider-wrapper" ref="sliderWrapper">
          <!--只有上面一句执行完了,下面的 slider 才会执行  -->
          <slider>
            <!-- 4-4 v-for 遍历 轮播图的数据-->
            <div v-for="item in recommends">
              <!-- linkUrl 是在 JSON 里面取到的 -->
              <a :href="item.linkUrl">
                <!--4-11 一旦有一个图片触发 load ，我们就调用loadImage方法-->
                <img class="needsclick" @load="loadImage" :src="item.picUrl">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li @click="selectItem(item)" v-for="item in discList" class="item">
              <div class="icon">
                <!-- 4-12 懒加载 把 :src 换成 v-lazy -->
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <!-- v-html 给字符做转译 -->
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <!-- 4-13 小菊花  没有长度的时候就显示 loading  啊-->
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<!-- 下面的都是手写的 -->
<script type="text/ecmascript-6">
  import Slider from 'base/slider/slider'
  import Loading from 'base/loading/loading'
  import Scroll from 'base/scroll/scroll'
  import {getRecommend, getDiscList} from 'api/recommend'
  import {playlistMixin} from 'common/js/mixin'
  import {ERR_OK} from 'api/config'
  import {mapMutations} from 'vuex'

  export default {
    mixins: [playlistMixin],
    // 4-4 添加 data 方法，与 dom 相关  ？啥意思
    data() {
      return {
        // 上面的 silder 数据
        recommends: [],
        // 4-11 异步获取得到的下面列表数据
        discList: []
      }
    },
    created() { // 声明周期
      // 调用了 _getRecommend()这个方法，_getRecommend()方法又调用了 api/recommend.js
      // api/recommend.js 里面当然是 JSONP 方法获取数据
      //  JSONP 通过 url 拼接参数形成地址获取数据
      //  所以在 localhost8080 我们可以在 Network 里的 JS 看到 fcg (也就是拿到的 data)
      //  有了 data，就是一些 DOM 和交互上面的事情
      //  后面会写一个 轮播图组件，把这个组件应用在 推荐页面上
      this._getRecommend()

      this._getDiscList()
    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      // 4-11 这个方法很重要，关系到上下两个部分出现的时机
      loadImage() {
        // 为了不浪费，设置 checkloaded 标志位，只要一张图片被调用了就 refresh
        // 此时哪怕下面的歌单列表是先渲染出来的，我们也可以得到完整的高度，不会出现滚不到底部的情况
        if (!this.checkloaded) {
          this.checkloaded = true
          this.$refs.scroll.refresh()
        }
      },
      selectItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDisc(item)
      },

      // 4-4 在上面的 data 里面调用 getRecommend
      _getRecommend() {
        // res 是 JSOP 里面的 data
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },

      // 4-7 获取歌单 和上面一样的！！！
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            // 4-9 这里给 discList 赋值，和上面的 recommends 是一样的
            this.discList = res.data.list
          }
        })
      },
      ...mapMutations({
        setDisc: 'SET_DISC'
      })
    },
    // 注册一下：
    components: {
      Slider,
      Loading,
      Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center  // 右侧垂直居中
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
