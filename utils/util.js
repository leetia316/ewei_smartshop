var app = getApp();
var Promise = require('./es6-promise.min.js');


function formatDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
}
function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function beforeResponseFilter(method, url, data, response, resolve) {
    console.log(response);
    if(response.data.type != 'success') {
        if (app.globalData.debug) {
            wx.showModal({
                title: 'debug 消息',
                content: response.data.message,
                showCancel: false
            });
        }
        return false;
    }
    return true;
}
function httpSend(method, url, data) {
    return new Promise(function (resolve, reject) {
        var params = {
            url: url,
            method: method,
            header: {
                "Content-Type": "json"
            },
            success: function (res) {
                if (beforeResponseFilter(method, url, data, res, resolve)) {
                    resolve(res.data);
                }
            },
            fail: function (error) {
                console.log(error)
            }
        };
        if(typeof data !== 'undefined') {
            params['data'] = data;
        }
        wx.request(params);
    });
}
function http(url) {
    return httpSend('GET', url);
}
function httpPost(url, data) {
    return httpSend('POST', url, data);
}

function getFormatTime(timestamp){
  let datetime = new Date(parseInt(timestamp) * 1000)

  var year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;//js从0开始取 
  var date = datetime.getDate();
  var hour = datetime.getHours();
  var minutes = datetime.getMinutes();
  var second = datetime.getSeconds();

  if (month < 10) {
    month = "0" + month;
  }
  if (date < 10) {
    date = "0" + date;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (second < 10) {
    second = "0" + second;
  }
  var time = year + "-" + month + "-" + date; //2009-06-12 17:18:05

  return time;
}

function formData(num){
  if(num == null){
    return
  }

  if (!isNaN(num)) {
    let result = (num.toString()).indexOf(".");
    if(num < 0){
      return 0
    }

    if (result != -1) {
      return num.toFixed(2)
    } else {
      return num
    }
  }
}

module.exports = {
  http: http,
  httpPost: httpPost,
  formatDate: formatDate,
  formatTime: formatTime,
  getFormatTime: getFormatTime,
  formData: formData
}
