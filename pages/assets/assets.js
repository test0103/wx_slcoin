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
        console.log(res)
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
        if(res.statusCode === 200) {
          console.log(res)
          if(res.data.msg === "比赛尚未开始") {
            this.setData({
              total: {
                assets: res.data.asset,
                profit: '0.00',
                yield: '0.00%'
              }
            })
          } else {
            this.setData({
              myRank: res.data.userRank,
              coinList: res.data.coins,
              total: {
                assets: res.data.asset,
                profit: res.data.income,
                yield: res.data.yield
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
      url: 'pages/myreward/myreward',
    })
  },
  //查看我的规则
  ToGameRegular:function () {
    wx.navigateTo({
      url: '/pages/regular/regular',
    })
  }
})