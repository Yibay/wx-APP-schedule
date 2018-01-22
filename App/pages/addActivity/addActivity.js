// 新建行程

const app = getApp();

Page({
  data: {
    activityStartTime: '00:00',
    activityEndTime: '00:00'
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

  // 活动起始时间变更
  startTimeChange(e){
    this.setData({ activityStartTime: e.detail.value });
  },

  // 活动结束时间变更
  endTimeChange(e){
    this.setData({ activityEndTime: e.detail.value });
  }
})