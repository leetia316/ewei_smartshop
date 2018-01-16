// pages/user/order_detail/order_detail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    orderDetailData: {},
    reasons: [
      '我不想买了',
      '信息填写错误，重新拍',
      '同城见面交易',
      '其他原因'
    ],
    cancelreason: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.id
    });
    this.getData()
    if (options.payOver) {
      var pages = getCurrentPages();
      if (pages.length > 1) { //上一个页面实例对象 
        var prePage = pages[pages.length - 2]; //关键在这里
        prePage.getData()
      }
    }
  },
  getData(isShowLoading) {
    typeof isShowLoading == 'undefined' && (isShowLoading = true);
    app.globalData.wtApi.orderDetail({ 'orderid': this.data.orderId }, isShowLoading).then((data) => {
      this.processData(data, isShowLoading);
    })
  },
  processData(data, isShowLoading) {
    if (data.status == 1) {
      //订单状态处理
      switch (data.result.order.status) {
        case "0":
          data.result.order.bannnerStatusStr = '等待付款';
          data.result.order.bannnerImgStatusStr = '待付款';
          break;
        case "1":
          data.result.order.bannnerStatusStr = '买家已付款';
          data.result.order.bannnerImgStatusStr = '已付款';
          break;
        case "2":
          data.result.order.bannnerStatusStr = '卖家已发货';
          data.result.order.bannnerImgStatusStr = '已发货';
          break;
        case "3":
          data.result.order.bannnerStatusStr = '交易完成';
          data.result.order.bannnerImgStatusStr = '完成';
          break;
        case "4":
          data.result.order.bannnerStatusStr = '买家已付款';
          data.result.order.bannnerImgStatusStr = '已付款';
          break;
      }
      //处理自定义表单处理
      // 单文本显示singleTextArr， 多文本显示manyTextArr，图片显示 imgsArr
      let singleTextArr = [], manyTextArr = [];
      data.result.goods.forEach((good) => {
        good.goods_info.forEach((goodInfo) => {
          for (let key in goodInfo.diyformfields) {
            let value = goodInfo.diyformfields[key];
            //0 单行文本 2 下拉框 6 省份证号码 7 日期 
            if (value.data_type == 0 || value.data_type == 2 || value.data_type == 6 || value.data_type == 7) {
              singleTextArr.push({
                'name': value.tp_name,
                'data': goodInfo.diyformdata[key]
              })
            }
            // 8 日期范围
            if (value.data_type == 8) {
              let date = '';
              if (goodInfo.diyformdata[key].length > 0) {
                date = goodInfo.diyformdata[key][0] + "至" + goodInfo.diyformdata[key][1]
              }
              singleTextArr.push({
                'name': value.tp_name,
                'data': date
              })
            }
            //3 多选框
            if (value.data_type == 3) {
              manyTextArr.push({
                'name': value.tp_name,
                'data': goodInfo.diyformdata[key]
              })
            }
            // 9 城市 
            if (value.data_type == 9) {
              manyTextArr.push({
                'name': value.tp_name,
                'data': [goodInfo.diyformdata[key].province, goodInfo.diyformdata[key].city]
              })
            }
            //5 图片
            if (value.data_type == 5) {
              goodInfo.imgsArr = {
                'name': value.tp_name,
                'data': goodInfo.diyformdata[key]
              }
            }
          }
          goodInfo.singleTextArr = singleTextArr;
          goodInfo.manyTextArr = manyTextArr;
        })
      })
      this.setData({
        orderDetailData: data.result
      })
      !isShowLoading && wx.stopPullDownRefresh();
    }
  },
  infoToggleTap(event) {
    let goodid = event.currentTarget.dataset.goodid;
    this.data.orderDetailData.goods.forEach((value, key) => {
      value.goods_info.forEach((good, index) => {
        if (good.goodsid == goodid) {
          var toggle = this.data.orderDetailData.goods[key].goods_info[index].toggle;
          this.data.orderDetailData.goods[key].goods_info[index].toggle = !toggle;
          this.setData({
            orderDetailData: this.data.orderDetailData
          })
        }
      })
    })
  },
  toIndexTap(event) {
    wx.switchTab({
      url: '../../index/index',
    })
  },
  onDeliveryTap(event) {
    wx.showModal({
      title: '提示',
      content: '请在公众号中查看物流详情',
      showCancel: false
    })
  },
  onHelpRightTap(event) {
    wx.showModal({
      title: '提示',
      content: '若要查看维权详情，请到公众号中查看',
      showCancel: false
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
              that.processData(data, false);
            } else {
              console.log(data.result.message)
              wx.showToast({
                title: '操作失败'
              })
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
      showModalStatus: true
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
    this.hideModal();
    app.globalData.wtApi.cancelOrder({ 'orderid': this.data.cancelid, 'remark': this.data.cancelreason }).then((data) => {
      if (data.status == 1) {
        setTimeout(() => {
          wx.showToast({
            title: '取消成功'
          });
        }, 500)
        setTimeout(()=>{
          wx.redirectTo({
            url: '../my_order/my_order'
          })
        },1800)
      } else {
        console.log(data.result.message);
        wx.showToast({
          title: '操作失败'
        })
      }
    })
  },
  onPullDownRefresh: function () {
    this.setData({
      orderDetailData: {},
    });
    this.getData(false);
  }
})