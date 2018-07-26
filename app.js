var Utils = require('utils/util.js');

//app.js
App({
  onLaunch: function (options) {
    this.globalData.secene = options.scene;
    console.log(options);
    if (options.secene === 1044 || options.secene === 1007) {  //  通过好友的分享进入  
      this.globalData.room_num = options.query.room_num;
    }
    wx.checkSession({
      success: () => {
        //session_key 未过期
        wx.getStorage({
          key: 'user_id',
          success: res => {
            this.globalData.user_id = res.data;
          }
        })
        wx.getStorage({
          key: 'room_num',
          success: res => {
            if(res.data !== ''){
              this.globalData.room_num = res.data;
            }
          }
        })
      },
      fail: () => {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success: res => {
            if (res.code) {
              //发起网络请求,获取user_id
              this.globalData.code = res.code;

              let _data = {}
              _data.code = res.code;
              if(options.query.user_id){
                _data.from = options.query.user_id;
                _data.room_num = options.query.room_num;
              }

              wx.request({
                url: 'https://123.207.247.38:8088/authorization',
                data: _data,
                success: res => {
                  if (res.statusCode === 200) {
                    this.globalData.user_id = res.data.user_id;
                    wx.setStorage({
                      key: 'user_id',
                      data: res.data.user_id
                    })
                  }
                },
                fail: err => {
                  console.log('获取user_id失败！');
                }
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })
      }
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.setStorage({
            key: "isAuthorize", // 缓存用户是否授权
            data: true
          })
        } else {
          wx.setStorage({
            key: "isAuthorize",
            data: false
          })
          wx.setStorage({
            key: "isEnterGame",  //  记录用户是否参加比赛或者比赛是否结束
            data: false
          })
          wx.setStorage({
            key: "step",  // 记录当前的进行步骤
            data: 1
          })
        }
      }
    })
  },

  //  当用户通过分享进入页面不存在时，页面进入首页
  onPageNotFound(res) {
    wx.switchTab({
      url: 'pages/trade/trade'
    }) 
  },

  // 全局的变量对象
  globalData: {
    code:'',   // 登录后获取的零时凭证
    secene: '',  // 用户进入的场景值
    user_id: '',  // 用户的唯一标识
    room_num: '',  // 通过分享进入房间号的值
    ROOTURL: "https://123.207.247.38:8088",  // 后台服务器的地址
  }
})