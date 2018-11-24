import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios'

// 4-2 抓轮播图数据
export function getRecommend() {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })

  return jsonp(url, data, options)
}


// 4-7 抓歌单数据
export function getDiscList() {
  // 这里的 url 和上面的不一样
  // 在前端这里就不是 JSONP 请求了，而是一个 ajax 请求
  // 请求的是 dev-serve.js 里的 apiRoutes.get('/getDiscList',function(){})
  const url = '/api/getDiscList'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq', // ??? 在哪里
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),// Query String Parameters 里也是随机数
    format: 'json'
  })

// 4-8
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSongList(disstid) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return jsonp(url, data, options)
}
