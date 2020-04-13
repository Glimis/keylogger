var ws = require("nodejs-websocket")
var ipc = require("../ipc").default

const conns = new Set()

ipc.on(({ x, y }) => {
    for (var conn of conns) { // 遍历Set
        conn.send(JSON.stringify([x, y]))
    }
})

ws.createServer(function (conn) {
    conns.add(conn)

    // 再次注册,面临删除的问题
    // ipc.on((data) => {
    //     conn.send(JSON.stringify(data))
    // })

    conn.on("close", function (code, reason) {
        conns.delete(conn)
        console.log("关闭连接")
    })
    conn.on("error", function (code, reason) {
        console.log("异常关闭")
    })
}).listen(3000)