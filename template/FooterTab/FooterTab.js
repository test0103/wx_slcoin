//初始化数据
function tabbarinit() {
  return [
    {
      "current": 0,
      "text": "交易",
      "pagePath": "/pages/trade/trade",
      "iconPath": "/image/toolbar/tab_trade.png",
      "selectedIconPath": "/image/toolbar/tab_trade_active.png"
    },
    {
      "current": 0,
      "text": "排名",
      "pagePath": "/pages/rank/rank",
      "iconPath": "/image/toolbar/tab_rank.png",
      "selectedIconPath": "/image/toolbar/tab_rank_active.png"
    },
    {
      "current": 0,
      "text": "资产",
      "pagePath": "/pages/assets/assets",
      "iconPath": "/image/toolbar/tab_assets.png",
      "selectedIconPath": "/image/toolbar/tab_assets_active.png"
    }
  ]

}
//tabbar 主入口
function tabbarmain(bindName = "tabdata", id, target) {
  var that = target;
  var bindData = {};
  var otabbar = tabbarinit();
  otabbar[id]['iconPath'] = otabbar[id]['selectedIconPath'] //换当前的icon
  otabbar[id]['current'] = 1;
  bindData[bindName] = otabbar
  that.setData({ bindData });
}

module.exports = {
  tabbar: tabbarmain
}