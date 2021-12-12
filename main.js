"use strict";

function benchmark(f, name, iterations=20){
    
    let times = []
    for(let i = 0;i < iterations;i++){
        let s = performance.now()
        f()
        let e = performance.now()
        times.push(e-s)
    }
    console.log(`=== BENCHMARK: ${name} ===`)
    console.log(times)
    console.log(times.reduce((acc,item)=>acc+item)/times.length)
}


let NUMNODES = 2000;

let intitial_positions = Array.from(new Array(NUMNODES), (item, index) => [
    500 + (400 + Math.cos(index/NUMNODES*Math.PI*200)*120) * Math.cos(index / NUMNODES * Math.PI * 2),
    500 + (400 + Math.cos(index/NUMNODES*Math.PI*200)*120) * Math.sin(index / NUMNODES * Math.PI * 2)
]);
//intitial_positions[0] = [500, 500];

let position = v32.from_rows(intitial_positions);
//let mass     = v32.from_column(new Array(NUMNODES).fill(1));

let velocity = v32.from_rows(new Array(NUMNODES).fill([0,0]));


let edges                = new Uint32Array((NUMNODES-1)*2)
for(let i=0;i<edges.length;i+=2){
    edges[i] = i - Math.floor(i/2);
    edges[i+1] = i+1 - Math.floor(i/2);
}
let edge_rest_length     = v32.from_column(new Array(NUMNODES-1).fill(0.1));
let edge_spring_constant = v32.from_column(new Array(NUMNODES-1).fill(0.1));
let edge_vector          = position.arg_delta_store(edges, v32.from_zeros(NUMNODES-1, 2));
let edge_length          = edge_vector.magnitude_store(v32.from_zeros(NUMNODES-1, 1));

let edge_force_magnitude = edge_rest_length.sub_store(edge_length, v32.from_zeros(NUMNODES-1,1)).mul_self(edge_spring_constant);

// points to same object as edge vector
let edge_force            = edge_vector.div_column_self(edge_length).replace_nan_self().mul_column_self(edge_force_magnitude);





//let position_diff = position.sub_store(position2, v32.from_zeros(NUMNODES, 2))
//let magnitude = position_diff.magnitude_store(v32.from_zeros(NUMNODES, 1))

let canvas = document.querySelector("canvas")
let ctx = canvas.getContext('2d');
run(performance.now())
function run(time){
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    simulate()
    draw()
    requestAnimationFrame(run)
}


function simulate(){
    position            .arg_delta_store (edges, edge_vector);
    edge_vector         .magnitude_store (edge_length);
    edge_rest_length    .sub_store       (edge_length, edge_force_magnitude)
    edge_force_magnitude.mul_self        (edge_spring_constant);
    edge_vector         .div_column_self (edge_length)
    edge_vector         .replace_nan_self()
    edge_vector         .mul_column_self (edge_force_magnitude);

    for(let i=0;i<edges.length;i+=2){
        let index_a = edges[i];
        let index_b = edges[i + 1];
        velocity.data[index_a*velocity.columns] += edge_vector.data[i]
        velocity.data[index_a*velocity.columns+1] += edge_vector.data[i+1]
        velocity.data[index_b*velocity.columns] -= edge_vector.data[i]
        velocity.data[index_b*velocity.columns+1] -= edge_vector.data[i+1]
    }

    //velocity            .add_self        (edge_vector);

    position.add_self(velocity);
    velocity.scalar_mul_self(0.98);
}



function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let rows = position.iter_rows();
    ctx.beginPath()
    ctx.moveTo(...rows.next().value);
    for(let coords of rows){
        ctx.lineTo(...coords);
    }
    ctx.stroke();
}