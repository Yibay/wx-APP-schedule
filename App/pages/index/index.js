//index.js
//获取应用实例
const app = getApp()
// 引入工具函数
const _ = require('../../utils/util.js')

Page({
  data: {
    date: {}, // 日历组件：日期数据
    eventType: app.globalData.eventType
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
    this.updateCalendar(date)
  },
  // 生命周期：页面显示
  onShow: function () {
    // 获取当前选中日期
    var date = this.data.date.datetime || new Date()
    // 初始化日历组件
    this.updateCalendar(date)
  },

  /** 
   * 组件方法：初始化/更新 日历组件
   * @param {Date} date
   */
  updateCalendar: function(date){
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
    var beforeDays = new Array(startDay);
    for(var i=0; i<startDay; i++){
      beforeDays[i] = {id: `before${i}`};
    }
    // 月末星期几（0~6 星期日~星期六）
    var endDay = new Date(currentYear, currentMonth + 1, 0).getDay()
    var afterDays = new Array(6 - endDay);
    for(var i=0; i<6 - endDay; i++){
      afterDays[i] = {id: `after${i}`};
    }
    // 获取本地储存 记录对象 (当前月)
    var record_key = `${currentYear}-${_.formatNumber(currentMonth)}`
    var record = wx.getStorageSync(record_key) || {}
    console.log(record)
    // 本月天数
    var numOfDay = new Date(currentYear, currentMonth + 1, 0).getDate()
    // 本月天数组
    var days = new Array(numOfDay)
    for (var i = 0; i < numOfDay; i++) {
      days[i] = {
        id: i + 1,
        record: record[_.formatNumber(i + 1)]
      }
    }
    console.log(days);
    return {
      datetime: date,
      currentYear, // 本地储存数据结构中，wx.setStorageSync('yyyy-01', {04: {type:...}})
      currentMonth, // 本地储存数据结构中，wx.setStorageSync('2017-mm', {04: {type:...}})
      currentDate, // 本地储存数据结构中，wx.setStorageSync('2017-01', {dd: {type:...}})
      beforeDays, // 用于wxml中填补前置空格
      afterDays, // 用于wxml中填补后续空格 
      numOfDay, // 本月天数，用于 上一月，下一月时，判断 当前日数 是否超出上、下月总天数
      days // 本月天数数组，用于 wxml 展示
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
      'date.beforeDays': calendarData.beforeDays,
      'date.afterDays': calendarData.afterDays,
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
  },

  /* 组件事件：切换日期 */
  handleChangeDate: function(evt){
    // 若没点中 日期数据，则直接返回
    if (!evt.target.dataset.day) return;
    // 更新日历数据
    this.updateCalendar(new Date(this.data.date.currentYear, this.data.date.currentMonth, evt.target.dataset.day))
  },

  /* 组件事件：切换月 */
  handleChangeMonth: function(evt){
    console.log(evt);
  },

  /* 组件事件：切换到今天 */
  changeToToday: function(){
    this.updateCalendar(new Date());
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

  /* 当日详情组件 */
  /* 组件事件：设置当日 事件类型 */
  handleSetDateType: function(){
    var that = this
    console.log(this.data.eventType)
    var itemList = this.data.eventType.map(item => item.text)
    // 显示操作菜单
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        // 选中事件类型
        var eventType = that.data.eventType[res.tapIndex]
        // 更新当日事件类型
        that.setRecord({
          bgcolor: eventType.bgcolor,
          color: eventType.color
        })
        // 更新日历数据
        that.updateCalendar(new Date(that.data.date.currentYear, that.data.date.currentMonth, that.data.date.currentDate))
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  /** 
   * 组件方法：更新当日 事件类型
   * @param {Object} recordData
   */
  setRecord: function (recordData){
    if (!recordData)return
    var currentYear = this.data.date.currentYear // 年
    var currentMonth = this.data.date.currentMonth // 月
    var currentDate = this.data.date.currentDate // 日
    // 获取记录对象
    var record_key = `${currentYear}-${_.formatNumber(currentMonth)}`
    var record = wx.getStorageSync(record_key) || {}
    currentDate = _.formatNumber(currentDate)
    // 若当日无记录, 则新建
    record[currentDate] || (record[currentDate] = {})
    record[currentDate].bgcolor = recordData.bgcolor
    record[currentDate].color = recordData.color
    // 本地储存记录
    wx.setStorageSync(record_key, record)
  }
})
