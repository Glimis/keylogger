const ipc = require('../../ipc').default
/**
 * 分钟表
 * 每分钟一条数据
 */


class minModel {
    constructor(day) {
        // 根据当前时间,创建模型
        this.date = new Date()
        // 初始化记录
        this.mapping = {

        }
        this.count = 0
    }

    set(val) {
        this.mapping[val] = this.mapping[val] || 0
        this.mapping[val]++
        this.count++
        ipc.emit({
            x: this.date,
            y: this.count
        })
    }

    isSome(date) {
        return date.getTime() - this.date < 60 * 1000 && this.date.getMinutes() == date.getMinutes()
    }
}


exports.default = minModel