// index.js
//获取应用实例
var tcity = require("../../../utils/citys.js");
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 地址联动显示相关
    provinces: [],
    province: "",
    citys: [],
    city: "",
    countys: [],
    county: '',
    value: [0, 0, 0],
    values: [0, 0, 0],
    condition: false,

    //设置横栏显示
    receiverItem: { title: '收件人', hint: '收件人', isAddress: 0, type: 'text', maxlength: 20, showline: true},
    phoneItem: { title: '联系电话', hint: '请填写手机号', isAddress: 1, type: 'number', maxlength: 11, showline: true },
    districtItem: { title: '所在地区', hint: '请选择所在地区', isAddress:2, showline: true },
    addressItem: { title: '详细地址', hint: '街道，楼牌号', isAddress: 3, type: 'text', maxlength: 0, ststem:'ios',showline: false },

    // 输入数据
    realname:'',
    mobile:'',
    addressdetail:'',
    // 记录系统型号
    systemType:'ios'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    tcity.init(that);
    var cityData = that.data.cityData;
    const provinces = [];
    const citys = [];
    const countys = [];
    for (let i = 0; i < cityData.length; i++) {
      provinces.push(cityData[i].name);
    }
    for (let i = 0; i < cityData[0].sub.length; i++) {
      citys.push(cityData[0].sub[i].name)
    }
    for (let i = 0; i < cityData[0].sub[0].sub.length; i++) {
      countys.push(cityData[0].sub[0].sub[i].name)
    }

    that.setData({
      'provinces': provinces,
      'citys': citys,
      'countys': countys,
      'province': cityData[0].name,
      'city': cityData[0].sub[0].name,
      'county': cityData[0].sub[0].sub[0].name,
    })

    let sysinfo = wx.getSystemInfoSync();
    if (sysinfo) {
      console.log('sysinfo : ' + JSON.stringify(sysinfo));
      let systemType = 'ios';
      let systemInfo = sysinfo.system;
      if (sysinfo.system.indexOf('iOS ') >= 0){
        systemType = 'ios'
      }else{
        systemType = 'android'
      }

      this.setData({
        addressItem: { title: '详细地址', hint: '街道，楼牌号', isAddress: 3, type: 'text', maxlength: 0, system: systemType, showline: false },
        systemType: systemType
      })
    }  
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

  /**
   * 打开位置选择框
   */
  openModal: function () {
    this.setData({
      condition: !this.data.condition,
      districtItem: { title: '所在地区', hint: this.data.province + " " + this.data.city + " " + this.data.county, isAddress: 2, showline: true },
    })
  },

  /**
     * 联动数据改变函数
     */
  bindChange: function (e) {
    //console.log(e);
    var val = e.detail.value
    var t = this.data.values;
    var cityData = this.data.cityData;

    if (val[0] != t[0]) {
      const citys = [];
      const countys = [];

      for (let i = 0; i < cityData[val[0]].sub.length; i++) {
        citys.push(cityData[val[0]].sub[i].name)
      }
      for (let i = 0; i < cityData[val[0]].sub[0].sub.length; i++) {
        countys.push(cityData[val[0]].sub[0].sub[i].name)
      }

      this.setData({
        province: this.data.provinces[val[0]],
        city: cityData[val[0]].sub[0].name,
        citys: citys,
        county: cityData[val[0]].sub[0].sub[0].name,
        countys: countys,
        values: val,
        value: [val[0], 0, 0]
      })
      this.refreshAddressInfo();
      return;
    }
    if (val[1] != t[1]) {
      const countys = [];

      for (let i = 0; i < cityData[val[0]].sub[val[1]].sub.length; i++) {
        countys.push(cityData[val[0]].sub[val[1]].sub[i].name)
      }

      this.setData({
        city: this.data.citys[val[1]],
        county: cityData[val[0]].sub[val[1]].sub[0].name,
        countys: countys,
        values: val,
        value: [val[0], val[1], 0]
      })
      this.refreshAddressInfo();
      return;
    }
    if (val[2] != t[2]) {
      this.setData({
        county: this.data.countys[val[2]],
        values: val
      })
      this.refreshAddressInfo();
      return;
    }
  },

  /**
   * 获取输入数据
   */
  valueInput: function (e) {
    var detail = e.detail.value;
    var id = e.target.id;
    if (id == '收件人'){
      if (detail.length == 0){
        this.setData({
          receiverItem: { title: '收件人', hint: '收件人', isAddress: 0, type: 'text', maxlength: 20, showline: true},
        })
      }else{
        this.setData({
          realname: detail
        })
      }
     
    } else if (id == '联系电话'){
      if (detail == '') {
        this.setData({
          phoneItem: { title: '联系电话', hint: '请填写手机号', isAddress: 1, type: 'number', maxlength: 11, showline: true },
        })
      } else {
        this.setData({
          mobile: detail
        })
      }
    } else if (id == 'textarea'){
      if (detail == '') {
        this.setData({
          addressItem: { title: '详细地址', hint: '街道，楼牌号', isAddress: 3, type: 'text', system: this.data.systemType, maxlength: 0, showline: false},
        })
      } else {
        this.setData({
          addressdetail: detail
        })
      }
    }
  },


  /**
   * 设置刷新数据
   */
  refreshAddressInfo: function () {
    this.setData({
      districtItem: { title: '所在地区', hint: this.data.province + " " + this.data.city + " " + this.data.county, isAddress: 2, showline: true },
    })
  },

  saveAddress: function(e){
    // 判断人名是否为空
    if (this.data.realname == '') {
      wx.showToast({
        image: '/images/common/icon_warning.png',
        title: '请输入联系人',
        duration: 1000
      })
      return
    }
    //判断电话是否格式正确
    if (this.data.mobile.length == 0) {
      wx.showToast({
        image: '/images/common/icon_warning.png',
        title: '请输入手机号码',
        duration: 1000
      })
      return
    }
    let regPhone = /^1[34578]\d{9}$/;
    let tel = /^(\d{3})(\d{8})$|^(\d{4})(\d{7})$|^(\d{4})(\d{8})$/;
    if (!regPhone.test(this.data.mobile)) {
      wx.showToast({
        image: '/images/common/icon_warning.png',
        title: '手机格式错误',
        duration: 1000
      })
      return
    }
    //判断地址
    if (this.data.province + " " + this.data.city + " " + this.data.county == '') {
      wx.showToast({
        image: '/images/common/icon_warning.png',
        title: '请输入地址',
        duration: 1000
      })
      return
    }
    //判断详细地址
    if (this.data.address == '') {
      wx.showToast({
        image: '/images/common/icon_warning.png',
        title: '请输入详细地址',
        duration: 1000
      })
      return
    }

    let data = {
      "realname": this.data.realname,
      "mobile": this.data.mobile,
      "areas": this.data.province + " " + this.data.city + " " + this.data.county,
      "address": this.data.addressdetail,
    }

    console.log('county no' + JSON.stringify(data));
    app.globalData.wtApi.postAddressAdd(data).then((data) => {
      console.log('county no'+JSON.stringify(data));
      if (data.status == 1) {
        // wx.showToast({
        //   image: '/images/common/icon_warning.png',
        //   title: data.result.message,
        //   duration: 1000
        // })
        wx.navigateBack();  //返回上一个页面 
      } else {
        wx.showToast({
          image: '/images/common/icon_warning.png',
          title: data.result.message,
          duration: 1000
        })
      }
    })
  }
})