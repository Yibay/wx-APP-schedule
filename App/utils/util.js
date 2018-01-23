// 格式化时间 字符串 如：2017/12/29 17:51:35
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 格式化数字 不足2位，补一个0
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 复制 对象属性
const assign = (obj, sourceObj) => {
  obj = Object(obj);
  Reflect.ownKeys(sourceObj).forEach(key => {
    obj[key] = sourceObj[key];
  });
  return obj;
}

// 过滤掉，某些属性 (不改变原对象)
const omit = (obj, omitKeysArray) => {
  var new_obj = assign({}, obj);
  for (let key of omitKeysArray){
    delete new_obj[key];
  }
  return new_obj;
}

// 暴露接口
module.exports = {
  formatTime: formatTime,
  formatNumber: formatNumber,
  assign: assign,
  omit
}
