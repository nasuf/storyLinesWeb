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
        loading: false,
        authorized: false,
        authModalVisable: false,
        isStoryNeedApproval: false,
        authActions: [
            {
                name: '授权',
                color: '#19be6b',
                type: 'auth',
                pathKey: 'tab_top_current',
                pathValue: 'tab1'
            },
            {
                name: '取消'
            }
        ],
        publishing: false,
        contentLengthMax: null,
        contentLengthMin: null,
        contentLength: null,
        storyAuthorOpenid: '',

        screenHeight: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // update userInfo to db
        app.refreshUserInfo();
        var sysInfo = wx.getSystemInfoSync();
        var parentPhaseId = options.parentPhaseId;
        var rootPhaseId = options.rootPhaseId;
        var isNewStory = options.isNewStory;
        var title = options.title;
        var storyId = options.storyId;
        var isStoryNeedApproval = options.isStoryNeedApproval;
        var newPhase_isNewStory = '';
        var contentLengthMax = options.contentLengthMax;
        var contentLengthMin = options.contentLengthMin;
        var storyAuthorOpenid = options.storyAuthorOpenid;
        var contentLengthLimitExpr = '';
        if (contentLengthMax != 'null') {
            contentLengthLimitExpr = '字数上限：' + contentLengthMax
        }
        if (contentLengthMin != 'null') {
            contentLengthLimitExpr = contentLengthLimitExpr == '' ? ('字数下限：' + contentLengthMin) : (contentLengthLimitExpr + '，字数下限：' + contentLengthMin);
        }
        if (contentLengthLimitExpr != '') {
            contentLengthLimitExpr = '(' + contentLengthLimitExpr;
        }
        this.setData({
            isNewStory: isNewStory,
            storyId: storyId,
            parentPhaseId: parentPhaseId,
            rootPhaseId: rootPhaseId,
            authorized: app.globalData.authorized,
            isStoryNeedApproval: isStoryNeedApproval,
            contentLengthLimitExpr: contentLengthLimitExpr,
            contentLengthMax: contentLengthMax,
            contentLengthMin: contentLengthMin,
            screenHeight: sysInfo.screenHeight
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
                    var parentPhase = res.data.data;
                    parentPhase.content = parentPhase.content.replace(/[\n]+/g, '\n\n')
                    _this.setData({
                        parentPhase: parentPhase
                    })
                }
            }
        })
    },

    inputChange: function(e) {
        var newPhase_content = 'newPhase.content'
        this.setData({
            [newPhase_content]: e.detail.value,
            contentLength: e.detail.value.length
        })
    },

    post: function () {
        var _this = this;
        var validated = this.validate();
        if (!validated || this.data.publishing == true) {
            return;
        }
        wx.showLoading({
            title: '正在发布...',
            icon: 'loading',
        });
        this.setData({
            loading: true,
            publishing: true
        })
        wx.showNavigationBarLoading();
        wx.request({
            url: app.globalData.serverHost + '/story/story?openid=' + app.globalData.openid + '&isNewStory=false' + '&parentPhaseId=' + this.data.parentPhaseId + '&storyId=' + this.data.storyId + '&rootPhaseId=' + this.data.rootPhaseId + '&needApproval=' + this.data.isStoryNeedApproval,
            data: _this.data.newPhase,
            method: 'POST',
            success: function (res) {
                wx.hideLoading();
                if (res.data.status == 'success') {

                    wx.hideNavigationBarLoading()
                    wx.showToast({
                        title: (_this.data.isStoryNeedApproval == 'true' && _this.data.storyAuthorOpenid != app.globalData.openid) ? '等待审核' : '发布成功',
                        icon: 'success',
                        success: function () {
                            setTimeout(function () {
                                wx.navigateBack({})
                                _this.setData({
                                    loading: false,
                                    publishing: false
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
        if (this.data.contentLengthMax != null && this.data.contentLength > parseInt(this.data.contentLengthMax)) {
            $Message({
                content: '内容长度不能超过字数上限' + this.data.contentLengthMax,
                type: 'warning'
            });
            return false;
        }
        if (this.data.contentLengthMin != null && this.data.contentLength < parseInt(this.data.contentLengthMin)) {
            $Message({
                content: '内容长度不能低于字数下限' + this.data.contentLengthMin,
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

    authorize: function (e) {
        this.setData({
            authModalVisable: !this.data.authModalVisable
        })
    },

    handleAuth: function ({ detail }) {
        this.setData({
            authModalVisable: false
        });
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