

let NUMNODES = 500;

let intitial_positions = Array.from(new Array(NUMNODES), (item, index) => [
    100 + 50 * Math.cos(index / NUMNODES * Math.PI * 2),
    100 + 50 * Math.sin(index / NUMNODES * Math.PI * 2)
]);

let position = v32.from_rows(intitial_positions);
let mass     = v32.from_column(new Array(NUMNODES).fill(1));

let velocity = v32.from_rows(new Array(NUMNODES).fill([0,0]));


let edges                = Array.from(Array(NUMNODES-1), (_, index) => [index, index+1])
let edge_rest_length     = v32.from_column(new Array(NUMNODES-1).fill(5))
let edge_spring_constant = v32.from_column(new Array(NUMNODES-1).fill(0.1))
let edge_delta           = position.arg_delta_store(edges, v32.from_zeros(NUMNODES-1, 2));
let edge_length          = edge_delta.magnitude_store(v32.from_zeros(NUMNODES-1, 1))


let edge_force_magnitude = edge_rest_length.sub_store(edge_length, v32.from_zeros(NUMNODES-1,1)).mul_self(edge_spring_constant)

let edge_unit



// let position_deltas = position.diff_store(v32.from_zeros(NUMNODES-1, 1))


let position2 = v32.from_rows(intitial_positions);


position2.scalar_mul_store(2, position2);






let position_diff = position.sub_store(position2, v32.from_zeros(NUMNODES, 2))
//let magnitude = position_diff.magnitude_store(v32.from_zeros(NUMNODES, 1))


run(performance.now())
function run(time){
    
    


    requestAnimationFrame(run)
}
