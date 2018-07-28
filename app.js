var Utils = require('utils/util.js');

//app.js
App({
  onLaunch: function (options) {
    this.globalData.secene = options.scene;
    console.log('获取分享而来的信息')
    console.log(options);

    if (options.secene === 1044 || options.secene === 1007) {  //  通过好友的分享进入  
      this.globalData.query = options.query;
    }
    wx.checkSession({
      success: () => {
        // 当前的session_key未过期
        console.log('已经登录')
        wx.getStorage({
          key: 'user_id',
          success: res => {
            this.globalData.user_id = res.data;
          }
        })
        
        wx.getStorage({
          key: 'room_num',
          success: res => {
            if (res.data !== '') {
              this.globalData.room_num = res.data;
            }
          }
        })
       
        wx.getStorage({
          key: 'endTime',
          success: res => {
            if (res.data !== '') {
              if(new Date(res.data).getTime() > new Date().getTime()){
                console.log(11)
                this.globalData.endTime = res.data;
              } else {
                console.log(22)
                wx.setStorage({
                  key: 'step',
                  data: 4,
                })
              }
            }
          }
        })
        
      },
      fail: () => {
        // 当前用户已过期
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
    query: {}, // 分享进入房间的携带数据
    code:'',   // 登录后获取的零时凭证
    secene: '',  // 用户进入的场景值
    user_id: '',  // 用户的唯一标识
    room_num: '',  // 用户参赛的房间号
    endTime: '', //用户当前比赛的结束时间
    ROOTURL: "http://172.20.120.190:8088",  // 后台服务器的地址
  }
})