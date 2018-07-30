var Utils = require('../../utils/util.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    RewardList:[
  
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.request({
      url: app.globalData.ROOTURL + '/rewardInfo',
      data: {
        user_id: app.globalData.user_id
      },
      success: res => {
        if(res.statusCode === 200){
          for(let i=0,len=res.data.length;i<len;i++){
            res.data[i].endTime = ChangeTheStyle(res.data[i].endTime);
          }
          this.setData({
            RewardList: res.data
          })
        } else {
          wx.showToast({
            title: '获取奖励信息失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.error(err);
      }
    })
  }
})
function ChangeTheStyle(time) {
  let arr = time.split(" ");
  return arr[2];
}