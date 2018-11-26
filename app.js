//app.js
App({
    onLaunch: function () {
        this.login();
        
    },

    auth: function (url) {
        var _this = this;
        wx.getSetting({
            success: function (res) {
                // not authorized
                if (!res.authSetting['scope.userInfo']) {
                    wx.showModal({
                        title: '用户未授权',
                        content: '如需正常使用该小程序的全部功能，请允许我们获取您的已公开的微信用户信息（如微信昵称，头像等）。请点击授权按钮完成授权。谢谢配合。',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                                wx.redirectTo({
                                    url: url
                                })
                            }
                        }
                    })
                } else {
                    // authorized
                    wx.getUserInfo({
                        success: res => {
                            console.log(res);
                            _this.globalData.userInfo = res.userInfo;
                            _this.globalData.authorized = true;
                            _this.login();
                        },
                    })
                }
            }
        })
    },

    refreshUserInfo: function () {
        var _this = this;
        wx.getSetting({
            success: function (res) {
                // authorized
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: function (res) {
                            console.log(res);
                            _this.globalData.userInfo = res.userInfo;
                            _this.globalData.authorized = true;
                            // refresh userinfo 
                            wx.request({
                                url: _this.globalData.serverHost + '/auth/info?openid=' + _this.globalData.openid,
                                data: _this.globalData.userInfo,
                                method: 'POST',
                                success: function (res) {
                                    console.log("refresh latest userInfo: " + res)
                                }
                            })
                        }
                    });
                }
            }
        })

    },

    login: function () {
        // 登录
        wx.login({
            success: res => {
                var _this = this;
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                console.log("entered login ")
                wx.showLoading({
                    title: '正在加载',
                    icon: 'loading'
                });
                wx.request({
                    url: _this.globalData.serverHost + '/auth/openid?code=' + res.code,
                    data: {},
                    method: 'POST',
                    success: function (res) {
                        console.log("res:" + res)
                        wx.hideLoading();
                        _this.globalData.openid = res.data.data.openid;
                        _this.globalData.role = res.data.data.role;
                        _this.refreshUserInfo();
                        // 查看管理员登录状态
                        if (_this.globalData.role == "ADMIN") {
                            wx.getStorage({
                                key: 'adminLoginKey',
                                success: function (res) {
                                    console.log("adminLoginKey: " + res.data);
                                    var adminLoginKey = res.data;
                                    wx.request({
                                        url: _this.globalData.serverHost + '/auth/validate/adminOnlineStatus?openid=' + _this.globalData.openid + '&adminLoginKey=' + adminLoginKey,
                                        method: 'GET',
                                        success: function (res) {
                                            console.log("adminLoginStatus:" + res.data.data.adminLoginStatus);
                                            var adminLoginStatus = res.data.data.adminLoginStatus;
                                            if (adminLoginStatus == true) {
                                                // 设置管理员登录状态为true
                                                _this.globalData.adminLoginStatus = true;
                                            }
                                        }
                                    })
                                }
                            })
                        }

                    }
                })
            },
            fail: res => {
                debugger;
                console.log(res);
            }
        })

    },

    formatDate: function (milliseconds) {
        var date = new Date(milliseconds);

        var year = date.getYear() + 1900;
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        hours = hours < 10 ? '0' + hours : hours;
        var minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var seconds = date.getSeconds();
        seconds = seconds < 10 ? '0' + seconds : seconds;

        if (year == (new Date().getYear() + 1900)) {
            if (month == (new Date().getMonth() + 1)) {
                if (day == (new Date().getDate())) {
                    return hours + ":" + minutes;
                } else if (day == (new Date().getDate()) - 1) {
                    return '昨天 ' + hours + ":" + minutes;
                } else if (day == (new Date().getDate()) - 2) {
                    return '前天 ' + hours + ":" + minutes;
                }
            }
            return (month < 10 ? '0' + month : month) + "-" + (day < 10 ? '0' + day : day) + " " + hours + ":" + minutes;
        } else {
            return year + "-" + (month < 10 ? '0' + month : month) + "-" + (day < 10 ? '0' + day : day) + " " + hours + ":" + minutes;
        }
    },
    globalData: {
        userInfo: null,
        openid: '',
        serverHost: "http://localhost:19095",
        // serverHost: "https://story.nasuf.cn",
        authorized: false
    }
})