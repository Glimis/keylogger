/**
 * 假装通讯
 * 这一层,会在两个程序中运行,不属于共享内存,不能直接通讯
 */
const path = require('path')
const fs = require('fs')
const fsName = path.resolve(__dirname, './ipc.json')
const net = require('net')


exports.default = {
    emit(data) {
        // 轮训沟通
        // fs.writeFileSync(fsName, JSON.stringify(data), 'utf-8')
        // socket沟通
        if (global.socketProcess) {
            global.socketProcess.send(data);
        }
    },
    // 此处只需要一次,需要判断,此处略
    on(cb) {
        // 注册监听
        // fs.watchFile(fsName, function (curr, prev) {
        //     let str = fs.readFileSync(fsName, 'utf-8')
        //     cb(JSON.parse(str))
        // })

        // 对于socket客户端,需要创建连接
        let client = new net.Socket()
        client.connect(3001, 'localhost')
        client.setEncoding('utf8')
        client.on('data', (chunk) => {
            try {
                cb(JSON.parse(chunk))
            } catch (e) {

            }
        })
        client.on('error', (e) => {
            console.log(e);
        })
        client.on('close', (e) => {
            console.log(e);
        })
    }
}