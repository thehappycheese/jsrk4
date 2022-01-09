"use strict";

const arr_speed = (a, b)=>{
    let dx = a[0] - b[0];
    let dy = a[1] - b[1];
    return Math.sqrt(dx*dx + dy*dy);
}

const triangle_wave = x => {
    let fx = Math.floor(Math.abs(x)) % 2
    return (Math.abs(x) % 1) * (fx * 2 - 1) + 1 - fx;
}

let image_data;
let image_data_view;

let color_scales = {
    rainbow: chroma.scale(['#f00','#0f0','#00f','#f00']).mode('hsl'),
    plasma: chroma.scale(['#0d0887','#5d01a6','#ab1488','#d24e71','#e8853a','#ecc000','#daff47']).mode('hsl'),
    plasma2: chroma.scale([
        '#0d0887', '#5d01a6', '#ab1488', '#d24e71', '#e8853a', '#ecc000', '#daff47', '#ecc000', '#e8853a', '#d24e71', '#ab1488', '#5d01a6', '#0d0887'
    ]).mode('hsl'),
    plasma3_bez: chroma.bezier([
        '0d0887', '5d01a6', 'ab1488', 'd24e71', 'e8853a'
    ]),//.mode('hsl'),
    rand1:chroma.bezier(["d88c9a","f2d0a9","f1e3d3","99c1b9","8e7dbe"]),
    rand2:chroma.bezier(["8a00d4","#d527b7","#f782c2","#f9c46b","#e3e3e3"])
}

let [canvas, ctx, mouse] = make_fullscreen_canvas()
const COLLIDE_FAT = 10;

let old_time = performance.now();

(async function start(){
    image_data = await load_image("img/face.jpg");
    image_data_view = new DataView(image_data.data.buffer);
    run(performance.now());
})()


function run(time){
    let delta_time = time - old_time;
    old_time   = time;
    simulate(delta_time);
    draw()
    requestAnimationFrame(run)
}





function draw(){
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //for(let coords of position.iter_rows()){
    //   ctx.fillRect(...coords, 2 , 2);
    //}

    // ctx.beginPath()
    // for(let [a, b] of iter.zip(position_old.iter_rows(), position.iter_rows())){
    //     ctx.moveTo(...a);
    //     ctx.lineTo(...b);
    // }
    // ctx.stroke();

    ctx.globalAlpha = 1;
    
    ctx.beginPath()
    for(let [index, [[a, b, mag_ab],[c,d, _]]] of 
            iter.enumerate(
                iter.pairwise(
                    iter.zip(
                        iter.wrap(position_old.iter_rows()),
                        iter.wrap(position.iter_rows()),
                        iter.wrap(iter.from_arr(edge_force_magnitude.data))
                    ),
                    
                ),
            )
        ){
        
        let speed = (arr_speed(a,c)+arr_speed(b,d))*0.5;
        //ctx.fillStyle = color_scales.rainbow(triangle_wave(index/600)).luminance(speed/20).hex();
        //ctx.fillStyle = color_scales.rand2(triangle_wave(mag_ab)).alpha(speed).hex()//.luminance(speed/40).hex();
        ctx.fillStyle = "#"+get_image_colour(triangle_wave(index/300), triangle_wave(image_y_counter/image_y_counter_max*2))
        ctx.beginPath()
        ctx.moveTo(...a);
        ctx.lineTo(...b);
        ctx.lineTo(...d);
        ctx.lineTo(...c);
        ctx.fill();

    }
    image_y_counter ++;
    if (image_y_counter>image_y_counter_max){
        image_y_counter=0;
    }
}
const image_y_counter_max = 600;
let image_y_counter = 0;

function get_image_colour(x_unit, y_unit){
    let w = image_data.width;
    let h = image_data.height;
    let x = Math.floor((w-1) * x_unit);
    let y = Math.floor((h-1) * y_unit);
    let pi = x*4 + y*(w)*4
    return image_data_view.getUint32(pi,false).toString(16)
}

// function draw(){
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.beginPath()
//     ctx.strokeStyle = "green"
//     ctx.lineWidth = COLLIDE_FAT-2
//     ctx.lineJoin = "round"
//     ctx.lineCap = "round"
//     stroke_snake();
//     ctx.beginPath();
//     ctx.strokeStyle = "limegreen"
//     ctx.lineWidth = COLLIDE_FAT-8
//     stroke_snake();
// }

// function stroke_snake(){
//     let rows = position.iter_rows();
//     ctx.moveTo(...rows.next().value);
//     for(let coords of rows){
//         ctx.lineTo(...coords);
//     }
//     ctx.stroke();
// }