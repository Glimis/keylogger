const minModel = require('./minModel').default
const dayModel = require('./dayModel').default

let _minModel;

// 初始化天数据
let _dayModel = new dayModel(new Date());

exports.set = function (val) {
    // 获取当前时间
    let now = new Date()
    // 判断与天是否相同
    if (!_dayModel.isSome(now)) {
        // 修改为第二天
        _dayModel = new dayModel(now)
    }

    // 判断分钟
    if (!_minModel || !_minModel.isSome(now)) {
        _dayModel.push(_minModel)
        _minModel = new minModel(now)
    }
    _minModel.set(val)
}