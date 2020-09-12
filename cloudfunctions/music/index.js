// 云函数入口文件
const cloud = require('wx-server-sdk')

// 引入tcb-router
const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  const app = new TcbRouter({event})
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

  return app.serve();

}