//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    // console.log(logs);

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    current: {},
    eventType: [ // 当日事件类型
      { type: 0, text: '通告', bgcolor: '#ff619b', color: '#fff' },
      { type: 1, text: '彩排', bgcolor: '#b7b8f0', color: '#fff' },
      { type: 2, text: '会议', bgcolor: '#e06555', color: '#fff' },
      { type: 3, text: '筹备', bgcolor: '#6ad4fe', color: '#fff' },
      { type: 4, text: '其他', bgcolor: '#efefef', color: '#000' },
    ]
  }
})