//index.js
//获取应用实例
const app = getApp()
const { $Message } = require('../../dist/base/index');

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
            needApproval: false,
            storyTitle: '',
            content: ''
        },
        showTopErrorTips: false,
        errorMsg: "",
        tab_top_current: 'tab1',
        tab_bottom_current: 'homepage',
        needLoadMoreStories: false,
        tab_top_dot: false,
        tab_bottom_dot: false,
        nfcStack: [],
        nfcStackTop: 0
    },

    handleTabTopChange({
        detail
    }) {
        this.setData({
            tab_top_current: detail.key
        });
        if (detail.key == 'tab1') {
            var selectedTags = this.selectComponent("#storylist").data.selectedTags;
            this.selectComponent("#storylist").loadStories(selectedTags, true);
            this.setData({
                tab_top_dot: false
            })
        }
    },
    handleTabBottomChange({
        detail
    }) {
        var _this = this;
        this.setData({
            tab_bottom_current: detail.key
        });
        if (detail.key == 'mine' && _this.data.tab_bottom_dot == true) {
            this.setData({
                tab_bottom_dot: false
            })
        }
    },
    //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function(options) {
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
        this.subscribeWebSocketConnection()
        // app.refreshUserInfo();
    },

    userInfoHandler: function(e) {
        var userInfo = e.detail.userInfo;
        if (userInfo != undefined) {
            app.globalData.userInfo = userInfo
            app.globalData.authorized = true;
            app.auth();
            this.setData({
                authorized: true
            })
        }
    },

    inputChange: function(e) {
        var key = 'phase.' + e.currentTarget.dataset.key;
        this.setData({
            [key]: e.detail.value
        })
    },

    switchChange: function(e) {
        var key = 'phase.' + e.currentTarget.dataset.key;
        this.setData({
            [key]: e.detail.value == true ? true : false
        })
    },

    onNewTabTopClicked: function(e) {
        var selectedTags = this.selectComponent("#storylist").data.selectedTags;
        this.selectComponent("#storylist").loadStories(selectedTags, true)
    },

    post: function() {
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
            url: app.globalData.serverHost + '/story/story?openid=' + app.globalData.openid + '&needApproval=' + _this.data.phase.needApproval + '&isNewStory=true&isPublic=' + _this.data.phase.isPublic,
            data: _this.data.phase,
            method: 'POST',
            success: function(res) {
                wx.hideLoading();
                if (res.data.status == 'success') {

                    wx.hideNavigationBarLoading()
                    wx.showToast({
                        title: '发布成功',
                        icon: 'success',
                        success: function() {
                            setTimeout(function() {
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

    showTopErrorTips: function(errorMsg) {
        var _this = this;
        this.setData({
            showTopErrorTips: true,
            errorMsg: errorMsg
        });
        setTimeout(function() {
            _this.setData({
                showTopErrorTips: false
            });
        }, 1500);
    },

    onScrollReachBottomOfStoryList: function() {
        this.selectComponent('#storylist').loadStories();
    },

    onScrollReachBottomOfUserList: function() {
        var component = this.selectComponent('#userList');
        component.loadUserPosts(component.data.storyLineBtnClicked);
    },

    onPullDownRefresh: function() {
        this.selectComponent('#storylist').loadStories([], true);
    },

    subscribeWebSocketConnection: function() {
        var _this = this;
        wx.onSocketOpen(function() {
            console.log('WebSocket Connected!');
            app.globalData.socketConnected = true;
            // $Message({
            //     content: 'Socket Connected!',
            //     type: 'success',
            //     duration: 2
            // });
        })

        wx.onSocketClose(function() {
            app.globalData.socketConnected= false;
            // $Message({
            //     content: 'Socket Closed!',
            //     type: 'warning',
            //     duration: 2
            // });
            if (app.globalData.openid && !app.globalData.onHideTriggered) {
                wx.connectSocket({
                    url: app.globalData.serverWsHost + '/' + app.globalData.openid
                })
            }
        })

        wx.onSocketMessage(function(res) {
            console.log(JSON.parse(res.data))
            var notification = JSON.parse(res.data);
            if (notification.type == 'MULTIPLE') {
                _this.setData({
                    tab_top_dot: true
                })
            } else {
                var nfc = _this.assumbleNotification(notification);
                
                    $Message({
                        content: nfc,
                        type: 'success',
                        duration: 3
                    });
                
                wx.request({
                    url: app.globalData.serverHost + '/story/consumeNotification',
                    method: 'POST',
                    data: notification,
                    success: function (res) {

                    }
                })
            }
        })
    },

    assumbleNotification: function(notification) {
        this.setData({
            tab_bottom_dot: true
        })
        var content = '';
        var titles = notification.storyTitleList;
        for (let i in titles) {
            content = content + '《' + titles[i] + '》';
            if (i != titles.length - 1) {
                content = content + ', '
            }
        }
        if (notification.isStoryUpdateNotification) {
            content = '您的故事线：' + content + ' 有更新！';
        } else {
            content = '您续写的故事线：' + content + ' 有更新！';
        }
        return content;
    }
})