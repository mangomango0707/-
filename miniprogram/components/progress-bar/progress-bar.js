// components/progress-bar/progress-bar.js
// 可移动区域和容器的宽度
let movableAreaWidth = 0
let movableViewWidth = 0
// 当前的秒数
let currentSec = -1
// 当前歌曲总时长
let duration = 0
let isMoving = false // 表示当前进度条是否在拖拽，解决：当进度条拖动的时候和updatetime有冲突的问题

// 获取全局唯一背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    // 表示移动距离
    movableDis: 0,
    // 当前进度条相对于总宽度移动的距离（百分比）
    progress: 0
  },

  // 组件生命周期函数
  lifetimes: {
    ready() {
      // 如果当前调用的是同一首歌，重新设置时长
      if(this.properties.isSame && this.data.showTime.totalTime === '00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 触发拖拽进度条事件
    // 获取当前位置/时间
    onChange(event) {
      console.log(event);
      // 判断是否为手动拖动
      if(event.detail.source === 'touch'){
        // 先保存progress、movableDis的值，但不设置，频繁设置影响性能
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100,
        this.data.movableDis = event.detail.x
        isMoving = true
      }
      
    },
    // 当放开拖拽圆点时，设置当前时间/位置
    onTouchEnd() {
      // 获取当前时间
      const currentTimeFormat = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      // 将progress、movableDis的值设置到页面中
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFormat.min+':'+currentTimeFormat.sec
      })
      // 将音乐跳转到对应的时间播放，时间参数以秒为单位
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },

    // 获取当前进度条宽度
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        console.log(rect);
        // 赋值宽度
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },

    // 监听/绑定背景音乐各种事件
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay');
        isMoving = false
        this.triggerEvent('musicPlay')
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop');
      })

      backgroundAudioManager.onPause(() => {
        console.log('onPause');
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting');
      })

      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay');
        // console.log(backgroundAudioManager.duration);
        if(typeof backgroundAudioManager.duration != 'undefined'){
          // 设置进度条歌曲时长
          this._setTime()
        }else{
          // 延迟1s设置即可
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {
        console.log('onTimeUpdate');
        if(!isMoving){
          // 获取当前歌曲已经播放的时间
          const currentTime = backgroundAudioManager.currentTime 
          // 获取当前歌曲总时长
          const duration = backgroundAudioManager.duration

          const sec = currentTime.toString().split('.')[0]
          if(sec != currentSec){
            // console.log(currentTime);
            // 格式化时间
            const currentTimeFormat = this._dateFormat(currentTime)
            this.setData({
              // 应该移动的距离
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFormat.min}:${currentTimeFormat.sec}`
            })

            currentSec = sec

            // 联动歌词，将当前每次update的时间传递出去
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }

          
        }
        
      })

      backgroundAudioManager.onEnded(() => {
        console.log('onEnded');
        // 组件间的通信，自定义组件触发事件
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        console.log(res.errMsg);
        console.log(res.errCode);
        wx.showToast({
          title: '错误: '+res.errCode,
        })
      })
    },

    // 设置每首歌曲时长
    _setTime() {
      duration = backgroundAudioManager.duration
      // console.log(duration);
      // 格式化时间
      const durationFormat = this._dateFormat(duration)
      // console.log(durationFormat);
      
      // 给对象的属性赋值的方法
      this.setData({
        ['showTime.totalTime']: `${durationFormat.min}:${durationFormat.sec}`
      })
    },

    // 格式化时间
    _dateFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },

    // 时间补零操作
    _parse0(sec){
      return sec < 10 ? '0' + sec : sec
    },

    
  }
})
