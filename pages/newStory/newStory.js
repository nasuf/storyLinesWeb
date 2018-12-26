const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phase: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  inputChange: function(e) {
      var key = 'phase.' + e.currentTarget.dataset.key;
      this.setData({
          [key]: e.detail.value
      })
  },

  switchChange: function (e) {
      var key = 'phase.' + e.currentTarget.dataset.key;
      this.setData({
          [key]: e.detail.value == true ? true : false
      })
  },

  post: function() {
      var _this = this;
      wx.showLoading({
          title: '正在发布...',
          icon: 'loading',
      });
      wx.showNavigationBarLoading();
      wx.request({
          url: app.globalData.serverHost + '/story/story?openid=' + app.globalData.openid + '&needApproval=' + _this.data.phase.needApproval + '&isNewStory=true',
          data: _this.data.phase,
          method: 'POST',
          success: function (res) {
              wx.hideLoading();
              if (res.data.status == 'success') {

                  wx.hideNavigationBarLoading()
                  wx.showToast({
                      title: '发布成功',
                      icon: 'success',
                      success: function () {
                          setTimeout(function () {
                              wx.redirectTo({
                                  url: '../ticket/ticket',
                              })
                          }, 1500);
                      }
                  });

              } else {
                  _this.showTopErrorTips('发布失败，请重试');
              }
          }
      })
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