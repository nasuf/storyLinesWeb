const app = getApp()

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
        storyLineBtnClicked: true,
        continuesBtnClicked: false,
        stories: [],
        phases: [],
        storyLinesPageNumber: 0,
        continuesPageNumber: 0,
        pageSize: 15,
        sort: {
            createdDate: 'DESC'
        },
        storyLinesBtnTriggered: true,
        continuesBtnTriggered: false,
        loading: false
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
                    authorized: true
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
                    storyLineBtnClicked: true,
                    continuesBtnClicked: false
                })
                // this.loadUserPhases(true);
            } else if (type == 'myContinues') {
                this.setData({
                    storyLineBtnStyle: 'background-color: #f5f5f5 !important',
                    continuesBtnStyle: 'background-color: white !important',
                    storyLineBtnClicked: false,
                    continuesBtnClicked: true
                })
                if (this.data.continuesBtnTriggered == false) {
                    this.loadUserPosts(false);
                }
                this.setData({
                    // storyLinesBtnTriggered: true,
                    continuesBtnTriggered: true
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

        onCheckDetail: function (e) {
            var id = e.currentTarget.dataset.id;
            var title = e.currentTarget.dataset.title;
            wx.navigateTo({
                url: '/pages/line/line?parentPhaseId=' + id + '&title=' + title
            })
        },
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
