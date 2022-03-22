// pages/line.js
const app = getApp()

// const wxGetImageInfo = promisify(wx.getImageInfo)
// const wxCanvasToTempFilePath = promisify(wx.canvasToTempFilePath)
// const wxSaveImageToPhotosAlbum = promisify(wx.saveImageToPhotosAlbum)

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
        lineIndex: '',

        canvasWidth: '',
        canvasHeight: '',

        canvasUrl: '',
        isShowCav: false,

        filePath: '',

        storyAuthorOpenid: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _this = this;
        wx.getSystemInfo({
            success: function (res) {
                var myCanvasWidth = res.screenWidth
                var myCanvasHeight = res.screenHeight
                _this.setData({
                    canvasWidth: myCanvasWidth,
                    canvasHeight: myCanvasHeight
                })
            },
        })

        var parentPhaseId = options.parentPhaseId;
        var title = options.title;
        var isPendingApproval = options.isPendingApproval;
        var pendingApprovalPhaseId = options.pendingApprovalPhaseId;
        var currentApprovalStatus = options.currentApprovalStatus;
        var hasBeenContinued = options.hasBeenContinued;
        var needIncReviewCount = options.needIncReviewCount;
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
        this.loadLine(parentPhaseId, needIncReviewCount);
    },

    loadLine: function (parentPhaseId, needIncReviewCount) {
        var _this = this;
        wx.showNavigationBarLoading();
        wx.request({
            url: app.globalData.serverHost + '/story/story/phases/' + parentPhaseId + '?pageNumber=' + this.data.pageNumber + '&pageSize=' + this.data.pageSize + '&childPhasesPageSize=' + this.data.childPhasesPageSize + '&sort=' + encodeURIComponent(JSON.stringify(this.data.sort)) + '&init=' + this.data.init + '&needIncReviewCount=' + needIncReviewCount + '&openid=' + app.globalData.openid,
            success: function (res) {
                if (res.data.status == 'success') {
                    var phases = res.data.data;
                    var phasesArr = _this.data.phases;
                    for (var i in phases) {
                        phases[i].createdDate = app.formatDate(phases[i].createdDate);
                        phases[i].likeShapeFilled = (phases[i].likesUsers && phases[i].likesUsers.indexOf(_this.data.openid) != -1) ? true : false;
                        phases[i].content = phases[i].content.replace(/[\n]+/g, '\n\n')
                        phasesArr.push(phases[i]);
                    }
                    _this.setData({
                        phases: phasesArr,
                        init: false,
                        blurStyle: '',
                        storyTitle: phasesArr[0].storyTitle,
                        isStoryNeedApproval: phasesArr[0].isStoryNeedApproval,
                        contentLengthMax: phasesArr[0].contentLengthMax,
                        contentLengthMin: phasesArr[0].contentLengthMin,
                        storyAuthorOpenid: phasesArr[0].storyAuthorOpenid
                        // pageNumber: _this.data.pageNumber + 1
                    })
                    wx.hideNavigationBarLoading();
                }
            }
        })
    },

    loadParentLine: function () {
        this.setData({
            isUserCenterTriggered: false,
            // phases: [],
            loading: true
        })
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/parentLine?parentPhaseId=' + this.data.parentPhaseId,
            method: 'GET',
            success: function (res) {
                if (res.data.status == 'success') {
                    var phases = res.data.data;
                    var currentPhases = _this.data.phases;
                    var tmpPhases = [];
                    for (var i in phases) {
                        phases[i].createdDate = app.formatDate(phases[i].createdDate);
                        phases[i].likeShapeFilled = (phases[i].likesUsers && phases[i].likesUsers.indexOf(_this.data.openid) != -1) ? true : false;
                        phases[i].content = phases[i].content.replace(/[\n]+/g, '\n\n')
                        tmpPhases.push(phases[i]);
                    }
                    for (var i = 1; i < currentPhases.length; i++) {
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

    onTap: function (e) {
        var currentIndex = e.currentTarget.dataset.index;
        // if (currentIndex != this.data.phases.length - 1) {
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
        // }
    },

    onBranchTap: function (e) {
        var parentPhaseId = e.currentTarget.dataset.id;
        var index = e.currentTarget.dataset.index;
        var branchindex = e.currentTarget.dataset.branchindex;
        var phases = this.data.phases.slice(0, index + 1);
        phases.push(this.data.branchPhases[branchindex])
        for (var i in phases) {
            phases[i].content = phases[i].content.replace(/[\n]+/g, '\n\n')
        }
        this.setData({
            phases: phases,
            branchPhases: [],
            showBranch: !this.data.showBranch
            // createBranchBtnDisplay: !this.data.createBranchBtnDisplay
        })
        this.loadLine(parentPhaseId, false);
    },

    loadBranches: function (parentPhaseId) {
        var _this = this;
        wx.request({
            url: app.globalData.serverHost + '/story/branchPhases?parentPhaseId=' + parentPhaseId,
            success: function (res) {
                if (res.data.status == 'success') {
                    var branchPhases = res.data.data;
                    // var branchPhasesArr = _this.data.branchPhases;
                    for (var i in branchPhases) {
                        branchPhases[i].createdDate = app.formatDate(branchPhases[i].createdDate);
                        branchPhases[i].processedContent = branchPhases[i].content.length > 50 ? branchPhases[i].content.substr(0, 50) + '...' : branchPhases[i].content
                    }
                    _this.setData({
                        branchPhases: branchPhases
                    })
                }
            }
        })
    },

    onCreateBtnTap: function (e) {
        // var id = e.currentTarget.dataset.id;
        // var title = e.currentTarget.dataset.title;
        var id = this.data.parentPhaseId;
        var title = this.data.storyTitle;
        var storyId = this.data.phases[this.data.phases.length - 1].storyId;
        wx.navigateTo({
            url: '../newPhase/newPhase?rootPhaseId=' + this.data.rootPhaseId + '&parentPhaseId=' + id + '&title=' + title + '&isNewStory=false&storyId=' + storyId + 
            '&isStoryNeedApproval=' + this.data.isStoryNeedApproval + '&contentLengthMax=' + this.data.contentLengthMax + '&contentLengthMin=' + this.data.contentLengthMin + '&storyAuthorOpenid=' + this.data.storyAuthorOpenid
        })
    },

    continueBtnTap: function () {
        var lastPhaseId = this.data.phases[this.data.phases.length - 1].id;
        var storyId = this.data.phases[this.data.phases.length - 1].storyId;
        var title = this.data.title;
        wx.navigateTo({
            url: '../newPhase/newPhase?rootPhaseId=' + this.data.rootPhaseId + '&parentPhaseId=' + lastPhaseId + '&title=' + title + '&isNewStory=false&storyId=' + storyId + '&isStoryNeedApproval=' + this.data.isStoryNeedApproval + '&contentLengthMax=' + this.data.contentLengthMax + '&contentLengthMin=' + this.data.contentLengthMin + '&storyAuthorOpenid=' + this.data.storyAuthorOpenid
        })
    },

    canvas: function (object) {
        let _this = this;
        const ctx = wx.createCanvasContext('mycanvas');
        var content = '';
        var phases = this.data.phases;
        var canvasHeight = this.data.canvasHeight;
        var canvasWidth = this.data.canvasWidth;

        this.setData({
            isShowCav: true
        })
        
        
        ctx.setFontSize(14);
        var lines = [];
        lines.push(this.data.storyTitle + '\n');
        lines.push('');
        for (var i in phases) {
            content += phases[i].content + (phases[i].content.endsWith('\n') ? '' : '\n');
        }
        var phases = content.split('\n');
        for (var j in phases) {
            var content = phases[j];
            var cur = 0;
            for (var i in content) {
                var lineSize = ctx.measureText(content.substring(cur, i)).width;
                if (lineSize > canvasWidth * 0.8) {
                    var line = content.substring(cur, i);
                    lines.push(line);
                    cur = i;
                }
            }
            lines.push(content.substring(cur, content.length));
            // lines.push('');
        }
        lines.push(''); lines.push(''); lines.push('');
        var contentHeight = 15 + lines.length * 20;
        if (contentHeight > this.data.canvasHeight)
            canvasHeight = contentHeight;
        this.setData({
            canvasHeight: canvasHeight
        })
        ctx.setFillStyle('#495060')
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.setFillStyle("white");
        // content
        for (var i in lines) {
            if (i == 0) {
                ctx.setFontSize(18);
            } else {
                ctx.setFontSize(14);
            }
            ctx.fillText(lines[i], canvasWidth * 0.1, 60 + i * 20);
        }

        // ctx.draw();

        ctx.draw(true, function(res) {
            wx.canvasToTempFilePath({
                canvasId: 'mycanvas',
                success: function(res) {
                    var filePath = res.tempFilePath;
                    _this.setData({
                        filePath: filePath
                    })
                    wx.previewImage({
                        current: filePath, // 当前显示图片的http链接  
                        urls: [filePath], // 需要预览的图片http链接列表  
                    })
                }
            }, this)
        });
    },

    preview: function() {
        var _this = this;
        wx.previewImage({
            current: _this.data.filePath, // 当前显示图片的http链接  
            urls: [_this.data.filePath], // 需要预览的图片http链接列表  
        })
    },


    approveStatusBtnTap: function (e) {
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
            success: function (res) {
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
        var currentParentPhaseId = this.data.phases[this.data.phases.length - 1].id;
        // this.setData({
        //     branchPhases: [],
        //     createBranchBtnDisplay: false
        // })
        this.loadLine(currentParentPhaseId, false);
    },

    onShow: function () {
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
            if (!phase.likesUsers) {
                phase.likesUsers = [];
            }
            phase.likesUsers.push(this.data.openid);
            phase.likes = (!phase.likes || phase.likes == 0) ? 1 : ++phase.likes;
        } else {
            // user has liked this phase
            var tmpLikesUsers = [];
            for (var i in phase.likesUsers) {
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
            success: function (res) {
                console.log('success rate!');
            }
        })
    },

    toggleBranchSider: function () {
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