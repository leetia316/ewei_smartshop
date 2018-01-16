// pages/user/my_order/my_order.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    steps: [
      {
        status: '',
        title: '全部'
      },
      {
        status: 0,
        title: '待付款'
      },
      {
        status: 1,
        title: '待发货'
      },
      {
        status: 2,
        title: '待收货'
      },
      {
        status: 3,
        title: '已完成'
      },
      {
        status: 4,
        title: '退换货'
      }

    ],
    reasons: [
      '我不想买了',
      '信息填写错误，重新拍',
      '同城见面交易',
      '其他原因'
    ],
    status: '',
    page: 1,
    cancelreason: '',
    cancelid: '',
    orderList: [],
    dataBackFlag: false,
    noScroll:false,
    hasMore:true,
  },

  onLoad: function (options) {
    this.getData()
  },
  getData(isShowLoading) {
    typeof isShowLoading == 'undefined' && (isShowLoading = true);
    let that = this;
    this.data.hasMore && app.globalData.wtApi.myOrderList({ 'status': this.data.status, 'page': this.data.page }, isShowLoading).then((data) => {
      if (data.status == 1) {
        let totalOrderList = this.data.orderList.concat(data.result.list);
        let page = this.data.page + 1;
        this.setData({
          orderList: totalOrderList,
          page:page,
          dataBackFlag: true,
          hasMore: data.result.list.length >= 15
        })
        !isShowLoading && wx.stopPullDownRefresh();
      }else{
        wx.showToast({
          title: data.result.message
        });
         that.getData();
      }
    })
  },
  onStepTap(event) {
    if (this.data.dataBackFlag) {
      this.setData({
        status: event.currentTarget.dataset.status,
        dataBackFlag: false,
        orderList: [],
        page:1,
        hasMore: true,
      })
      this.getData()
    }
  },
  onOrderTap(event) {
    let orderid = event.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: `../order_detail/order_detail?id=${orderid}`,
    })
  },
  toIndexTap(event) {
    wx.switchTab({
      url: '../../index/index',
    })
  },
  onCancelTap(event) {
    this.setData({
      cancelreason: '',
      cancelid: event.currentTarget.dataset.orderid
    })
    this.showModal()
  },
  onPayTap(event) {
    let orderid = event.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: `../../order/orderpay/index?id=${orderid}`,
    })
  },
  onSureTap(event) {
    let that = this;
    let orderid = event.currentTarget.dataset.orderid;
    wx.showModal({
      title: '提示',
      content: '确认已收到货了吗？',
      success: function (res) {
        if (res.confirm) {
          // 调取收货接口
          app.globalData.wtApi.sureOrder({ 'orderid': orderid }).then((data) => {
            if (data.status == 1) {
              setTimeout(() => {
                wx.showToast({
                  title: '已收货'
                });
              }, 500)
              that.data.orderList.forEach((orderItem)=>{
                if (orderItem.id == orderid){
                  if (that.data.status == ''){
                    orderItem.status = 3;
                    orderItem.statusstr = '已完成';
                  } else if (that.data.status == 2){
                    let index = that.data.orderList.indexOf(orderItem);
                    that.data.orderList.splice(index,1)
                  }
                }
              })
              that.setData({
                orderList: that.data.orderList
              })
            } else {
              console.log(data.result.message)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true,
      noScroll: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
    
  },
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      noScroll: false
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  // 选择取消订单原因
  onCancelReasonTap(event) {
    this.setData({
      cancelreason: event.currentTarget.dataset.cancelreason,
    })
  },
  //取消弹层确定按钮
  onCancelSureTap(event) {
    let that = this;
    this.hideModal();
    if (this.data.cancelreason != '') {
      app.globalData.wtApi.cancelOrder({ 'orderid': this.data.cancelid, 'remark': this.data.cancelreason }).then((data) => {
        if (data.status == 1) {
          setTimeout(()=>{
            wx.showToast({
              title: '取消成功'
            });
          },500)
          
          this.data.orderList.forEach((orderItem) => {
            if (orderItem.id == this.data.cancelid){
              let index = this.data.orderList.indexOf(orderItem);
              this.data.orderList.splice(index,1)
            }
          })
          this.setData({
            orderList: this.data.orderList
          })
        } else {
          console.log(data.result.message)
        }
      })
    }

  },
  onReachBottom: function () {
    this.getData();
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      orderList: [],
      dataBackFlag: false,
      hasMore: true,
    });
    this.getData(false);
  }

})