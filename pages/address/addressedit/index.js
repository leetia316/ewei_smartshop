// index.js
//获取应用实例
var tcity = require("../../../utils/citys.js");
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

    provinces: [],
    province: "",
    citys: [],
    city: "",
    countys: [],
    county: '',
    value: [0, 0, 0],
    values: [0, 0, 0],
    condition: false,

    receiverItem: { title: '收件人', hint: '收件人', isAddress: 0, showline:true,maxlength: 20 },
    phoneItem: { title: '联系电话', hint: '请填写手机号', isAddress: 1, showline:true,type: 'number', maxlength: 11 },
    districtItem: { title: '所在地区', hint: '请选择所在地区', isAddress: 2,showline:true },
    addressItem: { title: '详细地址', hint: '街道，楼牌号', isAddress: 3, showline:false,maxlength: 0 },

    // 地址数据
    id: '',
    realname: '',
    backupsname: '',
    mobile: '',
    province: '',
    city: '',
    area: '',
    address: '',
    addressSize: 0, //现在收货地址数量
    changeAddress: false,
    // 记录系统型号
    systemType: 'ios'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({
      id: options.id,
      realname: options.realname,
      backupsname: options.realname,
      mobile: options.mobile,
      province: options.province,
      city: options.city,
      area: options.area,
      address: options.address,
      addressSize: options.addressSize,

      receiverItem: { title: '收件人', hint: options.realname, isAddress: 0, showline: true, type: 'text', maxlength: 20 },
      phoneItem: { title: '联系电话', hint: options.mobile, isAddress: 1, showline:true,type: 'number', maxlength: 11 },
      districtItem: { title: '所在地区', hint: options.province + ' ' + options.city + ' ' + options.area, isAddress: 2, showline: true },
      addressItem: { title: '详细地址', hint: options.address, isAddress: 3, showline: false, type: 'text', maxlength: 0 },

    }),

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
      'county': cityData[0].sub[0].sub[0].name
    })

    let sysinfo = wx.getSystemInfoSync();
    if (sysinfo) {
      console.log('sysinfo : ' + JSON.stringify(sysinfo));
      let systemType = 'ios';
      let systemInfo = sysinfo.system;
      if (sysinfo.system.indexOf('iOS ') >= 0) {
        systemType = 'ios'
      } else {
        systemType = 'android'
      }

      this.setData({
        addressItem: { title: '详细地址', hint: options.address, isAddress: 3, type: 'text', maxlength: 0, system: systemType, showline: false },
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
      changeAddress: true,
      condition: !this.data.condition,
      districtItem: { title: '所在地区', hint: this.data.province + " " + this.data.city + " " + this.data.county, isAddress: 2, showline: true},
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
    if (id == '收件人') {
      if (detail.length == 0) {
        this.setData({
          receiverItem: { title: '收件人', hint: this.data.backupsname, isAddress: 0, showline: true, type: 'text', maxlength: 20 },
        })
      } else {
        this.setData({
          realname: detail
        })
      }

    } else if (id == '联系电话') {
      if (detail == '') {
        this.setData({
          phoneItem: { title: '联系电话', hint: this.data.phone, isAddress: 1, showline: true, type: 'number', maxlength: 11 },
        })
      } else {
        this.setData({
          mobile: detail
        })
      }
    } else if (id == 'textarea') {
      if (detail == '') {
        this.setData({
          addressItem: { title: '详细地址', hint: this.data.address, isAddress: 3, showline: false, system: this.data.systemType, type: 'text', maxlength: 0 },
        })
      } else {
        this.setData({
          address: detail
        })
      }
    }
  },

  /**
   * 设置刷新数据
   */
  refreshAddressInfo: function () {
    this.setData({
      districtItem: {
        title: '所在地区', hint: this.data.province + " " + this.data.city + " " + this.data.county, isAddress: 2, showline: true
      }
    })
  },

  // 修改地址
  editAddress: function (e) {
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
        title: '手机号格式错误！',
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

    let addressStr = this.data.province + ' ' + this.data.city + ' ' + this.data.area
    if (this.data.changeAddress) {
      addressStr = this.data.province + " " + this.data.city + " " + this.data.county
    }

    let data = {
      "id": this.data.id,
      "realname": this.data.realname,
      "mobile": this.data.mobile,
      "areas": addressStr,
      "address": this.data.address,
    }
    app.globalData.wtApi.getaddressSubmit(data).then((data) => {
      if (data.status == 1) {
        // wx.showToast({
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
  },

  // 删除地址
  deleteAddress: function (e) {
    //判断是不是最后一条
    let id = this.data.id
    let data = {
      "id": id,
    }
  
    let hide = '确认删除这个地址吗？';
    if (this.data.addressSize == 1){
      hide = '再删就没地址啦';
      wx.showToast({
        image: '/images/common/icon_warning.png',
        title: hide,
        duration: 1000
      })
      return;
    }


    wx.showModal({
      title: '提示',
      content: hide,
      success: function (res) {
        if (res.confirm) {
          app.globalData.wtApi.getaddressDelete(data).then((data) => {
            if (data.status == 1) {
              // wx.showToast({
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
        } else if (res.cancel) {
      
        }
      }
    })
  },

})