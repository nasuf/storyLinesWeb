//index.js
//获取应用实例
const app = getApp()
Page({
    data: {
        stories: [],
        pageNumber: 0,
        pageSize: 15,
        sort: {
            lastUpdatedDate: 'DESC'
        },
        activeIndex: 0,
        authorized: false,
        phase: {
            isPublic: true,
            needAuth: false,
            storyTitle: '',
            content: ''
        },
        showTopErrorTips: false,
        errorMsg: "",
        tab_top_current: 'tab1',
        tab_bottom_current: 'homepage'
    },

    handleTabTopChange({ detail }) {
        this.setData({
            tab_top_current: detail.key
        });
    },
    handleTabBottomChange({ detail }) {
        this.setData({
            tab_bottom_current: detail.key
        });
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function (options) {
        this.setData({
            authorized: app.globalData.authorized
        })
        if (options && options.pathKey && options.pathValue) {
            this.setData({
                [options.pathKey]: options.pathValue
            })
        }
        // this.loadData();
        this.storyList = this.selectComponent('#storyList');
    },

    userInfoHandler: function (e) {
        var userInfo = e.detail.userInfo;
        if (userInfo != undefined) {
            app.globalData.userInfo = userInfo
            app.globalData.authorized = true;
            app.auth();
            this.setData({
                authorized: true
            })
    
            // wx.reLaunch({
            //     url: '../index/index',
            // })
        }
    },


    

    inputChange: function (e) {
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
        wx.showNavigationBarLoading();
        wx.request({
            url: app.globalData.serverHost + '/story/story?openid=' + app.globalData.openid + '&needAuth=' + _this.data.phase.needAuth + '&isNewStory=true&isPublic=' + _this.data.phase.isPublic,
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
                                wx.reLaunch({
                                    url: '../index/index',
                                })
                                // wx.redirectTo({
                                //     url: '../index/index',
                                // })
                            }, 1500);
                        }
                    });

                } else {
                    _this.showTopErrorTips('发布失败，请重试');
                }
            }
        })
    },

    validate: function() {
        if (!this.data.phase.storyTitle) {
            this.showTopErrorTips('请输入标题')
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

    onReachBottom: function() {
        // this.loadData();
    }
})
