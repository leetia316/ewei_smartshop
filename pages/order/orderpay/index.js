// index.js

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderid: 0,
    moneySum: 0,
    result:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data = {
      orderid: options.id,
    }
    let that = this
    app.globalData.wtApi.getPayCashie(data).then((data) => {  
      if (data.status == 1) {
        that.setData({
          result: data,
          // orderid: options.orderid
        })
      } else if (data.status == 451){
        setTimeout(() => {
          wx.showToast({
            image: '/images/common/icon_warning.png',
            title: data.result.message,
            duration: 1000
          })
        }, 500)
        setTimeout(() => {
          wx.redirectTo({
            url: '../../user/my_order/my_order',
          })
        }, 1800)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  //支付
  goPayWeiXin: function(e){
      let weichat = this.data.result.result.wechat;
      let that = this
      let orderid = this.data.result.result.orderid;
      let typeStr = 'wechat';
      wx.requestPayment({
        'timeStamp': weichat.timeStamp,
        'nonceStr': weichat.nonceStr,
        'package': weichat.package,
        'signType': 'MD5',
        'paySign': weichat.paySign,
        'success': function (res) {
          // 状态查询
          that.queryPayStatus(orderid, typeStr);
        },
        'fail': function (res) {
          wx.showToast({
            image:'/images/common/icon_warning.png',
            title: '未支付',
            duration: 1000
          })
        }
      })
   
  } ,

//余额支付 
goPayBalance: function(e){
  let that = this
  let orderid = this.data.result.result.orderid;
  let typeStr = 'credit';
  let data = {
    orderid: orderid,
    type: typeStr
  }
  wx.showModal({
      title: '提示',
      content: '确认要支付吗?',
      success: function (res) {
        if (res.confirm) {
          app.globalData.wtApi.postPayGoPay(data).then((data) => {
            if (data.status == 1) {
              that.queryPayStatus(orderid, typeStr);
            } else {
              wx.showToast({
                image: '/images/common/icon_warning.png',
                title: data.result.message,
                duration: 1000
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

//订单为0支付
goPayOther: function (e) {
  let that = this
  let orderid = this.data.result.result.orderid;
  let typeStr = 'credit';
  let data = {
    orderid: orderid,
    type: typeStr
  }
  wx.showModal({
    title: '提示',
    content: '确认要支付吗?',
    success: function (res) {
      if (res.confirm) {
        app.globalData.wtApi.postPayGoPay(data).then((data) => {
          if (data.status == 1) {
            that.queryPayStatus(orderid, typeStr);
          } else {
            wx.showToast({
              image: '/images/common/icon_warning.png',
              title: data.result.message,
              duration: 1000
            })
          }
        })
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
},

  // 支付完成后订单状态查询
  queryPayStatus: function (orderid, type){
    let that = this;
    let data = {
      orderid: orderid,
      type: type
    }
    app.globalData.wtApi.queryPayStatus(data).then((data) => {
      if (data.status == 1) {
        //跳转到详情
        wx.redirectTo({
          url: '../../user/order_detail/order_detail?id=' + orderid + '&payOver=1',
        })
      } else {
        wx.showToast({
          image: '/images/common/icon_warning.png',
          title: data.result.message,
          duration: 1000
        })
      }
    })
  },
})