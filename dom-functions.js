
var menu_level = document.getElementById('gameLevel');
var menu_level_html = '';

for(var i=1; i<50; i++) menu_level_html += `<option class="level-option" value="${i}">Level ${i}</option>`;

menu_level.innerHTML = menu_level_html;

menu_level.onchange = function(){
    console.log('new level');
    level_num = Number(menu_level.value);
    console.log(level_num);
    saveCookie('current_level', level_num);
    reset_level();
}


// interactivity and info messaging

function msg_fun(){ return; }

function message(id, msg, fun = 'killed') {
    
    hold_dead = true;
    var dialogue = document.getElementById(id);
    var new_html = `<h4>${msg}</h4><h5>tap or press return..</h5>`;
    dialogue.innerHTML = new_html;
    dialogue.style.display = "block";

    // reassign msg_fun() - called when the dialogue closes - to appropriate action
    switch(fun){

        case 'killed':
            msg_fun = reset_level;
            break;

        case 'exit blocked':
            msg_fun = function(){
                hold_dead = false;
                document.getElementById('messenger').style.display='none';
            };
            break;


        case 'next':
            msg_fun = next_level;
            break;

        default:
            console.log('message() called but case unknown');
            break;
    }
    
    function enter(){
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {

                switch(fun){
                    case 'killed':
                        reset_level();
                        break;
                    case 'exit blocked':
                        hold_dead = false;
                        document.getElementById('messenger').style.display='none';
                        break;
                    case 'next':
                        next_level();
                    default:
                        console.log('enter pressed but case unknown');
                }
            } else enter();
        }, { once: true });
    }
    enter();
}


document.onkeyup = function(event) {

    switch (event.key) {
        // Arrow keys
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'ArrowRight':
        case 'ArrowDown':
            keydown = 0;
            break;
        
        case ' ':     // space - stationary move
            return_press = true;
            break;
        
        // case 'g': // g - grid
        //     toggle_grid();
        //     break;
        
        case 'c':
            clearAllCookies();
            break;
        
        default:
            break;
    }
}

// level choice

function reset_level() {
    queue = [];
    dead = true;
    busy = false; // to pause monsters
    document.getElementById('messenger').style.display='none';
    menu_level.value = String(level_num);
}

function next_level() {
    level_num++;
    reset_level()
    saveCookie('current_level', level_num);
    if(level_num > level_max){
        level_max = level_num;
        saveCookie('max_level', level_max);
    }
}

// cookies

function readCookie() {
    var cookie = {};
    var cookie_array = document.cookie.split(';');
    for(var i=0; i<cookie_array.length; i++) {
        cookie_arg = cookie_array[i].split('=');
        cookie[cookie_arg[0].trim()] = cookie_arg[1];
    }
    console.log(cookie)
    return cookie;
}

function saveCookie(c_name, c_value, exdays=10000) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    document.cookie=encodeURIComponent(c_name) 
        + "=" + encodeURIComponent(c_value)
        + (!exdays ? "" : "; expires="+exdate.toUTCString())
        + "; path=/";
}

