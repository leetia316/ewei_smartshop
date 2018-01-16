//index.js
//获取应用实例
var app = getApp();
var util = require("../../utils/util.js");
let Promise = require("../../utils/es6-promise.min.js");
Page({
    data: {
        motto: '',
        userInfo: {},
        goodsList:[],
        page:1,   //分页
        total: 10,  //数量
        scrollHeight:0,
        id:1,   //自定义限时抢购id
        initFlag: true,//第一次调取数据
        showNoMore:false,  //是否显示没有更多
        shop_name:'',    //商品标题
        userGetSetting:false
    },
    //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: './logs/logs'
        })
    },
    //头部导航点击链接事件
    //限时抢购
    onClickTap:function(e){
        console.log(e);
        var that = this;
        var timerId = that.data.id;
        wx.navigateTo({
            url: '/pages/shop-list/shop-list?timerId='+timerId
        })
    },
    //优惠券
    onClickCoupon:function () {
        wx.navigateTo({
            url: '../user/get_coupon/get_coupon'
        })
    },
    //我的订单
    onClickOrder:function () {
        wx.navigateTo({
            url: '../user/my_order/my_order'
        })
    },
    //全部商品
    onClickAll:function () {
        wx.navigateTo({
            url:'/pages/shop-list/shop-list'
        })
    },
    onLoad: function () {
        console.log('onLoad');
        this.setData({
            data: {}
        });
        this.init();
        var that = this;
        //wx.getSystemInfo({
        //    success:function(res){
        //        console.info(res.windowHeight);
        //        that.setData({
        //            scrollHeight:res.windowHeight
        //        });
        //    }
        //});

        //调用应用实例的方法获取全局数据
        //app.getUserInfo(function(userInfo){
        //    console.log(userInfo);
        //    //更新数据
        //    that.setData({
        //        userInfo:userInfo
        //    })
        //})
    },

    //页面显示
    onShow:function () {
        var that = this;
        wx.setNavigationBarTitle({//动态设置当前页面的标题
            title: that.data.shop_name
        })
        app.getAuthsetting(app,that,that.init)
        // if (!app.globalData.userGetSetting) {
        //     console.log('isGetAuthSetting', app.globalData.userGetSetting)
        //     wx.getSetting({
        //         success(res) {
        //             console.log(res)
        //             console.log(res.authSetting['scope.userInfo'])
        //             if (res.authSetting['scope.userInfo']) {
        //                 that.setData({
        //                     userGetSetting: true
        //                 })
        //                 that.init();
        //                 // 如果拿到用户授权，全局变量置为true
        //                 app.globalData.userGetSetting = true
        //                 // app.submitUserInfo()
        //             } else {
        //                 that.setData({
        //                     userGetSetting: false
        //                 })
        //             }
        //         }
        //     })
        // } else {
        //     if (app.globalData.userGetSetting != that.data.userGetSetting) {
        //         that.setData({
        //             userGetSetting: app.globalData.userGetSetting
        //         })
        //     }
        // }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
     onPullDownRefresh: function () {
         console.log("下拉刷新");
         setTimeout(function () {
            wx.stopPullDownRefresh()
        }, 1000)
     },

    /**
     * 页面上拉触底事件的处理函数
     */
     onReachBottom: function () {
        this.init();

    },
    init:function () {

        var that =this;
        let data = {
            page:that.data.page,
            //total:that.data.total
        };
        app.globalData.wtApi.getGoods(data).then((data) =>{
            "use strict";
            /*授权*/
            if (!app.globalData.userGetSetting) {
                wx.getSetting({
                    success: (res) => {
                        if (res.authSetting['scope.userInfo']) {
                            this.setData({
                                userGetSetting: true
                            })
                        }
                    }
                })
            }

            that.data.shop_name = data.result.shop_name;
            console.log(that.data.shop_name)
            var goodsList = that.data.goodsList;
            var total = that.data.total;
            for(var i = 0;i < data.result.list.length; i++){
              /*  if(data.result.list[i].title.length > 13){
                    data.result.list[i].title = data.result.list[i].title.slice(0,13);
                    console.log(data.result.list[i].title);
                    console.log(data.result.list[i].title.length);
                };*/
                goodsList.push(data.result.list[i]);

            }
            /*是否显示显示更多*/
            if ((this.data.initFlag && data.result.list.length < 7) || data.result.list.length >= 10) {
                this.data.showNoMore = false;
            } else {
                this.data.showNoMore = true;
            };

            console.log(total)
            that.setData({
                goodsList:goodsList,
                total:data.result.total,
                shop_name:that.data.shop_name,
                initFlag: false,
                showNoMore: this.data.showNoMore
            });
            wx.setNavigationBarTitle({//动态设置当前页面的标题
                title: that.data.shop_name
            })
            that.data.page ++;
        })
    },
    authSetting: function () {
        // wx.openSetting({
        //     success(res) {
        //         console.log(res)
        //     }
        // })
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

