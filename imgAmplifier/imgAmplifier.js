// //获取指定父元素的某个类的子元素
// var gbc = function(tparent, tclass) {
//     var allClass = tparent.getElmentsByTagName('*')
//     var results = []
//     for (var i = 0; i < allClass.length; i++) {
//         if (allClass[i].className === tclass) {
//             results.push(allClass[i])
//         }
//     }
//     return results
// }
var log = function() {
    console.log.apply(console, arguments)
}
//选取各部分
var Amp = function() {
    //获取最外层
    this.sbp = document.querySelector('#show_bigger_pic'),
    this.smallDiv = this.sbp.querySelector('.small_pic_div'),
    this.small = this.smallDiv.querySelector('img'),
    this.bigDiv = this.sbp.querySelector('.big_pic_div'),
    this.big = this.bigDiv.querySelector('img'),
    this.c = this.smallDiv.querySelector('.cover'),
    this.fs = this.smallDiv.querySelector('.float_span'),

    this.btn = true,
    this.smallW,
    this.smallH,
    this.bigW,
    this.bigH
}
Amp.prototype.mouseOver = function() {
    this.c.addEventListener('mouseover', function(){
        this.fs.style.display = 'block'
        this.bigDiv.style.display = 'block'
        this.c.style.cursor = 'pointer'
        if (this.btn) {
            this.smallW = this.small.offsetWidth
            this.smallH = this.small.offsetHeight
            this.bigW = this.big.offsetWidth
            this.bigH = this.big.offsetHeight

            this.smallDivW = this.smallDiv.offsetWidth
            this.smallDivH = this.smallDiv.offsetHeight
            // log(this.smallW, this.bigW)
            //计算滑动层的宽高
            this.fsW = Math.ceil(this.smallW / this.bigW * this.smallDivW)
            this.fsH = Math.ceil(this.smallH / this.bigH * this.smallDivH)
            this.fs.style.width = this.fsW + 'px'
            this.fs.style.height = this.fsH + 'px'
            //获取一次之后就不再改变
            btn = false
        }
    }.bind(this))
}
Amp.prototype.mouseOut = function() {
    this.c.addEventListener('mouseout', function(){
        this.fs.style.display = 'none'
        this.bigDiv.style.display = 'none'
    }.bind(this))
}
Amp.prototype.mouseMove = function() {
    this.c.addEventListener('mousemove', function(e){
        // log(e.clientX, this.small.offsetLeft)
        //计算fs在smallDiv里面的位置
        var left = e.clientX - this.sbp.offsetLeft - this.fs.offsetWidth / 2
        var top = e.clientY - this.sbp.offsetTop - this.fs.offsetHeight / 2
        //如果到了边缘
        if (left < 0) {
            left = 0
        } else if (left > this.c.offsetWidth - this.fs.offsetWidth) {
            left = this.c.offsetWidth - this.fs.offsetWidth
        }
        if (top < 0) {
            top = 0
        } else if (top > this.c.offsetHeight - this.fs.offsetHeight) {
            top = this.c.offsetHeight - this.fs.offsetHeight
        }
        this.fs.style.left = left + 'px'
        this.fs.style.top = top + 'px'
        this.big.style.left = -(left * (this.big.offsetWidth / this.c.offsetWidth)) + 'px'
        this.big.style.top = -(top * (this.big.offsetHeight / this.c.offsetHeight)) + 'px'
        // log(this.big.style.top)
    }.bind(this))
}

var __main = function() {
    var amp = new Amp()
    amp.mouseOver()
    amp.mouseOut()
    amp.mouseMove()
}
__main()
