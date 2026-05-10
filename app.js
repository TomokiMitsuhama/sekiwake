'use strict';

const n = 11;
const dialog = document.querySelector('dialog');
const showButton = document.querySelector('dialog + button');
const closeButton = document.querySelector('dialog button');

// ［ダイアログを表示］ボタンでダイアログがモーダルに開く
showButton.addEventListener('click', () => {
dialog.showModal();
});

// ［閉じる］ボタンでダイアログを閉じる
closeButton.addEventListener('click', () => {
dialog.close();
});

const fragment = document.createDocumentFragment();
const grid_container = document.getElementById('grid_container')
const wrapper = fragment.appendChild(document.createElement('div'))
wrapper.classList.add('wrapper')
for (let i = 0; i < n*n; i++){
    const button = document.createElement('div')
    button.textContent = '×'
    button.setAttribute('id', i)
    button.classList.add('space');
    wrapper.appendChild(button)
}
grid_container.appendChild(fragment)

function bezout(l, option){
    if(option == '34'){
        var r = l % 4
        return (4 - r) % 4
    } else if(option == '45'){
        var r = l % 5
        return (5 - r) % 5
    } else if(option == '56') {
        var r = l % 6
        return (6 - r) % 6
    }
}
function less(option){
    if(option == '34'){
        return 3
    } else if(option == '45'){
        return 4
    } else if(option == '56') {
        return 5
    }
}

$(function(){
        function checkStatus(){
            var option = $('input[name=\"mino\"]:checked').val()
            var l = $('.present').length;
            var isDisabled = false;
            var number_s = bezout(l, option);
            var auto_bool = $('input[name=\"auto\"]:checked').val()
            if (l==0){isDisabled = true}
            if (auto_bool == '1'){
                $('#min_move').prop('disabled', false)
                $('#fix_ratio').prop('disabled', true)
            } else {
                $('#min_move').prop('disabled', true)
                $('#fix_ratio').prop('disabled', false)
            }
            $('#mino_s').text(less(option).toString() + ':');
            $('#mino_l').text((less(option) + 1).toString() + ':');
            $('#number_s').attr('min', number_s.toString());
            $('#number_s').val(number_s.toString());
            $('#number_s').attr('step', (less(option) + 1).toString());
            $('#number_l').text((l - number_s*less(option))/(less(option) + 1));
            if(number_s*less(option) > l){
                isDisabled = true
                $('#fix_ratio').prop('disabled', true)
            } else {
                $('#number_s').attr('max', (number_s + (l - number_s*less(option))/less(option)).toString());
            }
            $('#execute').prop('disabled', isDisabled);
        }
        $('.wrapper div').click(function(){
            if($(this).attr('class')=='space'){
                $(this).removeClass('space').addClass('present')
                $(this).text('○')
            }else{
                if($(this).attr('class')=='present'){
                    $(this).removeClass('present').addClass('absent')
                    $(this).text('△')
                }else{
                    $(this).removeClass('absent').addClass('space')
                    $(this).text('×')
                }
            }
            checkStatus();
        })
        $('input[name=\"mino\"]').change(function(){
            checkStatus();
        })
        $('input[name=\"auto\"]').change(function(){
            checkStatus();
        })
        $('#number_s').change(function(){
            var l = $('.present').length;
            var option = $('input[name=\"mino\"]:checked').val()
            var number_s = Number($('#number_s').val())
            $('#number_l').text((l - number_s*less(option))/(less(option) + 1));
        })
})
const execute = document.getElementById('execute')
execute.addEventListener('click', submit)

