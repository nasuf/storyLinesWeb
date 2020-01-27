const app = getApp()
const { $Message } = require('../../dist/base/index');

Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        authorized: false,
        userInfo: null,
        openid: null,
        authModalVisable: false,
        authActions: [
            {
                name: '授权',
                color: '#19be6b',
                type: 'auth',
                pathKey: 'tab_bottom_current',
                pathValue: 'mine'
            },
            {
                name: '取消'
            }
        ],
        storyLineBtnStyle: 'background-color: white !important',
        continuesBtnStyle: '',
        pendingApprovalsBtnStyle: '',
        storyLineBtnClicked: true,
        continuesBtnClicked: false,
        pendingApprovalsBtnClicked: false,
        stories: [],
        phases: [],
        pendingApprovals: [],
        storyLinesPageNumber: 0,
        continuesPageNumber: 0,
        pendingApprovalsPageNumber: 0,
        pageSize: 20,
        sort: {
            createdDate: 'DESC'
        },
        storyLinesBtnTriggered: true,
        continuesBtnTriggered: false,
        pendingApprovalsBtnTriggered: false,
        loading: false,

        actionSheetVisible: false,
        actions:[
            {
                name: '意见或建议',
                icon: 'brush_fill'
            }
        ],

        feedBackVisiable: false,
        feedBackActions: [
            {
                name: '取消'
            },
            {
                name: '发送',
                color: '#19be6b',
                loading: false
            }
        ],
        feedback: {
            content: ''
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        userInfoHandler: function (e) {
            var userInfo = e.detail.userInfo;
            if (userInfo != undefined) {
                app.globalData.userInfo = userInfo
                app.globalData.authorized = true;
                this.setData({
                    userInfo: userInfo,
                    authorized: true,
                    openid: app.globalData.openid
                })
            }
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

        onModuleTap: function(e) {
            var type = e.currentTarget.dataset.type;
            if (type == 'myStoryLines') {
                this.setData({
                    storyLineBtnStyle: 'background-color: white !important',
                    continuesBtnStyle: 'background-color: #f5f5f5 !important',
                    pendingApprovalsBtnStyle: 'background-color: #f5f5f5 !important',
                    storyLineBtnClicked: true,
                    continuesBtnClicked: false,
                    pendingApprovalsBtnClicked: false,
                    stories: [],
                    storyLinesPageNumber: 0
                })
                this.loadUserPosts(true);
            } else if (type == 'myContinues') {
                this.setData({
                    storyLineBtnStyle: 'background-color: #f5f5f5 !important',
                    continuesBtnStyle: 'background-color: white !important',
                    pendingApprovalsBtnStyle: 'background-color: #f5f5f5 !important',
                    storyLineBtnClicked: false,
                    continuesBtnClicked: true,
                    pendingApprovalsBtnClicked: false,
                    phases: [],
                    continuesPageNumber: 0
                })
                // if (this.data.continuesBtnTriggered == false) {
                    this.loadUserPosts(false);
                // }
                this.setData({
                    // storyLinesBtnTriggered: true,
                    continuesBtnTriggered: true
                })
            } else if (type == 'myPendingApprovals') {
                this.setData({
                    storyLineBtnStyle: 'background-color: #f5f5f5 !important',
                    continuesBtnStyle: 'background-color: #f5f5f5 !important',
                    pendingApprovalsBtnStyle: 'background-color: white !important',
                    storyLineBtnClicked: false,
                    continuesBtnClicked: false,
                    pendingApprovalsBtnClicked: true,
                    pendingApprovals: [],
                    pendingApprovalsPageNumber: 0
                })
                // if (this.data.pendingApprovalsBtnTriggered == false) {
                    this.loadPendingApprovals();
                // }
                this.setData({
                    pendingApprovalsBtnTriggered: true
                })
            }
        },
        
        loadUserPosts: function(isStoryList) {
            this.setData({
                loading: true
            })
            var _this = this;
            var url = '';
            if (isStoryList) {
                url = app.globalData.serverHost + '/story/story/withUser' + '?openid=' + app.globalData.openid + '&pageNumber=' + this.data.storyLinesPageNumber + '&pageSize=' + this.data.pageSize + '&sort=' + encodeURIComponent(JSON.stringify(this.data.sort))
            } else {
                url = app.globalData.serverHost + '/story/story/withUser/continues' + '?openid=' + app.globalData.openid + '&pageNumber=' + this.data.continuesPageNumber + '&pageSize=' + this.data.pageSize + '&sort=' + encodeURIComponent(JSON.stringify(this.data.sort))
            }
            wx.request({
                url: url,
                method: 'GET',
                success: function (res) {
                    if (res.data.status == 'success') {
                        var storyList = res.data.data;
                        var originArr = isStoryList ? _this.data.stories : _this.data.phases;
                        for (var i in storyList) {
                            storyList[i].createdDate = app.formatDate(storyList[i].createdDate)
                            if (storyList[i].content && storyList[i].content.length > 50) {
                                storyList[i].content = storyList[i].content.slice(0, 51) + '...'
                            }
                            originArr.push(storyList[i]);
                        }
                        var updateItem1 = isStoryList ? 'stories' : 'phases'
                        var updateItem2 = isStoryList ? 'storyLinesPageNumber' : 'continuesPageNumber';
                        _this.setData({
                            [updateItem1]: originArr,
                            [updateItem2]: isStoryList ? (_this.data.storyLinesPageNumber + 1) : (_this.data.continuesPageNumber + 1),
                            loading: false
                        })
                    }
                }
            })
        },

        loadPendingApprovals: function() {
            var _this = this;
            wx.request({
                url: app.globalData.serverHost + '/story/approvalList?storyAuthorOpenid=' + app.globalData.openid + '&isStoryNeedApproval=true&pageSize=' + this.data.pageSize + '&pageNumber=' + this.data.pendingApprovalsPageNumber,
                method: 'GET',
                success: function(res) {
                    var originArr = _this.data.pendingApprovals;
                    var phases = res.data.data;
                    for (var i in phases) {
                        if (phases[i].content && phases[i].content.length > 50) {
                            phases[i].content = phases[i].content.slice(0, 51) + '...'
                        }
                        originArr.push(res.data.data[i]);
                    }
                    _this.setData({
                        pendingApprovals: originArr,
                        pendingApprovalsPageNumber: _this.data.pendingApprovalsPageNumber + 1
                    })
                }
            })
        },

        onCheckDetail: function (e) {
            var id = e.currentTarget.dataset.id;
            var title = e.currentTarget.dataset.title;
            var isUserLine = e.currentTarget.dataset.isuserline;
            var isPendingApproval = e.currentTarget.dataset.ispendingapproval;
            var currentApprovalStatus = e.currentTarget.dataset.status;
            var hasBeenContinued = e.currentTarget.dataset.hasbeencontinued;
            var url = '/pages/line/line?parentPhaseId=' + id + '&title=' + title + '&isUserCenterTriggered=' + (isUserLine == 'true' ? 'false' : 'true') + '&isPendingApproval=' + isPendingApproval + '&pendingApprovalPhaseId=' + id + (undefined != currentApprovalStatus ? ('&currentApprovalStatus=' + currentApprovalStatus) : '') + '&hasBeenContinued=' + hasBeenContinued + '&needIncReviewCount=false';
            wx.navigateTo({
                url: url
            })
        },

        openActionSheet: function() {
            this.setData({
                actionSheetVisible: true
            })
        },

        handleActionSheetCancel: function() {
            this.setData({
                actionSheetVisible: false
            })
        },

        openFeedbackModal: function() {
            this.setData({
                feedBackVisiable: true,
                actionSheetVisible: false
            })
        },

        handleFeedbackClick({detail}) {
            var _this = this;
            if (detail.index === 0) {
                this.setData({
                    feedBackVisiable: false,
                    ['feedback.content']: ''
                });
            } else if (!this.data.feedback.content || !this.data.feedback.content.trim()) {
                $Message({
                    content: '内容不能为空',
                    type: 'warning'
                });
            } else {
                const actions = [...this.data.feedBackActions];
                if (!actions[1].loading) {
                    actions[1].loading = true;
                    this.setData({
                        feedBackActions: actions,
                        ['feedback.openid']: app.globalData.openid
                    })
                    wx.request({
                        url: app.globalData.serverHost + '/auth/feedback',
                        method: 'POST',
                        data: _this.data.feedback,
                        success: function (res) {
                            if (res.data.status == 'success') {
                                actions[1].loading = false;
                                _this.setData({
                                    feedBackActions: actions,
                                    feedBackVisiable: false,
                                    ['feedback.content']: ''
                                })
                                $Message({
                                    content: '发送成功',
                                    type: 'success'
                                });
                            }
                        }
                    })
                }
            }
        }, 

        feedbackInputChange: function(e) {
            var content = e.detail.detail.value;
            this.setData({
                ['feedback.content']: content
            })
        }
    },

    lifetimes: {
        attached: function() {
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
                    this.loadUserPosts(true)
                }
            } 
        }
    }
})
