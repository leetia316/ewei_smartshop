
var app = getApp()
Page({
    data: {
        userInfo: {},
        userGetSetting: true
    },
    onLoad: function (options) {
        //调取数据
        //this.getUserInfo();
    },
    getUserInfo(isShowLoading){
      typeof isShowLoading == 'undefined' && (isShowLoading = true);
      app.globalData.wtApi.userCenter({}, isShowLoading).then((data) => {
            if(data.status == 1){
                this.setData({
                    userInfo: data.result
                })
                !isShowLoading && wx.stopPullDownRefresh();
            }else{
              console.log(data.message)
            }
        })
    },

    onShow(){
        app.getAuthsetting(app,this);
        this.getUserInfo();
    },
    onPullDownRefresh: function () {
      this.setData({
        userInfo: {},
      });
      this.getUserInfo(false);
    },
    authSetting: function () {
        wx.getUserInfo({
            fail() {
                wx.getSetting({
                    success(res) {
                        if (!res.authSetting['scope.userInfo']) {
                            wx.openSetting({
                                success(res) {
                                    console.log(res)
                                }
                            })
                        }
                    }
                })
            }
        })
    }
})
