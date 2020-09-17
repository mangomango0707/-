// pages/player/player.js
let musiclist = []
let nowPlayingIndex = 0
// 获取全局唯一的背景音乐管理器
const BackgroundAudioManager = wx.getBackgroundAudioManager()

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 背景图
    picUrl: '',
    // 播放状态变量
    isPlaying: false,
    // 表示当前歌词是否显示
    isLyricShow: false,
    // 歌词
    lyric: '',
    isSame: false //表示是否为同一首歌曲
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
    // 获取选中歌曲信息，传递歌曲musicId参数
    this._loadMusicDetail(options.musicId)
  },

  // 加载选中歌曲信息
  _loadMusicDetail(musicId) {

    // 判断当前是否是同一首歌曲
    if(musicId === app.getPlayingMusicId()){
      this.setData({
        isSame: true
      })
    }else{
      this.setData({
        isSame: false
      })
    }

    //先判断是不是同一首歌
    if(!this.data.isSame){
      // 每次加载，先停止上一首歌曲的播放再加载下一首
      BackgroundAudioManager.stop()
    }
    let music = musiclist[nowPlayingIndex]
    console.log(music);
    // 设置播放歌曲页面导航头文字为歌曲名
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    app.setPlayingMusicId(musicId)

    wx.showLoading({
      title: '歌曲加载中',
    })

    // 一加载歌曲即调用歌曲播放的云函数
    wx.cloud.callFunction({
      name: 'music',
      data: {
        // 该云函数需要传递歌曲musicId
        musicId,
        $url: 'musicUrl'
      }
    }).then((res) => {
      console.log(res)
      let result = res.result
      // 设置音频的数据源
      BackgroundAudioManager.src = result.data[0].url

      // 先判断有没有url资源，可能没有权限
      if(result.data[0].url == null){
        wx.showToast({
          title: '无权限播放',
        })
        // 无需再进行其他赋值操作
        return
      }

      //先判断是不是同一首歌
    if(!this.data.isSame){
      // 需设置音频标题，否则报错
      BackgroundAudioManager.title = music.name
      BackgroundAudioManager.singer = music.ar[0].name
      BackgroundAudioManager.epname = music.al.name
      BackgroundAudioManager.coverImgUrl = music.al.picUrl
    }
      
      // console.log(BackgroundAudioManager.duration);
      

      // 一开始加载完即自动播放，改变播放状态
      this.setData({
        isPlaying: true
      })

      wx.hideLoading()

      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then((res) => {
        console.log(res)
        // 歌词初始化
        let lyric = '暂无歌词'
        const lrc = res.result.lrc
        if(lrc){
          lyric = lrc.lyric
        }
        this.setData({
          // 歌词需要传递给歌词组件
          lyric
        })

      })
    })
  },

  // 点击按钮切换播放或暂停
  togglePlaying() {
    // 根据状态变量来判断并控制音乐的播放与暂停
    if(this.data.isPlaying){
      // 暂停
      BackgroundAudioManager.pause()
    }else{
      // 播放
      BackgroundAudioManager.play()
    }
    // 同时改变状态变量的值
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  // 点击播放上一首
  onPrev() {
    // 根据当前正在播放的index来判断
    if(nowPlayingIndex === 0){
      // 设置为最后一首
      nowPlayingIndex = musiclist.length - 1
    }else{
      nowPlayingIndex--
    }
 
    // 重新加载新的歌曲
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 点击播放下一首
  onNext() {
    // 根据当前正在播放的index来判断
    if(nowPlayingIndex === (musiclist.length - 1)){
      // 设置为第一首
      nowPlayingIndex = 0
    }else{
      nowPlayingIndex++
    }
 
    // 重新加载新的歌曲
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  // 点击唱片图片切换为歌词显示
  onChangeLyricShow() {
    // 每次点击，更改歌词显示与否状态值
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  // 将当前时间传递到歌词组件中
  timeUpdate(event) {
    // 根据选择器选取到歌词组件
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  // 切换系统面板播放状态联动小程序播放状态
  onPlay() {
    this.setData({
      isPlaying: true
    })
  },

  onPause() {
    this.setData({
      isPlaying: false
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