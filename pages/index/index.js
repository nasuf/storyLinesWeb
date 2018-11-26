//index.js
//获取应用实例
const app = getApp()
var sliderWidth = 96;
Page({
    data: {
        stories: [],
        pageNumber: 0,
        pageSize: 15,
        sort: {
            lastUpdatedDate: 'DESC'
        },
        tabs: ["最新", "推荐", "新故事线"],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        authorized: false,
        phase: {
            isPublic: true,
            needAuth: false,
            storyTitle: '',
            content: ''
        },
        showTopErrorTips: false,
        errorMsg: ""
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        this.setData({
            authorized: app.globalData.authorized
        })
        this.loadData();
        var _this = this;
        wx.getSystemInfo({
            success: function (res) {
                _this.setData({
                    sliderLeft: (res.windowWidth / _this.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / _this.data.tabs.length * _this.data.activeIndex
                });
            }
        });
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

    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id,
            authorized: app.globalData.authorized
        });
    },

    loadData: function() {
        wx.showLoading({
            title: '加载中...',
        })
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/story?pageNumber=' + this.data.pageNumber + '&pageSize=' + this.data.pageSize + '&sort=' + encodeURIComponent(JSON.stringify(this.data.sort)),
            success: function (res) {
                if (res.data.status == 'success') {
                    var storyList = res.data.data;
                    var storyArr = _this.data.stories;
                    for (var i in storyList) {
                        storyList[i].createdDate = app.formatDate(storyList[i].createdDate)
                        storyArr.push(storyList[i]);
                    }
                    _this.setData({
                        stories: storyArr,
                        pageNumber: _this.data.pageNumber + 1
                    })
                    wx.hideLoading();
                }
            }
        })
    },

    onCheckDetail: function(e) {
        var id = e.currentTarget.dataset.id;
        var title = e.currentTarget.dataset.title;
        wx.navigateTo({
            url: '../line/line?parentPhaseId=' + id + '&title=' + title
        })
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
        this.loadData();
    }
})
