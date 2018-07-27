var Utils = require('../../utils/util.js');
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentRank: 4, //当前名次
    userLogo: 'https://wx.qlogo.cn/mmopen/vi_32/dX9dQnzy8yy0yCic43pUr0q57rwic4reWKL2Wmn9PGGhR2VmfjRkjmrb7XyvBEzVUuZa7CUm4IARkia7o7aS8lfiaA/132',
    isEnterGame: false, //  是否参加比赛
    isStartGame: false  // 是否开赛
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
          this.setData({
            isEnterGame: true,
          });
          wx.getStorage({
            key: 'isStartGame',
            success: (res) => {
              if (res.data) {
                this.setData({
                  isStartGame: true,
                });
                this.getRankInfo();
              }
            }
          })
        }
      }
    })
  },
  // 获取排名信息
  getRankInfo: function() {
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
        key: 'room_num',
        success: res => {
          temp_room = res.data
        }
      });
    }
    wx.request({
      url: app.globalData.ROOTURL + '/rank_info',
      data: {
        user_id: temp_user,
        room_num: temp_room
      },
      success: res => {
        if(res.statusCode === 200) {
          let len = res.data.length;
          for(let i=0;i<len-1;i++){
            if(typeof res.data[i] === 'object'){
              res.data[i].wei_pic = decodeURIComponent(res.data[i].wei_pic);
            }
          }
          console.log(res.data);
          this.setData({
            HeadRank: res.data.slice(0, 3),
            RankList: res.data.slice(3, len - 1),
            currentRank: res.data[len - 1].split(":")[1]
          })
        } else {
          wx.showToast({
            title: '获取排名信息失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('请求排名信息失败！');
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
      path: '/pages/rank/rank?room_num=' + app.globalData.room_num+'&user_id='+app.globalData.user_id,
    }
  },

  // 立即参加比赛
  ToEnterGame:function () {
    wx.switchTab({
      url: '/pages/trade/trade',
    })
  }
})