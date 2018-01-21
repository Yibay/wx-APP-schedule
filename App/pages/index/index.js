//index.js
//获取应用实例
const app = getApp()
// 引入工具函数
const _ = require('../../utils/util.js')

Page({
  data: {
    date: {}, // 日历组件：日期数据
    eventType: [ // 当日事件类型
      { text: '通告', bgcolor: '#ff619b', color: '#fff' },
      { text: '彩排', bgcolor: '#b7b8f0', color: '#fff' },
      { text: '会议', bgcolor: '#e06555', color: '#fff' },
      { text: '筹备', bgcolor: '#6ad4fe', color: '#fff' },
      { text: '其他', bgcolor: '#efefef', color: '#000' },
    ]
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
  },

  /* 组件事件：切换日期 */
  handleChangeDate: function(evt){
    // 若没点中 日期数据，则直接返回
    if (!evt.target.dataset.day) return;
    // 更新日历数据
    this.updateCalendar(new Date(this.data.date.currentYear, this.data.date.currentMonth, evt.target.dataset.day))
  },

  /* 当日详情组件 */
  /* 组件事件：设置当日 事件类型 */
  handleSetDateType: function(){
    var that = this
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
