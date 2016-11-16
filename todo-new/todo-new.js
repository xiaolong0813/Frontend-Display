var log = function(){console.log.apply(console,arguments)}
//声明分类，子分类，项目的数组，以下面的格式：

// [{"id":0,"name":"默认分类","child":[0]},
// {"id":1,"name":"父亲一","child":[1,2]},
//
// [{"id":0,"pid":0,"name":"默认子分类","child":[-1,0,1]},
// {"id":1,"pid":"1","name":"父一子一","child":[2,3]},

//
// [{"finish":true,"name":"使用说明","date":"2015-06-05","content":"本应用为离线应用","pid":0,"id":-1,},
// {"finish":true,"name":"sssss","date":"2016-11-17","content":"sssss","pid":"0","id":0},


var todo = {
    parentList : [
        {id: 0,name: '默认分类', child: [0]},
    ],
    childList : [
        {id: 0, pid: 0, name: '默认子分类', child: [0]}
    ],
    taskList : [
        {id: 0, pid: 0, name: '使用说明', content: '本应用是离线应用，数据将存储在本地硬盘',date:'2016-11-09', finish: true,}
    ],
}

//选择器
var $ = function(element) {
    if(element){
        return document.querySelector(element)
    }
    else {
        log( id + "is not exit")
    }
}
//对元素注册事件
var addEvent = function(element, event, listener) {
    if(element.addEventListener){
        element.addEventListener(event, listener);
    } else {
        log('failed to add event')
    }
}
//获取目前激活的child的id
var getActiveChild = function() {
    return $('.todo-item-container').dataset.activechild
}
//获取目前激活的task的id
var getActiveTask = function() {
    return $('.todo-task-list').dataset.activetask
}
//删去数组中元素的某个class，即clear
var clearClass = function(array, className) {
    Array.prototype.forEach.call(array, function(t){
        if (t.classList.contains(className)) {
            t.classList.remove(className)
        }
    })
}

// //模拟ajax与后端（即全局数组）进行交互
// var ajaxModel = function(url, data, callback) {
//
// }
//通过id在数组中寻找拥有此id的对象（不能直接把id当index，因为数据有可能存放在数据库里面，而id并不是一个人
//的，有可能是多个人共用，此时id就按照顺序排列。）
//以上是我开始的想法，后来想想，其实id就是每个在数组中的index值，这个无所谓有多少，放进去的时候就决定了
//他的位置，也就决定了index值，但是还是按照搜索id的方式写吧
var findById = function(id, list, index=false) {
    var found = false
    for (let i = 0; i < list.length; i++) {
        if (String(id) === String(list[i].id)) {
            if (!index) {
                return list[i]
            } else {
                // log(id, list[i].id)
                return i
            }
        }
    }
    return found
}


