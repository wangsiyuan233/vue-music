import originJsonp from 'jsonp'

export default function jsonp(url, data, option) {
  // 判断一个 url 里面有没有问号，没有的话就用 &
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

export function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  return url ? url.substring(1) : ''
  // 如果 url 有data，就把第一个 & 去掉
  // 如果 url 没有data，就为空
}
