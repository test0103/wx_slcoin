var Utils = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userLogo: '../../image/logo.png',
    isInvited: true,
    inviteList:[],  // 已邀请好友列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow: function () {
    wx.getStorage({
      key: 'userInfo',
      success: res => {
        this.setData({
          userLogo: res.data.avatarUrl
        });
      },
    })
    
    this.getInvitedInfo();
  },

  // 获取邀请列表的信息
  getInvitedInfo: function () {
    console.log('获取邀请列表...');
    let temp = app.globalData.user_id;
    if (temp === '') {
      wx.getStorage({
        key: 'user_id',
        success: res => {
          temp = res.data
        }
      });
    }
    wx.request({
      url: app.globalData.ROOTURL + '/invitated',
      data: {
        user_id: temp,
        time: Utils.formatTime(new Date())
      },
      success: res => {
        console.log(res)
        if (res.statusCode === 200) {
          console.log('获取邀请列表成功');
          if (res.data.data === '') {
            this.setData({
              isInvited: false
            })
          } else {
            this.setData({
              inviteList: res.data
            })
          }
        } else {
          wx.showToast({
            title: '获取邀请列表失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error('获取邀请列表失败！');
      }
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let temp_user = app.globalData.user_id;
    let temp_room = app.globalData.room_num;
    if (temp_room === '') {
      wx.getStorage({
        key: 'room_num',
        success: res => {
          temp_room = res.data;
        },
      })
    }
    if (temp_user === '') {
      wx.getStorage({
        key: 'user_id',
        success: res => {
          temp_user = res.data;
        },
      })
    }
    return {
      title: '炒币大咖',
      path: '/pages/trade/trade?room_num=' + temp_room + '&user_id=' + temp_user,
    }
  }
})