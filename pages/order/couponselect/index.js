// pages/order/couponselect/index.js

var app = getApp();
var Utils = require("../../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    isFold:true,
    type:0,
    money:0,
    goods:{},
    merchs:{},
    couponPosition:-1,
    isSelected:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.goods == undefined){
      return
    }

    this.setData({
      type: options.type,
      money: options.options,
      goods: JSON.parse(options.goods),
      merchs: JSON.parse(options.merchs),
      couponPosition: options. couponPosition
    })
   
    let data = {
      type: this.data.type,
      money: this.data.money,
      goods: this.data.goods,
      merchs: this.data.merchs
    }

    app.globalData.wtApi.queryCouponList(data).then((data) => {
      for (let i = 0; i < data.result.coupons.length;i++){
        data.result.coupons[i].timestart = Utils.getFormatTime(data.result.coupons[i].timestart);
        data.result.coupons[i].timeend = Utils.getFormatTime(data.result.coupons[i].timeend);
        if (this.data.couponPosition != -1 && data.result.coupons.length > this.data.couponPosition){
          data.result.coupons[this.data.couponPosition].selected = 1;
        }
      }

      this.setData({
        dataList: data.result.coupons,
      })
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
    let isSelected = false;
    for (let i = 0; i < this.data.dataList.length; i++) {
      if (this.data.dataList[i].selected == 1) {
        isSelected = true;
      }
    }

    if(isSelected){
      return
    }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      couponPosition: -1,
      couponItem: undefined
    })
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
  //优惠券的内容展开关闭 
  unfoldTextView(e){
    let position = e.currentTarget.dataset.index;
    let listTemp = this.data.dataList;
    if (listTemp[position].unfold != undefined && listTemp[position].unfold == 1) {
      listTemp[position].unfold = 0;
    } else {
      listTemp[position].unfold = 1;
    }

    this.setData({
      dataList: listTemp
    })
  },
  //点击是否选中
  selectCoupon: function(e){
    let position = e.currentTarget.dataset.index;
    let listTemp = this.data.dataList;
    let isSelected = false;
    if (listTemp[position].selected != undefined && listTemp[position].selected == 1){
      listTemp[position].selected = 0;
      isSelected = false
    }else{
      listTemp[position].selected = 1;
      isSelected = true
    }
   
    this.setData({
      dataList: listTemp,
      isSelected: isSelected,
      couponPosition:position,
    })

    if (!isSelected){
      return
    }

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      couponPosition: position,
      couponItem: listTemp[position]
    })

    wx.navigateBack();  //返回上一个页面
  }, 

  //不使用优惠券
  disuseCoupon: function(e){
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      couponPosition: -1,
      couponItem: undefined
    })
    wx.navigateBack();  //返回上一个页面 
  }

})