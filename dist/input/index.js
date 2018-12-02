Component({
    behaviors: ['wx://form-field'],

    externalClasses: ['i-class'],

    data: {
        vHeight: null
    },

    properties: {
        title: {
            type: String
        },
        // text || textarea || password || number
        type: {
            type: String,
            value: 'text'
        },
        disabled: {
            type: Boolean,
            value: false
        },
        placeholder: {
            type: String,
            value: ''
        },
        autofocus: {
            type: Boolean,
            value: false
        },
        mode: {
            type: String,
            value: 'normal'
        },
        right: {
            type: Boolean,
            value: false
        },
        error: {
            type: Boolean,
            value: false
        },
        maxlength: {
            type: Number
        },
        singleline: {
            type: Boolean
        }
    },

    methods: {
        handleInputChange(event) {
            const { detail = {} } = event;
            const { value = '' } = detail;
            this.setData({ value });

            this.triggerEvent('change', event);
        },

        handleInputFocus(event) {
            this.triggerEvent('focus', event);
        },

        handleInputBlur(event) {
            this.triggerEvent('blur', event);
        },

        handleConfirm(event) {
            this.triggerEvent('inputconfirm', event);
        }
    },

    lifetimes: {
        attached: function() {
            var _this = this;
            wx.getSystemInfo({
                success: function(res) {
                    _this.setData({
                        vHeight: res.windowHeight * 0.55 + 'rpx'
                    })
                }
            })
        }
    }
});
