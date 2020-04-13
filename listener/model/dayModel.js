const fs = require('fs')
const path = require('path')

/**
 * 天表
 * 一天代表一个文件
 * 数组结构,内容为分的数据 【为分表的集合】
 *
 */


class dayModel {
    constructor(date) {
        this.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay() + 1}`
        // 根据时间,确定文件
        this.path = path.resolve(__dirname, `../../data/${this.date}`)
        // 如果文件存在,初始化数据
        if (fs.existsSync(this.path)) {
            let data = fs.readFileSync(this.path, 'utf-8')
            try {
                this.value = JSON.parse(data)
            } catch (e) {
                this.value = []
            }
        } else {
            this.value = []
        }
    }

    push(minModel) {
        if (minModel && this.isSome(minModel.date)) {
            this.value.push(minModel)
            this.flush()
        }
    }

    // 是否为当天数据
    isSome(date) {
        if (date) {
            return this.date == `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDay() + 1}`
        }
    }

    // 刷新”数据库“
    flush() {
        // 保存元数据
        fs.writeFileSync(this.path, JSON.stringify(this.value), 'utf-8')
        // 保存统计数据
        fs.writeFileSync(this.path + '-c', JSON.stringify(getCount(this.value)), 'utf-8')
    }
}

function getCount(minModels) {
    return minModels.map((minModel) => {
        let c = 0
        for (let key in minModel.mapping) {
            c += minModel.mapping[key]
        }
        return {
            x: minModel.date,
            y: c
        }
    })
}


exports.default = dayModel