Component({
    externalClasses: ['i-class'],

    options: {
        multipleSlots: true
    },

    properties: {
        full: {
            type: Boolean,
            value: false
        },
        thumb: {
            type: String,
            value: ''
        },
        title: {
            type: String,
            value: ''
        },
        extra: {
            type: String,
            value: ''
        },
        extra_type: {
            type: String,
            value: ''
        },
        extra_color: {
            type: String,
            value: ''
        },
        likes: {
            type: Number,
            value: 0
        },
        needHeader: {
            type: Boolean,
            value: true
        },
        borderRadius: {
            type: String,
            value: ''
        }
    },
    methods: {
        onTap: function() {
            var myEventDetail = {} // detail对象，提供给事件监听函数
            var myEventOption = {} // 触发事件的选项
            this.triggerEvent('likeevent', myEventDetail, myEventOption)
        }
    }
});
