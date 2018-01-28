//index.js
const _ = require('../../utils/util.js');
const app = getApp();

Page({
  data: {
    // datetime: Date 类型
    record_key: '', // 如 '2017-01'
    calendarRecords: {} // 如 {'2018-01':{'04':...,'26':...}}，可以初始化时，传入全部数据，本项目时，翻页时，3月1批更新；
  },
  // 生命周期：页面显示
  onShow: function () {
    this.updateRecord(this.data.datetime);
  },

  /* 1. 传入calendar组件的回调函数，获取 calendar组件 当前日期 */
  getDate(evt) {
    // 刷新日历记录
    this.checkUpdateRecord(evt.detail.datetime);
    // 把calendar传出的数据，绑定到data上
    this.setData({ datetime: evt.detail.datetime });
  },
  /* 1.1 检验是否需要更新 */
  checkUpdateRecord(datetime){
    let currentDate = new Date(datetime);
    let currentYear = currentDate.getFullYear() // 年
    let currentMonth = currentDate.getMonth() // 月
    let record_key = `${currentYear}-${_.formatNumber(currentMonth)}`;
    // 若发生过 翻月
    if (record_key !== this.data.record_key) {
      this.updateRecord(datetime);
    }
  },
  /* 1.2 更新data数据：获取本地储存，刷新日历记录 */
  updateRecord(datetime){
    let currentDate = new Date(datetime);
    let currentYear = currentDate.getFullYear() // 年
    let currentMonth = currentDate.getMonth() // 月
    let record_key = `${currentYear}-${_.formatNumber(currentMonth)}`;
    // 获取本地储存（本月）
    let calendarRecords = {};
    // 获取本地储存（上月、本月、下月）
    this.getAdjacentMonths(currentYear, currentMonth).forEach(record_key => {
      let monthRecord = wx.getStorageSync(record_key) || {};
      calendarRecords[record_key] = monthRecord;
    });
    console.log(calendarRecords);
    // 一批更新3页数据，轮播时，体验好（目标页进入时，就带有数据）
    this.setData({
      record_key,
      calendarRecords
    })
  },
  /* 1.3 辅助工具方法：计算上月下月 record_key 如：['2017-12'，'2018-01'，'2018-02'] */
  getAdjacentMonths(currentYear, currentMonth){
    let adjacentMonths = [];
    let lastMonth = new Date(currentYear, currentMonth - 1, 1);
    let nextMonth = new Date(currentYear, currentMonth + 1, 1);
    adjacentMonths.push(`${lastMonth.getFullYear()}-${_.formatNumber(lastMonth.getMonth())}`);
    adjacentMonths.push(`${currentYear}-${_.formatNumber(currentMonth)}`);
    adjacentMonths.push(`${nextMonth.getFullYear()}-${_.formatNumber(nextMonth.getMonth())}`);
    return adjacentMonths;
  },

  /* 2.1 组件事件：添加活动 */
  addActivity: function(){
    // 当日年、月、日 数据同步到全局数据 (如此 新页面也可获得日期数据)
    let date = new Date(this.data.datetime);
    app.globalData.current.currentYear = date.getFullYear();
    app.globalData.current.currentMonth = date.getMonth();
    app.globalData.current.currentDate = date.getDate();
    // 新建行程页
    wx.navigateTo({
      url: '../addActivity/addActivity',
    })
  },

})
