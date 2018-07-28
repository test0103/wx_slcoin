var Utils = require('../../utils/util.js');
const app = getApp();
var coinTimer;  //获取币种信息的定时器
var waitTime; // 等待比赛开始的定时器
var timer;  //比赛倒计时的定时器
var total_second = 2 * 60 * 60 * 1000; // 2h的倒计时

Page({
  /**
   * 页面的初始数据
   */
  data: {
    user_id: '',
    room_num: '',
    isFormId: false, // 是否获取formId
    step: 1, // 表示进行的步骤：1-未参赛，2-邀请好友，3-开赛进行交易，4-比赛结束
    isEnterGame: false, // 是否参加比赛
    isStartGame: false, // 是否开赛
    unFullNum: 1, // 当前房间人数
    countURL: '',  // 开赛前倒计时的数字图标 
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
      income: '',
      yield: ''
    },
    query: {}  //保存分享而来的参数信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if(options.user_id) {
      this.setData({
        query: {
          from: options.user_id,
          room_num: options.room_num
        }
      })
    }
    wx.getStorage({
      key: 'room_num',
      success: res => {
        this.setData({
          room_num: res.data
        })
      }
    })
    wx.getStorage({
      key: 'user_id',
      success: res => {
        this.setData({
          user_id: res.data
        })
      }
    })
  },

  onShow: function(){
    wx.getStorage({
      key: 'step',
      success: res => {
        this.setData({
          step: res.data
        })
        this.JugeTheStatus(res.data);
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
  JugeTheStatus: function (step) {
    console.log('状态更改，初始化数据。。。。')
    if (step === 2) {
      console.log('状态2')
      console.log(this.data)
      this.getRoomInfo();
    }

    if (step === 3) {
      console.log('状态3')
      clearTimeout(waitTime);
      waitTime = null;
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

      wx.getStorage({
        key: 'endTime',
        success: (res) => {
          let end = new Date(res.data).getTime();
          console.log(end);
          let now = new Date().getTime();
          console.log(now);
          total_second = end - now;
          CountOneDay(this);
        },
      })
    }

    if(step === 4) {
      console.log('状态4');
      clearInterval(coinTimer);
      coinTimer = null;
      app.globalData.room_num = '';
    } 
  },

  /**
   * 点击立即参赛，获取用户信息权限
   */
  getUserInfo: function (e) {
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
        title: '授权成功！',
      });
    } else {  // 用户拒绝了授权
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，可能没办法更好的体验炒币大咖!',
        showCancel: false
      })
    }
    let userData = {
      nickname: e.detail.userInfo.nickName || '',
      wei_pic: encodeURIComponent(e.detail.userInfo.avatarUrl || '../../image/wx_login.jpg'),
      time: Utils.formatTime(new Date())
    };

    this.userLogin(userData);
  },

  // 用户登录，并获取user_id
  userLogin: function (userData) {
    wx.login({
      success: res => {
        if (res.code) {
          app.globalData.code = res.code;
          console.log('获取Code');

          let params = userData;
          params.code = res.code;
          params.time = Utils.formatTime(new Date());

          wx.request({
            url: 'http://172.20.120.190:8088/authorization',
            data: params,
            success: res => {
              console.log('获取user_id');
              if (res.statusCode === 200) {
                this.setData({
                  user_id: res.data.user_id
                })
                app.globalData.user_id = res.data.user_id;
                console.log(res.data.user_id)
                console.log('缓存user_id！');
                wx.setStorage({
                  key: 'user_id',
                  data: res.data.user_id
                })
              }
            },
            fail: err => {
              wx.showToast({
                title: '获取user_id失败',
                icon: 'error'
              });
            }
          })

        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })

    // 切换点击按钮的属性，获取用户的formId，以便后续发模版消息
    this.setData({
      isFormId: true
    })
  },

  // 授权后获取用户的FormId，并参加比赛
  getUserFormId: function (e) {
    console.log('获取用户的formId')
    this.setData({
      formId: e.detail.formId
    })
    this.joinGame(e.detail.formId);
  },

  // 立即参赛
  joinGame: function (formId) {
    console.log('获取formId后，立即参赛')
    let temp = app.globalData.user_id;

    if(temp === ''){
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp = res.data
            console.log('获取缓存中')
          }
        });
        console.log('缓存获取成功：' + temp + '33')
      }
    }
    let params = {
      user_id: temp,
      formId: formId,
      time: Utils.formatTime(new Date())
    }
    if (this.data.query.from) {
      params.from = this.data.query.from;
      params.room_num = this.data.query.room_num;
    }
    wx.request({
      url: app.globalData.ROOTURL + '/game/join',
      data: params,
      success: res => {
        if (res.statusCode === 200) {
          console.log('参赛成功获取房间号')
          let currenStep = 2;
          app.globalData.room_num = res.data.room_num;
          if (res.data.isStartGame && res.data.end_time) { //  异地登陆后，该用户以及参见过比赛，且该比赛尚未结束
            currenStep = 3;
            wx.setStorage({
              key: "isStartGame",
              data: true
            })
            wx.setStorage({
              key: "endTime",
              data: res.data.end_time
            })
          }
          this.setData({
            step: currenStep,
            room_num: res.data.room_num,
            isEnterGame: true,
            isStartGame: currenStep === 3,
            unFullNum: res.data.number
          })
          wx.setStorage({
            key: "step",
            data: currenStep
          })
          wx.setStorage({
            key: "room_num",
            data: res.data.room_num
          })
          wx.setStorage({
            key: "isEnterGame",
            data: true
          })
          this.JugeTheStatus(currenStep);  //登录后变更状态，需要重新初始化数据
        } else {
          wx.showToast({
            title: '参赛失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error(err);
      }
    })
  },

  // 在等待开赛时，轮询获取房间的信息
  getRoomInfo: function () {
    console.log('开始获取房间信息')
    let temp_user = app.globalData.user_id;
    let temp_room = app.globalData.room_num;

    if (temp_room === ''){
      if (this.data.room_num !== '' && this.data.room_num !== undefined){
        temp_room = this.data.room_num;
      } else {
        wx.getStorage({
          key: 'room_num',
          success: res => {
            temp_room = res.data;
          },
        })
      }
    }

    if (temp_user === '') {
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp_user = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp_user = res.data;
          },
        })
      }
    }

    wx.request({
      url: app.globalData.ROOTURL + '/room_info',
      data: {
        user_id: temp_user,
        room_num: temp_room,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        console.log('获取房间信')
        if (res.statusCode === 200) {
          console.log('成功更新房间信息')
          this.setData({
            unFullNum: res.data.number
          })
          console.log(this.data)
          if(res.data.number >= 5) {
            wx.setStorage({
              key: 'endTime',
              data: res.data.endTime,
            })
            clearTimeout(waitTime);
            waitTime = null;

            this.StartGame(res.data.endTime);
            return;
          }
        } else {
          wx.showToast({
            title: '获取房间信息失败',
            icon: 'none'
          })
        }
        
        waitTime = setTimeout(() => {
          this.getRoomInfo();
        }, 5 * 1000);
      },
      fail: err => {
        console.error('获取房间信息失败！');
      }
    })
  },

  // 请求虚拟货币的基本信息
  getCoinInfo: function() {
    let temp = app.globalData.user_id;
    if (temp === '') {
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp = res.data
          }
        });
      }
    }

    wx.request({
      url: app.globalData.ROOTURL + '/coin_info',
      data: {
        user_id: temp,
        time: Utils.formatTime(new Date())
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
        } else {
          wx.showToast({
            title: '获取币种信息失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('获取币种信息失败！');
      }
    })
  },

  // 获取比赛时的用户交易信息
  getRollingInfor: function () {
    let temp = app.globalData.user_id;
    if (temp === '') {
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp = res.data
          }
        });
      }
    }

    wx.request({
      url: app.globalData.ROOTURL + '/rolling',
      data: {
        user_id: temp,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        if (res.statusCode === 200) {
          if(res.data.length > 0) {
            this.setData({
              msgList: res.data
            });
          }
        } else {
          wx.showToast({
            title: '获取交易信息失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('获取交易信息失败！');
      }
    })
  },

  //请求当前用户的个人资产
  getMyAssets: function () {
    let temp = app.globalData.user_id;
    if (temp === '') {
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp = res.data
          }
        });
      }
    }

    wx.request({
      url: app.globalData.ROOTURL + '/personAsset',
      data: {
        user_id: temp,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        if (res.statusCode === 200) {
          this.setData({
            our: {
              assets: res.data.money,
              possess: DealMyOwn(res.data.possess)
            }
          })
        } else {
          wx.showToast({
            title: '获取个人资产信息失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('请求当前用户的个人资产失败！');
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let temp_user = app.globalData.user_id;
    let temp_room = app.globalData.room_num;
    if (temp_room === '') {
      if (this.data.room_num !== '' && this.data.room_num !== undefined) {
        temp_room = this.data.room_num;
      } else {
        wx.getStorage({
          key: 'room_num',
          success: res => {
            temp_room = res.data;
          },
        })
      }
    }
    if (temp_user === '') {
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp_user = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp_user = res.data;
          },
        })
      }
    }
    return {
      title: '炒币大咖',
      path: '/pages/trade/trade?room_num=' + temp_room + '&user_id=' + temp_user,
    }
  },

  // 查看游戏规则
  ViewToRegular: function (){
    wx.navigateTo({
      url: '/pages/regular/regular',
    })
  },

  // 开始比赛(目前是点击金币图片，实现开赛)
  StartGame: function (endTime){
    this.setData({
      isStartGame:true,
      endTime: endTime
    });
    wx.setStorage({
      key: 'isStartGame',
      data: true,
    })
    count_down(this);
    let end = new Date(endTime).getTime();
    let now = new Date().getTime();
    total_second = end - now;
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

  // 选择买入/卖出/交易记录的Tab
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
        this.getUserRecords();
        break;
    }
  },

  // 查看本人的当场比赛的交易记录
  getUserRecords: function (){
    console.log('获取交易记录')
    let temp = app.globalData.user_id;
    if (temp === '') {
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp = res.data
          }
        });
      }
    }

    wx.request({
      url: app.globalData.ROOTURL + '/transationRecord',
      data: {
        user_id: temp,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        console.log(res)
        if (res.statusCode === 200) {
          this.setData({
            recordList: res.data
          })
        } else {
          wx.showToast({
            title: '获取个人交易记录失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('获取个人交易记录失败！');
      }
    })
  },

  // 买入卖出成功后，更新个人资产
  ChangeMyAssets: function(obj) {
    console.log(obj)
    let refresh;
    if(obj.detail.type === 'buy'){
      refresh = this.selectComponent("#buy").updateMoney(obj.detail.money);
    } else {
      refresh = this.selectComponent("#sale").updateMoney(DealMyOwn(obj.detail.possess));
    }
    
    this.setData({
      our: {
        assets: obj.detail.money,
        possess: DealMyOwn(obj.detail.possess)
      }
    }, refresh)
  },

  // 比赛结束
  GameOver: function(){
    let temp_room = app.globalData.room_num;
    if (temp_room === '') {
      if (this.data.room_num !== '' && this.data.room_num !== undefined) {
        temp_room = this.data.room_num;
      } else {
        wx.getStorage({
          key: 'room_num',
          success: res => {
            temp_room = res.data;
          },
        })
      }
    }

    let temp_user = app.globalData.user_id;
    if (temp_user === '') {
      if (this.data.user_id !== '' && this.data.user_id !== undefined) {
        temp_user = this.data.user_id;
      } else {
        wx.getStorage({
          key: 'user_id',
          success: res => {
            temp_user = res.data;
          },
        })
      }
    }

    wx.request({
      url: app.globalData.ROOTURL + '/game/room/end',
      data: {
        user_id: temp_user,
        room_num: temp_room,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        if(res.statusCode === 200) {
          this.setData({
            step: 4,
            room_num: '',
            myrank: res.data.userRank,
            our:{
              assets: res.data.asset,
              income: res.data.endMoney,
              yield: res.data.endRate
            }
          })
          wx.setStorage({
            key: "isEnterGame",
            data: false
          });
          wx.removeStorage({ key: 'endTime' });
          wx.removeStorage({ key: 'room_num' });
        } else {
          wx.showToast({
            title: '当场比赛结束失败',
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
   
  },

  // 查看奖励
  ToMyReward: function () {
    wx.navigateTo({
      url: '/pages/reward/reward',
    })
  },

  //  查看排名
  ToMyRank: function () {
    wx.switchTab({
      url: '/pages/rank/rank',
    })
  }
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
    that.JugeTheStatus(3);
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
    that.GameOver();
    return;
  }
  timer = setTimeout(function () {
    total_second -= 1000;
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
  if(str === '') {
    return {};
  }
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