//绑定添加分类菜单的事件的按钮
var addParentBind = function() {
    $('.nav-btm').addEventListener('click', function(e){
        $('.cover').style.display = 'block'
        //把第一个置为选中
        $('#add-select').children[0].selected = 'selected'
    })
    addEvent($('#cancel'), 'click', function(){
        $('.cover').style.display = 'none'
    })
    addEvent($('#ok'), 'click', function(){
        var selValue = $('#add-select').value
        var inputValue = $('#add-input').value
        $('#add-input').value = ''
        if (!inputValue) {
            alert('请输入分类名称')
        } else {
            addParentChildData(selValue, inputValue)
            // log(selValue, inputValue)
            $('.cover').style.display = 'none'
        }
    })
    //经过的时候显示删除按钮
    addEvent($('.todo-item-container'), 'mouseover', function(e){
        var self = e.target
        var pa = self.closest('.todo-item-delete')
        if (pa) {
            let i = pa.querySelector('.fa-trash-o')
            if (i) {
                i.style.display = 'inline-block'
            }
        }
    })
    //移出鼠标的时候隐藏删除按钮
    addEvent($('.todo-item-container'), 'mouseout', function(e){
        var self = e.target
        var pa = self.closest('.todo-item-delete')
        if (pa) {
            let i = pa.querySelector('.fa-trash-o')
            if (i) {
                i.style.display = 'none'
            }
        }
    })
}
//添加分类的事件，并将数据存入全局变量（这里模拟后端数据）
var addParentChildData = function(selValue, inputValue) {
    //如果这是第一个，就增加主分类
    var selNUm = Number(selValue)
    // log(selNUm)
    if (selNUm === 0) {
        // 如果是新元素，那么新添加的元素的 id 就是最后一个元素的 id + 1，注意不能按照长度。
        var pLen = todo.parentList.length
        var newId = Number(todo.parentList[pLen - 1].id) + 1
        var newParent = {id: newId,name: inputValue,child:[]}
        //把新加入的父类导入parentList，注意，这里为了要模拟后端交互，用parentList里面的
        //数据进行前端页面的修改，假设后端返回的是newParent
        todo.parentList.push(newParent)
        // addParentFront(newParent)
        //更新nav界面
        rendNav()

    } else {
        var cLen = todo.childList.length
        var newId = Number(todo.childList[cLen - 1].id) + 1
        var newChild = {id: newId, pid: selNUm, name: inputValue, child: []}
        todo.childList.push(newChild)
        //同样，这里不能把pid当做index直接修改，应该根据id找到parentList里面相应对象，再修改这个对象
        var pCell = findById(selNUm, todo.parentList)
        pCell.child.push(newId)
        // addChildFront(newChild)
        //更新nav界面
        rendNav()
    }
    saveTodo()
}
//添加父类，根据模拟后端返回的数据进行前端页面的更新
var addParentFront = function(newParent) {
    //计算这个父类下的任务个数
    let sum = 0
    let childArray = newParent.child
    for (let i = 0; i < childArray.length; i++) {
        var taskNum = findById(childArray[i], todo.childList).child.length
        sum += taskNum
    }
    //添加父类页面的HTML部分
    var t = `<div class="todo-item" data-idofitem=${newParent.id}>
        <div class="todo-item-title todo-item-delete" data-idofchild=i${newParent.id}>
            <span class='title-span'>
            <i class="fa fa-folder-open"></i>  ${newParent.name}  (${sum})</span>
            <i class="fa fa-trash-o" style='display:none'></i>
        </div>
    </div>`
    $('.todo-item-container').insertAdjacentHTML('beforeend', t)
    //添加分类选择框HTML部分
    var s = `<option value=${newParent.id}>${newParent.name}</option>`
    $('#add-select').insertAdjacentHTML('beforeend', s)
}
//添加子分类，根据模拟后端返回的数据进行前端页面的更新
var addChildFront = function(newChild) {
    //计算这个子类下的任务个数
    let sum = newChild.child.length
    //子分类的模板字符串
    var t = `<div class="todo-item-child todo-item-delete" data-idofchild=${newChild.id}>
                <span class='child-span'>
                <i class="fa fa-file-o"></i>  ${newChild.name}  (${sum})</span>
                <i class="fa fa-trash-o" style='display:none'></i>
            </div>`
    var id = newChild.pid
    //寻找id为pid的目标父元素pa,插入目标字符串,并修改父元素标题中的子分类个数
    var pa = $(`[data-idofitem="${id}"]`)
    // log(id, pa)
    pa.insertAdjacentHTML('beforeend', t)
}
//点击nav内的元素时。修改container中的被激活的元素的data-activeChild，以方便识别在哪个子分类
//添加任务以及改变任务显示
var navActiveBind = function() {
    //给container绑定点击事件
    addEvent($('.todo-item-container'), 'click', function(e){
        var self = e.target
        var pa = self.closest('.todo-item-delete')
        if (pa) {
            activeOneChild(pa)
            //根据选取的id，即activechild的id，更新aside界面
            rendAside('all')
            //根据渲染后的aside中的任务列表，更新渲染main界面
            rendMain()
        }
    })
    addEvent($('#todo-item-all'), 'click', function(e){
        selectAll()
    })
}
//选取所有任务
var selectAll = function() {
    //如果选择的是所有任务，把activechild置为-1，更新界面
    activeOneChild($('#todo-item-all'))
    rendAside('all')
    rendMain()
    var tasks = $('.todo-task-list').querySelectorAll('.todo-task-list-content')
    var num = tasks.length
    var allSpan = $('#todo-item-all').querySelector('span')
    allSpan.innerHTML = num
}
//激活某个子分类
var activeOneChild = function(e) {
    //选择所有子分类和父分类
    var children = document.querySelectorAll('.todo-item-child')
    var parents = document.querySelectorAll('.todo-item-title')
    //删去其他元素的激活class，给这个加上class，并修改container中的data
    clearClass(children, 'child-active')
    clearClass(parents, 'child-active')
    e.classList.add('child-active')
    var cid = e.dataset.idofchild
    //这个作为激活的id赋予container的data
    $('.todo-item-container').setAttribute('data-activechild',cid)
}
//绑定删除parent或者child的事件
var deleteBind = function() {
    //声明要删除的pid，cid和tid
    var pid,cid
    addEvent($('.todo-item-container'), 'click', function(e){
        var s = e.target
        if (s.classList.contains('fa-trash-o')) {
            var pa = s.parentElement
            // s.parentElement.remove()
            if (pa.classList.contains('todo-item-title')) {
                pid = pa.parentElement.dataset.idofitem
                //根据要删除的pid处理后台数据，如果成功，就删除这个div以更新页面
                deleteParentData(pid)
                //根据pid操作front
                deleteParentFront(pid)

            } else if (pa.classList.contains('todo-item-child')) {
                cid = pa.dataset.idofchild
                //根据要删除的cid处理后台数据，如果成功，就删除这个div以更新页面
                deleteChildData(cid)
                //根据cid操作front
                deleteChildFront(cid)
            }
        }
    })
}
//根据pid删除后台数据
var deleteParentData = function(pid) {
    //删去p的同时也需要删除里面包含的c和t
    var pIndex = findById(pid, todo.parentList, true)
    var childArray = todo.parentList[pIndex].child
    todo.parentList.splice(pIndex, 1)
    if (childArray.length > 0) {
        for (let i = 0; i < childArray.length; i++) {
            var cIndex = findById(childArray[i], todo.childList, true)
            var taskArray = todo.childList[cIndex].child
            todo.childList.splice(cIndex, 1)
            if (taskArray.length > 0) {
                //注意这里不能用i为自变量，和外面的i会重叠,或者用let i
                for (let i = 0; i < taskArray.length; i++) {
                    var tIndex = findById(taskArray[i], todo.taskList, true)
                    todo.taskList.splice(tIndex, 1)
                }
            }
        }
    }
    // log(todo.childList)
    saveTodo()
}
//根据返回值pid更新删除后的页面
var deleteParentFront = function(pid) {
    // //删去nav内div和option选项
    // // var p = $(`[data-idofitem="${pid}"]`)
    // var cInp = p.querySelectorAll('.todo-item-child')
    // //如果删除的是当前激活的一项，把当前激活项目设为所有任务
    // var idOfacC = $('.todo-item-container').dataset.activechild
    // for (let i = 0; i < cInp.length; i++) {
    //     var cid = cInp[i].dataset.idofchild
    //     if (String(cid) === String(idOfacC)) {
    //         selectAll()
    //         break
    //     }
    // }
    // // p.remove()
    // var options = $('#add-select').children
    // for (let i = 0; i < options.length; i++) {
    //     var v = String(options[i].value)
    //     if (v === String(pid)) {
    //         options[i].remove()
    //     }
    // }
    rendNav()
    // selectAll()

}
//根据cid删除后台数据
var deleteChildData = function(cid) {
    //注意删除c里面的t的同时，需要删除父元素p内child数组内的c的id值
    var cIndex = findById(cid, todo.childList, true)
    var taskArray = todo.childList[cIndex].child
    var idofP = todo.childList[cIndex].pid
    todo.childList.splice(cIndex, 1)
    if (taskArray.length > 0) {
        for (let i = 0; i < taskArray.length; i++) {
            var tIndex = findById(taskArray[i], todo.taskList, true)
            todo.taskList.splice(tIndex, 1)
        }
    }
    //在其父元素的child数组里面删除此id
    var childInP = findById(idofP, todo.parentList).child
    var index
    for (let i = 0; i < childInP.length; i++) {
        if (String(childInP[i]) === String(cid)) {
            index = i
        }
    }
    childInP.splice(index, 1)
    //保存
    saveTodo()
}
//根据返回值cid更新删除后的页面
var deleteChildFront = function(cid) {
    // //删除此child
    // var child = $(`[data-idofchild="${cid}"]`)
    // var parent = child.parentElement
    //如果删除的是当前激活的一项，把当前激活项目设为所有任务
    // var idOfacC = $('.todo-item-container').dataset.activechild
    // rendNav()
    // if (String(idOfacC) === String(cid)) {
    //     selectAll()
    // } else {
    //     var child = $(`[data-idofchild="${idOfacC}"]`)
    //     activeOneChild(child)
    // }
    rendNav()
    // child.remove()
    // //修改父类中的child个数
    // var span = parent.children[0].querySelector('span')
    // span.innerHTML = Number(span.innerHTML) - 1
}
//根据tid删除后台数据
var deleteTaskData = function(tid) {
    var tIndex = findById(tid, todo.taskList, true)
    var idofP = todo.taskList[tIndex].pid
    todo.taskList.splice(tIndex, 1)
    //在其父元素的child数组里面删除此id
    var taskInC = findById(idofP, todo.childList).child
    var index
    for (let i = 0; i < taskInC.length; i++) {
        if (String(taskInC[i]) === String(tid)) {
            index = i
        }
    }
    taskInC.splice(index, 1)
    //保存
    saveTodo()
}
//根据返回值tid更新删除后的页面
var deleteTaskFront = function(tid) {
    rendNav()
    rendAside('all')
    rendMain()
}
//更新渲染nav界面
var rendNav = function() {
    //所有任务个数
    var allSum = todo.taskList.length
    $('#todo-item-all').querySelector('span').innerHTML = allSum
    //记录激活项
    var idOfacC = $('.todo-item-container').dataset.activechild
    //清空内容
    $('.todo-item-container').innerHTML = ''
    $('#add-select').innerHTML = ''
    //导入父元素
    for (let i = 0; i < todo.parentList.length; i++) {
        addParentFront(todo.parentList[i])
    }
    //导入子元素
    for (let i = 0; i < todo.childList.length; i++) {
        addChildFront(todo.childList[i])
    }
    //把默认父元素和子元素的删除按钮隐藏
    $(`[data-idofchild=i0]`).querySelector('.fa-trash-o').remove()
    $(`[data-idofchild="0"]`).querySelector('.fa-trash-o').remove()
    //选取激活项，如果还在就激活，如果不在了，就激活所有任务
    var child = $(`[data-idofchild="${idOfacC}"]`)
    if (child) {
        activeOneChild(child)
    } else {
        selectAll()
    }
}
//根据date前后重新排列taskArray
var arrayByDate = function(array) {
    var newArray = array.slice(0)
    var dateArray = []
    Array.prototype.forEach.call(array, function(t){
        var task = findById(t, todo.taskList)
        dateArray.push(task.date)
    })
    var temp,temp1
    for (let i = 0; i < dateArray.length - 1; i++) {
        for (let j = i + 1; j < dateArray.length; j++) {
            if (dateArray[i] < dateArray[j]) {
                //要使两个数组同时进行排序，才能保持一致
                //date排序
                temp = dateArray[i]
                dateArray[i] = dateArray[j]
                dateArray[j] = temp
                //id排序
                temp1 = newArray[i]
                newArray[i] = newArray[j]
                newArray[j] = temp1
            }
        }
    }
    return newArray
}
//根据选取的activechild的id，更新渲染aside界面，即把childList中的child数组中的元素列出来,activeTaskId
//为激活任务的id,如果有的话，就激活这个task，如果没有，默认激活第一个task
//添加模式参数（所有，未完成，已完成）
var rendAside = function(modal, activeTaskId='') {
    //首先更新todo-buttons中按钮的激活状态
    if (modal === 'all') {
        var buttons = $('.todo-buttons').children
        clearClass(buttons, 'list-active')
        $('.todo-all').classList.add('list-active')
    }
    //获取目前激活的child的id，并根据此id在childList里面找到这个child，并获取其child数组，即
    //包含task的id的数组
    var taskArray = []
    var cid = getActiveChild()
    if (cid === '-1') {
        for (let i = 0; i < todo.taskList.length; i++) {
            taskArray.push(todo.taskList[i].id)
        }
    } else if (cid.includes('i')) {
        var pid = cid.slice(1)
        var childArray = findById(pid, todo.parentList).child
        for (let i = 0; i < childArray.length; i++) {
            var taskCell = findById(childArray[i], todo.childList).child
            taskArray = [...taskArray, ...taskCell]
        }
    } else {
        var activechild = findById(cid, todo.childList)
        taskArray = activechild.child
    }

    // 清空任务列表的内容，并根据选择的内容替换
    $('.todo-task-list').innerHTML = ''
    // log(cid, taskArray)
    if (taskArray.length > 0) {
        // log(taskArray)
        //将数组按照时间顺序排列
        var newArray = arrayByDate(taskArray)
        for (let i = 0; i < newArray.length; i++) {
            var t = newArray[i]
            var task = findById(t, todo.taskList)
            // 将获取的每个task显示在列表中
            var finish = task.finish
            //根据finish和模式判断是否需要跳过此次循环
            if ((modal === 'done' && !finish) || (modal === 'undone' && finish) ) {
                continue
            }
            var id = task.id
            var name = finish ? `<i class="fa fa-check"></i>${task.name}` : task.name
            var date = task.date
            var color = finish ? 'green' : 'black'
            //判断日期是否和最后一个相同，如果是就不用插入时间
            var allList = $('.todo-task-list').querySelectorAll('.todo-task-list-time')
            var t
            //第一个要插入时间
            if (allList.length === 0) {
                t = `<div class="todo-task-list-time todo-task-list-cell">${date}</div>
                    <div class="todo-task-list-content todo-task-list-cell" data-idoftask=${id} style="color:${color}">${name}</div>`
            } else if (allList[allList.length - 1].innerHTML === date) {
                t = `<div class="todo-task-list-content todo-task-list-cell" data-idoftask=${id} style="color:${color}">${name}</div>`
            } else {
                t = `<div class="todo-task-list-time todo-task-list-cell">${date}</div>
                    <div class="todo-task-list-content todo-task-list-cell" data-idoftask=${id} style="color:${color}">${name}</div>`
            }
            $('.todo-task-list').insertAdjacentHTML('beforeend', t)
        }
        if (!activeTaskId) {
            //把所选的task中的第一个职位置为激活的，data-activetask
            var task1 = $('.todo-task-list').getElementsByClassName('todo-task-list-content')[0]
            if (task1) {
                $('.todo-task-list').dataset.activetask = task1.dataset.idoftask
                task1.classList.add('task-active')
            }
        } else {
            //激活id为提供的activeTaskId的task
            $('.todo-task-list').dataset.activetask = activeTaskId
            $(`[data-idoftask="${activeTaskId}"]`).classList.add('task-active')
        }
    } else {
        $('.todo-task-list').dataset.activetask = -1   //代表task列表没有内容
    }
}
//绑定aside上的todo-buttons（显示完成或未完成的按钮）的事件
var asideButtonsBind = function() {
    addEvent($('.todo-buttons'), 'click', function(e){
        var self = e.target
        var buttons = $('.todo-buttons').children
        clearClass(buttons, 'list-active')
        self.classList.add('list-active')
        if (self.classList.contains('todo-all')) {
            rendAside('all')
            rendMain()
        } else if (self.classList.contains('todo-undone')) {
            rendAside('undone')
            rendMain()
        } else if (self.classList.contains('todo-done')) {
            rendAside('done')
            rendMain()
        }
    })
}
//同nav，点击aside内的元素时。修改task-list中的被激活的元素的activetask，以方便识别在哪个子分类
//添加任务以及改变任务显示
var asideActiveBind = function() {
    var children = $('.todo-task-list').getElementsByClassName('todo-task-list-content')
    addEvent($('.todo-task-list'), 'click', function(e){
        var self = e.target
        if (self.classList.contains('todo-task-list-content')) {
            clearClass(children, 'task-active')
            self.classList.add('task-active')
            var tid = self.dataset.idoftask
            $('.todo-task-list').setAttribute('data-activetask',tid)
            rendMain()
        }
    })
}
//根据选取的activetask的id，更新渲染main界面
var rendMain = function() {
    var tid = getActiveTask()
    //把tid赋予main里面的data-showTaskId
    $('main').dataset.state = tid
    //把textarea改为不可编辑，并隐藏保存取消按钮,显示编辑和完成按钮
    $(`.textarea-content`).readonly = 'readonly'
    $(`.textarea-content`).disabled = 'disabled'
    $('.todo-saveAndQuit').style.display = 'none'
    //查询此任务是否完成，完成就去掉编辑按钮，未完成就保留
    var tid = getActiveTask()
    var finished = findById(tid, todo.taskList).finish
    if (finished) {
        if (String(tid) === '0') {
            $('.editAndDone').style.display = 'none'
        } else {
            $('.editAndDone').style.display = 'inline-block'
            $('#id-todo-done').style.display = 'none'
            $('#id-todo-edit').style.display = 'none'
        }
    } else {
        $('.editAndDone').style.display = 'inline-block'
        $('#id-todo-done').style.display = 'inline-block'
        $('#id-todo-edit').style.display = 'inline-block'
    }
    //根据id进行渲染
    if(Number(tid) !== -1) {
        var task = findById(tid, todo.taskList)
        //根据task更新渲染main
        var name = task.name
        var date = task.date
        var content = task.content
        // log(content)
        rendMainAid(name, date, content)
    } else {
        rendMainAid('无', '无', '无内容')
        //删去edit和done按钮
        $('.editAndDone').style.display = 'none'
    }
}
//渲染main辅助函数
var rendMainAid = function(name, date, content) {
    $('.todo-title-note').innerHTML = name
    $('.todo-time-note').innerHTML = date
    $('.todo-content').querySelector('.textarea-content').value = content
}
//添加新增任务按钮事件
var addTaskBind = function() {
    addEvent($('.aside-btm'), 'click', function(e){
        var cid = getActiveChild()
        if (cid === '-1' || cid.includes('i')) {
            alert('请选择子分类')
        } else {
            //修改main里面data的状态，以表示目前为新任务而不是编辑
            $('main').dataset.state = 'pre-page'
            var tInput = `<input type="text" placeholder="请输入标题" class='todo-name-input'>`
            var dInput = `<input type="date" class='todo-date-input'>`
            // var button =
            rendMainAid(tInput, dInput, '')
            //将textarea改为可编辑
            $(`.textarea-content`).removeAttribute('readonly')
            $(`.textarea-content`).removeAttribute('disabled')
            //显示按钮并删去info内提示文字，并修改按钮文字
            $('.todo-saveAndQuit').style.display = 'block'
            $('.todo-saveAndQuit').querySelector('.save').innerHTML = '保存'
            $('.todo-saveAndQuit').querySelector('.save').style.width = '60px'
            $('.info').innerHTML = ''
            //删去edit和done按钮
            $('.editAndDone').style.display = 'none'
        }
    })
}
//绑定保存和取消事件,这里共用添加和编辑的功能，通过main内的data来判断是add还是edit
var saveTaskBind = function() {
    addEvent($('.todo-saveAndQuit'), 'click', function(e){
        var self = e.target
        if (self.classList.contains('quit')) {
            rendMain()
        } else if (self.classList.contains('save')) {
            var name = $('.todo-name-input').value
            var date = $('.todo-date-input').value
            var content = $('.textarea-content').value
            if (!name) {
                $('.info').innerHTML = '标题不能为空'
            } else if (!date) {
                $('.info').innerHTML = '日期不能为空'
            } else if (!content) {
                $('.info').innerHTML = '内容不能为空'
            } else {
                //判断是添加还是更新数据
                var state = $('main').dataset.state
                if (state === 'pre-page') {
                    //添加
                    var newTask = addTaskData(name, date, content)
                    //根据后端（全局数组）返回的数据，即新添加的任务，进行页面渲染
                    addTaskFront(newTask)
                } else {
                    //编辑
                    var editTask = editTaskData(name, date, content)
                    //根据后端（全局数组）返回的数据，即新添加的任务，进行页面渲染
                    editTaskFront(editTask)
                }
            }
        }
    })
}
//如果任务不存在（即main的data的id与todo-task-list的activetask不同），说明是新任务，
//将新任务添加进taskList。如果相同，说明是旧任务，更新这个任务
var addTaskData = function(name, date, content) {
    var cid = getActiveChild()
    var tLen = todo.taskList.length
    var newTid = Number(todo.taskList[tLen - 1].id) + 1
    var newTask = {id: newTid, pid: cid, name: name, content: content,date:date, finish: false,}
    todo.taskList.push(newTask)
    var cCell = findById(cid, todo.childList)
    cCell.child.push(newTid)
    //保存
    saveTodo()
    //返回这个新任务，模拟后端控制前端进行页面渲染
    return newTask
}
//根据返回的数据渲染main模块
var addTaskFront = function(newTask) {
    rendNav()
    //在aside的todo-task-list修改当前激活task并渲染aside界面
    rendAside('all', newTask.id)
    //渲染main界面
    rendMain()
    // //将子分类中和所有任务中的task个数+1
    // var ch = $(`[data-idofchild="${newTask.pid}"]`)
    // var chSpan = ch.querySelector('span')
    // chSpan.innerHTML = Number(chSpan.innerHTML) + 1
    // var allSpan = $('#todo-item-all').querySelector('span')
    // allSpan.innerHTML = Number(allSpan.innerHTML) + 1
}
//绑定完成和编辑事件
var editDoneDeleteTaskBind = function() {
    addEvent($('.editAndDone'), 'click', function(e){
        //原生js中也有closest这种写法
        if(e.target.className !== 'editAndDone') {
            if (e.target.closest('a').id === 'id-todo-done') {
                var task = doneTaskData()
                doneTaskFront(task)
            } else if (e.target.closest('a').id === 'id-todo-edit') {
                editTaskBind()
            } else if (e.target.closest('a').id === 'id-todo-delete') {
                var tid = $('main').dataset.state
                deleteTaskData(tid)
                deleteTaskFront(tid)
            }
        }
    })
}
//更新后台数据done
var doneTaskData = function() {
    var tid = getActiveTask()
    var task = findById(tid, todo.taskList)
    task.finish = true
    //保存
    saveTodo()
    return task
}
//根据完成更新后的返回数据更新页面
var doneTaskFront = function(doneTask) {
    if (doneTask.finish) {
        //这里不用更新nav，没有变化
        rendAside('all', doneTask.id)
        rendMain()
    }
}
//编辑的时候先修改front end， 再传输数据给后端
var editTaskBind = function() {
    var name = $('.todo-title-note').innerHTML
    var date = $('.todo-time-note').innerHTML
    var content = $('.todo-content').querySelector('.textarea-content').value
    var tInput = `<input type="text" placeholder="请输入标题" class='todo-name-input' value=${name}>`
    var dInput = `<input type="date" class='todo-date-input' value=${date}>`
    rendMainAid(tInput, dInput, content)
    //将textarea改为可编辑
    $(`.textarea-content`).removeAttribute('readonly')
    $(`.textarea-content`).removeAttribute('disabled')
    //显示按钮并删去info内提示文字,并修改按钮文字
    $('.todo-saveAndQuit').style.display = 'block'
    $('.todo-saveAndQuit').querySelector('.save').innerHTML = '保存修改'
    $('.todo-saveAndQuit').querySelector('.save').style.width = '100px'
    $('.info').innerHTML = ''
    //删去edit和done按钮
    $('.editAndDone').style.display = 'none'
}
//更新后台数据edit
var editTaskData = function(name, date, content) {
    var tid = $('main').dataset.state
    var tCell = findById(tid, todo.taskList)
    tCell.name = name
    tCell.date = date
    tCell.content = content
    //保存
    saveTodo()
    return tCell
}
//根据编辑更新后的返回数据更新页面
var editTaskFront = function(editTask) {
    //这里不用更新nav，没有变化
    rendAside('all', editTask.id)
    rendMain()
}
//初始化
var initTodo = function() {
    // saveTodo()
    todo = loadTodo()
    rendNav()
    selectAll()
}
//保存数据
var saveTodo = function() {
    var s = JSON.stringify(todo)
    localStorage.todo = s
}
//读取数据
var loadTodo = function() {
    var a = localStorage.todo
    if (a) {
        return JSON.parse(a)
    } else {
        return todo
    }    // log(a)

}
//绑定各个事件
var bindEvents = function() {
    addParentBind()
    navActiveBind()
    deleteBind()
    asideActiveBind()
    asideButtonsBind()
    addTaskBind()
    saveTaskBind()
    editDoneDeleteTaskBind()
}
var __main = function() {
    bindEvents()
    initTodo()
}

__main()
