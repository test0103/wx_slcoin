// login.js
const app = getApp();

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onLoad: function () {
    wx.navigateTo({
      url: '../index/index'
    })
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      let that = this;
      //插入登录的用户的相关信息到数据库
      wx.request({
        url: app.globalData.rootPath + 'user/add',
        data: {
          openid: app.globalData.openid,
          nickName: e.detail.userInfo.nickName,
          avatarUrl: e.detail.userInfo.avatarUrl,
          province: e.detail.userInfo.province,
          city: e.detail.userInfo.city
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          //从数据库获取用户信息
          that.queryUsreInfo();
          console.log("插入小程序登录用户信息成功！");
        }
      });
      //授权成功后，跳转进入小程序首页
      wx.navigateTo({
        url: '../index/index'
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },

  //获取用户信息接口
  queryUsreInfo: function () {
    wx.request({
      url: app.globalData.rootPath + 'users/queryByOpenid',
      data: {
        openid: app.globalData.openid
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        app.globalData.userInfo = res.data;
      }
    });
  },

})