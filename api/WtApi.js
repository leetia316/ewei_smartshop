
import Promise from 'es6-promise.min'
class WtApi {
  // 定义构造函数
  constructor() {
    this._initConfig()
  }
  /**
   * 初始化对象
   */
  _initConfig() {
    this.extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
  }

  /**
   * 发起wx.request请求
   * @param path             跟路径后的路由路径
   * @param method           请求的方式[get,post]
   * @param data             request里面的数据   对象格式   如果是method为get则解析后拼接到url中，如果是method为post，则放到request数据包中
   * @param isShowLoading    是否显示loading蒙层，boolean类型  [true,false]
   * @returns {Promise}      返回promise对象
   * @private
   */
  _api(path, method, data, isShowLoading) {
    let that = this;
    this.headerConfig = {
      'Content-Type': 'application/html'
    };
    //  header配置
    let sessionId = wx.getStorageSync('session_id');
    if (sessionId) {
      this.headerConfig = Object.assign(this.headerConfig, { 'X-Wd-Session-Id': sessionId })
    }
    //  请求地址配置
    let urlString = this.extConfig.api_prefix + path;
  
    urlString += (urlString.indexOf('?') < 0 ? '?' : '&') + `i=${this.extConfig.uniacid}&ver=${this.extConfig.ver}`;
    console.log('urlString : ' + method+ ' : ' + urlString);
    return new Promise(function (resolve, reject) {
      if (isShowLoading) {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
      }
      wx.request({
        url: urlString,
        data: data,
        method: method,
        header: that.headerConfig,
        success: function (res) {
          if (isShowLoading) {
            wx.hideLoading()
          }
          if (res.data && res.data.status == '-401') {
            // 用户未登录
            that.setSessionId().then((session_id) => {
              that.headerConfig = Object.assign(that.headerConfig, { 'X-Wd-Session-Id': session_id });
              wx.request({
                url: urlString,
                data: data,
                method: method,
                header: that.headerConfig,
                success: function (res) {
                  resolve(res.data)
                },
                fail:function(){
                  setTimeout(()=>{
                    wx.showToast({
                      title: '加载失败',
                      image:'/images/common/icon_warning.png'
                    });
                  },500)
                }
              })
            })
          } else {
            resolve(res.data)
            // 为了简单，在每个接口登录的时候都判断下是否需要获取用户信息
          }
        },
        fail: function (res) {
          if (isShowLoading) {
            wx.hideLoading()
          }
          setTimeout(()=>{
            wx.showToast({
              title: '加载失败',
              image: '/images/common/icon_warning.png'
            });
          },500);
          reject(res);
        },
        complete: function (res) {
          if (isShowLoading) {
            wx.hideLoading()
          }
        }
      })
    })
  }

