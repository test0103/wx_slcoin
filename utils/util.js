/**
 * request请求封装
 * url {String}   传递方法名
 * types {Number} 传递方式(1,GET,2,POST)
 * data {Object}  传递数据对象
 */

function getDataFromServer(url, data = {}, types = 2) {
  // 获取公共配置
  var ROOTURL = "http://172.20.120.190:8088";
  // 请求校验
  var checkData = {};
  // 合并对象，处理请求参数
  var datas = mergeObj(checkData, data);

  var promise = new Promise(function (resolve, reject) {
    wx.request({
      url: ROOTURL + url,
      data: datas,
      method: (types === 1) ? 'GET' : 'POST',
      header: (types === 1) ? { 'content-type': 'application/json' } : { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.statusCode === 200) {
          resolve(res)
        } else {
          reject(res)
        }
      },
      fail: function(res) {
        reject(res)
      }
    })
  });
  return promise;
}

// object 对象合并
function mergeObj(o1, o2) {
  for (var key in o2) {
    o1[key] = o2[key]
  }
  return o1;
}


// 计算倒计时的时间差
const completeTime = function (endTime) {
  let now = new Date();
  let endLine = new Date(endTime);
  return endLine - now;
}


// 处理时间的格式
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  getDataFromServer: getDataFromServer,
  completeTime: completeTime,
}