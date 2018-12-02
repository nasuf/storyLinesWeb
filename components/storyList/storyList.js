const app = getApp();
const { $Toast } = require('../../dist/base/index');

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
      stories: [],
      pageNumber: 0,
      pageSize: 5,
      sort: {
          createdDate: 'DESC'
      },
      loading: true
  },

  lifetimes: {
    attached: function() {
        this.loadStories()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {

      onCheckDetail: function (e) {
          var id = e.currentTarget.dataset.id;
          var title = e.currentTarget.dataset.title;
          wx.navigateTo({
              url: '/pages/line/line?parentPhaseId=' + id + '&title=' + title
          })
      },

      likeEventListener: function(e) {
          console.log('like!');
          var _this = this;
          var index = e.currentTarget.dataset.index;
          var update = "stories[" + index + "].likes";
          this.setData({
              [update]: this.data.stories[index].likes ? (++this.data.stories[index].likes) : 1
          })
      },

      loadStories: function() {
        //   $Toast({
        //       content: '加载中',
        //       type: 'loading'
        //   });
          this.setData({
              loading: true
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
                          pageNumber: _this.data.pageNumber + 1,
                          loading: false
                      })
                    //   $Toast.hide();
                  }
              }
          })
      }
  }
})
