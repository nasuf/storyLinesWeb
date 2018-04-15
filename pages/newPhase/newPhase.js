// pages/newPhase/newPhase.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        parentPhase: {},
        newPhase: {},
        storyId: '',
        isNewStory: '',
        parentPhaseId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var parentPhaseId = options.parentPhaseId;
        var isNewStory = options.isNewStory;
        var title = options.title;
        var storyId = options.storyId;
        var newPhase_isNewStory = ''
        this.setData({
            isNewStory: isNewStory,
            storyId: storyId,
            parentPhaseId: parentPhaseId
        })
        this.loadPhase(parentPhaseId);
        wx.setNavigationBarTitle({
            title: title.length > 10 ? title.substr(0, 10) + '...' : title
        })
    },

    loadPhase: function (parentPhaseId) {
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/phase/' + parentPhaseId,
            success: function(res) {
                if (res.data.status == 'success') {
                    _this.setData({
                        parentPhase: res.data.data
                    })
                }
            }
        })
    },

    inputChange: function(e) {
        var newPhase_content = 'newPhase.content'
        this.setData({
            [newPhase_content]: e.detail.value
        })
    },

    post: function (e) {

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