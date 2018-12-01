const app = getApp();
Component({
    externalClasses: ['i-class', 'i-class-mask'],

    properties: {
        visible: {
            type: Boolean,
            value: false
        },
        title: {
            type: String,
            value: ''
        },
        showOk: {
            type: Boolean,
            value: true
        },
        showCancel: {
            type: Boolean,
            value: true
        },
        okText: {
            type: String,
            value: '确定'
        },
        cancelText: {
            type: String,
            value: '取消'
        },
        // 按钮组，有此值时，不显示 ok 和 cancel 按钮
        actions: {
            type: Array,
            value: []
        },
        // horizontal || vertical
        actionMode: {
            type: String,
            value: 'horizontal'
        }
    },

    data: {
        pathKey: '',
        pathValue: ''
    },

    methods: {
        handleClickItem ({ currentTarget = {} }) {
            const dataset = currentTarget.dataset || {};
            const { index } = dataset;
            this.triggerEvent('click', { index });
        },
        handleAuthBtn ({ currentTarget = {} }) {
            const dataset = currentTarget.dataset || {};
            const { index } = dataset.index;
            this.setData({
                pathKey: dataset.pathkey,
                pathValue: dataset.pathvalue
            })
            this.triggerEvent('click', { index });
        },
        handleClickOk () {
            this.triggerEvent('ok');
        },
        handleClickCancel () {
            this.triggerEvent('cancel');
        },
        userInfoHandler: function (e) {
            var userInfo = e.detail.userInfo;
            if (userInfo != undefined) {
                app.globalData.userInfo = userInfo
                app.globalData.authorized = true;
                wx.reLaunch({
                    url: '../index/index?pathKey=' + this.data.pathKey + '&pathValue=' +  this.data.pathValue,
                })
            }
        },
    }
});
