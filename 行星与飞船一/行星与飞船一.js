var log = function(){console.log.apply(console, arguments)}
//建立飞船对象
var Airship = function(id, pathId) {
    this.id = id,
    this.path = pathId,
    this.state = 'stop',
    this.deg = 0,
    this.power = 100,
    this.speed = 30,
    this.chargeSpeed = 4,
    this.dischargeSpeed = 6,
    this.shipDiv,
    this.powerDiv
}
//创建飞船
Airship.prototype.create = function() {
    let id = this.id,
        pid = this.path
    var t = `<div class="ship" data-ship=${id}>
                <div class="power"><span>100%</span></div>
            </div>`
    var path = $(`[data-path=${pid}]`)
    path.append(t)
    this.shipDiv = $(`[data-ship=${id}]`)
    this.powerDiv = $('.power', this.shipDiv)
    //把信息在控制台list中显示出来
    consoler(`创建飞船${id}号`,'green')
}
//飞船动力系统,包括飞行和停止和销毁
Airship.prototype.dynamicSystem = function() {
    //用一个参数self把this传进去,和bind(this)的效果相同
    var self = this
    var fly = function() {
        //剩下的能量还能飞多久(单位是s)，以及开始的角度，和这段时间能飞多少角度
        //注意这里不能在step里面直接用self.deg，否则无法在动画的过程中同步self.deg
        var time = self.power / self.dischargeSpeed
        var deg = self.deg
        var degEnd = self.deg + self.speed * time
        self.shipDiv.animate({xx: 0},{
            // 注意，这里animate不支持transform,不可直接用，但是可以用step函数实现
            step: function(n, fx) {
                // 这里指定了start，前面的xx就和这里无关了，随便写个数就好
                fx.start = deg
                fx.end = degEnd
                self.deg = n % 360
                // log(n)
                $(this).css('transform', `rotate(${n}deg)`)
            },
            duration : time * 1000
        })
    }
    var stop = function() {
        self.shipDiv.stop()
    }
    var destroy = function() {
        self.shipDiv.stop()
        self.powerDiv.stop()
        self.shipDiv.remove()
    }
    return {
        fly: fly,
        stop: stop,
        destroy: destroy
    }
}
//飞船能量系统，包括充能和放能
Airship.prototype.powerSystem = function() {
    var self = this
    var power = self.power
    var powerCharge = function(pStart, pEnd) {
        var time = Math.abs(pEnd - pStart) / self.dischargeSpeed
        self.powerDiv.animate({x: 0}, {
            step: function(n, fx) {
                fx.start = pStart
                fx.end = pEnd
                self.power = n
                //这里的this指的是调用动画的对象，即self.powerDiv
                $(this).css('width', `${n}%`)
                let m = Math.floor(n)
                $('span', this).text(`${m}%`)
                if (n > 50) {
                    $(this).css('background-color', `green`)
                } else if (n > 25) {
                    $(this).css('background-color', `orange`)
                } else {
                    $(this).css('background-color', `red`)
                }
            },
            //这里定义结束后执行的函数，如果能量为0，则飞船状态改为stop
            complete: function() {
                if (self.power === 0) {
                    self.stateManager().changeState('stop')
                }
            },
            duration : time * 1000,
        })
    }
    var discharge = function() {
        self.powerDiv.stop()
        self.powerSystem().powerCharge(power, 0)
    }
    var charge = function() {
        self.powerDiv.stop()
        self.powerSystem().powerCharge(power, 100)
    }
    return {
        powerCharge : powerCharge,
        discharge : discharge,
        charge : charge
    }
}
//不同状态时的相应行为
Airship.prototype.stateManager = function() {
    var self = this
    //不同状态时的行为函数
    var states = {
        flyState : function() {
            if (self.state !== 'destroy') {
                self.state = 'fly'
                self.dynamicSystem().fly()
                self.powerSystem().discharge()
                consoler(`${self.id}号飞船起飞了,耗能率每秒${self.dischargeSpeed}%~`)
            }
        },
        stopState : function() {
            if (self.state !== 'destroy') {
                self.state = 'stop'
                self.dynamicSystem().stop()
                self.powerSystem().charge()
                consoler(`${self.id}号飞船停止了,充能率每秒${self.chargeSpeed}%~`)
            }

        },
        destroyState : function() {
            self.state = 'destroy'
            self.dynamicSystem().destroy()
            consoler(`${self.id}号飞船已销毁~`,'red')
        }
    }
    var changeState = function(state) {
        if (state !== self.state) {
            states[`${state}State`]()
        }
    }
    return {changeState : changeState}
}
//接受信号系统，用于通过信号做出相应行为
Airship.prototype.getMessage = function(id, msg) {
    var self = this
    if (id === self.path) {
        switch (msg) {
            case 'fly':
            case 'stop':
            case 'destroy':
                self.stateManager().changeState(msg)
                break;
            default:
                alert("invalid command")
        }
    }
}

