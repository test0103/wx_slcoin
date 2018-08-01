const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userName: '用户名',
    userLogo: '../../image/logo.png',
    myRank: '',
    total: {
      assets: '0.00',
      profit: '0.00',
      yield: '+0.00%'
    },
    coinList: [],
    isEnterGame: false,
    isStartGame: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  onShow: function(){
    wx.getStorage({
      key: 'isEnterGame',
      success: (res) => {
        if (res.data) {
          let userData = wx.getStorageSync('userInfo');
          this.setData({
            isEnterGame: res.data,
            userLogo: userData.avatarUrl,
            userName: userData.nickName
          });
          this.getUserAsset();
        }
      }
    })
  },

  // 获取个人资产信息
  getUserAsset: function (){
    console.log('获取个人资产信息')
    let temp_user = app.globalData.user_id;
    if (temp_user === '') {
      wx.getStorage({
        key: 'user_id',
        success: res => {
          temp_user = res.data
        }
      });
    }
    let temp_room = app.globalData.room_num;
    if (temp_room === '') {
      wx.getStorage({
        key: 'user_id',
        success: res => {
          temp_room = res.data
        }
      });
    }
    wx.request({
      url: app.globalData.ROOTURL + '/homePage',
      data: {
        user_id: temp_user,
        room_num: temp_room
      },
      success: res => {
        console.log(res)
        if(res.statusCode === 200) {
          if(res.data.msg === "比赛尚未开始") {
            this.setData({
              myRank: '',
              coinList:[],
              total: {
                assets: res.data.asset,
                profit: '0.00',
                yield: '0.00%'
              }
            })
          } else {
            let temp = []
            if(res.data.coins) {
              for(let i=0,len=res.data.coins.length;i<len;i++){
                if(Number(res.data.coins[i].amount) > 0){
                  temp.push(res.data.coins[i]);
                }
              }
            }
            this.setData({
              myRank: res.data.userRank,
              coinList: temp,
              total: {
                assets: res.data.asset,
                profit: res.data.income || res.data.earnMoney,
                yield: res.data.yield || res.data.earnRate
              }
            })
          }
        } else {
          wx.showToast({
            title: '获取资产信息失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('请求资产信息失败！');
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let temp_user = app.globalData.user_id;
    if (temp_user === '') {
      wx.getStorage({
        key: 'user_id',
        success: res => {
          temp_user = res.data
        }
      });
    }
    let temp_room = app.globalData.room_num;
    if (temp_room === '') {
      wx.getStorage({
        key: 'user_id',
        success: res => {
          temp_room = res.data
        }
      });
    }
    return {
      title: '炒币大咖',
      path: '/pages/rank/rank?room_num=' + temp_room + '&user_id=' + temp_user,
    }
  },

  //查看奖励页
  ToMyReward:function () {
    wx.navigateTo({
      url: '/pages/reward/reward',
    })
  },
  //查看我的规则
  ToGameRegular:function () {
    wx.navigateTo({
      url: '/pages/regular/regular',
    })
  }
})

function DealMyPossess(str) {
  if (str === '') {
    return [];
  }

  let temp = str.split(",");
  let result = [];
  for (let i = 0, len = temp.length; i < len-1; i++) {
    if (temp[i] !== "") {
      let key = temp[i].split(" ");
      if (Number(key[1]) !== 0) {
        let item = {};
        item.coin_type = key[0];
        item.amount = key[1];
        result.push(item);
      }
    }
  }
  return result;
}
