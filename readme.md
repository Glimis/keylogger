## 代码记录器
科普教程

### 功能
1. 记录每天键盘次数
2. 通过chart进行展示
3. 实时更新

可以判断每天自己打了多少字,已验证,写程序最好先设计在下手 -。-

### 包含模块

1. listener

    监听键盘事件

2. static

    前端显示页面

3. websocket

    前端,实时刷新

4. koa

    前端,获取历史数据

## 技术点
1. 如何记录键盘事件

    在浏览器中的键盘事件,比如input中,指的是在input激活时,监听的键盘事件,在node中的监听事件,指的是node程序下的监听事件,此处`指全局监听`

    `全局监听`指不管在那个程序中,只要输入了键盘指令,都可以监听到,而这个需求就是`键盘记录收集`,往难听的时候,就是侵犯隐私 【也可以盗号,因为还可以监听鼠标,这就是为什么虚拟乱序键盘可以防盗号】,所以作为操作系统,对于这一块的限制都是很严格的 【mac 的输入监视/辅助功能】,node没有相关的底层库,所以只能依靠其他语言或git上相关的库

    注:全局组合自定义事件,如果操作系统没有的话,跟这个实现的思路差不多
### node - iohook
基于c提供给node,相关的全局监听底层库,问题是对mac的兼容性略差 【指触发一次,而且会阻止案件响应】,坐等完善

### python - pynput
java没有底层库,调用的是dll,而python 有比较完善的 pynput,此处使用python实现,本身要求只是获取键盘的按键名即可,代码很简单

```python
def on_press(key):
    if hasattr(key, 'char'):
        print(key.char, end='')
    else:
        print(key, end='')


with keyboard.Listener(
        on_press=on_press) as listener:
    listener.join()
```

2. python与node如何交互 【进程通讯 - 父子进程】

    通过`spawn`可以调用终端,通过`stdout.on('data')`可以获取到对方【python】print的数据,但监听事件是一个死循环 【监听嘛】,不做处理是获取不到的,这里涉及的就是程序通讯

    比如两个微服务之间,如何进行通讯,这里需要的就是协议

    比如ipc,或者说在python中监听到事件后,将其写在内存,文件或数据库中,node程序读取这块内存或文件即可,这样两个程序就彻底解耦了,再不行就http/TCP,web最熟悉的协议,也是可以的 【跨机器执行,集群的基础】

    此处选择`stdout.on('data')`【利用父子进程,本身也算是ipc】,on本身就是监听的意思,指的是对方【python】输出的数据【即print】,只是通常会首先放到缓存中【类似于tcp】,所以在python中,使用`sys.stdout.flush()`即可实现这两个程序的通讯

```python
def on_press(key):
    if hasattr(key, 'char'):
        print(key.char, end='')
    else:
        print(key, end='')
    sys.stdout.flush()


with keyboard.Listener(
        on_press=on_press) as listener:
    listener.join()
```

3. 模型

    模型用来屏蔽数据库存储与业务,假设是关系型数据库,这里就需要将每个案件的时间,键名都存入到数据库中,那模型只有一个
    ```JavaScript
    {
        date:'',//触发事件
        key:''//键盘信息 ,应该包含组合按键,此处指实现单按键
        // 。。。 
    }
    ```

    这样就可以实现任意要求,但是太占空间了,我们的需求精确到分即可,所以
    ```JavaScript
        date:'',//触发事件
        mapping:{} //每个键盘执行的次数
    ```
4. 数据存储

    fs,直接读取文件,这么小的项目,用毛线数据库 - -

    那这里就有个问题,一个文件还是多个文件,多文件,不解释啊,一个文件的话,之后做图标时,内存可能会炸掉的

    那一个文件对应一个模型,这个模型就是天【就是分的集合】,配合业务就很明显了

    ```javascript
    // 刷新”数据库“
    flush() {
        // 保存元数据
        fs.writeFileSync(this.path, JSON.stringify(this.value), 'utf-8')
        // 保存统计数据
        fs.writeFileSync(this.path + '-c', JSON.stringify(getCount(this.value)), 'utf-8')
    }
    ```
5. 模型工具

    用以简化模型与业务的交互

    调用模型时,核心的需求就一个,存入键盘数据,而业务上并不关心其他信息,此时,就需要一个模型组合的模块,也就是utils,用以辅助完成模型与业务的交接,业务很简单,根据保存数据的日期,选择文件进行修改,根据时间【分钟】,确认是否置入分钟集合
    ```javascript
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
    ```

自此,记录每天键盘次数已经完成

