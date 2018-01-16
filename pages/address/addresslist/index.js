// index.js

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: {},
    page: 1,
    pageSize: 10,
    addressid:0,
    isselect:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.setData({
      addressid: options.addressid
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
    this.setData({
      data: {}
    });
    var that = this;
    app.globalData.wtApi.getaddressList({}).then((data) => {
      var resultList = data.result.list;
      console.log(resultList);
      for (let i = 0; i < resultList.length;i++){
        if (resultList[i].id  ==  this.data.addressid){
          resultList[i].selected = 1
        }else{
          resultList[i].selected = 0
        }
      }
    
      that.setData({
        addressList: resultList
      });
    })
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
    let deleteitem = true;
    for (let i = 0; i < this.data.addressList.length;i++){
      if (this.data.addressList[i].id == this.data.addressid){
        deleteitem = false;
      }
    }

    if (deleteitem && !this.data.isselect){
      let item = this.data.addressList[0];

      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1];   //当前页面
      var prevPage = pages[pages.length - 2];  //上一个页面

      //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
      prevPage.setData({
        addressInfo: item
      })
    }
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

  /**
   * 地址列表点击修改
   */
  gotoAddressEdit(e) {
  
    let index = e.currentTarget.id;
    let item = this.data.addressList[index];
    let addressSize = this.data.addressList.length;
    wx.navigateTo({
      url: '../addressedit/index'
      +'?id='+item.id
      + '&realname=' + item.realname
      + '&mobile=' + item.mobile
      + '&province=' + item.province
      + '&city='+item.city
      + '&area=' + item.area
      + '&address=' + item.address
      + '&addressSize=' + addressSize
    })
  },

  /**
   * 地址信息添加的事件
   */
  gotoAddressAdd: function (event) {
    wx.navigateTo({
      url: '../addressadd/index'
    })
  },


  /**
   * 小程序跳转回去 并传递参数
   */
  gotoBack: function (event) {
    this.setData({
      isselect: true
    })
   
    let index = event.currentTarget.id;
    let item = this.data.addressList[index];

    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面

    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      addressInfo: item
    })
    wx.navigateBack();  //返回上一个页面
  }

})