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
        }
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onLoad: function () {
        this.loadData();
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

    onReachBottom: function() {
        this.loadData();
    }
})
