var Utils = require('../../utils/util.js');
const app = getApp();
var coinTimer;  //获取币种信息的定时器
var waitTime; // 等待比赛开始的定时器
var timer;  //比赛倒计时的定时器
var total_second = 24 * 60 * 60; // 一天的倒计时

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isFormId: false, // 是否获取formId
    step: 1, // 表示进行的步骤：1-未参赛，2-邀请好友，3-开赛进行交易，4-比赛结束
    isEnterGame: false, // 是否参加比赛
    isStartGame: false, // 是否开赛
    unFullNum: 49, // 当前房间人数
    countURL: '',  //倒计时的数字图标 
    clock: "00:00:00",  // 开赛后的倒计时
    coinType: '', // 当前币种
    coinMoney: '', // 当前币种的价格
    coinIndex: 0,  // 当前选择的币种（数组中所在的序号）
    AvailableMoney: '', // 当前可用余额
    currentTab: 0, // 当前所在的tab：0-买入，1-卖出，2-交易记录
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    msgList:['目前暂无交易记录'],
    recordList:[],
    our: {
      assets: '20000',  // 目前的资产
      possess: '', //目前持有的币种
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    });
    console.log(this.data)
    wx.getStorage({
      key: 'step',
      success: res => {
        this.setData({
          step: res.data
        })
        this.JugeTheStatus();
      }
    })
  },

  /**
   * 当页面隐藏的时候
   */
  onHide: function () {
    clearInterval(coinTimer);
    coinTimer = null;
  },

  // 判断用户的状态，并初始化数据
  JugeTheStatus: function () {
    console.log('初始化数据')
    if (this.data.step === 2) {
      console.log('状态2')
      this.getRoomInfo();
    }

    if (this.data.step === 3) {
      console.log('状态3')
      if (this.data.currentTab === 0) {
        this.Buy = this.selectComponent("#buy");
        this.Buy.init();
      } else if (this.data.currentTab === 1) {
        this.Sale = this.selectComponent("#sale");
        this.Sale.init();
      }

      this.getCoinInfo();
      this.getRollingInfor();
      this.getMyAssets();
      // wx.getStorage({
      //   key: 'endTime',
      //   success: (res) => {
      //     let end = new date(res.data).getTime();
      //     let now = new date().getTime();
      //     total_second = end - now;
      //     count_down(this);
      //   },
      // })
    }

    if(this.data.step === 4) {

    } 
  },

  // 在等待开赛时，轮询获取房间的信息
  getRoomInfo: function () {
    wx.request({
      url: app.globalData.ROOTURL + '/room_info',
      data: {
        user_id: app.globalData.user_id,
        room_num: app.globalData.room_num,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        if (res.statusCode === 200) {
          this.setData({
            unFullNum: res.data.number
          })
          if(res.data.number >= 50) {
            this.setData({
              endTime: res.data.endTime
            })
            wx.setStorage({
              key: 'endTime',
              data: res.data.endTime,
            })
            clearTimeout(waitTime);
            waitTime = null;
            this.StartGame();
            return;
          }
          waitTime = setTimeout(() => {
            this.getRoomInfo();
          }, 30 * 1000)
        }
      },
      fail: err => {
        console.error('获取房间信息失败！');
      }
    })
  },

  // 请求虚拟货币的基本信息
  getCoinInfo: function() {
    wx.request({
      url: app.globalData.ROOTURL + '/coin_info',
      data: {
        user_id: app.globalData.user_id
      },
      success: res => {
        if (res.statusCode === 200) {
          let tempArr = [];
          for (let i = 0, len = res.data.length; i < len; i++) {
            tempArr.push(res.data[i].coin_type);
          }
          this.setData({
            coinList: res.data,
            coinArray: tempArr,
            coinType: tempArr[0],
            coinMoney: res.data[0].coin_money
          })
          coinTimer = setTimeout(() => {
            this.getCoinInfo();
          }, 60 * 1000);
        }
      },
      fail: err => {
        console.error('获取币种信息失败！');
      }
    })
  },

  // 获取比赛时的用户交易信息
  getRollingInfor: function () {
    wx.request({
      url: app.globalData.ROOTURL + '/rolling',
      data: {
        user_id: app.globalData.user_id,
        time: Utils.formatTime(new Date('2018-07-27 00:00:00'))
      },
      success: res => {
        if (res.statusCode === 200 && res.data.length > 0) {
          this.setData({
            msgList: res.data
          });
        }
      },
      fail: err => {
        console.error('获取房间内的交易信息失败！');
      }
    })
  },

  //请求当前用户的个人资产
  getMyAssets: function () {
    wx.request({
      url: app.globalData.ROOTURL + '/personAsset',
      data: {
        user_id: app.globalData.user_id,
        time: Utils.formatTime(new Date('2018-07-27 00:00:00'))
      },
      success: res => {
        this.setData({
          our: {
            assets: res.data.money,
            possess: DealMyOwn(res.data.possess)
          }
        })
      },
      fail: err => {
        console.error('请求当前用户的个人资产失败！');
      }
    })
  },

  /**
   * 点击立即参赛，获取用户信息权限
   */
  getUserInfo: function (e) {
    console.log('获取用户的授权信息')
    console.log(e);
    if (e.detail.userInfo) { // 用户点击了授权,并将用户的信息缓存
      wx.setStorage({
        key: "isAuthorize",
        data: true
      })
      wx.setStorage({
        key: "userInfo",
        data: e.detail.userInfo
      })
      wx.showToast({
        title: '授权成功，点击参赛！',
      });
    } else {  // 用户拒绝了授权
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，可能没办法更好的体验炒币大咖!',
        showCancel: false
      })
    }
   
    this.setData({
      isFormId: true
    })
    // 更新用户的个人基本信息
    wx.request({
      url: app.globalData.ROOTURL + '/updateUserInfo',
      data: {
        user_id: app.globalData.user_id,
        nickname: e.detail.userInfo.nickName || '',
        wei_pic: encodeURIComponent(e.detail.userInfo.avatarUrl || '../../image/wx_login.jpg')
      }
    })
  },

  // 授权后获取用户的FormId
  getUserFormId: function(e) {
    console.log('获取用户的formId')
    console.log(e);
    this.setData({
      formId: e.detail.formId
    })
    this.joinGame(e.detail.formId);
  },

  // 立即参赛
  joinGame: function (formId) {
    console.log( '获取formId后，立即参赛')
    wx.request({
      url: app.globalData.ROOTURL + '/game/join',
      data: {
        user_id: app.globalData.user_id,
        formId: formId,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        if (res.statusCode === 200) {
          app.globalData.room_num = res.data.roomNum;
          this.setData({
            step: 2,
            isEnterGame: true,
            unFullNum: res.data.number
          })
          wx.setStorage({
            key: "step",
            data: 2
          })
          wx.setStorage({
            key: "isEnterGame",
            data: true
          })
          wx.setStorage({
            key: "room_num",
            data: res.data.roomNum
          })
          this.JugeTheStatus();  //登录后变更状态，需要重新初始化数据
        }
      },
      fail: err => {
        console.error(err);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    } else if (res.from === 'menu') {
      // 来自菜单的转发按钮
    }
    return {
      title: '炒币大咖',
      path: '/pages/trade/trade?room_num='+ app.globalData.room_num +'&user_id='+app.globalData.user_id,
    }
  },

  // 查看游戏规则
  ViewToRegular: function (){
    wx.navigateTo({
      url: '/pages/regular/regular',
    })
  },

  // 开始比赛(目前是点击金币图片，实现开赛)
  StartGame: function (){
    this.setData({
      isStartGame:true
    });
    wx.setStorage({
      key: 'isStartGame',
      data: true,
    })
    count_down(this);
    // CountOneDay(this);
  },

  // 选择币种事件 
  bindPickerChange: function(e) {
    let item = this.data.coinList[e.detail.value];
    this.setData({
      coinIndex: Number(e.detail.value),
      coinType: item.coin_type,
      coinMoney: item.coin_money,
    })

    if(this.data.currentTab === 0) {
      this.Buy = this.selectComponent('#buy');
      this.Buy.init();
    } else if(this.data.currentTab === 1){
      this.Sale = this.selectComponent("#sale");
      this.Sale.init();
    }
  },

  // 选择买入/卖出/交易记录
  switchTab: function (e) {
    let tab = e.currentTarget.id;
    switch(tab) {
      case 'tabbuy':
        this.setData({ currentTab: 0 });
        this.Buy = this.selectComponent('#buy');
        this.Buy.init();
        break;
      case 'tabsale':
        this.setData({ currentTab: 1 });
        this.Sale = this.selectComponent("#sale");
        this.Sale.init();
        break;
      case 'tabrecord':
        this.setData({ currentTab: 2 });
        Utils.getDataFromServer('/transationRecord', { user_id: app.globalData.user_id }, 2).then((res) => {
          this.setData({
            recordList: res.data
          })
        }).catch((err) => {
          console.error(err);
        })
        break;
    }
  },

  // 买入卖出成功后，更新个人资产
  ChangeMyAssets: function(obj) {
    this.setData({
      our: {
        assets: obj.detail.money,
        possess: DealMyOwn(obj.detail.possess)
      }
    })
  },

  // 比赛结束
  GameOver: function(){
    wx.request({
      url: app.globalData.ROOTURL + '/room/end',
      data: {
        user_id: app.globalData.user_id,
        room_num: app.globalData.room_num
      },
      success: res => {
        if(res.statusCode === 200) {
          this.setData({
            myrank: res.data.rank,
            our:{
              income: res.data.income,
              yield: res.data.yield
            }
          })
        }
      },
      fail: err => {
        console.error(err);
      }
    })
  },

  // 比赛结束后，再来一局
  AgainGame: function () {
    this.setData({
      isEnterGame: false,
      isStartGame: false,
      step: 1
    })
    wx.setStorage({
      key: "step",
      data: 1
    })
    wx.setStorage({
      key: "isEnterGame",
      data: false
    })
  },
})





