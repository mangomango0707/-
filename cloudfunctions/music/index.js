// 云函数入口文件
const cloud = require('wx-server-sdk')

// 引入tcb-router
const TcbRouter = require('tcb-router')

// 引入axios来发送请求
const axios = require('axios')
// 基本请求路径
const BASE_URL = 'https://apis.imooc.com'
// 个人码
const ICODE = 'icode=7DCCFAB20B6B4C54'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const app = new TcbRouter({event})
  
  // 获取歌单数据
  app.router('playlist', async(ctx, next) => {
    // 查询歌单数据
    ctx.body = await cloud.database().collection('playlist')
    .skip(event.start).limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then((res) => {
      return res
    });
  })

  // 获取歌曲列表信息调用
  app.router('musiclist', async(ctx, next) => {
    const res = await axios.get(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&${ICODE}`)
    ctx.body = res.data
  })

  return app.serve();

}