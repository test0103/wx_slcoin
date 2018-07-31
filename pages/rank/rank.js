var Utils = require('../../utils/util.js');
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentRank: '', //当前名次
    userLogo: '../../image/logo.png',
    isEnterGame: false, //  是否参加比赛
    isStartGame: false  // 是否开赛
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
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
    console.log('获取排名信息...');
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
        console.log(res)
        if(res.statusCode === 200) {
          console.log('获取排名信息成功')
          let len = res.data.length;
          let myRank = '';
          for(let i=0;i<len;i++){
            if(typeof res.data[i] === 'object'){
              if(res.data[i].wei_pic) {
                res.data[i].wei_pic = decodeURIComponent(res.data[i].wei_pic);
              } else {
                res.data[i].wei_pic = '../../image/logo.png';
              }
              if (res.data[i].user_id === Number(temp_user)){
                myRank = res.data[i].userRank || res.data[i].rank;
              }
              if (res.data[i].nickname){
                res.data[i].nickname = decodeURIComponent(res.data[i].nickname);
              }
            }
          }
          if (len > 3) {
            let _rank = [];
            if(typeof res.data[len-1] === 'object'){
              _rank = res.data.slice(3,len);
            } else {
              _rank = res.data.slice(3, len-1);
            }
            this.setData({
              HeadRank: res.data.slice(0, 3),
              RankList: _rank,
              currentRank: myRank
            })
          } else {
            this.setData({
              HeadRank: res.data,
              RankList: [],
              currentRank: myRank
            })
          }
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
      path: '/pages/rank/rank?room_num=' + temp_user + '&user_id=' + temp_room
    }
  },

  // 立即参加比赛
  ToEnterGame:function () {
    wx.switchTab({
      url: '/pages/trade/trade',
    })
  }
})