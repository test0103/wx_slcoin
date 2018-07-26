Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 显示的告示内容
    msgList: {
      type: Array,
      value: [
        { url: "url", title: "暂无公告" }
      ]
    },
  },

  /**
   * 组件内私有数据
   */
  data: {
    
  },

  /**
   * 组件的公有方法列表
   */
  methods: {

  }
})