// var test1 = function() {
//     return {
//         t1: function() {
//             //这里返回的this是整个return的对象
//             log('t1的this是',this)
//         },
//         t2: function() {
//             log('t2的this是',this)
//         }
//     }
// }
//指挥官对象,参数为要发送的对象
var Commander = function(obj) {
    this.obj = obj
}
Commander.prototype.commandManager = function() {
    var self = this
    $('button').hover(function(e){
        $(e.target).addClass('hover')
    },function(e){
        $(e.target).removeClass('hover')
    })
    $('control').on('click', 'button', function(e){
        var t = $(e.target)
        var msg = t.attr('name')
        var pathId = t.parent().data('con')
        var msgObj = {
            message : msg,
            pathId : pathId
        }
        //如果点击的是create,则不能在这个轨道再创建，按钮变为不可点击,这里要改变hover的
        //样式的话，不能用伪类
        if (msg === 'create') {
            t.attr('disabled', 'true').removeClass('hover')
        } else if (msg === 'destroy') {
            //如果点击销毁，则创建按钮可点击，这里不能用attr将disabled属性改为false,应删除此属性
            t.siblings('button[name="create"]').removeAttr('disabled').removeClass('hover')
        }
        self.obj.receive(msgObj).sendMessage()
    })
    consoler(`准备就绪,请下达指令`)
}


