const { spawn, fork } = require('child_process')
const { set } = require('./model/utils')
const path = require('path')

// 监听全局键盘事件
const pythonProcess = spawn('/usr/bin/python3', [path.join(__dirname, './listener.py')])


pythonProcess.stdout.on('data', (data) => {
    set(data + '')
})

// 通讯,沟通其他模块
// const socketProcess = spawn('node', [path.join(__dirname, './socket.js')])
const socketProcess = fork(path.join(__dirname, './socket.js'))
global.socketProcess = socketProcess
