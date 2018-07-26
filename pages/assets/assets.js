const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userName: '用户名',
    userLogo: 'https://wx.qlogo.cn/mmopen/vi_32/dX9dQnzy8yy0yCic43pUr0q57rwic4reWKL2Wmn9PGGhR2VmfjRkjmrb7XyvBEzVUuZa7CUm4IARkia7o7aS8lfiaA/132',
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
    wx.getStorage({
      key: 'isEnterGame',
      success: (res) => {
        if(res.data) {
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
    wx.request({
      url: app.globalData.ROOTURL + '/homePage',
      data: {
        user_id: app.globalData.user_id,
        room_num: app.globalData.room_num
      },
      success: res => {
        if(res.statusCode === 200) {
          if(res.data.errmsg === "比赛尚未开始" && res.data.data !== '') {
            this.setData({
              myRank: res.data.userRank,
              coinList: res.data.coins,
              total: {
                assets: res.data.money,
                profit: res.data.income,
                yield: res.data.yield
              }
            })
          } else {
            this.setData({
              total: {
                assets: 20000,
                profit: '0.00',
                yield: '0.00%'
              }
            })
          }
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
    if (res.from === 'button') {
      // 来自页面内转发按钮
    } else if (res.from === 'menu') {
      // 来自菜单的转发按钮
    }
    return {
      title: '炒币大咖',
      path: '/pages/rank/rank?room_num=' + app.globalData.room_num + '&user_id=' + app.globalData.user_id,
    }
  },

  ToMyReward:function () {
    wx.navigateTo({
      url: 'pages/myreward/myreward',
    })
  },

  ToGameRegular:function () {
    wx.navigateTo({
      url: '/pages/regular/regular',
    })
  }
})