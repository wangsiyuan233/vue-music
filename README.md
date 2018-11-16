
> 一、准备工作

*第2个视频：Vue-cli脚手架安装*
准备 `webpack` / `node.js`
下面说说 准备 `vue-cli` 的安装
进入 `cmd` 在全局环境下 `npm install --global vue-cli`
安装好了还是在 `cmd` 情况下，`vue -V` 如果有版本号，就说明安装成功了！恭喜你小源
回到桌面，`git bash` 一下 `vue init webpack vue-music`
会让你判断作者/描述/要不要安装这些那些的东西 
安装`vue-cli`并不是唯一的方式，但是它可以帮助我们，搭建好基本的框架，帮助我们初始化了 `webpack`
OK，进度条跑完，我们在总的文件夹下 `npm run dev` 调出 `localhost8080`

*第3个视频：项目目录介绍及图标字体丶公共样式等资源准备*
`src/api`：放的是和后端请求相关的代码，比如 `Ajax` 和 `JSONP`
`src/common`：目录里面就是一些通用性的资源 字体啊图片啊样式啊
`src/components`：通用组件
`src/router`：路由相关的文件
`src/store`：存放 `vue` 相关的代码
`main.js` 是入口

![](https://i.imgur.com/XkE7AAG.png)

一定要在 `package.json` 里面加入 `"stylus":"^0.54.5"`  和 `"stylus-loader":"^2.1.1"`,

经过了一段离奇的报错，我也不知道怎么就走上了正轨，页面可以正常显示了

在 `build/webpack.base.conf.js` 里面搜索 `alias`，把下面的规则补全，就可以不用 `../` 了

> 二、骨架开发

使用 `vue-router` 实现组件间的动态切换
如果你想装很多依赖，那就先在 `package.json` 里面写入它的版本号，再 `npm i`
（试了一下，好像必须要 `npm install babel-runtime` 这样啊，有没有简洁的办法呢）

`babel-runtime` ： 对 `ES6` 的语法进行转义
`fastclick`： 消除移动端点击的 `300ms` 的延迟
`babel-polyfill`：对 `ES6` 的 `api` 的转译

【写头部（带炸鸡图标的bar）】
我们在 `m-header.vue` 里面把骨架和样式都写好
这个头部很简单的一个框架和样式）重点是右上角的一个 `<router-link> `

（`<router-link> `组件支持用户在具有路由功能的应用中 (点击) 导航。 通过 `to` 属性指定目标地址，默认渲染成带有正确链接的 `<a>` 标签，可以通过配置 `tag` 属性生成别的标签。另外，当目标路由成功激活时，链接元素自动设置一个表示激活的 `CSS` 类名。）

进入 `App.vue` ，倒入 `import MHeader from 'components/m-header/m-header'`

接着 `export default MHeader` 等

（使用 `export default` 命令，为模块指定默认输出，这样就不需要知道所要加载模块的变量名）

然后把 `<div id="app">替换部分</div>` 改成 `<div id="app"><m-header></m-header></div>`
激动人心的时刻到了！！ 页面上就会出现一只鸡仔！！


再按照上面的三步，把 `m-header.vue` 这个写好的文件展现在页面里哈哈

同理我们倒入了 `Player` 和 `Tab`
（呵呵呵哒失败了，不能手贱倒入）

下面开始顶部导航栏组件开发（就是动态组件切换啊！）所以重头戏就是 `router/index.js` 的配置

**【引入顶部导航栏】**

在 `App.vue` 里，直接引入了 `tab.vue` ，所以在页面上就成功展示了 顶部导航栏的四个部分
```
<template>
  <div id="app" @touchmove.prevent>
    <m-header></m-header>
    <tab></tab>
  </div>
</template>

<script type="text/ecmascript-6">

import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'

export default {
  components: {
    MHeader,
    Tab
  }
}
</script>
```

**【实现动态组件切换】**

按照上面的讨论（三步骤）
我们可以在 `router/index.js` 写成（仅以 `rank` 为例）
```
import Rank from 'components/recommend/recommend'

Vue.use(Router)
//注册一下router

export default new Router({
	routes: [
	  {
		path:'/rank',
		compoment: Rank
	  }
	]
})
```
非常神奇的是，我们需要在 src 下面专门建立一个 router 文件夹，而这个文件夹是专门存放组件切换的！目前为止就是这个导航栏的切换。（所以要是我还有别的需求，比如的 [推荐] 下面还有 [hiphop] [摇滚] [民族风]之类的怎么办呢？）

> 三、推荐页面

两个部分：
1、首页：轮播图和歌单列表
2、歌单详情页

数据来自 QQ音乐，现在要开始学怎么抓数据了！！幸福来得太突然！！

**【抓数据】**

我们要通过 `JSONP` 来拿到我们想要的数据
看到这个鬼东西就知道是 跨域 啊啊啊
它就是利用动态创建一个 `<script>` 标签，里面的 `src` 指向想要请求的服务端地址

下面开始在 `src/js/jsonp.js` 里面开始写了
写好了就用 `JSONP` 来真实查询我们的数据
获取数据时我们会封装一些方法，一般存放在 `src/api` 里
（ `recommend.js `是纯手写的）
首先把这个页面的 `Network` 里的 `JS` 里的 `p.fcg` 双击打开，弹出来的网址，舍弃问号及问号以后的内容

（插入一句： `api/config.js` 配置一些公共的参数）

调用了 `_getRecommend()` 这个方法，`_getRecommend()` 方法又调用了 `api/recommend.js`
`api/recommend.js` 里面当然是 `JSONP` 方法获取数据
`JSONP` 通过 `url` 拼接参数形成地址获取数据
所以在 `localhost8080` 我们可以在 `Network` 里的 `JS` 看到 `fcg` (也就是拿到的 `data`)
有了 `data`，就是一些 `DOM` 和交互上面的事情
