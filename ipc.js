/**
 * 假装通讯
 */
const fs = require('fs')
const path = require('path')
const fsName = path.resolve(__dirname, './ipc.json')

exports.default = {
    regist() {
        // 客户端,注册

        3001
    },
    emit(data) {
        // socket沟通
        global.socketProcess.send(JSON.stringify(data))
        // 轮训沟通
        // fs.writeFileSync(fsName, JSON.stringify(data), 'utf-8')
    },
    on(cb) {
        fs.watchFile(fsName, function (curr, prev) {
            let str = fs.readFileSync(fsName, 'utf-8')
            cb(JSON.parse(str))
        });
    }
}