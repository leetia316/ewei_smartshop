//app.js
import WtApi from './api/WtApi'
App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },

  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  getAuthsetting:function(app,that,successHandle) {
    if (!app.globalData.userGetSetting) {
            wx.getSetting({
                success(res) {
                  console.log('app' + res)
                    if (res.authSetting['scope.userInfo']) {
                        that.setData({
                            userGetSetting: true
                        })
                        app.globalData.userGetSetting = true;
                        successHandle && successHandle()
                        // app.submitUserInfo()
                    } else {
                        that.setData({
                            userGetSetting: false
                        })
                    }
                }
            })
        } else {
            if (app.globalData.userGetSetting != that.data.userGetSetting) {
                that.setData({
                    userGetSetting: app.globalData.userGetSetting
                })
            }
        }
  },

  globalData: {
    wtApi: new WtApi,
    userInfo: null,
    userGetSetting:false,   //是否得到用户授权
    //dianUrl:'https://wxfx.lashou.com',
    debug:false,
  }
})