/*** 开赛前的倒计时 ***/
var count_second = 3,
urlList = ['../../image/waitgame/count_one.png', '../../image/waitgame/count_two.png', '../../image/waitgame/count_three.png'];
function count_down(that) {
  if (count_second <= 0) {
    that.setData({
      step: 3
    })
    wx.setStorage({
      key: "step",
      data: 3
    })
    CountOneDay(that)
    that.JugeTheStatus();
    return;
  }

  that.setData({
    countURL: urlList[count_second-1],
  });
  setTimeout(function () {
    count_second -= 1;
    count_down(that);
  }, 1000)
}

/*** 比赛结束的倒计时 ***/
function CountOneDay(that) {
  // 渲染倒计时时钟
  that.setData({
    clock: date_format(total_second)
  });

  if (total_second <= 0) {
    that.setData({
      clock: "00:00:00"
    });
    clearTimeout(timer);
    timer = null;
    return;
  }
  timer = setTimeout(function () {
    total_second -= 1;
    CountOneDay(that);
  }, 1000)
}

// 时间格式化输出
function date_format(second) {
  var hr = fill_zero_prefix(Math.floor(second / 3600)); // 小时位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));  // 分钟位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));  // 秒位
  return hr + ":" + min + ":" + sec;
}
// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}

// 处理个人资产的格式（字符串转为对象）
function DealMyOwn(str){
  let temp = str.split(",");
  let item = {};
  for(let i=0,len=temp.length;i<len;i++){
    if(temp[i] !== ""){
      let key = temp[i].split(" ");
      item[key[0]] = key[1];
    }
  }
  return item;
}