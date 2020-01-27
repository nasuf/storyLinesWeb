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
      pageSize: 25,
      sort: {
          lastUpdatedDate: 'DESC'
      },
      loading: true,
      tags: [],
      selectedTags: [],
      needReviewCount: false
  },

  lifetimes: {
    attached: function() {
        if (app.globalData.tabTopCurrent != 'tab3') {
            this.loadStories([], true, 'recommendation');
        }
        this.loadTags();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {

      loadTags: function () {
          var _this = this;
          wx.request({
              url: app.globalData.serverHost + '/story/loadTags',
              method: 'GET',
              success: function (res) {
                  var tags = res.data.data;
                  for (var i in tags) {
                      if (tags[i].value == '全部') {
                          tags[i].checked = true
                      }
                  }
                  _this.setData({
                      tags: res.data.data
                  })
              }
          })
      },

      tagClick: function (e) {
          const detail = e.detail;
          var value = e.currentTarget.dataset.value;
          var selectedTags = this.data.selectedTags;
          var allTags = this.data.tags;
          var tmpTags = [];
          this.setData({
              ['tags[' + e.detail.name + '].checked']: detail.checked
          })
          if (value == '全部') {
              // set 'all' tags to checked
            //   this.setData({
            //       ['tags[0].checked']: true
            //   })
              // set 'non-all' tags to unchecked
              for (var i=1; i<allTags.length; i++) {
                  allTags[i].checked = false;
              }
              this.setData({
                  tags: allTags
              })
          } else if (selectedTags.indexOf(value) != -1) {
              // exists, then remove it
              for (var i in selectedTags) {
                  if (selectedTags[i] != value)
                      tmpTags.push(selectedTags[i])
              }
          } else {
              // not exists, then add it
              tmpTags = selectedTags;
              tmpTags.push(value);
          }
          // process 'all' tags
          if (tmpTags.length > 0) {
              this.setData({
                  ['tags[0].checked']: false
              })
          } else if (tmpTags.length == 0 && value != '全部') {
              // no tags selected
              this.setData({
                  ['tags[0].checked']: true
              })
          }
          this.setData({
              selectedTags: tmpTags,
              pageNumber: 0,
              stories: []
          })
          this.loadStories(this.data.selectedTags, true);
      },

      onCheckDetail: function (e) {
          var id = e.currentTarget.dataset.id;
          var title = e.currentTarget.dataset.title;
          wx.navigateTo({
              url: '/pages/line/line?parentPhaseId=' + id + '&title=' + title + '&isUserCenterTriggered=false&needIncReviewCount=true'
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

      loadStories: function(tags, isInit, tabName) {
        //   $Toast({
        //       content: '加载中',
        //       type: 'loading'
        //   });
        //   wx.showNavigationBarLoading();
          if (isInit) {
              this.setData({
                  loading: true,
                  stories: [],
                  pageNumber: 0
              })
          }
          var _this = this;
          
          var sort = this.data.sort;
          if (tabName == 'recommendation') {
              sort = {
                  reviewCount: 'DESC'
              }
          }
          var url = app.globalData.serverHost + '/story/story' + (((tags != undefined && tags.length != 0) || (this.data.tags && this.data.tags.length > 0 && this.data.tags[0].checked == false)) ? '/filtered' : '') + '?pageNumber=' + this.data.pageNumber + '&pageSize=' + this.data.pageSize + '&sort=' + encodeURIComponent(JSON.stringify(sort)) + ((tags != undefined && tags.length != 0) ? ('&tags=' + tags) : '');
          wx.request({
              url: url,
              success: function (res) {
                  if (res.data.status == 'success') {
                      var storyList = res.data.data;
                      var storyArr = _this.data.stories;
                      for (var i in storyList) {
                          if (storyList[i].createdDate != storyList[i].lastUpdatedDate) {
                              storyList[i].updated = true;
                              storyList[i].lastUpdatedDate = app.formatDate(storyList[i].lastUpdatedDate)
                          }
                          storyList[i].createdDate = app.formatDate(storyList[i].createdDate);
                          storyArr.push(storyList[i]);
                      }
                      _this.setData({
                          stories: storyArr,
                          pageNumber: _this.data.pageNumber + 1,
                          loading: false,
                          needReviewCount: tabName == 'recommendation' ? true : false
                      })
                      wx.stopPullDownRefresh();
                    //   wx.hideNavigationBarLoading();
                    //   $Toast.hide();
                  }
              }
          })
      }
  }
})
