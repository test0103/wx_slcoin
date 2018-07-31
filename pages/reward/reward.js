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
    console.log('查看奖励...')
    wx.request({
      url: app.globalData.ROOTURL + '/rewardInfo',
      data: {
        user_id: app.globalData.user_id
      },
      success: res => {
        console.log(res)
        if(res.statusCode === 200){
          console.log('获取奖励成功')
          for(let i=0,len=res.data.length;i<len;i++){
            res.data[i].endTime = ChangeTheStyle(res.data[i].roomNum);
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
  return arr[1];
}