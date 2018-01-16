// pages/user/my_coupon/my_coupon.js
var app = getApp();
Page({
  data: {
    page: 1,
    couponList: [],
    initFlag: true,//第一次调取数据
    showNoMore: false,//是否显示没有更多
    hasMore: true,//是否还有数据
    dataBackFlag:false//列表数据调取回来
  },
  onLoad: function (options) {
    //调取数据
    this.getCouponList();
  },
  getCouponList(isShowLoading) {
    typeof isShowLoading == 'undefined' && (isShowLoading = true);
    if (this.data.hasMore) {
      wx.showNavigationBarLoading();
      app.globalData.wtApi.myCouponList({ 'page': this.data.page }, isShowLoading).then((data) => {
        if (data.status == 1) {
          data.result.list.length > 0 && data.result.list.forEach((value, key) => {
            value.toggle = true;
            if (value.limit_text.replace(/[^\x00-\xff]/g, "01").length > 44) {
              value.limit_ellipsis_text = this.cutstr(value.limit_text, 44);
              value.enoughLongText = true
            } else {
              value.limit_ellipsis_text = value.limit_text;
              value.enoughLongText = false
            }
          })
          /*是否显示显示更多*/
          if ((this.data.initFlag && data.result.list.length < 7) || data.result.list.length >= 10) {
            this.data.showNoMore = false;
          }else{
            this.data.showNoMore = true;
          }

          /*合并数据*/
          let totalCouponList = this.data.couponList.concat(data.result.list);
          let page = this.data.page + 1
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
    let id = event.currentTarget.dataset.id;
    this.data.couponList.forEach((value) => {
      if(value.id == id){
        value.toggle = !value.toggle
      }
    })
    this.setData({
      couponList: this.data.couponList
    })
  },
  toGetCouponTap(event) {
    let couponid = event.currentTarget.dataset.couponid;
    wx.redirectTo({
      url: '../../shop-list/shop-list?couponid='+couponid
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

  // 重新调取数据
  changeData: function () {
    this.setData({
      page: 1,
      couponList: [],
      initFlag: true,//第一次调取数据
      showNoMore: false,//是否显示没有更多
      hasMore: true//是否还有数据
    });
    this.getCouponList()
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
      dataBackFlag: false//列表数据调取回来
    });
    this.getCouponList(false);
  }

})