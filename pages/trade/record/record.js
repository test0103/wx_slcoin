Component({
  /**
   * 组件的属性列表
   */
  properties: {
    recordList:{
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    RecordList:[
      { tradeType: 0, coinType: 'BTC', amount: 23.45, coinMoney: '345.67', changeTime: '12:34:56'},
      { tradeType: 1, coinType: 'BTC', amount: 23.45, coinMoney: '345.67', changeTime: '12:34:56' }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})