function submit() {
    var present = []
    var absent = []
    var mino = $('input[name=\"mino\"]:checked').val()
    var auto = $('input[name=\"auto\"]:checked').val()
    var reverse = $('input[name=\"reverse\"]:checked').val()
    var number_s = Number($('#number_s').val())
    var number_l = Number($('#number_l').text())
    var l = $('.present').length;
    for (let i = 0; i < n*n; i++) {
        let b = document.getElementById(String(i))
        let c = b.getAttribute('class')
        if(c=='present'){
            present.push(i)
        }else if(c=='absent'){
            absent.push(i)
        }
    }
    if (auto == "1"){
    } else {
        const save_data = document.getElementById('save_data')
        let present_grid = gridify(present, n);
        let absent_grid = gridify(absent, n);
        let output = algo_dlx_fix(present_grid, new Set(), mino, number_s, number_l);
        let result_aligned = align_output(output, present_grid, absent_grid)
        save_data.style.display = 'block'
        save_data.textContent = save(result_aligned)
        save_data.style.display = 'none'
        view_result(0)
    }
}

// 結果表示

function save(output){
    let outcome = []
    for (let result of output){
        let pair = []
        for (let i=0; i<2; i++){
            let table = [];
            for (let row of result[i]){
                table.push(row.join())
            }
            let str = table.join(";");
            pair.push(str)
        }
        let str2 = pair.join(":");
        outcome.push(str2)
    }
    let str3 = outcome.join("/")
    return str3
}

function load(str){
    if (str == ""){return []} else {
    let list1 = str.split("/");
    let new_list = []
    for (let result of list1){
        let new_result = [];
        let result_list = result.split(":");
        for (let table of result_list){
            let new_table = [];
            let table_list = table.split(";")
            for (let row of table_list){
                let new_row = row.split(",");
                new_table.push(new_row)
            }
            new_result.push(new_table)
        }
        new_list.push(new_result)
    }
    return new_list}
}

function result_min(result){
    let x = Number.MAX_VALUE;
    let y = Number.MAX_VALUE;
    for (let group of result){
        let seats = group.slice(1);
        for (let seat of seats){
            if (seat[0] < x){
                x = seat[0]
            }
            if (seat[1] < y){
                y = seat[1]
            }
        }
    }
    return [x, y]
}

function result_max(result){
    let x = -1*Number.MAX_VALUE;
    let y = -1*Number.MAX_VALUE;
    for (let group of result){
        let seats = group.slice(1);
        for (let seat of seats){
            if (seat[0] > x){
                x = seat[0]
            }
            if (seat[1] > y){
                y = seat[1]
            }
        }
    }
    return [x, y]
}

function align_output(output, present, absent){
    let present_min = field_min(present)
    let absent_min = field_min(absent)
    let present_max = field_max(present)
    let absent_max = field_max(absent)
    let outcome = []
    for (let result of output){
        console.log(result)
        let res_min = result_min(result);
        let res_max = result_max(result);
        let viewer_min = [Math.min(present_min[0], absent_min[0], res_min[0]), Math.min(present_min[1], absent_min[1], res_min[1])];
        let viewer_max = [Math.max(present_max[0], absent_max[0], res_max[0]), Math.max(present_max[1], absent_max[1], res_max[1])];
        let width = viewer_max[0] - viewer_min[0] + 1;
        let height = viewer_max[1] - viewer_min[1] + 1;
        let result1 = new Array(width);
        for (let i = 0; i < width; i++){
            result1[i] = (new Array(height).fill(-1))
        }
        let result2 = new Array(width);
        for (let i = 0; i < width; i++){
            result2[i] = (new Array(height).fill(0))
        }
        for (let seat of present){
            result1[seat[0] - viewer_min[0]][seat[1] - viewer_min[1]] = 0;
            result2[seat[0] - viewer_min[0]][seat[1] - viewer_min[1]] = -1;
        }
        for (let seat of absent){
            result1[seat[0] - viewer_min[0]][seat[1] - viewer_min[1]] = 0;
        }
        for (let i = 0; i < result.length; i++){
            let group = result[i].slice(1);
            console.log(group)
            for (let seat of group){
                result1[seat[0] - viewer_min[0]][seat[1] - viewer_min[1]] = i + 1;
                result2[seat[0] - viewer_min[0]][seat[1] - viewer_min[1]] = 0;
            }
        }
        outcome.push([result1, result2])
    }
    console.log(outcome)
    return outcome
}

