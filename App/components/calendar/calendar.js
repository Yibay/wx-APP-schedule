const _ = require('../../utils/util.js')

// 日历组件
Component({
  // 组件内数据
  data: {
    date: {}, // 日历组件：日期数据
    swiperIndex: 1, // 3页日历 轮播，默认中间页（0、1、2）
    duration: 300  // 轮播缓动时间
  },
  // 组件生命周期
  attached(){
    // 获取当前选中日期
    var date = this.data.date.datetime || new Date()
    // 初始化日历组件
    this.updateCalendar(date)
  },
  // 组件方法
  methods: {
    /** 
     * 组件方法：初始化/更新 日历组件
     * @param {Date} date
     */
    updateCalendar: function (date) {
      // 构造日历数据
      var dateData = this.constructCalendarData(date)
      // 更新日历数据
      this.setCalendarData(dateData)
    },
    /** 
     * 构造data数据方法：构造 日历完整数据
     * @param {Date} date
     * @returns {Object} calendarData
     */
    constructCalendarData: function (date) {
      var currentYear = date.getFullYear() // 年
      var currentMonth = date.getMonth() // 月
      var currentDate = date.getDate() // 日
      // 本月天数
      var numOfDay = new Date(currentYear, currentMonth + 1, 0).getDate()
      // 日历轮播数组
      var calendarSwiperArray = [
        this.constructMonthData(new Date(currentYear, currentMonth - 1, 1)),
        this.constructMonthData(new Date(date)),
        this.constructMonthData(new Date(currentYear, currentMonth + 1, 1))
      ];

      return {
        datetime: date, // onShow时，若 date.datetime存在，则用它生成new Date，作为数据源
        currentYear, // 本地储存数据结构中，wx.setStorageSync('yyyy-01', {04: {type:...}})
        currentMonth, // 本地储存数据结构中，wx.setStorageSync('2017-mm', {04: {type:...}})
        currentDate, // 本地储存数据结构中，wx.setStorageSync('2017-01', {dd: {type:...}})
        numOfDay, // 本月天数，用于 上一月，下一月时，判断 当前日数 是否超出上、下月总天数
        calendarSwiperArray: calendarSwiperArray // 上、本、下月天数数组，用于 wxml swiper 展示
      }
    },
    /** 
     * 构造data数据方法：构造 日历月swiper数据
     * @param {Date} date
     * @returns {{
     *  beforeDays: array,
     *  days: array,
     *  afterDays: array
     * }} MonthData
     */
    constructMonthData(date) {
      var currentYear = date.getFullYear() // 年
      var currentMonth = date.getMonth() // 月
      // 月初星期几（0~6 星期日~星期六）
      var startDay = new Date(currentYear, currentMonth, 1).getDay()
      var beforeDays = new Array(startDay);
      for (var i = 0; i < startDay; i++) {
        beforeDays[i] = { id: `before${i}` };
      }
      // 月末星期几（0~6 星期日~星期六）
      var endDay = new Date(currentYear, currentMonth + 1, 0).getDay()
      var afterDays = new Array(6 - endDay);
      for (var i = 0; i < 6 - endDay; i++) {
        afterDays[i] = { id: `after${i}` };
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
      return {
        beforeDays, // 用于wxml中填补前置空格 arrayOf( { id: before0 } )
        afterDays, // 用于wxml中填补后续空格 arrayOf( { id: after0 } )
        days // 本月天数数组，用于 wxml 展示 arrayOf( { id: 1, record: object } )
      }
    },
    /** 
     * 组件方法：更新日历数据 刷新视图
     * @param {Object} calendarData
     */
    setCalendarData(calendarData) {
      this.setData({
        'date.datetime': calendarData.datetime,
        'date.currentYear': calendarData.currentYear,
        'date.currentMonth': calendarData.currentMonth,
        'date.currentDate': calendarData.currentDate,
        'date.calendarSwiperArray': calendarData.calendarSwiperArray,
        swiperIndex: 1
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
        currentYear--;
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
    handleChangeDate: function (evt) {
      // 若没点中 日期数据，则直接返回
      if (!evt.target.dataset.day) return;
      // 更新日历数据
      this.updateCalendar(new Date(this.data.date.currentYear, this.data.date.currentMonth, evt.target.dataset.day))
    },

    /* 组件事件：切换到今天 */
    changeToToday: function () {
      this.updateCalendar(new Date());
    },

    /* 日历组件事件：滑到上、下一月 */
    swiperCalendar(evt) {
      if (evt.detail.current === 2) {
        new Promise((resolve) => {
          setTimeout(() => {
            this.setData({ duration: 0 });
            this.handleToNextMonth();
            resolve();
          }, 200)
        })
          .then(
          () => { this.setData({ duration: 300 }); }
          )
      }
      else if (evt.detail.current === 0) {
        new Promise((resolve) => {
          setTimeout(() => {
            this.setData({ duration: 0 });
            this.handleToLastMonth();
            resolve();
          }, 200)
        })
          .then(
          () => { this.setData({ duration: 300 }); }
          )
      }
    }
  }
})