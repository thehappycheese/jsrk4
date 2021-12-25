"use strict";

let [canvas, ctx, mouse] = make_fullscreen_canvas()
const COLLIDE_FAT = 10;

let old_time = performance.now();
run(performance.now())
function run(time){
    let delta_time = time - old_time;
    old_time   = time;
    simulate(delta_time);
    draw()
    requestAnimationFrame(run)
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath()
    ctx.strokeStyle = "green"
    ctx.lineWidth = COLLIDE_FAT-2
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    stroke_snake();
    ctx.beginPath();
    ctx.strokeStyle = "limegreen"
    ctx.lineWidth = COLLIDE_FAT-8
    stroke_snake();
}

function stroke_snake(){
    let rows = position.iter_rows();
    ctx.moveTo(...rows.next().value);
    for(let coords of rows){
        ctx.lineTo(...coords);
    }
    ctx.stroke();
}