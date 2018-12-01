// pages/newPhase/newPhase.js
const app = getApp()
const { $Message } = require('../../dist/base/index');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        parentPhase: {},
        newPhase: {},
        storyId: '',
        isNewStory: '',
        parentPhaseId: '',
        showTopErrorTips: false,
        errorMsg: '',
        loading: false
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

    post: function () {
        var _this = this;
        var validated = this.validate();
        if (!validated) {
            return;
        }
        wx.showLoading({
            title: '正在发布...',
            icon: 'loading',
        });
        this.setData({
            loading: true
        })
        wx.showNavigationBarLoading();
        wx.request({
            url: app.globalData.serverHost + '/story/story?openid=' + app.globalData.openid + '&isNewStory=false' + '&parentPhaseId=' + this.data.parentPhaseId + '&storyId=' + this.data.storyId,
            data: _this.data.newPhase,
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
                                wx.navigateBack({
                                    
                                })
                                _this.setData({
                                    loading: false
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

    validate: function () {
        if (!this.data.newPhase.content || !this.data.newPhase.content.trim()) {
            // this.showTopErrorTips('请输入内容')
            $Message({
                content: '内容不能为空',
                type: 'warning'
            });
            return false;
        }
        return true;
    },

    showTopErrorTips: function (errorMsg) {
        var _this = this;
        this.setData({
            showTopErrorTips: true,
            errorMsg: errorMsg
        });
        setTimeout(function () {
            _this.setData({
                showTopErrorTips: false
            });
        }, 1500);
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