function view_result (index) {
    const fragment = document.createDocumentFragment();
    const result_container = document.getElementById('result_container')
    const save_data = document.getElementById('save_data')
    save_data.style.display = "block"
    const output = load(save_data.textContent)
    save_data.style.display = "none"
    result_container.removeChild(document.getElementById('result_wrapper'))
    const wrapper = fragment.appendChild(document.createElement('div'))
    wrapper.className = 'result_wrapper'
    wrapper.id = 'result_wrapper'
    console.log(output)
    if (output.length > 0){
        let res = output[index]
        let res1 = res[0]
        let res2 = res[1]
        console.log(res1)
        console.log(res2)
        let l_tate = res1.length
        let l_yoko = res1[0].length
        let n_tate = 2*l_tate - 1
        let n_yoko = 2*l_yoko - 1
        wrapper.style.gridTemplateColumns = 'repeat(' + (l_yoko - 1).toString() + ', 50px 5px) 50fr';
        wrapper.style.gridTemplateRows = 'repeat(' + (l_tate - 1).toString() + ', 50px 5px) 50px';
        for (let j=0; j < n_tate; j++){
          for (let k=0; k < n_yoko; k++){
              const el = document.createElement('div')
              if ((j%2 == 0) && (k%2 == 0)){
                  if (res1[j/2][k/2] == '-1'){
                      el.className = 'void'
                  }else if(res1[j/2][k/2] == '0'){
                    el.className = 'seat'
                    if(res2[j/2][k/2] == '-1'){
                      el.style.background = '#555'
                    }else{
                      el.style.background = '#aaa'
                    }
                  }else {
                      el.className = 'seat'
                      el.textContent = res1[j/2][k/2]
                      if(res2[j/2][k/2] == '1'){
                          el.style.background = '#e78'
                      }
                  }
              } else if((j%2 == 0) && (k%2 != 0)){
                  if (res1[j/2][(k-1)/2] != res1[j/2][(k+1)/2]){
                      el.className = 'vline'
                  }else{
                      el.className = 'void'
                  }
              } else if((j%2 != 0) && (k%2 == 0)){
                  if (res1[(j-1)/2][k/2] != res1[(j+1)/2][k/2]){
                      el.className = 'hline'
                  }else{
                      el.className = 'void'
                  }
              } else {
                  if ((res1[(j-1)/2][(k-1)/2] != res1[(j-1)/2][(k+1)/2])||(res1[(j+1)/2][(k-1)/2] != res1[(j+1)/2][(k+1)/2])||(res1[(j-1)/2][(k-1)/2] != res1[(j+1)/2][(k-1)/2])||(res1[(j-1)/2][(k+1)/2] != res1[(j+1)/2][(k+1)/2])){
                      el.className = 'vhline'
                  }else{
                      el.className = 'void'
                  }
              }
              wrapper.appendChild(el)
          }
      }
    } else {wrapper.innerText = 'None'}
    result_container.appendChild(fragment)

    function button_next () {
        if (index != output.length - 1){
            view_result(index + 1)
        }
    }

    function button_prev () {
        if (index != 0){
            view_result(index - 1)
        }
    }

    function viewbutton (index) {
        const fragment = document.createDocumentFragment();
        const button_container = document.getElementById('button_container')
        button_container.removeChild(document.getElementById('button_wrapper'))
        const wrapper = button_container.appendChild(document.createElement('div'))
        wrapper.className = 'button_wrapper'
        wrapper.id = 'button_wrapper'
        const leftbutton = fragment.appendChild(document.createElement('input'))
        leftbutton.type = 'button'
        leftbutton.value = '←'
        leftbutton.className = 'btn'
        leftbutton.style.margin = 'auto auto'
        if (index == 0){
            leftbutton.disabled = true
            leftbutton.style.background = '#888'
        } else {
            leftbutton.style.background = '#e64'
        }
        leftbutton.addEventListener('click', () => {button_prev()})
        const fraction = fragment.appendChild(document.createElement('div'))
        fraction.setAttribute('id', 'fraction')
        fraction.textContent = (index + 1).toString()
        fraction.class = 'container'
        fraction.style.margin = 'auto auto'
        const rightbutton = fragment.appendChild(document.createElement('input'))
        rightbutton.type = 'button'
        rightbutton.value = '→'
        rightbutton.className = 'btn'
        rightbutton.style.margin = 'auto auto'
        rightbutton.addEventListener('click', () =>{button_next()})
        if (index == (output.length - 1)){
            rightbutton.disabled = true
            rightbutton.style.background = '#888'
        } else {
            rightbutton.disabled = false
            rightbutton.style.background = '#e64'
        }
        wrapper.appendChild(fragment)
    }
    viewbutton(index)
}



