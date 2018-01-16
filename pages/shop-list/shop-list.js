// pages/shop-list/shop-list.js
var app = getApp();
let Promise = require("../../utils/es6-promise.min.js");
/*接口*/

//let Url = '/wxa/index.php?i=8&c=entry&m=ewei_shopv2&do=mobile&r=wxa.goods.list.show&ver=1';
Page({

  /**
   * 页面的初始数据
   */

  data: {
    pali: [
      {
        id: 0,
        style: '',
        title: '综合'
      },
      {
        id: 1,
        title: '销量'
      },
      {
        id: 2,
        by: '',
        title: '价格',
        image: "/images/imgIndex/intt.png",
        style: ''
      },
    ],
    screen: [
      {
        ider: 3,
        isrecommand: '',
        isnew: '',
        ishot: '',
        isdiscount: '',
        issendfree: '',
        istime: '',
        title: '筛选',
        image: '/images/imgIndex/shape_01.png'
      }
    ],
    status: '',
    goodsData: [],
    page: 1,       //分页
    total: 10,     //数量
    scrollHeight: 0,
    scrollTop: 0,
    showView: false,  //弹层隐藏/显示
    isRecom: true,
    colorView: true,
    isColor: true,
    isCount: true,
    isFree: true,
    isTimer: true,
    parms: '',
    typedata: [{ 'id': 1, style: '', title: '商品推荐' }, { 'id': 0, style: '', title: '新品上市' }, { 'id': 0, style: '', title: '热卖商品' }, { 'id': 0, style: '', title: '促销商品' }, { 'id': 0, style: '', title: '上架包邮' }, { 'id': 0, style: '', title: '限时抢购' }],
    message: '', ///搜索没有数据返回的文字提示
    news: '',    ///商品列表没有数据返回的文字提示
    initFlag: true,//第一次调取数据
    showNoMore: false,  //是否显示没有更多
    statusShow: false,
    seatchtitle: '搜索商品'

  },

  metaData: {
    keywords: '',
    order: '',
    by: '',
    isrecommand: false,
    isnew: false,
    ishot: false,
    isdiscount: false,
    issendfree: false,
    istime: false,
    page: 1,
    merchid: 0
  },
  //有优惠券id
  couponData: {
    couponid: '',
    keywords: '',
    order: '',
    by: '',
    isrecommand: false,
    isnew: false,
    ishot: false,
    isdiscount: false,
    issendfree: false,
    istime: false,
    page: 1,
    merchid: 0
  },

  query: function () {
    let params = {};
    if (!!this.metaData.keywords) {
      params.keywords = this.metaData.keywords;
    }
    if (!!this.metaData.order) {
      params.order = this.metaData.order;
    }
    if (!!this.metaData.by) {
      params.by = this.metaData.by;
    }
    if (!!this.metaData.isrecommand) {
      params.isrecommand = +this.metaData.isrecommand;
    }
    if (!!this.metaData.ishot) {
      params.ishot = +this.metaData.ishot;
    }
    if (!!this.metaData.isnew) {
      params.isnew = +this.metaData.isnew;
    }
    if (!!this.metaData.isdiscount) {
      params.isdiscount = +this.metaData.isdiscount;
    }
    if (!!this.metaData.issendfree) {
      params.issendfree = +this.metaData.issendfree;
    }
    if (!!this.metaData.istime) {
      params.istime = +this.metaData.istime;
    }
    if (!!this.metaData.page) {
      params.page = +this.metaData.page;
    }
    if (!!this.metaData.merchid) {
      params.merchid = +this.metaData.merchid;
    }

    let that = this;
    app.globalData.wtApi.getList(params).then((data) => {
      console.log(data);
      var goodsData = that.data.goodsData;
      console.log(goodsData)
      let shop_name = data.result.shop_name;
      console.log(data.result.shop_name);
      if (data.status == 1) {
        if (params.page === 1) {
          goodsData = [];
        }
        for (var i = 0; i < data.result.list.length; i++) {
          /*if(data.result.list[i].title.length > 13){
              data.result.list[i].title = data.result.list[i].title.substring(0,13);
              console.log(data.result.list[i].title);
              console.log(data.result.list[0].title.length);
          }*/
          goodsData.push(data.result.list[i]);

        }
        /*是否显示显示更多*/
        if ((this.data.initFlag && data.result.list.length < 7) || data.result.list.length >= 10) {
          this.data.showNoMore = false;
        } else {
          this.data.showNoMore = true;
        };
        that.setData({
          goodsData: goodsData,
          shop_name: shop_name,
          initFlag: false,
          showNoMore: this.data.showNoMore,
          message: []
        });
        wx.setNavigationBarTitle({//动态设置当前页面的标题
          title: shop_name
        })
        that.metaData.page++;
        wx.stopPullDownRefresh();
      }
      else if (data.status == 0) {
        this.data.message = data.result.message;
        this.data.news = data.result.message;
        console.log(this.data.message);
        if (this.data.message == "暂时没有任何商品") {
          that.setData({
            goodsData: [],
            message: this.data.message,
            shop_name: shop_name
          })
        }
        wx.setNavigationBarTitle({//动态设置当前页面的标题
          title: ''
        })
      }
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading()

    });
  },

  on: function () {
    this.metaData.keywords = 'asdasddad';
    this.metaData.page = 1;
    this.query();

  },
  onNavigator: function (e) {
    var id = e.currentTarget.dataset.id;
    console.log('商品id' + id);
    wx.navigateTo({
      url: '../order-detail/order-detail?id=' + id
    })
  },
  on2: function () {
    this.query();
  },
  coupon: function () {
    let params = {};
    if (!!this.couponData.couponid) {
      params.couponid = this.couponData.couponid;
    }
    if (!!this.couponData.keywords) {
      params.keywords = this.couponData.keywords;
    }
    if (!!this.couponData.order) {
      params.order = this.couponData.order;
    }
    if (!!this.couponData.by) {
      params.by = this.couponData.by;
    }
    if (!!this.couponData.isrecommand) {
      params.isrecommand = +this.couponData.isrecommand;
    }
    if (!!this.couponData.ishot) {
      params.ishot = +this.couponData.ishot;
    }
    if (!!this.couponData.isnew) {
      params.isnew = +this.couponData.isnew;
    }
    if (!!this.couponData.isdiscount) {
      params.isdiscount = +this.couponData.isdiscount;
    }
    if (!!this.couponData.issendfree) {
      params.issendfree = +this.couponData.issendfree;
    }
    if (!!this.couponData.istime) {
      params.istime = +this.couponData.istime;
    }
    if (!!this.couponData.page) {
      params.page = +this.couponData.page;
    }
    if (!!this.couponData.merchid) {
      params.merchid = +this.couponData.merchid;
    }
    let that = this;
    app.globalData.wtApi.Coupon(params).then((data) => {
      console.log(data);
      var goodsData = that.data.goodsData;
      let shop_name = data.result.shop_name;
      console.log(data.result.shop_name);
      if (data.status == 1) {
        if (params.page === 1) {
          goodsData = [];
        }
        for (var i = 0; i < data.result.list.length; i++) {
          /*if(data.result.list[i].title.length > 13){
              data.result.list[i].title = data.result.list[i].title.substring(0,13);
              console.log(data.result.list[i].title);
              console.log(data.result.list[i].title.length);
          };*/
          goodsData.push(data.result.list[i]);
        }
        /*是否显示显示更多*/
        if ((this.data.initFlag && data.result.list.length < 7) || data.result.list.length >= 10) {
          this.data.showNoMore = false;
        } else {
          this.data.showNoMore = true;
        };
        that.setData({
          goodsData: goodsData,
          shop_name: shop_name,
          initFlag: false,
          showNoMore: this.data.showNoMore
        })
        wx.setNavigationBarTitle({//动态设置当前页面的标题
          title: shop_name
        })
        that.couponData.page++;
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading()
      }

    })
  },
  onCoupon: function () {
    this.coupon();
  },


  onSearch: function () {
    //搜索事件
    wx.redirectTo({
      url: '../search/search'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    showView: (options.showView == "true" ? true : false)
    this.setData({
      title: options.keywords,  //搜索页带过来的关键词
      seatchtitle: options.keywords,
      timerId: options.timerId,  //从首页的限时抢购跳转过来的
      couponid: options.couponid, //我的优惠券页面带过来的couponid
      id: 0,    //商品列表导航id
      ider: 3
    })
    var that = this;
    //如果存在优惠券id
    if (options.couponid) {
      this.couponData.couponid = that.data.couponid;
      this.couponData.page = 1;
      this.coupon();
    }
    // options存在  限时抢购
    else if (options.timerId == 1) {
      this.metaData.istime = 1;
      this.metaData.page = 1;
      this.query();
    }
    else if (!options.keywords) {
      this.metaData.page = 1;
      this.query();

    }
    else {
      this.onShopList();
    }

    wx.getSystemInfo({
      success: function (res) {
        console.info(res.windowHeight);
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });

  },


  onStepTap(event) {//导航综合销量价格筛选切换状态
    var that = this;
    var id = event.currentTarget.dataset.index;
    console.log(id);
    let by = event.currentTarget.dataset.type;
    console.log(by);
    let pali = this.data.pali;
    console.log(pali);
    if (pali[id].id === 0) {
      that.onAllGoods();
      pali[id].by = '';
    } else if (pali[id].id === 1) {
      that.onOrderSales();
      pali[id].by = '';
    } else if (pali[id].id === 2 && pali[id].by === '') {
      pali[id].by = 'asc';
      that.onPriceMax();

    } else if (pali[id].id === 2 && pali[id].by === 'asc') {
      pali[id].by = 'desc';
      that.onPriceMin();

    } else if (pali[id].id === 2 && pali[id].by === 'desc') {
      pali[id].by = 'asc';
      that.onPriceMax();
    }

    this.setData({
      id: event.currentTarget.dataset.index,
      by: pali[id].by
    })

  },
  onCreen: function (event) {
    let ider = event.currentTarget.dataset.index;
    console.log(ider);
    if (ider === 3) {
      this.onChange();
    } else if (ider === 4) {
      this.onChange();
    }
  },
  /*筛选显示隐藏*/
  onChange: function () {
    var that = this;
    that.setData({
      showView: true
    })

  },
  /*点击确定关闭弹层*/
  onMark: function (e) {
    var that = this;
    this.setData({
      showView: (!that.data.showView),

    })
    if (that.data.couponid) {
      for (let i = 0; i < this.data.typedata.length; i++) {
        console.log(JSON.stringify(this.data.typedata[i]))
        if (i == 0 && this.data.typedata[i].id == 1) {
          this.couponData.isrecommand = +1;

        } else if (i == 0 && this.data.typedata[i].id == 0) {
          this.couponData.isrecommand = +false
        }
        if (i == 1 && this.data.typedata[i].id == 1) {
          this.couponData.isnew = +1


        } else if (i == 1 && this.data.typedata[i].id == 0) {
          this.couponData.isnew = +false
        }
        if (i == 2 && this.data.typedata[i].id == 1) {
          this.couponData.ishot = +1


        } else if (i == 2 && this.data.typedata[i].id == 0) {
          this.couponData.ishot = +false
        }
        if (i == 3 && this.data.typedata[i].id == 1) {
          this.couponData.isdiscount = +1

        } else if (i == 3 && this.data.typedata[i].id == 0) {
          this.couponData.isdiscount = +false
        }
        if (i == 4 && this.data.typedata[i].id == 1) {
          this.couponData.issendfree = +1


        } else if (i == 4 && this.data.typedata[i].id == 0) {
          this.couponData.issendfree = +false
        }
        if (i == 5 && this.data.typedata[i].id == 1) {
          this.couponData.istime = +1

        } else if (i == 5 && this.data.typedata[i].id == 0) {
          this.couponData.istime = +false;
        }

      }
      this.couponData.keywords = that.data.title;
      this.couponData.page = 1;
      this.coupon();
      console.log(this.data.typedata.id);
      if (this.couponData.isdiscount === 1 || this.couponData.ishot === 1
        || this.couponData.isnew === 1 || this.couponData.isrecommand === 1 || this.couponData.issendfree === 1
        || this.couponData.istime === 1) {
        this.setData({
          ider: 4
        })
      } if (this.couponData.isdiscount === 0 && this.couponData.ishot === 0
        && this.couponData.isnew === 0 && this.couponData.isrecommand === 0 && this.couponData.issendfree === 0
        && this.couponData.istime === 0) {
        this.setData({
          ider: 3
        })
        console.log(this.couponData)
      }
    } else {
      for (let i = 0; i < this.data.typedata.length; i++) {
        console.log(JSON.stringify(this.data.typedata[i]))
        if (i == 0 && this.data.typedata[i].id == 1) {
          this.metaData.isrecommand = +1;

        } else if (i == 0 && this.data.typedata[i].id == 0) {
          this.metaData.isrecommand = +false
        }
        if (i == 1 && this.data.typedata[i].id == 1) {
          this.metaData.isnew = +1


        } else if (i == 1 && this.data.typedata[i].id == 0) {
          this.metaData.isnew = +false
        }
        if (i == 2 && this.data.typedata[i].id == 1) {
          this.metaData.ishot = +1


        } else if (i == 2 && this.data.typedata[i].id == 0) {
          this.metaData.ishot = +false
        }
        if (i == 3 && this.data.typedata[i].id == 1) {
          this.metaData.isdiscount = +1

        } else if (i == 3 && this.data.typedata[i].id == 0) {
          this.metaData.isdiscount = +false
        }
        if (i == 4 && this.data.typedata[i].id == 1) {
          this.metaData.issendfree = +1


        } else if (i == 4 && this.data.typedata[i].id == 0) {
          this.metaData.issendfree = +false
        }
        if (i == 5 && this.data.typedata[i].id == 1) {
          this.metaData.istime = +1

        } else if (i == 5 && this.data.typedata[i].id == 0) {
          this.metaData.istime = +false;
        }

      }
      this.metaData.keywords = that.data.title;
      this.metaData.page = 1;
      this.query();
      console.log(this.data.typedata.id);
      if (this.metaData.isdiscount === 1 || this.metaData.ishot === 1
        || this.metaData.isnew === 1 || this.metaData.isrecommand === 1 || this.metaData.issendfree === 1
        || this.metaData.istime === 1) {
        this.setData({
          ider: 4
        })
      } if (this.metaData.isdiscount === 0 && this.metaData.ishot === 0
        && this.metaData.isnew === 0 && this.metaData.isrecommand === 0 && this.metaData.issendfree === 0
        && this.metaData.istime === 0) {
        this.setData({
          ider: 3
        })
        console.log(this.metaData)
      }
    }


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
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
  /*按关键字进行搜索商品*/
  onShopList: function () {
    var that = this;
    if (that.data.couponid) {
      this.couponData.keywords = that.data.title;
      this.couponData.page = 1;
      this.coupon();
    } else {
      this.metaData.keywords = that.data.title;
      this.metaData.page = 1;
      this.query();
    }


  },
  /*综合*/
  onAllGoods: function () {
    var that = this;
    if (that.data.couponid) {
      this.couponData.page = 1;
      this.couponData.by = '';
      this.couponData.order = '';
      this.coupon();
    } else {
      this.metaData.page = 1;
      this.metaData.by = '';
      this.metaData.order = '';
      this.query();
    }


  },
  /*点击切换颜色，点击事件不是同一个怎么解决*/

  /*销量*/
  onOrderSales: function () {
    var that = this;
    if (that.data.couponid) {
      this.couponData.couponid = that.data.couponid;
      this.couponData.keywords = that.data.title;
      this.couponData.by = 'desc';
      this.couponData.order = 'sales';
      this.couponData.page = 1;
      this.coupon();
    } else {
      this.metaData.keywords = that.data.title
      this.metaData.by = 'desc';
      this.metaData.order = 'sales';
      this.metaData.page = 1;
      this.query();
    }

  },
  /*价格从小到大*/
  onPriceMin: function () {
    var that = this;
    if (that.data.couponid) {
      this.couponData.couponid = that.data.couponid;
      this.couponData.keywords = that.data.title;
      this.couponData.order = 'minprice';
      this.couponData.by = 'desc';
      this.couponData.page = 1;
      this.coupon();
    } else {
      this.metaData.keywords = that.data.title
      this.metaData.order = 'minprice';
      this.metaData.by = 'desc';
      this.metaData.page = 1;
      this.query();
    }


  },
  /*价格从大到小*/
  onPriceMax: function () {
    var that = this;
    if (that.data.couponid) {
      this.couponData.couponid = that.data.couponid;
      this.couponData.keywords = that.data.title
      this.couponData.page = 1;
      this.couponData.order = 'minprice';
      this.couponData.by = 'asc';
      this.coupon();
    } else {
      this.metaData.keywords = that.data.title
      this.metaData.page = 1;
      this.metaData.order = 'minprice';
      this.metaData.by = 'asc';
      this.query();
    }

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
    wx.stopPullDownRefresh();
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onPageScroll: function (e) {


  },
  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function (e) {
    console.log(3333);
    if (this.data.couponid) {
      this.onCoupon();
    } else {
      this.on2();
    }

  },

  onClick: function (e) {

    let position = e.currentTarget.dataset.index;
    console.log(position)
    let listData = this.data.typedata

    console.log(listData)
    if (listData[position].id == 0) {
      listData[position].id = 1
    } else {
      listData[position].id = 0
    }

    this.setData({
      typedata: listData
    })
  }

})