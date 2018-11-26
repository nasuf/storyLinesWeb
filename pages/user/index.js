const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
      authorized: false,
  },

  userInfoHandler: function (e) {
      var userInfo = e.detail.userInfo;
      if (userInfo != undefined) {
          app.globalData.userInfo = userInfo
          app.globalData.authorized = true;
          wx.reLaunch({
              url: '../index/index',
          })
      }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          authorized: app.globalData.authorized
      })

      if (!this.data.authorized) {
          app.auth('/pages/user/index');
      }

      if (app.globalData.userInfo) {
          this.setData({
              userInfo: app.globalData.userInfo,
              hasUserInfo: true,
              role: app.globalData.role,
              adminLoginStatus: app.globalData.role == "ADMIN"
                  && app.globalData.adminLoginStatus == true ? true : false
          })
          if (app.globalData.openid) {
              wx.request({
                  url: app.globalData.serverHost + '/auth/info?openid=' + app.globalData.openid,
                  data: app.globalData.userInfo,
                  method: 'POST',
                  success: function (res) {
                      console.log("res:" + res)
                  }
              })
          }
      } 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})