// 集合実装
function gridify(xl, d){
    let buff = new Set();
    for (const x of xl) {
        buff.add([Math.floor(x/d), x%d])
    }
    return buff
}

function field_min(xs){
    let x = Number.MAX_VALUE
    let y = Number.MAX_VALUE
    for (const xl of xs){
        if (xl[0] < x){x = xl[0]}
        if (xl[1] < y){y = xl[1]}
    }
    return [x, y]
}

function field_max(xs){
    let x = -1*Number.MAX_VALUE
    let y = -1*Number.MAX_VALUE
    for (const xl of xs){
        if (xl[0] > x){x = xl[0]}
        if (xl[1] > y){y = xl[1]}
    }
    return [x, y]
}

function make_tromino(field_min, field_max){
    let buff = new Set()
    for (let x = field_min[0]; x < field_max[0]; x++){
        for (let y = field_min[1]; y < field_max[1]; y++){
            buff.add([3, [x, y], [x + 1, y], [x, y + 1]                ])
            buff.add([3, [x, y], [x + 1, y],             [x + 1, y + 1]])
            buff.add([3, [x, y],             [x, y + 1], [x + 1, y + 1]])
            buff.add([3,         [x + 1, y], [x, y + 1], [x + 1, y + 1]])
        }
    }
    return buff
}

function make_tetromino(field_min, field_max){
    let buff = new Set()
    for (let x = field_min[0]; x < field_max[0]; x++){
        for (let y = field_min[1]; y < field_max[1]; y++){
            buff.add([4, [x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]])
        }
    }
    return buff
}

function make_pentomino(field_min, field_max){
    let buff = new Set()
    for (let x = field_min[0]; x < field_max[0]; x++){
        for (let y = field_min[1]; y < (field_max[1] - 1); y++){
            buff.add([5, [x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1], [x, y + 2]                ])
            buff.add([5, [x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1],             [x + 1, y + 2]])
            buff.add([5, [x, y],             [x, y + 1], [x + 1, y + 1], [x, y + 2], [x + 1, y + 2]])
            buff.add([5,         [x + 1, y], [x, y + 1], [x + 1, y + 1], [x, y + 2], [x + 1, y + 2]])
        }
    }
    for (let x = field_min[0]; x < (field_max[0] - 1); x++){
        for (let y = field_min[1]; y < field_max[1]; y++){
            buff.add([5, [x, y], [x + 1, y], [x + 2, y], [x, y + 1], [x + 1, y + 1]                ])
            buff.add([5, [x, y], [x + 1, y], [x + 2, y],             [x + 1, y + 1], [x + 2, y + 1]])
            buff.add([5, [x, y], [x + 1, y],             [x, y + 1], [x + 1, y + 1], [x + 2, y + 1]])
            buff.add([5,         [x + 1, y], [x + 2, y], [x, y + 1], [x + 1, y + 1], [x + 2, y + 1]])
        }
    }
    return buff
}

function make_hexomino(field_min, field_max){
    let buff = new Set()
    for (let x = field_min[0]; x < field_max[0]; x++){
        for (let y = field_min[1]; y < (field_max[1] - 1); y++){
            buff.add([6, [x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1], [x, y + 2], [x + 1, y + 2]])
        }
    }
    for (let x = field_min[0]; x < (field_max[0] - 1); x++){
        for (let y = field_min[1]; y < field_max[1]; y++){
            buff.add([6, [x, y], [x + 1, y], [x + 2, y], [x, y + 1], [x + 1, y + 1], [x + 2, y + 1]])
        }
    }
    return buff
}

