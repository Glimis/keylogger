const net = require('net')
const server = net.createServer()
const conns = new Set()

server.on('connection', (conn) => {
    conns.add(conn)
    console.log('socket通讯终端', '用于联系两个node')

    conn.on('close', (conn) => {
        conns.delete(conn)
        console.log('socket通讯终端', '用于联系两个node')
    })
})


process.on('message', (data) => {


    for (var conn of conns) {
        conn.write(JSON.stringify(data))
    }
})
server.listen(3001)