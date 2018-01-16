// pages/search/search.js
var app = getApp();
var util = require("../../utils/util.js");
let Promise = require("../../utils/es6-promise.min.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
      focus:true,
      searchValue:'',
      keyInputList:[],
      historyList:[],
      message:''
  
  },
  /*取消事件*/
  onClickCancel:function () {console.log("取消")
      wx.switchTab({
          url: '/pages/index/index'
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.init();

  },
    /*历史搜索*/
    init:function () {
        var that = this;
        app.globalData.wtApi.getGoods().then((data) =>{
            var historyList = that.data.historyList;
            historyList =data.result.keywords_record;
            that.setData({
                historyList:historyList
            })
        })

    },
    /*删除事件*/
    onDelete:function () {
        var that = this;
        that.setData({
            historyList:[]
        })
        app.globalData.wtApi.getDelect().then((data)=>{
            console.log(data);
            that.setData({
                historyList:[]
            })
        })
    },
    /*根据关键词搜索数据*/
  searchValueInput:function(e){
        var value = e.detail.value;
        console.log(value);
        var that = this;
        this.setData({
            focus: true,
            searchValue:value,
        });
      let keywords = {
          keywords:that.data.searchValue
      };
      app.globalData.wtApi.getList(keywords).then((data)=>{
          "use strict";

      });
      wx.redirectTo({
          url:'/pages/shop-list/shop-list?keywords='+value
      })


  },
    keySelect:function (e) {
        var key = e.currentTarget.dataset.key;
        console.log(key);
        this.setData({
            searchValue:key
        })
        var that = this;
        let keywords = {
            keywords:that.data.searchValue
        };
        app.globalData.wtApi.getList(keywords).then((data)=>{

        })
        wx.redirectTo({
            url:'/pages/shop-list/shop-list?keywords='+key
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
  onPullDownRefresh: function(){
      wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.bindSearch();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})