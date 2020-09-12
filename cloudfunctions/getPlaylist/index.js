// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 对云数据库进行初始化
const db = cloud.database()

// 引入axios发送请求
const axios = require('axios')

// 获取音乐歌单接口
const URL = 'https://apis.imooc.com/personalized?icode=7DCCFAB20B6B4C54'

// 数据条数最大限制
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {

  // 获取当前歌单集合的数据
  // 有数据条数限制
  // const list = await db.collection('playlist').get();

  const countResult = await db.collection('playlist').count();
  console.log(countResult);
  const total = countResult.total;
  // 几批数据
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 异步任务数组
  const tasks = []
  // 循环数据批取数据
  for(let i = 0; i < batchTimes; i++){
    // 异步
    let promise = db.collection('playlist').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    // 将每次异步任务存进异步任务数组中
    tasks.push(promise)
  }
  // 声明一个变量存放数据
  let list = {
    data: []
  }
  // 处理异步任务数组
  if(tasks.length){
    // Promise.all处理所有异步任务，全部处理完再下一步，reduce进行累加操作
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  

  // 发送请求
  const {data} = await axios.get(URL)
  // console.log(data);
  if(data.code >= 1000){
    console.log(data.msg);
  }
  // 歌单数据
  const playlist = data.result;

  // 去重
  // 声明一个存储不重复的歌单新数据
  const newData = []
  for(let i = 0; i < playlist.length; i++){
    // 判断重复数据的标识,true代表无重复数据，false代表有重复数据
    let flag = true;
    for(let j = 0; j < list.data.length; j++){
      if(playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }

    if(flag){
      newData.push(playlist[i])
    }
  }

  // 将歌单数据存入云数据库
  if(newData.length){
    for(let i = 0; i < newData.length; i++){
      await db.collection('playlist').add({
        data: {
          ...newData[i],
          createTime: db.serverDate()
        }
      }).then((res) => {
        console.log("插入成功");
      }).catch((err) => {
        console.log("插入失败");
      })
    }
  }
  
  return newData.length;
  
}