//mediator对象，作用是接受指挥官的信号并延迟一秒发送，但是会有丢包，并且储存所有飞船的信息
var Mediator = function() {
    this.shipData = []
}
Mediator.prototype.receive = function(msg) {
    var self = this,
        pid = msg.pathId,
        ms = msg.message
    var newShip = function() {
        var length = self.shipData.length,
            newId = (length === 0) ? 1 : (self.shipData[length - 1].id + 1),
            newOne = new Airship(newId, pid)
        newOne.create()
        self.shipData.push(newOne)
    }
    var sendMessage = function() {
        setTimeout(function(){
            var success = Math.random() > 0.3 ? true : false
            if (success) {
                if (ms === 'create') {
                    //同级函数可以直接调用
                    newShip()
                    log(self.shipData)
                } else {
                    //向所有的飞船发送命令
                    for (var i = 0; i < self.shipData.length; i++) {
                        self.shipData[i].getMessage(pid, ms)
                    }
                    log(self.shipData)
                }
            } else {
                consoler(`信号发送失败！`, 'red')
            }
        },1000)
    }
    return {
        newShip : newShip,
        sendMessage : sendMessage
    }
}
// //动画工具,用于集体处理飞船的各个行为
// var animater = {
//     // create : function(id) {
//     //     // log('create')
//     //     var t = `<div class="ship-${id}" data-ship=${id}>
//     //                 <span>100%</span>
//     //                 <div class="power">
//     //                 </div>
//     //             </div>`
//     //     var path = $($(`[data-path=${id}]`)[0])
//     //     path.append(t)
//     //     //把信息在控制台list中显示出来
//     //     consoler('创建飞船')
//     // },
//     //// 参数为：id，开始和结束的角度，速度(每秒飞行的度数)
//     // fly : function(id, degStart, degEnd, rate) {
//     //     var ship = $(`[data-ship=${id}]`)
//     //     //时间
//     //     var time = (degEnd - degStart) / rate * 1000
//     //     // 注意，这里animate不支持transform,不可直接用，但是可以用step函数实现
//     //     ship.animate({xx: 0},{
//     //         step: function(n, fx) {
//     //             // 这里指定了start，前面的xx就和这里无关了，随便写个数就好
//     //             fx.start = degStart
//     //             fx.end = degEnd
//     //             $(this).css('transform', `rotate(${n}deg)`)
//     //         },
//     //         duration : time
//     //     })
//     // },
//     // stop : function(id) {
//     //     var ship = $(`[data-ship=${id}]`)
//     //     ship.stop()
//     // },
//     // destroy : function(id) {
//     //     var ship = $(`[data-ship=${id}]`)
//     //     ship.remove()
//     // },
//     //放电相关，power为当前能量，rate为放电速度
//     discharge : function(id, power, rate) {
//         //在ship中选择对应的能量和数值
//         var ship = $(`[data-ship=${id}]`)
//         var time = power / rate * 1000
//         ship.animate({xx: 0}, {
//             step: function(n, fx) {
//                 fx.start = power
//                 fx.end = 0
//                 $('.power', this).css('width', `${n}%`)
//                 let m = Math.floor(n)
//                 $('span', this).text(`${m}%`)
//             },
//             duration : time
//         })
//     },
//     //充电相关
//     charge : function(id, power, rate) {
//         var ship = $(`[data-ship=${id}]`)
//         var time = (100 - power) / rate *1000
//         ship.animate({x: 0}, {
//             step: function(n, fx) {
//                 fx.start = power
//                 fx.end = 100
//                 $('.power', this).css('width', `${n}%`)
//                 let m = Math.floor(n)
//                 $('span', this).text(`${m}%`)
//             },
//             duration: time
//         })
//     }
// }

//控制台工具
var consoler = function(msg, color='blue') {
    var t = `<li style='color: ${color}'><i class="fa fa-volume-up"></i> ${msg}</li>`
    $('.list').find('ul').prepend(t)
}

//生成星空,把屏幕分成八块，每块里面随机分3-10个
var stars = function() {
    var divide = function() {
        for (var i = 0; i < 2; i++) {
            for (var j = 0; j < 4; j++) {
                let minLeft = 25 * j,
                    maxLeft = 25 * (j + 1),
                    minTop = 50 * i,
                    maxTop = 50 * (i + 1)
                eachArea(minLeft, maxLeft, minTop, maxTop)
            }
        }
    }
    var eachArea = function(minLeft, maxLeft, minTop, maxTop) {
        let min = 3, max = 10,
            num = Math.floor(Math.random() * (max - min) + min)
        for (let i = 0; i < num; i++) {
            var starLeft = Math.floor(Math.random() * (maxLeft - minLeft) + minLeft),
                starTop = Math.floor(Math.random() * (maxTop - minTop) + minTop),
                radius = Math.floor(Math.random() * 3 + 1)
            t = `<star style="width:${radius}px; height:${radius}px; top:${starTop}%; left:${starLeft}%"></star>`
            $('stars').append(t)
        }
    }
    var shinning = function() {
        var out = setInterval(function(){
            let num = Math.floor(Math.random() * ($('stars').children().length)),
                star = $($('stars').children()[num])
                star.animate({x:0},{
                    step : function(n, fx) {
                        $(this).css('background-color', 'transparent')
                    },
                    complete : function() {
                        $(this).css('background-color', 'white')
                    },
                    duration : 1000
                })
        },3000)
    }
    return {
        divide : divide,
        shinning : shinning
    }
}
//主线程
window.onload = function() {
    stars().divide()
    stars().shinning()
    var media = new Mediator()
    var commander = new Commander(media)
    commander.commandManager()
}
// test()
