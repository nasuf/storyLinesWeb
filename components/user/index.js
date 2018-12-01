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
                }
            } 
        }
    }
})