function make_subset (field, mino){
    if (mino == 34){
        var coverset = make_tromino(field_min(field), field_max(field)).union(make_tetromino(field_min(field), field_max(field)))
    } else if (mino == 45){
        var coverset = make_tetromino(field_min(field), field_max(field)).union(make_pentomino(field_min(field), field_max(field)))
    } else {
        var coverset = make_pentomino(field_min(field), field_max(field)).union(make_hexomino(field_min(field), field_max(field)))
    }
    let buff = [];
    for (const item of coverset){
        let item_sliced = new Set(item.slice(1))
        if (subsetp(item_sliced, field)){
            buff.push(item)
        }
    }
    return buff
}


function subsetp (xs, ys) {
    let xs1 = new Set();
    let ys1 = new Set();
    for (const x of xs) {
        xs1.add(x.toString())
    }
    for (const y of ys) {
        ys1.add(y.toString())
    }
    return xs1.isSubsetOf(ys1)
}

// DLX

function dnode(up, down, prev, next, header, name, quantity = 1, len = 0){
    this.up = up;
    this.down = down;
    this.prev = prev;
    this.next = next;
    this.name = name;
    this.quantity = quantity;
    this.len = len;
}

var root = null

function make_new_dnode(name){
    let node = new dnode()
    node.up = node;
    node.down = node;
    node.prev = node;
    node.next = node;
    node.header = node;
    node.name = name;
    return node
}

function init_header(){
    root = make_new_dnode(-1)
}

function insert_line(header, new_node){
    let p_node = header.prev;
    new_node.prev = p_node;
    new_node.next = header;
    p_node.next = new_node;
    header.prev = new_node;
    return new_node
}

function search_header(name){
    let node = root.next
    do {
        if(node.name.toString() == name.toString()){
            return node
        }
        node = node.next
    } while (node != root)
    return insert_line(root, make_new_dnode(name))
}

function insert_column(col, new_node){
    let header = search_header(col)
    let p_node = header.up;
    header.len += 1;
    new_node.header = header;
    new_node.down = header;
    header.up = new_node;
    new_node.up = p_node;
    p_node.down = new_node;
}

function remove_header(node){
    let header = node.header;
    let p_node = header.prev;
    let n_node = header.next;
    p_node.next = n_node;
    n_node.prev = p_node;
}

function make_qlist(mino, number_s, number_l){
    if (mino == '34' || mino == 34){
        return [Number(number_s), Number(number_l), 0, 0]
    } else if (mino == '45' || mino == 45){
        return [0, Number(number_s), Number(number_l), 0]
    } else {
        return [0, 0, Number(number_s), Number(number_l)]
    }
}

function make_dancing_links(xss, qlist){
    init_header();
    let line = 0;
    for (const xs of xss){
        let h_node = make_new_dnode(line);
        insert_column(xs[0], h_node);
        for (const col of xs.slice(1)) {
            let node = make_new_dnode(line);
            insert_column(col, node);
            insert_line(h_node, node);
        }
        line += 1
    }
    let node = root.next;
    let n_node = node.next
    while (true) {
        if (node == root){
            break
        } else {
            // DLチェック1
            let memo = [node.name];
            let d_node = node.down
            while (true) {
                if (node == d_node){
                    break
                } else {
                    memo.push(d_node.name);
                    d_node = d_node.down
                }
            }
            console.log(memo)
            // DLチェック1終わり
            if (typeof node.name == 'number'){
                node.quantity = qlist[node.name - 3]
                if (node.quantity == 0){
                    remove_header(node);
                    let c_node = node.down
                    while (c_node != node) {
                        if (c_node != c_node.header) {
                            let l_node = c_node.next
                            do {
                                remove_column(l_node);
                                l_node = l_node.next
                            } while (l_node != c_node)
                        }
                        c_node = c_node.down
                    }
                }
            }
            node = n_node;
            n_node = node.next
        }
    }
}

