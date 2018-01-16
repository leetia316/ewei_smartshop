// index.js
var utils = require("../../../utils/util.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],

    userInfo: {},
    addressInfo:undefined,    //地址信息
    couponItem:undefined,     //优惠券信息
    couponPosition:-1,
    
    // 地址数据
    id: '',
    realname: '',
    mobile: '',
    province: '',
    city: '',
    area: '',
    address: '',
    //确认订单数据
    result:'',
    // 传递给支付界面
    orderid:'',
    priceSum:0,
    priceBackups:0, 
    // 买家留言
    leaveMessage:'',
    fromcart:1, // 订单来源： 1购物车 0立即购买
    gdid:0,       //自定义表单ID
    // 显示内容控制
    receiverItem: { title: '选填:', hint: '买家留言（50字以内）', leaveMessage: '' },
    itemCoupon: { fistName: '选择优惠券', lastContent: '0', showArrow: false },
    itemAmount: { fistName: '商品小计', lastContent: '￥0', showArrow: true },
    itemCarriage: { fistName: '运费', lastContent: '￥0', showArrow: true },

    showMallDiscount:false,
    showCoupon:false,
    couponContent: { fistName: '优惠券优惠', lastContent: '-￥0', showArrow: true }, 
    //会员、促销
    showMember:false,
    showPromotion:false,
    memberItem: { fistName: '会员优惠', lastContent: '-￥0', showArrow: true }, 
    promotionItem: { fistName: '促销优惠', lastContent: '-￥0', showArrow: true }, 
    // 商户满减
    showMerchants:false,
    showMallDiscount: false,
    merchantsReduction: { fistName: '商户单笔满', fistMoney: 0, fistEnd: '元', lastContent: '￥0' },
    mallDiscounts: { fistName: '商户单笔满', fistMoney: 0, fistEnd: '元', lastContent: '￥0' }, 

    // 立即购买的参数
    goodsid:0,
    optionid:0,
    total:0,
    gdid:0,
    // 会员 促销是否显示 备份
    memberBackups: false, 
    promotionBackups:false,
    itemCouponBackups:{}
  },

  /**
   */
  onLoad: function (options) {
    var that = this
    
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        id: options.id,
        realname: options.realname,
        mobile: options.mobile,
        province: options.province,
        city: options.city,
        area: options.area,
        address: options.address,
        goodsid: options.goodsid,
        optionid: options.optionid,
        total: options.total,
        gdid: options.gdid,
      })
    });

    let data = {}
    if (that.data.goodsid != 0){
      data = {
        goodsid: that.data.goodsid,
        optionid: that.data.optionid,
        total: that.data.total,
        gdid: that.data.gdid,
      }
    }
  
    app.globalData.wtApi.postComfirmOrder(data).then((data) => {
      if (data.status == 0){
        wx.showToast({
          title: data.result.message,
          duration: 1000
        });
        wx.navigateBack();  //返回上一个页面 
      }

      let priceSum = 0;
      let couponone = '';
      let coupontwo = '';
      let couponthree = '';
      let isCoupon = false;   //是否显示优惠券
      let isMember = false;   //是否显示会员优惠
      let showPromotion = false;  //是否显示促销优惠
      let isMall = false; //是否显示商城优惠
      let isMerchants = false;    //
      let address = undefined;  
      
      if (data.result.address != undefined && data.result.address.id != undefined){
        address = data.result.address
      }

      priceSum = data.result.goods_price;
      if (data.result.couponcount != 0) {
        couponone = '可用';
        coupontwo = data.result.couponcount;
        couponthree = '张';
      } else {
        couponone = '无可用优惠券'
      }
      // 会员优惠
      if (data.result.discountprice != 0) {
        isMember = true
        priceSum = priceSum - data.result.discountprice;
      }
      // 促销优惠
      if (data.result.isdiscountprice != 0) {
        showPromotion = true
        priceSum = priceSum - data.result.isdiscountprice;
      }
      //商城满减
      if (data.result.saleset.showenough) {
        isMall = true
        priceSum = priceSum - data.result.saleset.enoughdeduct;
      }
      //商户满减
      if (data.result.merch_saleset.merch_showenough != null) {
        isMerchants = true  
        priceSum = priceSum - data.result.merch_saleset.merch_enoughdeduct;
      }
      priceSum = utils.formData(priceSum + data.result.dispatch_price);
   
      
      that.setData({
        result: data.result,
        priceSum: priceSum,
        priceBackups: priceSum,
        fromcart: data.result.fromcart,
        gdid: data.result.gdid,
        dataList: data.result.goods_list,
        itemCoupon: { fistName: '选择优惠券', lastone: couponone, lasttwo: coupontwo, lastthree: couponthree, showArrow: false },
        itemCouponBackups: {fistName: '选择优惠券', lastone: couponone, lasttwo: coupontwo, lastthree: couponthree, showArrow: false },
        itemAmount: { fistName: '商品小计', lastContent: '￥' + utils.formData(data.result.goods_price), showArrow: true },
        itemCarriage: { fistName: '运费', lastContent: '￥' + utils.formData(data.result.dispatch_price), showArrow: true },
       
        showMember: isMember,
        memberBackups: isMember,
        showPromotion: showPromotion,
        promotionBackups: showPromotion,
        memberItem: { fistName: '会员优惠', lastContent: '-￥' + utils.formData(data.result.discountprice), showArrow: true },
        promotionItem: { fistName: '促销优惠', lastContent: '-￥' + utils.formData(data.result.isdiscountprice), showArrow: true },

        showMallDiscount: isMall,     //商城满减
        showMerchants: isMerchants,   //商户满减
        merchantsReduction: { fistName: '商户单笔满', fistMoney: utils.formData(data.result.merch_saleset.merch_enoughmoney), fistEnd: '元', lastContent: '-￥' + utils.formData(data.result.merch_saleset.merch_enoughdeduct)},
        
        mallDiscounts: { fistName: '商城单笔满', fistMoney: utils.formData(data.result.saleset.enoughmoney), fistEnd: '元', lastContent: '-￥' + utils.formData(data.result.saleset. enoughdeduct)}, 
        addressInfo: address
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

    let isCoupon = false;   //是否显示优惠券
    let couponone = '';
    let coupontwo = '';
    let couponthree = '';
    let couponMoney = '-￥'
    let priceSum = 0;
    let isMember = false;   //是否显示会员优惠 
    if (this.data.couponItem == undefined){
      isCoupon = false
      isMember =  this.data.memberBackups
      if (this.data.result.couponcount != 0) {
        couponone = '可用';
        coupontwo = this.data.result.couponcount;
        couponthree = '张';
      } else {
        couponone = '无可用优惠券'
      }
      couponMoney = '￥' + 0
      priceSum = this.data.priceBackups;

    }else{
      isCoupon = true

      coupontwo = this.data.couponItem.couponname

      if (this.data.couponItem.deduct < 0.01){
        isCoupon = false;
      }
      couponMoney = '-￥' + this.data.couponItem.deduct
      this.selectedCouponUpdate()
    }


  
    this.setData({
      priceSum: priceSum,
      showMember:isMember,
      itemCoupon: { fistName: '选择优惠券', lastone: couponone, lasttwo: coupontwo, lastthree: couponthree, showArrow: false },
      showCoupon: isCoupon,
      couponContent: { fistName: '优惠券优惠', lastContent:couponMoney, showArrow: true },
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
  // onShareAppMessage: function () {
  
  // },

  /**
   * 跳转到选择地址
   */
  gotoChooseAddress(e){
    // console.log(' 跳转到选择地址 sadkskldklsdlksdlk' + JSON.stringify(this.data.addressInfo))
    let addressid = 0
    if (this.data.addressInfo){
      addressid = this.data.addressInfo.id;
    }

    wx.navigateTo({
      url: '../../address/addresslist/index?addressid=' + addressid
    })
  },

  /**
   * 跳转到选择优惠券
   */
  gotoChooseCoupon(e){
    if(this.data.result.couponcount == 0){
      return
    }

    let type = 0;
    let money = this.data.result.goods_price;
   
    wx.navigateTo({
      url: '../couponselect/index?type=' + type + '&money=' + money + '&goods=' + JSON.stringify(this.data.result.goods) + '&couponPosition=' + this.data.couponPosition + '&merchs=' + JSON.stringify(this.data.result.merchs) ,
    })
  },

  /**
   * 跳转到支付
   */
  gotoPay: function(e){
    // 立即支付
    if (this.data.addressInfo == undefined){
      wx.showToast({
        title: '请选择收货地址！',
        duration: 1000
      });
      return
    }

    let couponid = 0
    if (this.data.couponItem != undefined){
      couponid = this.data.couponItem.id
    }

    let data = {
      dispatchtype: 0,//配送方式：0 快递 1 自提
      addressid: this.data.addressInfo.id,
      // addressid: 17,
      fromcart: this.data.fromcart,        // 1 购物车，0 立即购买
      gdid: this.data.gdid,
      couponid: couponid,
      goods: this.data.result.goods,
      // deduct: 0,
      // deduct2: 0,
      // invoicename: 0,
      // diydata: 0,
      remark: this.data.leaveMessage,
      // packageid: 0,
    }

    app.globalData.wtApi.postSubmitOrder(data).then((data) => {
      if(data.status == 1){
        wx.redirectTo({
          url: '../orderpay/index?money=' + this.data.priceSum + '&id=' + data.result.orderid,
        })
      }else{
        setTimeout(() => {
          wx.showToast({
            image: '/images/common/icon_warning.png',
            title: data.result.message,
            duration: 1000
          })
        }, 500)
      }
    })

  },

  // 优惠券更新数据
  selectedCouponUpdate: function(){
    if (this.data.couponItem == undefined) {
      return
    }
    let that = this
    let data = {
      couponid: this.data.couponItem.id,	//是	int	优惠券ID
      coupon_goods: this.data.result.coupon_goods,	//是	object	商品信息（coupon_goods）
      goodsprice: this.data.result.goods_price,	//是	number	总价格
      discountprice: this.data.result.discountprice,// 是 number 会员优惠 
      isdiscountprice: this.data.result.isdiscountprice
    }

    app.globalData.wtApi.postChooseCoupon(data).then((data) => {
      // console.log('globalData 优惠券更新数据: ' + JSON.stringify(data))
      let sumPrice = that.data.result.goods_price;
      let showCoupon = false;
      let couponMoney = 0;
      let isMember = false;   //是否显示会员优惠 
      let showPromotion = false;  //是否显示促销优惠 : showPromotion,
      sumPrice = sumPrice + that.data.result.dispatch_price;
      if (that.data.showMerchants){//商城优惠
        sumPrice = sumPrice - that.data.result.merch_saleset.merch_enoughdeduct;
      }
      if (that.data.showMallDiscount){//商户优惠
        sumPrice = sumPrice - that.data.result.saleset.enoughdeduct;
      }

      if (data.result.limitdiscounttype == 0){//不限制
        isMember = true;
        showPromotion = true;
        //优惠券优惠  会员优惠  促销优惠
        if (data.result.discountprice != null) {
          sumPrice = sumPrice - data.result.discountprice;
          if (data.result.discountprice == 0) {
            isMember = false
          }
        }
        if (data.result.isdiscountprice != null) {
          sumPrice = sumPrice - data.result.isdiscountprice;
        }
      } else if (data.result.limitdiscounttype == 1) { //限制促销优惠 : 
        isMember = true;
        showPromotion = false; 
        //优惠券优惠  会员优惠  促销优惠
        if (data.result.discountprice != null) {
          sumPrice = sumPrice - data.result.discountprice;
          if (data.result.discountprice == 0) {
            isMember = false
          }
        }
      } else if (data.result.limitdiscounttype == 2) {  //限制会员优惠 
        isMember = false;
        showPromotion = true;
        if (data.result.isdiscountprice != null) {
          sumPrice = sumPrice - data.result.isdiscountprice;
        }
      } else if (data.result.limitdiscounttype == 3) {  //限制促销和会员优惠
        isMember = false;
        showPromotion = false;
      }

      if (data.result.deductprice != null) {
        sumPrice = sumPrice - data.result.deductprice;
        couponMoney = '-￥' + utils.formData( data.result.deductprice);
        showCoupon = true;
      }
      
      that.setData({
        showMember: isMember,
        showCoupon: showCoupon,
        couponContent: { fistName: '优惠券优惠', lastContent: couponMoney, showArrow: true },
        priceSum: utils.formData(sumPrice)
      })
    })
  }, 

  // 获取买家留言输入的内容
  valueInput: function(e){
    var detail = e.detail.value;
    var id = e.target.id;
    if (id == '选填:') {
      this.setData({
        leaveMessage: detail,
      })
    } 
  },

  clearInputContent: function(e){
    this.setData({
      leaveMessage: "",
      receiverItem: { title: '选填:', hint: '买家留言（50字以内）', leaveMessage: '' },
    })
  }

})