  //  获取session_id 并将其放入请求头中
  setSessionId() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {//返回的res.code 是 mock code？？？？
          this.apiPost('/wxa/index.php?c=auth&a=session_id', { code: res.code },true).then((data) => {
            // 添加到sessionStroge
            if (data.data) {//判断条件？？？
              wx.setStorageSync('session_id', data.data.session_id);
              // 添加到header
              this.headerConfig = Object.assign(this.headerConfig, { 'X-Wd-Session-Id': data.data.session_id });
              // 提交用户信息到服务器
              console.log('用户信息')
              wx.getUserInfo({
                success: (res) => {
                  this.userInfoSubmit({
                    'userInfo': res.userInfo,
                    'rawData': res.rawData,
                    'signature': res.signature,
                    'encryptedData': res.encryptedData,
                    'iv': res.iv
                  }).then(function (res) {
                    resolve(data.data.session_id)
                  })
                },
                fail: () => {
                  reject(res);
                  //拒绝获取用户权限
                }
              })
            } else {
              console.log(data.message)
            }
          })
        },
        fail:()=>{
          reject(res);
        }
      })
    })
  }

  /**
   * 通用请求配置 GET && POST
   */
  //  通用请求 -> GET
  apiGet(url, data, isShowLoading) {
    return this._api(url, 'GET', data, isShowLoading)
  }

  //  通用请求 -> POST
  apiPost(url, data, isShowLoading) {
    return this._api(url, 'POST', data, isShowLoading)
  }

  //  --------------------------------------------------
  /**
   * 以下为实际调用的接口 && 方法名
   */
  
  userInfoSubmit(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.account.submit', data) }    //  提交用户信息
  myCouponList(data, isShowLoading) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.sale.coupon.my.getlist', data, isShowLoading) } //我的优惠券列表
  getCouponList(data, isShowLoading) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.sale.coupon.getlist', data, isShowLoading) } //获取优惠券列表
  getCoupon(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.sale.coupon.detail.pay', data, true) }
   //购买/兑换/领取优惠券
  userCenter(data, isShowLoading) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.center.info', data, isShowLoading) } //个人中心
  myOrderList(data, isShowLoading) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.order.orderList', data, isShowLoading) } //我的订单
  orderDetail(data, isShowLoading) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.order.detail', data, isShowLoading) } //订单详情
  getCartList(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.cart.cartList', data, true) } //购物车数据
  getCouponPay(data){return this.apiPost('/wxa/index.php?i=5&c=entry&m=ewei_shopv2&do=mobile&ver=1&r=wxa.sale.coupon.detail.payresult',data)}
  ///查询优惠券购买/兑换/领取结果

  getGoods(data) {return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.goods.list.recommand',data,true)}     //首页接口//历史搜索接口
  getDelect(data) {return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.goods.list.remove_history',data)}
  //删除历史搜索接口
  getList(data) {return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.goods.list.show',data,true)}   //商品列表,搜索接口






  getorderDetail(data) {return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.goods.detail.show&id=1670',data,true)}  //商品详情展示
  getorderContent(data) {return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.goods.detail.picker&id=1670',data,true)}  //商品详情信息
  postonCart(data) {return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.cart.add',data)} //加入购物车
  postDiyform(data) {return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.create.diyform',data)}    //自定义表单
  postcomfirmOrder(data) {return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.create.comfirmOrder',data)} //确认订单
  Coupon(data) {return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.sale.coupon.my.get_list',data,true)}//可使用优惠券的商品列表接口

  getaddressList(data) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.address.selector', data, true) } //获取地址列表
  getaddressSubmit(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.address.submit', data, true) } //提交地址
  getaddressDelete(data) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.address.delete', data, false) } //删除地址
  postAddressAdd(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.address.submit', data, true) } //添加地址
  postComfirmOrder(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.create.comfirmOrder', data, true) } //提交订单订单校验
  postSubmitOrder(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.create.submit', data, true) } //提交订单
  postCartSubmit(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.cart.submit', data, true) } //提交订单
  getPayCashie(data) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.pay.cashier', data, true) } //收银台数据
  postPayGoPay(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.pay.goPay', data, false) } //去支付数据
  cancelOrder(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.order.cancel', data, true)}//取消订单
  sureOrder(data) { return this.apiGet('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.order.finish', data,true) }//确认收货
  postChooseCoupon(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.create.chooseCoupon', data, true) } //确认订单页面选择好优惠券后再计算
  deleteCartData(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.cart.remove', data, true) } //购物车数据删除
  updateCartData(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.cart.update', data) } //购物车数据更新
  selectCartData(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.member.cart.select', data) } //购物车内容是否选中
  queryCouponList(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.sale.coupon.util.query', data, true) } //获取可使用的优惠券列表
  queryPayStatus(data) { return this.apiPost('/wxa/index.php?c=entry&m=ewei_shopv2&do=mobile&r=wxa.order.pay.goPay', data,true) } //余额支付/微信支付后查询支付状态

}

export default WtApi
