// pages/player/player.js
let musiclist = []
let nowPlayingIndex = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 背景图
    picUrl: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    // 当前选中歌曲在歌曲列表中的索引
    nowPlayingIndex = options.index
    // storage中选中歌单的歌曲列表
    musiclist = wx.getStorageSync('musiclist')
    // 获取选中歌曲信息
    this._loadMusicDetail()
  },

  // 加载选中歌曲信息
  _loadMusicDetail() {
    let music = musiclist[nowPlayingIndex]
    console.log(music);
    // 设置播放歌曲页面导航头文字为歌曲名
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})