6. chart图选型

    echart,无所谓,看个人爱好,略

自此,展示记录已完成

7. 实时更新 - 增量更新与更新更新

    实时更新可以是全量,也可以是增量,比如每分钟刷新一次页面,就是上古时期实时刷新的方式,有了ajax,每分钟获取一次ajax初始化信息,也可以更新,另一种友好的方式,则是只返回单位时间内的增量数据,以减少http数据量 【需要将写入服务于node的http服务联系起来】
    
    当然,轮训的实时性要差一些,现在的方式就是websocket 【此处无视兼容性】

    当然,有个问题是websocket如何获取内部程序之间的通知,这里将这种通知,封装为ipc
    ```javascript
    const conns = new Set()
    ipc.on(({ x, y }) => {
        for (var conn of conns) { // 遍历Set
            conn.send(JSON.stringify([x, y]))
        }
    })

    ws.createServer(function (conn) {
        conns.add(conn)

        // 这里的注册,是监听/连接,主需要注册一次即可
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
    ```
8. node服务通讯 【进程通讯 - 兄弟进程】

    这里将监听键盘当做一个进程启动,websocket服务当成另一个服务启动,此时,又出现了服务通讯的问题
    
    最简单的方式,则是将他们改成父子进程的方式 【基于同一个管理进程或者说主进程进行启动,主进程父子管理各个子进程的通讯,启动,关闭等,大多数程序都是这么设计,比如浏览器,比如兄弟组件通信】

    此处基于共享文件进行简易的通讯,使用的api是fs.watchFile,而这个接口说白了就是setTimeout 【所以,浏览器与后台的通讯,其实也是这么回事,两个不相关的兄弟进程,要么轮训,要么建立连接】

    ```javascript
    exports.default = {
        emit(data) {
            // 轮训沟通
            fs.writeFileSync(fsName, JSON.stringify(data), 'utf-8')
        },
        // 此处只需要一次,需要判断,此处略
        on(cb) {
            // 注册监听
            fs.watchFile(fsName, function (curr, prev) {
                let str = fs.readFileSync(fsName, 'utf-8')
                cb(JSON.parse(str))
            })
        }
    }
    ```
9. node服务通讯 -- 实时性VS性能

    在input中,`input事件`与`onchange事件`有什么区别?细节有很多,主要一点就一个,实时性,当用户按下数据,改变时,input就会立刻响应,响应级别类似于键盘,而onchange,就像缓存一样,只有丢失焦点时,才会触发

    轮序与socket通知,本身也可以用这种方式来区分,在9.中,使用`fs.watchFile`,在默认情况下,有5s左右的延迟【可设置】,换而言之,实时性略差,而轮训若想高实时性,性能就会很差【1s轮训】,此时,就需要使用连接的方式

    此处使用socket进行通讯,即在`listener`中,增加一个子进程`socket`,当其他程序通过socket注册时,就会进行通知

    注:`socket`会独立使用一个调用栈【死循环】,所以必然是一个单独的进程 【将通讯模块单独独立出来,是一种常见的方式,比如chrome的网络进程,当然,chrome是为了解耦】

    ```javascript
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
    ```
10. 稳定性与内存溢出

    死循环,最忌讳`throw`,这个会让整个程序断掉,所以需要对所有socket内容增加`try/catch`防止意外

    当然,这些意外都是需要尽可能被避免的,所以需要错误收集,以及错误处理 【比如socket传输数据合并】

    至于溢出,则是特指死链接剔除 【对于中断的链接记得删掉】
11. websocket重连

    websocket的经典问题,断了怎么办,这里并不是说重连就行了,而是重连后,中断之间的业务怎么办?此处通过断开后,重连传递断开时间,以在重连后,获取初始化数据

    wating
12. 实时更新与历史记录

    websocket可以自定义事件,完成历史记录的获取,但另一种方式是根据http进行获取,只有试试数据走websocket 【或者websocket传递http地址】,目的是走cdn,以优化加速,也就是增量走websocket,用户主动触发的历史记录,走http

    wating

13. 管理与配置

    当前程序需要4个端口
    
    一个前端展示端口,使用`http-server`打开,默认8080

    一个websocket端口,默认`3000`

    一个主进程监听端口,默认`3001`

    一个历史数据获取端口,默认`3002`

    端口关系到运维,反而与开发关系不大,尽可能的统一管理 【运维设置】

    另一个则是程序启动方案,之所以开启分散成这么多进程,也是为了能面对多种开启的方式

    比如,只需要收集记录,那次是,只需要打开主进程即可,只需要查看历史记录则同理
    
