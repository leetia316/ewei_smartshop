// pages/order-detail/order-detail.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
var tcity = require("../../utils/citys.js");
/*console.log(WxParse);*/

Page({

  /**
   * 页面的初始数据
   */
  data: {
      imgUrls: [],
      indicatorDots: true,
      autoplay: true,
      interval: 300,
      duration: 300,
      circular:true,
      orderList:[],
      orderShow:false,
      chooseCity:{},
      provinces: [],
      province: "",
      citys: [],
      city: "",
      countys: [],
      county: '',
      value: [0, 0, 0],
      values: [0, 0, 0],
      condition: false,
      chooseCity :{
          title:'所在地区',
          address:'请选择所在城市',
          isAddress:true
      },
      Nums:1,                        //数量
      list:{},                      //规格对象
      specSelectedItem: {

      },
      goodsData:'',              //商品头
      specsData:[],              //规格
      optionsData:'',             //每条规格id
      code_type:'',             //加入购物车  购买的自定义属性
      diyformfields:[],         //自定义表单
      specsitem:[],
      formVlaue:{               //input框值
        danhang:'请输入tp单行',
        codeId:'请输入身份证'
      },
      diyformdata:{} ,          //购物车数组(接口)
      gdid:'' ,         //自定义表单id(接口)
      date: '2016-09-01',
      dates:'2016-09-19',
      xialaArray:[],
      xialaindex:0,
      diyform:[],
      region: ['省', '市'],
      optionid:'',
      date1: '请选择日期',
      date2:'开始日期',
      date3:'结束日期',
 
  },

    metaData: {
        specOptionMap: {},
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var that = this;
      this.setData({
          id:options.id,
      });

    this.getorderDetail();

  },
  getorderDetail() {
      var that = this;
      app.globalData.wtApi.getorderDetail({"id":this.data.id}).then((data) => {
            var orderList = that.data.orderList;
            let contentStr = data.result.content;
            let  content = contentStr.replace(/\\/g,"");

            WxParse.wxParse('content', 'html', content, that);
          if(data.result.dispatchprice.min){
            if(data.result.dispatchprice.min !==data.result.dispatchprice.max){
                this.setData({
                    dispatchprice:data.result.dispatchprice.min+'~'+data.result.dispatchprice.max
                })
            }else if(data.result.dispatchprice.min == data.result.dispatchprice.max){
                this.setData({
                    dispatchprice:data.result.dispatchprice.min
                })
            };
          }else if(data.result.dispatchprice ==0){
              this.setData({
                  dispatchprice:'包邮'
              })
          } else{
              this.setData({
                  dispatchprice:data.result.dispatchprice
              })
          }

            this.setData({
                imgUrls:data.result.thumbs,
                title:data.result.title,
                subtitle:data.result.subtitle,
                minprice:data.result.minprice,
                productprice:data.result.productprice,
                sales:data.result.sales,
                unit:data.result.unit,
                quality:data.result.quality,
                repair:data.result.repair,
                seven:data.result.seven,
                other_services:data.result.goods_services.other_services,  //自定义
                specs:data.result.specs,
                logo:data.result.shop_detail.logo,
                shopname:data.result.shop_detail.shopname,
                num:data.result.cart_count


            });

        
      });
  },
  // 商品详情多规格自定义表单信息展示
  getorderContent(e) {
    var that = this;
    this.data.code_type = e.currentTarget.dataset.type;
    let id = {
      id:this.data.id
    };
      this.data.diyformfields = [];
    app.globalData.wtApi.getorderContent(id).then((data) => {
        //wx.setStorageSync('diyformfields', data.result.diyformfields);
        if(data.status == 1){
            this.data.goodsData = data.result.goods;
            this.data.specsData = data.result.specs;
            this.data.specsitem = [];
            for(var k=0; k<this.data.specsData.length;k++){
                this.data.specsitem.push(this.data.specsData[k]);
            };
            console.log(this.data.specsitem);
            this.buildSpecOptionMap(data.result.options);
            this.data.optionsData = data.result.options;
            this.data.diyformfields = data.result.diyformfields;
            let listObj = [];
            for(var i in this.data.diyformfields){
                this.data.diyformfields[i]['diyformkey'] = i;
                let data_typenum = this.data.diyformfields[i].data_type;
                if(data_typenum == 2){
                    this.setData({
                        xialaArray:this.data.diyformfields[i].tp_text
                    });
                } else if(data_typenum == 5) {
                    this.data.diyformfields[i].photoList = [];
                }
                listObj.push(this.data.diyformfields[i]);
            }
            console.log(listObj);
            this.setData({
                diyformfields:listObj,
                thumb:this.data.goodsData.thumb,
                minprice:this.data.goodsData.minprice,
                maxprice:this.data.goodsData.maxprice,
                total:this.data.goodsData.total,
                hasoption:this.data.goodsData.hasoption,
                specsitem:this.data.specsitem,
                orderShow:true

            })

        }

    })
  },
    /**
     * 计算规格项组合与option的映射
     * @param options Array 接口拿到的 options
     *
     */
    buildSpecOptionMap: function(options) {
        let len = options.length;
        let specOptionMap = {};
        for(let i = 0; i < len; i ++) {
            let option = options[i];

            let specs = options[i]['specs'].split('_');
            let specsLen = specs.length;
            for(let j = 0; j < specsLen; j ++) {
                specs[j] = + specs[j];
            }
            specs.sort();
            let specsStr = specs.join('_');

            specOptionMap[specsStr] = + option['id'];
        }
        this.metaData.specOptionMap = specOptionMap;
    },

    hideLayer() {
      this.setData({
        orderShow:false,
      })
    },

    /*城市弹层显示和隐藏*/
    openModal: function () {
        this.setData({
            condition: !this.data.condition
        })
    },

    /*input框失去焦点时触发事件*/
    bindblurDan(e) {
        this.data.formVlaue.danhang = e.detail.value;
        this.data.diyformdata[e.currentTarget.dataset.index] =e.detail.value;
    },
    bindblurCode(e) {
        this.data.formVlaue.codeId = e.detail.value;
        this.data.diyformdata[e.currentTarget.dataset.index] =e.detail.value;
    },
    /*下拉*/
    bindPicker: function(e) {
        this.data.diyformdata[e.currentTarget.dataset.index] =e.detail.value;
        console.log(e.detail.value);
        this.setData({
            xialaindex: e.detail.value,
            pickerTrue:true   //如果pickerTrue为true改变字体颜色
        })
    },
    /*多选框*/
    checkboxChange: function(e) {
        this.data.diyformdata[e.currentTarget.dataset.index] = e.detail.value;
    },
    /*日期*/
    bindDateChange: function(e) {
        this.data.diyformdata[e.currentTarget.dataset.index] =e.detail.value;
        console.log(this.data.diyformdata);
        this.setData({
            date1: e.detail.value,
            markTrue:true   //如果markTrue为true改变字体颜色
        })
    },

    //日期范围
    onDateChange: function(e) {
        var type = e.currentTarget.dataset.type;
        console.log(type);
        if(type){
            this.data.diyformdata[e.currentTarget.dataset.index+"_0"] =e.detail.value;
        };
        this.setData({
            date2: e.detail.value,
            startTrue:true    //如果startTrue为true改变字体颜色
        })
    },
    //日期范围
    onDateChangeEnd: function (e) {
        this.data.diyformdata[e.currentTarget.dataset.index+"_1"] =e.detail.value;
        this.setData({
            date3: e.detail.value,
            endTrue:true     //如果endTrue为true改变字体颜色
        })
    },
    //省市
    bindRegionChange: function (e) {
        this.data.diyformdata[e.currentTarget.dataset.index] =e.detail.value;
        console.log(this.data.diyformdata)
        this.setData({
            region: e.detail.value,
            regionTrue:true       //如果regionTrue为true改变字体颜色
        })
    },

    onChangePhoto(e) {
        var that = this;
        var formKey = e.currentTarget.dataset.index;
        var formIndex = e.currentTarget.dataset.id;
        let max = this.data.diyformfields[formIndex].tp_max;
        wx.chooseImage({
            count: max, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success:(res)=>{
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                //tempFiles  图片的本地文件列表，每一项是一个 File 对象
                var tempFilePaths = res.tempFilePaths;
                var len = tempFilePaths.length;
                var i;
                var photoPath = [];
                let count = this.data.diyformfields[formIndex].photoList.length;
                for(i = 0; i < len; i++){
                    if(count >= max) {
                        break;
                    }
                    this.data.diyformfields[formIndex].photoList.push(tempFilePaths[i]);
                    photoPath.push(tempFilePaths[i]);
                    count ++;
                }
                this.data.diyformdata[formKey] = this.data.diyformfields[formIndex].photoList;
                this.setData({
                    ['diyformfields[' + formIndex + ']photoList']: this.data.diyformfields[formIndex].photoList
                });

            }


        });



    },
    onDelete(e) {
        let formIndex = e.currentTarget.dataset.id;
        let photoIndex = e.currentTarget.dataset.photo;
        this.data.diyformfields[formIndex].photoList.splice(photoIndex, 1);
        this.data.diyformdata[this.data.diyformfields[formIndex].diyformkey] = this.data.diyformfields[formIndex].photoList;
        this.setData({
            ['diyformfields[' + formIndex + ']photoList']: this.data.diyformfields[formIndex].photoList
        });
    },
    bindMinus() {
        var that = this;
        /*console.log(num);*/
        if (this.data.Nums <=1){
            return;
        }else {
            this.data.Nums --;
        }
        this.setData({
            Nums:this.data.Nums
        })

    },
    bindPlus() {
       var that = this;
       let Nums = that.data.Nums;
       /*console.log(num);*/
        Nums ++;
       this.setData({
           Nums: Nums
       })

    },
    inputNum(e){
        "use strict";
        let Nums = this.data.Nums;
        Nums= e.detail.value;
        console.log(Nums);
        this.setData({
            Nums: Nums
        })
    },
    // 多规格选择
    onClicklist(e){
        var spec_id = e.currentTarget.dataset.spec_id;
        var item_id = e.currentTarget.dataset.item_id;
        var list = this.data.list;
        if(list[spec_id]) {
            if(list[spec_id] === item_id) {
                delete list[spec_id];
            } else {
                list[spec_id] = item_id;
            }
        } else {
            list[spec_id] = item_id;
        }
        console.log(list[spec_id]);

       /* this.setData({
            ['specSelectedItem.' + spec_id] : item_id
        });*/
        this.setData({
            specSelectedItem : list
        });

        let specItemIds = [];
        console.log(this.data.specSelectedItem);
        for(let i_spec_id in this.data.specSelectedItem) {
            let i_item_id = + this.data.specSelectedItem[i_spec_id];
            specItemIds.push(i_item_id);
        }
        specItemIds.sort();
        let specsStr = specItemIds.join('_');
        let option_id = this.metaData.specOptionMap[specsStr];
        console.log(specItemIds)
        if(specItemIds.length == this.data.specsData.length){
            for(var i=0; i<this.data.optionsData.length; i++){
                if (option_id === + this.data.optionsData[i].id){
                    console.log(this.data.optionsData[i].marketprice);
                    this.data.optionid = this.data.optionsData[i].id;
                    this.setData({
                        minprice:this.data.optionsData[i].marketprice,
                        maxprice:this.data.optionsData[i].marketprice,
                        total:this.data.optionsData[i].stock,
                        spectitle:this.data.optionsData[i],
                        optionid:this.data.optionsData[i].id,
                    })
                    break;
                }
            }
        }else if(specItemIds.length < this.data.specsData.length){
            this.setData({
                minprice:this.data.goodsData.minprice,
                maxprice:this.data.goodsData.maxprice,
                total:this.data.goodsData.total,
                spectitle:this.data.specsitem,
                optionid:''
            })
        }

        console.log(this.data.optionsData);
        console.log(this.data.specSelectedItem)

    },
    /*确定*/
    onClickBtn:function (e) {/*确认订单*/
        console.log(e);
        var that = this;
        this.setData({
            orderShow:false,
            num:this.data.num
        });
        var listdiy = this.data.diyformdata;

        let formData = {  //自定义表单接口参数
              id:this.data.id,
             diyformdata:listdiy
                
        };
        console.log(formData);
         let goodsid = {         //购物车接口参数
            goodsid:this.data.id,
            total:this.data.Nums,
            optionid:this.data.optionid,
            diyformdata:listdiy
          };
        console.log( goodsid);

        if (this.data.code_type == 0){//加入购物车
            if (this.data.diyformfields !=="") {
                 app.globalData.wtApi.postDiyform(formData).then((data) =>{//是否存在自定义表单
                    console.log(data);

                });
                app.globalData.wtApi.postonCart(goodsid).then((data) =>{
                    console.log(data);
                    if (data.status == 1){
                       let num = data.result.cartcount;
                        this.setData({
                            num:num
                        })

                    }else if (data.status == 0){
                        wx.showToast({
                            title:data.result.message,
                            image: '/images/common/icon_warning.png',
                            duration:2000
                        });
                        return;
                    }
                })
            }else {
                app.globalData.wtApi.postonCart(goodsid).then((data) =>{//购物车
                    console.log(data);
                    if (data.status == 1){
                        let num = data.result.cartcount;
                        this.setData({
                            num:num
                        });
                    }else if (data.status == 0){
                        wx.showToast({
                            title:data.result.message,
                            image: '/images/common/icon_warning.png',
                            duration:2000
                        });
                        return;
                    }
                })
            }
        }else  if (this.data.code_type == 1) {//购买
            if (this.data.diyformfields !==""){//是否存在自定义表单
                app.globalData.wtApi.postDiyform(formData).then((data) =>{
                  if (data.status == 1) {
                        console.log(data);
                        this.data.gdid = data.result.goods_data_id;
                        console.log(this.data.gdid);
                        let cartData = {                     //确认订单接口参数
                            goodsid:this.data.id,
                            optionid:this.data.optionid,
                            total:this.data.Nums,
                            gdid:this.data.gdid
                        };
                        let goodsid = this.data.id;
                        let optionid = this.data.optionid;
                        let total = this.data.Nums;
                        let gdid = this.data.gdid;
                        console.log(this.data.optionid);
                        if(this.data.goodsData.hasoption ==1 && optionid==""){
                          wx.showToast({
                              title:'请选择规格',
                              image: '/images/common/icon_warning.png',
                              duration:2000
                          });
                          return;
                        }
                      let cart = {
                          goodsid:this.data.id,
                          optionid:this.data.optionid,
                          total:this.data.Nums,
                          sign:1
                      };
                      app.globalData.wtApi.postonCart(cart).then((data) =>{console.log(data);//确认订单
                          if(data.status==1){
                              wx.navigateTo({
                                  url: '/pages/order/orderconfirm/index?goodsid='+goodsid+'&optionid='+optionid+'&total='+total+'&gdid='+gdid
                              })

                          }else if(data.status==0){
                              wx.showToast({
                                  title:data.result.message,
                                  image: '/images/common/icon_warning.png',
                                  duration:2000
                              });
                              return;
                          }
                      })

                  }


                });
                
            }else {
                let cartData = {                     //确认订单接口参数
                    goodsid:this.data.id,
                    optionid:this.data.optionid,
                    total:this.data.Nums
                };
                let goodsid = this.data.id;
                let optionid = this.data.optionid;
                let total = this.data.Nums;
                console.log(goodsid);
                console.log(optionid);
                console.log(total);
                if(this.data.goodsData.hasoption ==1 && optionid==""){
                    wx.showToast({
                        title:'请选择规格',
                        image: '/images/common/icon_warning.png',
                        duration:2000
                    });
                    return;
                }
                let cart = {
                    goodsid:this.data.id,
                    optionid:this.data.optionid,
                    total:this.data.Nums,
                    sign:1
                };
                app.globalData.wtApi.postonCart(cart).then((data) =>{console.log(data);//确认订单
                    if(data.status==1){
                        wx.navigateTo({
                            url: '/pages/order/orderconfirm/index?goodsid='+goodsid+'&optionid='+optionid+'&total='+total+'&gdid='+gdid
                        })

                    }else if(data.status==0){
                        wx.showToast({
                            title:data.result.message,
                            image: '/images/common/icon_warning.png',
                            duration:2000
                        });
                        return;
                    };

                })


            }

        }


    },
    getonCart(){/*跳转购物车*/
        "use strict";
        var that = this;
        this.setData({

        });
        wx.switchTab({
            url: '../shoppingcart/cart/index'
        })
       /* app.globalData.wtApi.getCartList().then((data)=>{
            console.log(data);
            wx.switchTab({
                url: '../shoppingcart/cart/index'
            })
        })*/

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
      console.log("下拉刷新");
      setTimeout(function () {
          wx.stopPullDownRefresh()
      }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
      var that = this;
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
   /* wx.getStorage({
        key: 'diyformfields',
        success: function(res) {
            console.log(res.data);
            var data ={};
            data = [];
            for(var i in res.data){
                console.log(i);
                data.push([i]);
                data.push(res.data[[i]]);
                console.log(res.data[i])
            }
            console.log(data)
        }
    })*/
})