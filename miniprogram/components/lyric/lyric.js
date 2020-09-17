// components/lyric/lyric.js
// 当前歌词的高度
let lyricHeight = 0

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String,
  },

  // 属性监听器
  observers: {
    lyric(lyc) {
      console.log(lyc)
      if(lyc === '暂无歌词'){
        this.setData({
          lyricList: [
            {
              lyc,
              time: 0
            }
          ],
          nowLyricIndex: -1
        })
      }else{
        // 解析歌词
      this._parseLyric(lyc)
      }
      
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lyricList: [],
    nowLyricIndex: 0,  // 当前选中歌词的下标
    scrollTop: 0  //滚动条滚动的高度
  },

  // 组件的生命周期函数
  lifetimes: {
    ready() {
      // 对px和rpx进行换算
      wx.getSystemInfo({
        success: (result) => {
          console.log(result);
          // 求出1rpx的大小
          lyricHeight = result.screenWidth / 750 * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 解析歌词
    _parseLyric(lyricString){
      // 根据换行分割每一句歌词
      let line = lyricString.split('\n')
      console.log(line);
      // 作为存储时间和歌词的对象数组
      let _lyricList = []
      // 循环解析数组
      line.forEach((elem) => {
        // 根据正则表达式取出时间
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time != null){
          console.log(time);
          // 根据时间分割取出歌词
          let lyc = elem.split(time)[1]
          // 将时间转化为数组
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          console.log(timeReg);
          // 将时间转为为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lyricList.push({
            lyc,
            time: time2Seconds
          })
        }
      })
      console.log(_lyricList);
      
      // 歌词列表
      this.setData({
        lyricList: _lyricList
      })

      // 取出时间
      
    },

    update(currentTime) {
      console.log(currentTime);

      let lyricList = this.data.lyricList
      // 根据当前的时间和歌词的时间进行匹配
      if(lyricList.length === 0){
        // 没有歌词 
        return
      }
      // 当当前时间大于歌词最后有时间的歌词时间
      if(currentTime > lyricList[lyricList.length - 1].time){
        if(this.data.nowLyricIndex != -1){
          // 设置为-1，不高亮显示，并且滑到最后
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lyricList.length * lyricHeight
          })
        }
      }

      // 有歌词，循环遍历
      for(let i = 0; i < lyricList.length; i++){
        // 判断当前时间跟歌词时间， 来高亮显示当前歌词
        if(currentTime <= lyricList[i].time){
          // 设置当前选中歌词的索引
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })

          break
        }
      }
    }
  }
})
