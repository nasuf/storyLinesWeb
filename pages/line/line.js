// pages/line.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        parentPhaseId: '',
        pageNumber: 0,
        pageSize: 15,
        childPhasesPageSize: 15,
        sort: {
            like: 'DESC'
        },
        phases: [],
        init: true,
        blurStyle: '',
        currentIndex: 'initial',

        branchPageNumber: 0,
        branchPageSize: 15,

        branchPhases: [],
        prevParentPhaseId: '',

        swiperDisplay: false,
        createBranchBtnDisplay: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        debugger;
        var parentPhaseId = options.parentPhaseId;
        var title = options.title;
        wx.setNavigationBarTitle({
            title: title.length > 10 ? title.substr(0, 10) + '...' : title,
        })
        this.setData({
            parentPhaseId: parentPhaseId,
            title: title
        })
        this.loadLine(parentPhaseId);
    },

    loadLine: function (parentPhaseId) {
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/story/phases/' + parentPhaseId + '?pageNumber=' + this.data.pageNumber + '&pageSize=' + this.data.pageSize + '&childPhasesPageSize=' + this.data.childPhasesPageSize + '&sort=' + encodeURIComponent(JSON.stringify(this.data.sort)) + '&init=' + this.data.init,
            success: function(res) {
                if (res.data.status == 'success') {
                    var phases = res.data.data;
                    var phasesArr = _this.data.phases;
                    for (var i in phases) {
                        phases[i].createdDate = app.formatDate(phases[i].createdDate);
                        phasesArr.push(phases[i]);
                    }
                    _this.setData({
                        phases: phasesArr,
                        init: false,
                        // swiperDisplay: _this.data.swiperDisplay ? false : false,
                        blurStyle: '',
                        storyTitle: phasesArr[0].storyTitle
                    })
                }
            }
        })
    },

    onTap: function(e) {
        var branchphases = e.currentTarget.dataset.branchphases;
        var currentIndex = e.currentTarget.dataset.index;
        var parentPhaseId = e.currentTarget.dataset.id;
        var _this = this;
        this.setData({
            currentIndex: currentIndex,
            createBranchBtnDisplay: !this.data.createBranchBtnDisplay
        })
        if (this.data.branchPhases.length > 0) {
            this.setData({
                parentPhaseId: parentPhaseId,
                branchPhases: [],
                blurStyle: '',
                swiperDisplay: !this.data.swiperDisplay
            })
            return;
        }
        if (branchphases && branchphases.length > 1) {
            this.setData({
                
                swiperDisplay: true
            })
            this.loadBranches(parentPhaseId);
        }
    },

    onBranchTap: function(e) {
        var parentPhaseId = e.currentTarget.dataset.id;
        var index = e.currentTarget.dataset.index;
        var branchindex = e.currentTarget.dataset.branchindex;
        var phases = this.data.phases.slice(0, index + 1);
        phases.push(this.data.branchPhases[branchindex])
        this.setData({
            phases: phases,
            branchPhases: [],
            createBranchBtnDisplay: !this.data.createBranchBtnDisplay,
            swiperDisplay: !this.data.swiperDisplay
        })
        this.loadLine(parentPhaseId);
    },

    loadBranches: function(parentPhaseId) {
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/branchPhases?parentPhaseId=' + parentPhaseId + '&pageNumber=' + this.data.branchPageNumber + '&pageSize=' + this.data.branchPageSize + '&sort=' + encodeURIComponent(JSON.stringify(this.data.sort)),
            success: function (res) {
                if (res.data.status == 'success') {
                    var branchPhases = res.data.data;
                    var branchPhasesArr = _this.data.branchPhases;
                    for (var i in branchPhases) {
                        branchPhases[i].createdDate = app.formatDate(branchPhases[i].createdDate);
                        branchPhasesArr.push(branchPhases[i]);
                    }
                    _this.setData({
                        branchPhases: branchPhasesArr
                    })
                }
            }
        })
    },

    onCreateBtnTap: function(e) {
        var id = e.currentTarget.dataset.id;
        var title = e.currentTarget.dataset.title;
        var storyId = this.data.phases[this.data.phases.length-1].storyId;
        wx.navigateTo({
            url: '../newPhase/newPhase?parentPhaseId=' + id + '&title=' + title + '&isNewStory=false&storyId=' + storyId
        })
    },

    publishTap: function() {
        var lastPhaseId = this.data.phases[this.data.phases.length-1].id;
        var storyId = this.data.phases[this.data.phases.length - 1].storyId;
        var title = this.data.title;
        wx.navigateTo({
            url: '../newPhase/newPhase?parentPhaseId=' + lastPhaseId + '&title=' + title + '&isNewStory=false&storyId=' + storyId
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var currentParentPhaseId = this.data.phases[this.data.phases.length-1].id;
        // this.setData({
        //     branchPhases: [],
        //     swiperDisplay: false,
        //     createBranchBtnDisplay: false
        // })
        this.loadLine(currentParentPhaseId);
    },

    onShow: function() {
        debugger;
        if (this.data.phases.length > 0) {
            var currentParentPhaseId = this.data.phases[this.data.phases.length - 1].id;
            this.setData({
                branchPhases: [],
                swiperDisplay: false,
                createBranchBtnDisplay: false
            })
            this.loadLine(currentParentPhaseId);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})