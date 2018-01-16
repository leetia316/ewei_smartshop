// pages/shoppingcart/cart/index.
// 控制总数量和总价格 全选 商品数量 是否删除 是否选中
var app = getApp()
var utils = require("../../../utils/util.js");

Page({

  /**
   * 页面的初始数据
   */

  data: {
    delBtnWidth: 80,
    able: [],
    disable: [],
    selecteAll:false,
    isSelecte:false,
    goodsNum:0,
    sumPrice:0.0,
    toastitem: {hidden:true, title:'hello !',},
    userGetSetting: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
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
    app.getAuthsetting(app,this);
    this.updateGoodsList()
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
    this.updateGoodsList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 商品刷新
   */
  updateGoodsList: function () {
    app.globalData.wtApi.getCartList({}).then((data) => {
      // console.log('updateGoodsList : ' + JSON.stringify(data))
      let list = data.result.list == undefined ? [] : data.result.list;
      let expire_list = data.result.expire_list == undefined ? [] : data.result.expire_list;
      let isSelectedAll = true;
      let isSelected = false;
      let selectCount = 0;
      let priceSum = 0;
      for (let i = 0; i < list.length; i++) {
        let merchantselect = true;
        for (let n = 0; n < list[i].goods.length; n++) {
          list[i].goods[n].plusicon = '/images/cart/plus_deep.png'
          if (parseInt(list[i].goods[n].total) == 1){
            list[i].goods[n].subtracticon = '/images/cart/minus_shallow.png'
          }else{
            list[i].goods[n].subtracticon = '/images/cart/minus_deep.png'
          }
         
          if (list[i].goods[n].selected == 0) {
            isSelectedAll = false;
            merchantselect = false;
          } else {
            isSelected = true;
            selectCount = selectCount + parseInt(list[i].goods[n].total);
            priceSum = priceSum + parseFloat(list[i].goods[n].total) * parseFloat(list[i].goods[n].marketprice);
          }
        }

        if (merchantselect){
          list[i].selected = 1
        }else{
          list[i].selected = 0
        }
      }

      this.setData({
        able: list,
        disable: expire_list,
        sumPrice: utils.formData(priceSum),
        selecteAll: isSelectedAll,
        goodsNum: selectCount,
        isSelected: isSelected
      });
    })
  },
  // 触摸事件
  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      });
    }
  },

  touchM: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = "";
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        txtStyle = "left:0px";
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "px";
        }
      }
      //获取手指触摸的是哪一项
      let position = e.currentTarget.dataset.index;
      let index = e.currentTarget.id;//在那个商家中
      let ablelist = this.data.able;

      let tempstr = ablelist[index].goods[position].txtStyle

      if (index && tempstr != 'left:-80px') {
     
        ablelist[index].goods[position].txtStyle = txtStyle
        //更新列表的状态
        this.setData({
          able: ablelist
        });
      }
    }
  },

  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
    
      var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "px" : "left:0px";
  
      //获取手指触摸的是哪一项
      var position = e.currentTarget.dataset.index;
      let index = e.currentTarget.id;//在那个商家中
     
      let ablelist = this.data.able;
      if (index) {
        ablelist[index].goods[position].txtStyle = txtStyle
        //更新列表的状态
        this.setData({
          able: ablelist
        });
      }
    }
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },

  //点击删除按钮事件
  delItem: function (e) {
    //获取列表中要删除项的下标
    let position = e.currentTarget.dataset.index;
    let index = e.currentTarget.id;

    var list = this.data.able;

    // 删除数据
    this.deleteCartData(list[index].goods[position].id)
    //移除列表中下标为index的项
    list[index].goods.splice(position, 1);

    let count = 0
    for (let i = 0; i < list.length;i++){
      if (list[i].goods.length == 0){
        list.splice(i, 1);
      }
    }

    for (let i = 0; i < list.length; i++) {
      count += list[i].goods.length;
    }

    if(count == 0){
      //更新列表的状态
      this.setData({
        able: []
      });
    }else{
      //更新列表的状态
      this.setData({
        able: list
      });
    }
   
    // 更新数据
    this.updateShow()
  },

  // 加号控制
  plusSymbol:function(e){
    let position = e.target.dataset.index;
    let index = e.target.id;
    let item = this.data.able[index];
    let goods = item.goods[position];
    // if (goods.stock > goods.total) {
      goods.total = parseInt(goods.total) + 1;
      goods.plusicon = '/images/cart/plus_deep.png'
      goods.subtracticon = "/images/cart/minus_deep.png"
    // } else {
    //   goods.total = goods.stock 
    //   goods.plusicon = '/images/cart/plus_shallow.png'
    // }
    let ablelist = this.data.able;
    ablelist[index].goods[position] = goods
    this.setData({
      able: ablelist
    });
    // 更新服务器
    this.cartNumChange(goods.id, goods.total, goods.optionid)
    // 更新显示
    this.updateShow()
  }, 

  // 减号控制
  subtractSymbol: function (e) {
    let position = e.target.dataset.index;
    let index = e.target.id;
    let goods = this.data.able[index].goods[position];
    let cansubtract = true
    if (goods.total > 2){
      goods.total = parseInt(goods.total) - 1;
      goods.subtracticon = "/images/cart/minus_deep.png"
      goods.plusicon = '/images/cart/plus_deep.png'
    }else{
      goods.total = 1
      goods.subtracticon = "/images/cart/minus_shallow.png"
      // wx.showToast({
      //   title: '最小数量为1',
      //   duration: 1000
      // })
    }
    let ablelist = this.data.able;
    ablelist[index].goods[position] = goods
    this.setData({
      able: ablelist
    });
    // 更新服务器
    this.cartNumChange(goods.id, goods.total, goods.optionid)
    // 更新显示
    this.updateShow()
  },

  // 全选操作
  selectedAll: function(e){
    let pickon = {}
    let isSelected = false;
    if (this.data.selecteAll){
      pickon = 0
      isSelected = false;
    }else{
      pickon = 1
      isSelected = true;
    }
    let ablelist = this.data.able;
   
    for (let i = 0; i < ablelist.length;i++){
      ablelist[i].selected = pickon
      for(let n=0;n<ablelist[i].goods.length;n++){
        ablelist[i].goods[n].selected = pickon
      }
    }

    this.setData({
      able: ablelist,
      selecteAll: isSelected,
    });
    // 更新服务器
    this.selectCartData({}, pickon)
    // 更新显示
    this.updateShow()
  },

  //选中按钮
  checkedOne:function (e) {
    let position = e.target.dataset.index;
    let index = e.target.id;
    let ablelist = this.data.able;
    let selected  = 0;
    let merchantSelect = true;
    if (ablelist[index].goods[position].selected == 1){
      selected = 0
    }else{
      selected = 1
    }
    ablelist[index].goods[position].selected = selected
    //更新商户选中状态
    for (let n = 0; n < ablelist[index].goods.length;n++){
      if(ablelist[index].goods[n].selected == 0){
        merchantSelect = false;
      }
    }
    if(merchantSelect){
      ablelist[index].selected = 1
    }else{
      ablelist[index].selected = 0
    }

    //更新列表的状态
    this.setData({
      able: ablelist
    });
    // 更新服务器
    this.selectCartData(ablelist[index].goods[position].id, selected)
    // 更新显示
    this.updateShow()
  },

  // 下单接口
  submitCheck:function(e){
    let that = this
    let count = 0
    for (let i = 0; i < this.data.able.length;i++){
      for(let n=0; n < this.data.able[i].goods.length;n++){
        if (this.data.able[i].goods[n].selected == 1){
          count += 1
        }
      }
    }

    if(count == 0){
      wx.showToast({
        image: '/images/common/icon_warning.png',
        title: '请选择商品',
        duration: 2000
      })
      return
    }

    app.globalData.wtApi.postCartSubmit({}).then((data) => {
      if (data.status == 1){
        wx.navigateTo({
          url: '../../order/orderconfirm/index',
        })
      }else{

        that.setData({
          toastitem: { hidden: false, title: data.result.message }
        });  

        that.updateGoodsList()
        // wx.showModal({
        //   title: '提示',
        //   content: data.result.message,
        //   success: function (res) {
        //     if (res.confirm) {
        //     }
        //   }
        // })
      }
    })
  },

  // 清空失效订单
  clearExpireList: function(e){
    let buffer = '';
    for (let i=0;i<this.data.disable.length;i++){
      buffer = buffer + this.data.disable[i].id + ",";
    } 
    if (buffer.length > 0){
      buffer = buffer.substr(0, buffer.length - 1);
    }
    let data = {
      ids: buffer
    }

    this.setData({
      disable: []
    });
 
    app.globalData.wtApi.deleteCartData(data).then((data) => {
      wx.showToast({
        title: data.result.message,
        duration: 1000
      })
    })
  },

  // 获取优惠券
  jumpCoupon: function(e){
    wx.navigateTo({
      url: '../../user/get_coupon/get_coupon',
    })
  },

  // 更新总的数量和总的价格
  updateShow:function(){
    //循环数据再更新
    //是否选中 选中后的数量
    let goodsTotal = 0;
    let priceSum = 0;
    let ablelist = this.data.able
    let allChoose = true;
    let isSelected = false;
    for (let i = 0; i < ablelist.length; i++) {
      for (let n = 0; n < ablelist[i].goods.length; n++) {
        if (ablelist[i].goods[n].selected == 1){
          goodsTotal = goodsTotal + parseFloat(ablelist[i].goods[n].total);
          priceSum = priceSum + parseFloat(ablelist[i].goods[n].total) * parseFloat(ablelist[i].goods[n].marketprice);
          isSelected = true;
        }else{
          allChoose = false
        }
      }
    }

    this.setData({
      goodsNum: goodsTotal,
      sumPrice: utils.formData(priceSum),
      selecteAll:allChoose,
      isSelecte:isSelected
    });
  },

  // 选中按钮数据更新
  selectCartData: function (id, select){

    let data = {
      id: id,
      select: select
    }
    app.globalData.wtApi.selectCartData(data).then((data) => {
      // wx.showToast({
      //   title: data.result.message,
      //   duration: 1000
      // })
    })
  },

  // 购物车数量改变
  cartNumChange: function (id, total, optionid) {
    let data = {
      id: id,
      total: total,
      optionid: optionid
    }

    app.globalData.wtApi.updateCartData(data).then((data) => {
      // wx.showToast({
      //   title: data.result.message,
      //   duration: 1000
      // })
    })
  },

  // 删除购物车中商品
  deleteCartData:function(id){
    let data = {
      ids: id
    }
    app.globalData.wtApi.deleteCartData(data).then((data) => {
      // wx.showToast({
      //   title: data.result.message,
      //   duration: 1000
      // })
    })
  },

  // 跳转到商品详情
  jumpToGoodsDetail:function(e){
    let position = e.currentTarget.dataset.index;
    let index = e.currentTarget.id;
    let id = this.data.able[index].goods[position].goodsid;
    wx.navigateTo({
      url: '../../order-detail/order-detail?id=' +id,
    })
  },

  // 跳转到商品首页
  jumpToHomePage: function(e){
    wx.switchTab({
      url: '../../index/index',
    });  
  },

  // 商家全选或取消函数
  merchantCheckAll: function(e){
    //循环数据再更新
    //是否选中 选中后的数量
    //是否改变全选
    //改变购物车数量

    let index = e.currentTarget.dataset.index;
    let ablelist = this.data.able;
    let selected = 0
    let goodslist = '';

    if (ablelist[index].selected != undefined && ablelist[index].selected == 1) {
      ablelist[index].selected = 0
      selected = 0
    } else {
      ablelist[index].selected = 1
      selected = 1
    }

    //更新商家下面数据
    for (let i = 0; i < ablelist[index].goods.length; i++){
      ablelist[index].goods[i].selected = selected;
      goodslist += ablelist[index].goods[i].id+','
    }
    if (goodslist.length > 0){
      goodslist = goodslist.substring(0, goodslist.length-1)
    }

    //更新列表的状态
    this.setData({
      able: ablelist
    });
    // 更新服务器
    this.selectCartData(goodslist, selected)
    // 更新显示
    this.updateShow()
  },

  //弹出框的确定
  toastconfirm:function(e){
    this.setData({
      toastitem: { hidden: true, title: '' }
    });
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