function select_min_column (){
    let min_node = root.next;
    let node = min_node.next;
    do {
        if (node.len == 0){
            return node
        } else if (node.len < min_node.len) {
            min_node = node
        }
        node = node.next
    } while (node != root)
    return min_node
}

function remove_column (node){
    let u_node = node.up;
    let d_node = node.down;
    u_node.down = d_node;
    d_node.up = u_node;
    node.header.len -= 1
}

function remove_matrix (h_node){
    let node = h_node;
    let header = node.header;
    while (true){
        header.quantity -= 1;
        if (header.quantity == 0){
            remove_header(node);
            let c_node = node.down;
            do {
                if (c_node.header != c_node) {
                    let l_node = c_node.next;
                    do {
                        remove_column(l_node);
                        l_node = l_node.next
                    } while (l_node != c_node)
                }
                c_node = c_node.down
            } while (c_node != node)
        }
        node = node.next;
        header = node.header;
        if (node == h_node){break}
    }
    remove_column(h_node)
}

function restore_header (node) {
    let header = node.header;
    let p_node = header.prev;
    let n_node = header.next;
    p_node.next = header;
    n_node.prev = header
}

function restore_column (node) {
    let u_node = node.up;
    let d_node = node.down;
    u_node.down = node;
    d_node.up = node;
    node.header.len += 1
}

function restore_matrix (h_node) {
    restore_column(h_node);
    let node = h_node.prev;
    let header = node.header;
    while (true) {
        header.quantity += 1;
        if (header.quantity == 1){
            restore_header(node);
            let c_node = node.up;
            do {
                if (c_node.header != c_node){
                    let l_node = c_node.prev;
                    do {
                        restore_column(l_node);
                        l_node = l_node.prev;
                    } while (l_node != c_node)
                }
                c_node = c_node.up;
            } while (c_node != node)
        }
        if (node == h_node){break}
        node = node.prev;
        header = node.header
    }
}

function emptyp (){
    return root == root.next
}

function algo_dlx_iter (f, xss, a){
    if (emptyp()){
        f(a)
    } else {
        let c_node = select_min_column();
        let l_node = c_node.down
        while (l_node != c_node) {
            remove_matrix(l_node);
            algo_dlx_iter(f, xss, a.concat([xss[l_node.name]]))
            restore_matrix(l_node)
            l_node = l_node.down
        }
    }
}

function algo_dlx_fix (present_grid, moved_grid, mino, number_s, number_l){
    let output = [];
    let subset = make_subset(present_grid.union(moved_grid), mino)
    make_dancing_links(subset, make_qlist(mino, number_s, number_l))
    algo_dlx_iter(function(a) {output.push(a)}, subset, [])
    return output
}

// function generate_result_auto(present, absent, mino, reverse){
//     let l = present.length;
//     if(reverse == '1'){
//         let number_s = bezout(l, mino) + (l - bezout(l, mino)*less(mino))/less(mino)
//         let number_l = (l - number_s*less(mino))/(less(mino) + 1)
//         let sign = -1
//     } else {
//         let number_s = bezout(l, mino)
//         let number_l = (l - number_s*less(mino))/(less(mino) + 1)
//         let sign = 1
//     }
//     let moved = []
//     let present_grid = gridify(present, present, n)
//     let absent_grid = gridify(absent, present, n)
//     let subset = make_subset(present_grid, mino)
//     LABEL:while (absent_grid == []){
//         make_dancing_links(present_grid, moved_grid, mino, number_s, number_l)
//         while (number_s >= 0 && number_l >= 0){
//             let output = algo_dlx()
//             if (output != []){
//                 return output
//             }
//             number_s += sign*(less(mino) + 1)
//             number_l -= sign*less(mino)
//             edit_dancing_links_number(mino, number_s, number_l)
//         }
//         unlikely = choose_unlikely(present_grid, moved)
//         likely = choose_likely(absent_grid, present_grid, moved)
//         present_grid = remove(present_grid, unlikely)
//         absent_grid = remove(absent_grid, likely)
//         moved_grid = moved.concat(unlikely, likely)
//         }
// }
