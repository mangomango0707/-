// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist: {
      type: Object
    }
  },

  // 监听器
  observers: {
    // 监听playlist中item的playCount数值
    ['playlist.playCount'](count) {
      // console.log(count);
      // console.log(this._tranNumber(count, 2));
      this.setData({
        _count: this._tranNumber(count, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 歌单在听数量
    _count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _tranNumber(num, point){
      // 先将number转化为String类型进行切割
      let numStr = num.toString().split('.')[0];
      if(numStr.length < 6){
        return num;
      }else if(numStr.length >= 6 && numStr.length <= 8){
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point);
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
      }else if(numStr.length > 8){
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point);
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿';
      }
    }
  }
})
