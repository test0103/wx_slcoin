var Utils = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userLogo: 'https://wx.qlogo.cn/mmopen/vi_32/dX9dQnzy8yy0yCic43pUr0q57rwic4reWKL2Wmn9PGGhR2VmfjRkjmrb7XyvBEzVUuZa7CUm4IARkia7o7aS8lfiaA/132',
    inviteList:[],  // 已邀请好友列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: app.globalData.ROOTURL + '/invitated',
      data: {
        user_id: app.globalData.user_id,
        time: Utils.formatTime(new Date('2018-07-27 00:00:00'))
      },
      success: res => {
        if (res.data.data !== '') {
          this.setData({
            inviteList: res.data.data
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
    
  }
})