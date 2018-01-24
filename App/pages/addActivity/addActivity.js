// 新建行程
import _ from '../../utils/util.js';

const app = getApp();

Page({
  data: {
    activityTypeIndex: 0,
    activityType: app.globalData.eventType,
    autoHeight: true
  },
  // 生命周期：页面加载
  onLoad(){
    console.log(app.globalData.current);
  },

  // 取消活动
  cancel(){
    wx.navigateBack({
      delta: 1, // 返回上一页
    })
  },

  // 完成 新建活动
  submit(){
    // 本地存储 活动
    this.setRecord(_.omit(this.data, ['activityType']));
    // 返回上一页
    this.cancel();
  },

  // 切换类别
  typeChange(e){
    var that = this;
    var itemList = app.globalData.eventType.map(item => item.text)
    // 显示操作菜单
    wx.showActionSheet({
      itemList: itemList,
      success: function (res) {
        // 选中事件类型
        that.setData({ activityTypeIndex: res.tapIndex});
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
  setRecord: function (recordData) {
    if (!recordData) return
    var currentYear = app.globalData.current.currentYear // 年
    var currentMonth = app.globalData.current.currentMonth // 月
    var currentDate = app.globalData.current.currentDate // 日
    // 获取记录对象
    var record_key = `${currentYear}-${_.formatNumber(currentMonth)}`
    var record = wx.getStorageSync(record_key) || {}
    currentDate = _.formatNumber(currentDate)
    // 若当日无记录, 则新建
    record[currentDate] || (record[currentDate] = {})
    // 复制 行程记录
    _.assign(record[currentDate], recordData)
    _.assign(record[currentDate], app.globalData.eventType[this.data.activityTypeIndex]);
    console.log(_.omit(record[currentDate], ['activityTypeIndex']));
    // 本地储存记录
    wx.setStorageSync(record_key, record)
  }
})