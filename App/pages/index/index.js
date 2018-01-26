//index.js
//获取应用实例
const app = getApp()
// 引入工具函数
const _ = require('../../utils/util.js')

Page({
  data: {
  },
  // 生命周期：页面显示
  onShow: function () {
  },

  /* 组件事件：添加活动 */
  addActivity: function(){
    // 当日年、月、日 数据同步到全局数据 (如此 新页面也可获得日期数据)
    app.globalData.current.currentYear = this.data.date.currentYear;
    app.globalData.current.currentMonth = this.data.date.currentMonth;
    app.globalData.current.currentDate = this.data.date.currentDate;
    // 新建行程页
    wx.navigateTo({
      url: '../addActivity/addActivity',
    })
  },

})
