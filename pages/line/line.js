// pages/line.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        parentPhaseId: '',
        rootPhaseId: '',
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

        createBranchBtnDisplay: false,
        loading: false,
        openid: '',

        isUserCenterTriggered: false,
        loading: false,

        isStoryNeedApproval: false,
        isPendingApproval: false,
        pendingApprovalPhaseId: '',
        
        approvalPublishing: false,
        currentApprovalStatus: '',
        hasBeenContinued: false,

        contentLengthMax: null,
        contentLengthMin: null,

        showBranch: false,

        storyTitle: '',
        lineIndex: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var parentPhaseId = options.parentPhaseId;
        var title = options.title;
        var isPendingApproval = options.isPendingApproval;
        var pendingApprovalPhaseId = options.pendingApprovalPhaseId;
        var currentApprovalStatus = options.currentApprovalStatus;
        var hasBeenContinued = options.hasBeenContinued;
        wx.setNavigationBarTitle({
            title: title.length > 10 ? title.substr(0, 10) + '...' : title,
        })
        this.setData({
            parentPhaseId: parentPhaseId,
            rootPhaseId: parentPhaseId,
            title: title,
            openid: app.globalData.openid,
            isUserCenterTriggered: options.isUserCenterTriggered
        })
        if (undefined != isPendingApproval) {
            this.setData({
                isPendingApproval: isPendingApproval
            })
        }
        if (undefined != pendingApprovalPhaseId) {
            this.setData({
                pendingApprovalPhaseId: pendingApprovalPhaseId
            })
        }
        if (undefined != currentApprovalStatus) {
            this.setData({
                currentApprovalStatus: currentApprovalStatus
            })
        }
        if (undefined != hasBeenContinued) {
            this.setData({
                hasBeenContinued: hasBeenContinued     
            })
        }
        this.loadLine(parentPhaseId, true);
    },

    loadLine: function (parentPhaseId, needIncReviewCount) {
        var _this = this;
        wx.showNavigationBarLoading();
        wx.request({
            url: app.globalData.serverHost + '/story/story/phases/' + parentPhaseId + '?pageNumber=' + this.data.pageNumber + '&pageSize=' + this.data.pageSize + '&childPhasesPageSize=' + this.data.childPhasesPageSize + '&sort=' + encodeURIComponent(JSON.stringify(this.data.sort)) + '&init=' + this.data.init + '&needIncReviewCount=' + needIncReviewCount + '&openid=' + app.globalData.openid,
            success: function(res) {
                if (res.data.status == 'success') {
                    var phases = res.data.data;
                    var phasesArr = _this.data.phases;
                    for (var i in phases) {
                        phases[i].createdDate = app.formatDate(phases[i].createdDate);
                        phases[i].likeShapeFilled = (phases[i].likesUsers && phases[i].likesUsers.indexOf(_this.data.openid) != -1) ? true : false;
                        phasesArr.push(phases[i]);
                    }
                    _this.setData({
                        phases: phasesArr,
                        init: false,
                        blurStyle: '',
                        storyTitle: phasesArr[0].storyTitle,
                        isStoryNeedApproval: phasesArr[0].isStoryNeedApproval,
                        contentLengthMax: phasesArr[0].contentLengthMax,
                        contentLengthMin: phasesArr[0].contentLengthMin
                        // pageNumber: _this.data.pageNumber + 1
                    })
                    wx.hideNavigationBarLoading();
                }
            }
        })
    },

    loadParentLine: function() {
        this.setData({
            isUserCenterTriggered: false,
            // phases: [],
            loading: true
        })
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/parentLine?parentPhaseId=' + this.data.parentPhaseId,
            method: 'GET',
            success: function(res) {
                if (res.data.status == 'success') {
                    var phases = res.data.data;
                    var currentPhases = _this.data.phases;
                    var tmpPhases = [];
                    for (var i in phases) {
                        phases[i].createdDate = app.formatDate(phases[i].createdDate);
                        phases[i].likeShapeFilled = (phases[i].likesUsers && phases[i].likesUsers.indexOf(_this.data.openid) != -1) ? true : false;
                        tmpPhases.push(phases[i]);
                    }
                    for (var i=1; i<currentPhases.length; i++) {
                        tmpPhases.push(currentPhases[i]);
                    }

                    _this.setData({
                        phases: tmpPhases,
                        init: false,
                        blurStyle: '',
                        storyTitle: tmpPhases[0].storyTitle,
                        loading: false
                    })
                    wx.hideNavigationBarLoading();
                }
            }
        })
    },

    onTap: function(e) {
        var currentIndex = e.currentTarget.dataset.index;
        if (currentIndex != this.data.phases.length -1) {
            var branchphases = e.currentTarget.dataset.branchphases;
            var parentPhaseId = e.currentTarget.dataset.id;
            var storyTitle = e.currentTarget.dataset.title;
            var _this = this;
            this.setData({
                currentIndex: currentIndex,
                parentPhaseId: parentPhaseId,
                createBranchBtnDisplay: (branchphases && branchphases.length) > 1 ? this.data.createBranchBtnDisplay : !this.data.createBranchBtnDisplay,
                showBranch: !this.data.showBranch,
                branchPhases: [],
                storyTitle: storyTitle
            })
            if (branchphases && branchphases.length > 1) {
                this.setData({
                    parentPhaseId: parentPhaseId
                })
                this.loadBranches(parentPhaseId);
            }
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
            showBranch: !this.data.showBranch
            // createBranchBtnDisplay: !this.data.createBranchBtnDisplay
        })
        this.loadLine(parentPhaseId, false);
    },

    loadBranches: function(parentPhaseId) {
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/branchPhases?parentPhaseId=' + parentPhaseId,
            success: function (res) {
                if (res.data.status == 'success') {
                    var branchPhases = res.data.data;
                    // var branchPhasesArr = _this.data.branchPhases;
                    for (var i in branchPhases) {
                        branchPhases[i].createdDate = app.formatDate(branchPhases[i].createdDate);
                        branchPhases[i].content = branchPhases[i].content.length > 50 ? branchPhases[i].content.substr(0, 50) + '...' : branchPhases[i].content
                    }
                    _this.setData({
                        branchPhases: branchPhases
                    })
                }
            }
        })
    },

    onCreateBtnTap: function(e) {
        // var id = e.currentTarget.dataset.id;
        // var title = e.currentTarget.dataset.title;
        var id = this.data.parentPhaseId;
        var title = this.data.storyTitle;
        var storyId = this.data.phases[this.data.phases.length-1].storyId;
        wx.navigateTo({
            url: '../newPhase/newPhase?rootPhaseId=' + this.data.rootPhaseId + '&parentPhaseId=' + id + '&title=' + title + '&isNewStory=false&storyId=' + storyId + '&contentLengthMax=' + this.data.contentLengthMax + '&contentLengthMin=' + this.data.contentLengthMin
        })
    },

    continueBtnTap: function() {
        var lastPhaseId = this.data.phases[this.data.phases.length-1].id;
        var storyId = this.data.phases[this.data.phases.length - 1].storyId;
        var title = this.data.title;
        wx.navigateTo({
            url: '../newPhase/newPhase?rootPhaseId=' + this.data.rootPhaseId + '&parentPhaseId=' + lastPhaseId + '&title=' + title + '&isNewStory=false&storyId=' + storyId + '&isStoryNeedApproval=' + this.data.isStoryNeedApproval + '&contentLengthMax=' + this.data.contentLengthMax + '&contentLengthMin=' + this.data.contentLengthMin
        })
    },

    approveStatusBtnTap: function(e) {
        wx.showLoading({
            title: '审核中...',
            icon: 'loading',
        });
        this.setData({
            approvalPublishing: true
        })
        var _this = this;
        var approvalStatus = e.currentTarget.dataset.approvalstatus;
        wx.request({
            url: app.globalData.serverHost + '/story/approve?approved=' + approvalStatus + '&phaseId=' + this.data.pendingApprovalPhaseId,
            method: 'GET',
            success: function(res) {
                if (res.data.status == 'success') {
                    wx.showToast({
                        title: '审核完成',
                        icon: 'success',
                        success: function () {
                            setTimeout(function () {
                                wx.navigateBack({})
                            }, 1500);
                        }
                    });
                }
            }
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var currentParentPhaseId = this.data.phases[this.data.phases.length-1].id;
        // this.setData({
        //     branchPhases: [],
        //     createBranchBtnDisplay: false
        // })
        this.loadLine(currentParentPhaseId, false);
    },

    onShow: function() {
        if (this.data.phases.length > 0) {
            var currentParentPhaseId = this.data.phases[this.data.phases.length - 1].id;
            this.setData({
                branchPhases: [],
                createBranchBtnDisplay: false,
                showBranch: false
            })
            this.loadLine(currentParentPhaseId, false);
        }
    },

    likeClicked: function (e) {
        console.log('like!');
        var _this = this;
        var index = e.currentTarget.dataset.index;
        var update = "phases[" + index + "].likes";
        var update_like_shape = "phases[" + index + "].likeShapeFilled";
        var likesUsers = this.data.phases[index].likesUsers;
        var phase = this.data.phases[index];
        if (!phase.likeShapeFilled) {
            // user hasn't liked this phase
            if(!phase.likesUsers) {
                phase.likesUsers = [];
            }
            phase.likesUsers.push(this.data.openid);
            phase.likes = (!phase.likes || phase.likes == 0) ? 1 : ++phase.likes;
        } else {
            // user has liked this phase
            var tmpLikesUsers = [];
            for(var i in phase.likesUsers) {
                if (phase.likesUsers[i] != this.data.openid) {
                    tmpLikesUsers.push(phase.likesUsers[i]);
                }
            }
            phase.likesUsers = tmpLikesUsers;
            phase.likes = --phase.likes;
        }
        phase.likeShapeFilled = !phase.likeShapeFilled;
        this.setData({
            ['phases[' + index + ']']: phase
        })

        wx.request({
            url: app.globalData.serverHost + '/story/ratePhase?phaseId=' + phase.id + '&like=' + (phase.likeShapeFilled) + '&openid=' + this.data.openid,
            method: 'GET',
            success: function(res) {
                console.log('success rate!');
            }
        })
    },

    toggleBranchSider: function() {
        this.setData({
            showBranch: !this.data.showBranch
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})