function clearAllCookies() {
    const current_cookies = document.cookie.split(";");

    for (let cookie of current_cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
    cookieAlert();
    console.log('cleared cookies');
}

function cookieAlert(){
    var new_cookie = Object.keys(cookies).indexOf('current_level') === -1;
    if(new_cookie) document.getElementById('credits').style.color = 'yellow';
}

function validateCookie(key, numeric = true){
    if(Object.keys(cookies).indexOf(key) === -1) return false;
    if(cookies[key] === undefined) return false;
    if(cookies[key] === 'undefined') return false;
    if(numeric){
        if(isNaN(cookies[key])) return false;
        if(parseFloat(cookies[key]) < 1 || parseFloat(cookies[key]) > 49) return false;
        return true;
    } else {
        return cookies[key] === true || cookies[key] === "true" || cookies[key] === false || cookies[key] === "false"
    }
}

var cookies = readCookie();

cookieAlert(cookies);

var level_max = 1,
    level_num = 1;

if(validateCookie('current_level', numeric = true)){ // valid
    level_num = cookies['current_level'];
} else { // invalid
    saveCookie('current_level', level_num);
}

if(validateCookie('max_level', numeric = true)){ // valid
    level_max = cookies['max_level'];
} else { // invalid
    saveCookie('max_level', level_max);
}

if(validateCookie('sound', numeric = false)){ // valid
    toggle_sound(set_to = cookies['sound'] === true || cookies['sound'] === "true");
} else { // invalid
    saveCookie('sound', sound);
}

menu_level.value = String(level_num);


// swipe for mobiles

var swipeX = 0, swipeY = 0;
var g = {"x": 0, "y": 0 }
var target = document.getElementById('game-area');

// -----------------------------------------------------------------------------------

// Controls

var p = { x: undefined, y: 0 },  // pointer position
    g = { x: 0, y: 0 },          // gesture - delta position
    mouse_down = false,
    target = document.getElementById('game-area'),
    mouse_report = document.getElementById('mouse-report'),
    touch_report = document.getElementById('touch-report'),
    sensitivity = 20;  // lower value = higher sensitivity

document.body.addEventListener('mousedown',function(e){ mouse_down = true;});
document.body.addEventListener('mouseup',function(e){ mouse_down = false; end_gesture(); });

function gesture(x, y){
    if(p.x === undefined){ p = {"x": x, "y": y }; return; }
    g.x += x - p.x;
    g.y += y - p.y;
    p.x = x; p.y = y;
    // this forces the dominant xy component to to be sole control
    if(Math.abs(g.x) > sensitivity | Math.abs(g.y) > sensitivity){
        if(Math.abs(g.x) > Math.abs(g.y)) { swipeX = Math.sign(g.x); }
        else { swipeY = Math.sign(g.y); }
        g = {"x": 0, "y": 0 }; 
    }
};

function end_gesture(){
    p.x = undefined;
    g = { x: 0, y: 0 };
};

document.body.addEventListener('mousemove',function(e){
    if(mouse_down){ gesture(e.x, e.y); }
})

document.body.addEventListener('touchmove',function(e){
    var touch = e.touches[0];
    gesture(touch.pageX, touch.pageY);
});

document.body.addEventListener('touchend', end_gesture);

main_div.onclick = function(e) { tap = true; };


// function toggle_grid(){//}
//     grid = !grid;
//     if(grid){
//         var x1, x2;
//         for(var i=1; i<=40; i++) {
//             x1 = create_this.add.text(mapX(i)-10, mapY(1)-5, i, { "size": 5, color: 'yellow' });
//             x2 = create_this.add.text(mapX(i)-10, mapY(16)-5, i, { "size": 5, color: 'yellow' });
//             grid_array.push(x1); grid_array.push(x2);
//         }
//         for(var i=1; i<=16; i++) {
//             x1 = create_this.add.text(mapX(1)-10, mapY(i)-5, i, { color: 'yellow' });
//             x2 = create_this.add.text(mapX(40)-10, mapY(i)-5, i, { color: 'yellow' });
//             grid_array.push(x1); grid_array.push(x2);
//         }
//         var game_dims = String(document.getElementById('game-panel').offsetWidth) + ' x ' +
//                         String(document.getElementById('game-panel').offsetHeight);
//         var screen_dims = String(window.innerWidth) + ' x ' + String(window.innerHeight);
//         x1 = create_this.add.text(mapX(20), mapY(10), game_dims, { color: 'yellow' });
//         x2 = create_this.add.text(mapX(20), mapY(8), screen_dims, { color: 'yellow' });
//         grid_array.push(x1); grid_array.push(x2);
//     }
//     else  {
//         grid_array.map( x => x.destroy() );
//         grid_array = [];
//     }
// }

function toggle_sound(set_to = undefined){
    if(set_to === undefined){
        sound = !sound;
        saveCookie('sound', sound);
    }
    else sound = set_to;
    if(sound) document.getElementById('sound').innerText = '🔊';
    else document.getElementById('sound').innerText = '🔇';
}
