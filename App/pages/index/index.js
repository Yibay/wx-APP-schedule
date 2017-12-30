//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    date: {}, // 日历组件：日期数据
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 生命周期：页面加载
  onLoad: function () {
    // 获取当前选中日期
    var date = this.data.date.datetime || new Date()
    // 初始化日历组件
    this.initCalendar(date)
  },

  /** 
   * 组件方法：初始化日历组件
   * @param {Date} date
   */
  initCalendar: function(date){
    // 构造日历数据
    var dateData = this.constructCalendarData(date)
    // 更新日历数据
    this.setCalendarData(dateData)
  },
  /** 
   * 组件方法：初始日历数据
   * @param {Date} date
   * @returns {Object} calendarData
   */
  constructCalendarData: function(date){
    var currentYear = date.getFullYear() // 年
    var currentMonth = date.getMonth() // 月
    var currentDate = date.getDate() // 日
    // 月初星期几（0~6 星期日~星期六）
    var startDay = new Date(currentYear, currentMonth, 1).getDay()
    // 本月天数
    var numOfDay = new Date(currentYear, currentMonth + 1, 0).getDate()
    // 本月天数组
    var days = new Array(numOfDay)
    for (var i = 0; i < numOfDay; i++) {
      days[i] = { id: i + 1 }
    }
    return {
      datetime: date,
      currentYear,
      currentMonth,
      currentDate,
      startDay,
      numOfDay,
      days
    }
  },
  /** 
   * 组件方法：更新日历数据 刷新视图
   * @param {Object} calendarData
   */
  setCalendarData(calendarData){
    console.log(calendarData)
    this.setData({
      'date.datetime': calendarData.datetime,
      'date.currentYear': calendarData.currentYear,
      'date.currentMonth': calendarData.currentMonth,
      'date.currentDate': calendarData.currentDate,
      'date.startDay': calendarData.startDay,
      'date.days': calendarData.days
    })
  },

  /* 组件事件：去上一月 */
  handleToLastMonth: function () {
    // 月份减1；跨年 则年减1，月设为 11 (12月份)
    var currentMonth, currentYear = this.data.date.currentYear;
    if (this.data.date.currentMonth > 0) { // 0 为1月份
      currentMonth = this.data.date.currentMonth - 1
    }
    else {
      currentYear --;
      currentMonth = 11 // 11 为12月份
    }
    // 构造日期数据（上月1号, 不用当前日，防止超出上月最大天数）
    var dateData = this.constructCalendarData(new Date(currentYear, currentMonth, 1))
    // 调整 日值 (若超出上月天数，则取上月最大值)
    dateData.currentDate = Math.min(dateData.numOfDay, this.data.date.currentDate)
    dateData.datetime = new Date(dateData.currentYear, dateData.currentMonth, dateData.currentDate)
    // 更新日历数据
    this.setCalendarData(dateData)
  },

  /* 组件事件：去下一月 */
  handleToNextMonth: function () {
    // 月份加1；跨年 则年加1，月设为 0 (1月份)
    var currentMonth, currentYear = this.data.date.currentYear;
    if (this.data.date.currentMonth < 11) { // 11 为12月份
      currentMonth = this.data.date.currentMonth + 1
    }
    else {
      currentYear++;
      currentMonth = 0 // 0 为1月份
    }
    // 构造日期数据（下月1号）
    var dateData = this.constructCalendarData(new Date(this.data.date.currentYear, this.data.date.currentMonth + 1, 1))
    // 调整 日值
    dateData.currentDate = Math.min(dateData.numOfDay, this.data.date.currentDate)
    dateData.datetime = new Date(dateData.currentYear, dateData.currentMonth, dateData.currentDate)
    // 更新日历数据
    this.setCalendarData(dateData)
  }
})
