const _ = require('../../utils/util.js')

/** 
 * <calendar bind:getDate = 'getDate' calendar-records='{{calendarRecords}}' />
 * 可绑回调事件 getDate, 选中日期，用于下方显示 当日内容
 * 可传入记事对象 calendarRecords，包含月记录内容（3个月），用于渲染 wxml
 */

/*日历组件*/
Component({
  // 1. 传入属性
  properties: {
    // 各日记录，用于显示组件上内容(左下角：事项类型；右下角：颜色)
    calendarRecords: {
      type: Object, // {年-月:{日:事件对象}
      value: {
        '2018-00': {
          // 1: {text: '...', color:'#6ad4fe'},
          // 15: { text: '...', color: '#b7b8f0'}
        }
      } 
    }
  },
  // 2. 组件内数据
  data: {
    // 抽象成组件后，可以考虑把date去掉，直接在data上 布置变量
    date: {
      // datetime: new Date(),
    }, // 日历组件：日期数据
    swiperIndex: 1, // 3页日历 轮播，默认中间页（0、1、2）
    duration: 300,  // 轮播缓动时间
  },
  // 3. 组件生命周期
  attached(){
    // 获取当前选中日期
    var date = this.data.date.datetime || new Date()
    // 初始化日历组件
    this.updateCalendar(date)
  },
  // 4. 组件方法
  methods: {
    /** 
     * 4.1 组件方法：初始化/更新 日历组件
     * @param {Date} date
     */
    updateCalendar(date) {
      // 构造日历数据
      var dateData = this.constructCalendarData(date)
      // 更新日历数据
      this.setCalendarData(dateData)
    },
    /** 
     * 4.1.1 构造data数据方法：构造 日历完整数据
     * @param {Date} date
     * @returns {Object} calendarData
     */
    constructCalendarData(date) {
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
     * 4.1.2 构造data数据方法：构造 日历月swiper数据
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
      // 记录对象 (当前月key) 配合 days内的id，可以定位到properties calendarRecords中的各日record
      var month_record_key = `${currentYear}-${_.formatNumber(currentMonth)}`;
      // 本月天数
      var numOfDay = new Date(currentYear, currentMonth + 1, 0).getDate()
      // 本月天数组
      var days = new Array(numOfDay)
      for (var i = 0; i < numOfDay; i++) {
        days[i] = { id: i + 1 };
      }
      return {
        month_record_key,
        beforeDays, // 用于wxml中填补前置空格 arrayOf( { id: before0 } )
        days, // 本月天数数组，用于 wxml 展示 arrayOf( { id: 1, record: object } )
        afterDays // 用于wxml中填补后续空格 arrayOf( { id: after0 } )
      }
    },
    /** 
     * 4.1.3 组件方法：更新日历数据 刷新视图
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
      // 更新数据时，可以把某些结果，通过 triggerEvent回调 回传
      this.triggerEvent('getDate', { datetime: calendarData.datetime });
    },

    /* 4.2.1 日历组件交互事件：去上一月 */
    handleToLastMonth() {
      // 取上月最后1天，防止 日超出当月最大天数、跨月
      let new_date = new Date(this.data.date.currentYear, this.data.date.currentMonth, 0);
      let currentMonth = new_date.getMonth();
      let currentYear = new_date.getFullYear();
      // (若超出上月天数，则取上月最大值)
      let currentDate = Math.min(new_date.getDate(), this.data.date.currentDate);

      // 构造日期数据
      var dateData = this.constructCalendarData(new Date(currentYear, currentMonth, currentDate));
      // 更新日历数据
      this.setCalendarData(dateData);
    },

    /* 4.2.2 日历组件交互事件：去下一月 */
    handleToNextMonth() {
      // 取下月最后1天，防止 日超出当月最大天数、跨月
      let new_date = new Date(this.data.date.currentYear, this.data.date.currentMonth + 2, 0);
      let currentMonth = new_date.getMonth();
      let currentYear = new_date.getFullYear();
      // (若超出上月天数，则取上月最大值)
      let currentDate = Math.min(new_date.getDate(), this.data.date.currentDate);

      // 构造日期数据
      var dateData = this.constructCalendarData(new Date(currentYear, currentMonth, currentDate));
      // 更新日历数据
      this.setCalendarData(dateData);
    },

    /* 4.2.3 日历组件交互事件：滑到上、下一月 */
    swiperCalendar(evt) {
      if (evt.detail.current === 2) {
        new Promise((resolve) => {
          setTimeout(() => {
            this.setData({ duration: 0 });
            this.handleToNextMonth();
            resolve();
          }, 300)
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
          }, 250)
        })
          .then(
          () => { this.setData({ duration: 300 }); }
          )
      }
    },

    /* 4.3 日历组件交互事件：切换日期 */
    handleChangeDate(evt) {
      // 若没点中 日期数据，则直接返回
      if (!evt.target.dataset.day) return;
      // 更新日历数据
      this.updateCalendar(new Date(this.data.date.currentYear, this.data.date.currentMonth, evt.target.dataset.day))
    },

    /* 4.3.1 日历组件交互事件：切换到今天 */
    changeToToday() {
      this.updateCalendar(new Date());
    },

    /* 4.4 添加当日事件 */ 
    addActivity(){
      this.triggerEvent('addActivity');
    }
  }
})