// pages/user/get_coupon/get_coupon.js
var app = getApp();
Page({
  data: {
    page: 1,
    couponList: [],
    initFlag: true,//第一次调取数据
    showNoMore: false,//是否显示没有更多
    hasMore: true,//是否还有数据
    dataBackFlag:false //列表数据回来
  },
  onLoad: function (options) {
    //调取数据
    this.getCouponList();
  },
  getCouponList(isShowLoading) {
    typeof isShowLoading == 'undefined' && (isShowLoading = true);
    if (this.data.hasMore) {
      wx.showNavigationBarLoading();
      app.globalData.wtApi.getCouponList({ 'page': this.data.page }, isShowLoading).then((data) => {
        if (data.status == 1) {
          data.result.list.length > 0 && data.result.list.forEach((value, key) => {
            value.toggle = true;
            /*描述省略号展开，此处用的是字数限制，也可以用小程序的wx.createSelectorQuery()获取节点信息*/
            if (value.limit_text.replace(/[^\x00-\xff]/g, "01").length > 44) {
              value.limit_ellipsis_text = this.cutstr(value.limit_text, 44);
              value.enoughLongText = true
            } else {
              value.limit_ellipsis_text = value.limit_text;
              value.enoughLongText = false
            }

          });
          /*是否显示显示更多*/
          if ((this.data.initFlag && data.result.list.length < 7) || data.result.list.length >= 10) {
            this.data.showNoMore = false;
          } else {
            this.data.showNoMore = true;
          }

          /*合并数据*/
          let totalCouponList = this.data.couponList.concat(data.result.list);
          let page = this.data.page + 1;
          /*设置数据*/
          this.setData({
            page: page,
            couponList: totalCouponList,
            initFlag: false,
            hasMore: data.result.list.length >= 10,
            showNoMore: this.data.showNoMore,
            dataBackFlag:true
          });
          !isShowLoading && wx.stopPullDownRefresh();
        } else {
          console.log(data.message)
        }
        wx.hideNavigationBarLoading()
      })
    }

  },
  /*事件*/
  onDesToggleTap(event) {
    let couponid = event.currentTarget.dataset.couponid;
    this.data.couponList.forEach((value) => {
      if (value.id == couponid) {
        value.toggle = !value.toggle
      }
    })
    this.setData({
      couponList: this.data.couponList
    })
  },
  getCouponTap(event) {
    let couponid = event.currentTarget.dataset.couponid;
    let content = "", that = this;
    this.data.couponList.forEach((value) => {
      if (value.id == couponid) {
        if (value.credit == 0 && value.money == 0) {
          this.toGetCoupon(couponid,'领取成功，请到商城中使用')
        } else {
          if (value.credit > 0 && value.money > 0) {
            content = `兑换此优惠券，将消耗${value.credit}积分${value.money}元确定兑换吗？`
          } else {
            if (value.credit > 0) {
              content = `兑换此优惠券，将消耗${value.credit}积分确定兑换吗？`
            }
            if (value.money > 0) {
              content = `兑换此优惠券，将消耗${value.money}元确定兑换吗？`
            }
          }
          wx.showModal({
            title: '提示',
            content: content,
            success: function (res) {
              if (res.confirm) {
                that.toGetCoupon(couponid,'兑换成功，请到商城中使用')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }

    })
  },
  // 兑换优惠券接口
  toGetCoupon(couponid,msg) {
    var that = this;
    app.globalData.wtApi.getCoupon({ 'id': couponid }).then((data) => {
      if (data.status == 1) {
        if (data.result.wechat && data.result.wechat.success) {
          var params = data.result.wechat;
          params.success = function (res) {
            that.toGetCouponPay(data.result.logid);
          },
          wx.requestPayment(params)
        } else {
          that.toGetCouponPay(data.result.logid,msg);
        }
      } else {
        wx.showModal({
          title: '提示',
          content: data.result.message,
          showCancel: false
        })
      }
    })
  },
  toGetCouponPay(logid,msg) {
    let content = '';
    app.globalData.wtApi.getCouponPay({ 'logid': logid }).then((data) => {
      if (data.status == 1) {
        content = msg;
      } else if (data.status == -1) {
        content = data.result.message;
      }
      wx.showModal({
        title: '提示',
        content: content,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            //获取页面栈
            var pages = getCurrentPages();
            if (pages.length > 1) {
              //上一个页面实例对象
              var prePage = pages[pages.length - 2];
              //关键在这里
              prePage.changeData()
            }
          }
        }
      })
    })
  },
  cutstr(str, len) {
    let str_length = 0, str_cut = '', str_len = str.length, strItem;
    for (var i = 0; i < str_len; i++) {
      strItem = str.charAt(i);
      str_length++;
      if (/[^\x00-\xff]/.test(strItem)) {
        str_length++;
      }
      str_cut = str_cut.concat(strItem);
      if (str_length >= len) {
        str_cut = str_cut.concat("...");
        return str_cut;
      }
    }
  },
  onReachBottom: function () {
    this.getCouponList();
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      couponList: [],
      initFlag: true,//第一次调取数据
      showNoMore: false,//是否显示没有更多
      hasMore: true,//是否还有数据
      dataBackFlag:false //列表数据回来
    });
    this.getCouponList(false);
  }
});