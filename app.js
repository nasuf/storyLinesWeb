//app.js
App({
    onLaunch: function () {
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
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
        //serverHost: "http://localhost:19095"
        serverHost: "https://story.nasuf.cn"
    }
})