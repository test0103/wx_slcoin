var Utils = require('../../../utils/util.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前选择币种的信息
    coinItem: {
      type: Object
    },
    // 当前用户持有的币种
    AvailableMoney: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    allStore: 1,  // 半仓的图片样式
    halfStore: 3,  // 全仓的图片样式
    StoreImgList: ['../../../image/tradegame/all_store_active.png',
      '../../../image/tradegame/all_store.png',
      '../../../image/tradegame/half_store_active.png',
      '../../../image/tradegame/half_store.png'],
    AvailableCoin: '', // 当前可用余额 
    TradeMoney: 0, // 交易金额
    isEnough: true, // 卖出金币是否够用
    isShowDialog: false, // 是否显示Dialog
    isHasCoin: true, //是否含有该种货币
    DialogUrl: '../../../image/tradegame/sale_dialog.png'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化组件数据
    init(){
      let coinNum = this.data.AvailableMoney[this.data.coinItem.coin_type];
      let amount = 0, money = 0;
      if(coinNum === undefined){ //  选择币种的时候，用户没有该币种
        this.setData({
          allStore: 1,
          halfStore: 3,
          isHasCoin: false,
          isEnough: false,
          AvailableCoin: '当前无该种货币',
          TradeMoney: money,    // 交易金额
          sale_coin_amount: amount,   // 买入数量
        })
        return ;
      }     
      if (this.data.allStore === 0) {
        amount = this.data.AvailableCoin;
        money = this.data.AvailableCoin * this.data.coinItem.coin_money;
      }
      if (this.data.halfStore === 2) {
        amount = this.data.AvailableCoin * 0.5;
        money = this.data.AvailableCoin * 0.5 * this.data.coinItem.coin_money;
      }
      this.setData({
        isHasCoin: true, 
        isEnough: true,       
        AvailableCoin: coinNum,
        TradeMoney: money,    // 交易金额
        sale_coin_amount: amount === 0 ? '' : amount,   // 买入数量
      })
    },

    // 选择全仓或者半仓
    ChooseStore(e) {
      let storeName = e.target.id;
      if (storeName === 'all') {
        this.setData({
          allStore: 0,
          halfStore: 3,
          TradeMoney: (this.data.AvailableCoin * this.data.coinItem.coin_money).toFixed(4),
          sale_coin_amount: this.data.AvailableCoin
        })
      } else if (storeName === 'half') {
        this.setData({
          allStore: 1,
          halfStore: 2,
          TradeMoney: (this.data.AvailableCoin * 0.5 * this.data.coinItem.coin_money).toFixed(4),
          sale_coin_amount: this.data.AvailableCoin * 0.5
        })
      }
    },

    // 改变输入框的买入数量
    ChangNumer(e) {
      let value = e.detail.value;
      let money = value * this.data.coinItem.coin_money;
      if (value > this.data.AvailableCoin) {
        this.setData({
          isEnough: false,
          TradeMoney: '',
          sale_coin_amount: 0,
          AvailableCoin: '余额不足'
        })
      } else {
        this.setData({
          isEnough: true,
          allStore: 1,
          halfStore: 3,
          TradeMoney: money.toFixed(4),
          sale_coin_amount: value
        })
      }
    },

    // 模拟卖出
    ModifySale() {
      let app = getApp();
      if (this.data.sale_coin_amount === 0) {
        wx.showToast({
          title: '卖出数量不能为0',
        })
        return;
      }
      let params = {
        trade_type: 1,
        user_id: app.globalData.user_id,
        room_num: app.globalData.room_num,
        coin_money: this.data.coinItem.coin_money,
        coin_type: this.data.coinItem.coin_type,
        amount: this.data.sale_coin_amount,
        time: Utils.formatTime(new Date())
      }
      wx.request({
        url: getApp().globalData.ROOTURL + '/transaction',
        data: params,
        success: res => {
          // 提示卖出成功
          this.setData({
            isShowDialog: true
          })
          let reback = {
            possess: res.data.possess,
            money: res.data.money
          }
          this.triggerEvent('SaleSuccess', reback);
          setTimeout(() => {
            this.setData({
              isShowDialog: false,
              allStore: 1,
              halfStore: 3,
              TradeMoney: 0,
              sale_coin_amount: 0
            })
          }, 1000)
        },
        fail: err => {
          // 提示卖出失败
          wx.showToast({
            title: '买入失败，请稍后重试',
            icon: 'none',
            duration: 1500
          })
        }
      })
    },

    // 余额不足时可以邀请好友
    ToDetailShare() {
      wx.navigateTo({
        url: '/pages/share/share',
      });
    }, 
  }
})