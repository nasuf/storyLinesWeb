const app = getApp();
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
        phase: {
            storyTitle: '',
            isPrivate: false,
            needAuth: false,
            content: '',
            tags: []
        },
        errorMsg: '',
        loading: false,
        tags: [],
        otherTagClicked: false,
        otherTags: [],
        authorized: false,
        authModalVisable: false,
        authActions: [
            {
                name: '授权',
                color: '#19be6b',
                type: 'auth',
                pathKey: 'tab_top_current',
                pathValue: 'tab3'
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
        inputChange: function (e) {
            if (e.currentTarget.dataset.key == 'otherTags') {
                // this.setData({
                //     otherTag: e.detail.detail.value
                // })
            } else {
                var key = 'phase.' + e.currentTarget.dataset.key;
                this.setData({
                    [key]: e.detail.detail.value
                })
            }
            
        },

        switchChange: function (e) {
            var key = 'phase.' + e.currentTarget.dataset.key;
            this.setData({
                [key]: e.detail.value
            })
        },

        otherTagInputConfirm: function(e) {
            var _this = this;
            var newTagValue = e.detail.detail.value;
            var tmpTags = this.data.tags;
            if (newTagValue && newTagValue.trim()) {
                var isNewTag = true
                for (var i in tmpTags) {
                    if (tmpTags[i].value == newTagValue) {
                        isNewTag = false;
                    }
                }
                if (isNewTag) {
                    var newTag = {
                        value: newTagValue,
                        color: 'yellow',
                        checked: 'true'
                    };
                    tmpTags.push(newTag);
                    this.setData({
                        tags: []
                    })
                    var existedPhaseTags = this.data.phase.tags;
                    existedPhaseTags.push(newTagValue);
                    this.setData({
                        tags: tmpTags,
                        ['phase.tags']: existedPhaseTags
                    })
                }
            }
        },

        post: function () {
            var _this = this;
            var validated = this.validate();
            if (!validated)
                return;
            wx.showLoading({
                title: '正在发布...',
                icon: 'loading',
            });
           
            this.setData({
                loading: true,
                disabled: true
            })
            // wx.showNavigationBarLoading();
            wx.request({
                url: app.globalData.serverHost + '/story/story?openid=' + app.globalData.openid + '&needAuth=' + _this.data.phase.needAuth + '&isNewStory=true',
                data: _this.data.phase,
                method: 'POST',
                success: function (res) {
                    wx.hideLoading();
                    if (res.data.status == 'success') {

                        // wx.hideNavigationBarLoading()
                        wx.showToast({
                            title: '发布成功',
                            icon: 'success',
                            success: function () {
                                setTimeout(function () {
                                    wx.redirectTo({
                                        url: '/pages/index/index',
                                    })
                                }, 1500);
                                _this.setData({
                                    loading: false
                                })
                            }
                        });

                    } else {
                        _this.showTopErrorTips('发布失败，请重试');
                        this.setData({
                            loading: false
                        })
                    }
                }
            })
        },

        validate: function() {
            if (!this.data.phase.storyTitle || !this.data.phase.storyTitle.trim()) {
                $Message({
                    content: '标题不能为空',
                    type: 'warning'
                });
                return false;
            } else if (!this.data.phase.content || !this.data.phase.content.trim()) {
                $Message({
                    content: '内容不能为空',
                    type: 'warning'
                });
                return false;
            }
            return true;
        },

        tagClick: function(e) {
            const detail = e.detail;
            this.setData({
                ['tags[' + e.detail.name + '].checked']: detail.checked
            })
            var value = e.currentTarget.dataset.value;
            if (value == '其他') {
                this.setData({
                    otherTagClicked: !this.data.otherTagClicked
                })
                return;
            }
            var tags = this.data.phase.tags; 
            var tmpTags = []
            if (tags.indexOf(value) != -1) {
                // exists, then remove it
                for (var i in tags) {
                    if (tags[i] != value)
                        tmpTags.push(tags[i])
                }
            } else {
                // not exists, then add it
                tmpTags = this.data.phase.tags;
                tmpTags.push(value);
            }
            this.setData({
                ['phase.tags']: tmpTags
            })
        },

        authorize: function(e) {
            this.setData({
                authModalVisable: !this.data.authModalVisable
            })
        },

        handleAuth: function ({ detail }) {
            this.setData({
                authModalVisable: false
            });
        },

        loadTags: function() {
            var _this = this;
            wx.request({
                url: app.globalData.serverHost + '/story/loadTags',
                method: 'GET',
                success: function (res) {
                    _this.setData({
                        tags: res.data.data
                    })
                }
            })
        }
    },
    lifetimes: {
        attached: function() {
            this.setData({
                authorized: app.globalData.authorized
            })
            this.loadTags();
            app.refreshUserInfo();
        }
    }
})
