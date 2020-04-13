const net = require('net')
const server = net.createServer()
const conns = new Set()

server.on('connection', (conn) => {
    conns.add(conn)

    conn.on('close', (conn) => {
        conns.delete(conn)
    })
})

server.listen(3001)