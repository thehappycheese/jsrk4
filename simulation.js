let NUMNODES = 200;

let intitial_positions = Array.from(new Array(NUMNODES), (item, index) => [
    500 + (400 + Math.cos(index/NUMNODES*Math.PI*200)*120) * Math.cos(index / NUMNODES * Math.PI * 2),
    500 + (400 + Math.cos(index/NUMNODES*Math.PI*200)*120) * Math.sin(index / NUMNODES * Math.PI * 2)
]);
//intitial_positions[0] = [500, 500];

let position             = v32.from.rows(intitial_positions);
//let mass               = v32.from_column(new Array(NUMNODES).fill(1));

let velocity_k1          = v32.from.rows(new Array(NUMNODES).fill([0,0]));
let speed_k1             = new v32(new Float32Array(NUMNODES).fill(0), NUMNODES, 1);
let drag_k1              = new v32(new Float32Array(NUMNODES).fill(0.988), NUMNODES, 1);

let edges                = new Uint32Array((NUMNODES-1)*2)
for(let i=0;i<edges.length;i+=2){
    edges[i]   = i   - Math.floor(i/2);
    edges[i+1] = i+1 - Math.floor(i/2);
}
let edge_rest_length     = v32.from.column(new Array(NUMNODES-1).fill(2));
let edge_spring_constant = v32.from.column(new Array(NUMNODES-1).fill(0.5));
let edge_vector          = v32.arg_delta(position,             edges,                v32.from.zeros(NUMNODES-1, 2));
let edge_length          = v32.magnitude(edge_vector,                                v32.from.zeros(NUMNODES-1, 1));

let edge_force_magnitude = v32.sub(      edge_rest_length,     edge_length,          v32.from_zeros(NUMNODES-1,1));
                           v32.mul(      edge_force_magnitude, edge_spring_constant, edge_force_magnitude);

// points to same object as edge vector
let edge_force            = edge_vector.div_column_self(edge_length).replace_nan_self().mul_column_self(edge_force_magnitude);

/**
 * 
 * @param {v32} speed
 * @param {v32} output 
 */
function drag(speed, output){
    // return 1/(1+np.exp(-(np.abs(mag_vel)/10-10)))*0.93+0.05
    // y=\frac{c-d}{1+\exp\left(-\frac{\left(x-b\right)}{a}\right)}+d
    let c = 0.995
    let a = 10
    let b = 100
    let d = 0.95
    for(let i = 0; i< speed.data.length; i++){
        output.data[i] = (c-d)/(1+Math.exp((speed.data[0]-b)/a))+d;
    }
}


let old_mouse = {x:0, y:0};
function simulate(delta_time, iterations=20){
    let mouse_vel_x = (mouse.x - old_mouse.x) / iterations;
    let mouse_vel_y = (mouse.y - old_mouse.y) / iterations;
    for(iteration=0;iteration<iterations;iteration++){
        
        edge_vector         .arg_delta       (position, edges);

        edge_length         .magnitude       (edge_vector);

        // edge_rest_length    .sub_store       (edge_length, edge_force_magnitude)
        edge_force_magnitude.sub             (edge_rest_length, edge_length);
        edge_force_magnitude.mul_self        (edge_spring_constant);
        edge_vector         .div_column_self (edge_length)
        edge_vector         .replace_nan_self()
        edge_vector         .mul_column_self (edge_force_magnitude);

        for(let i=0;i<edges.length;i+=2){
            let index_a = edges[i];
            let index_b = edges[i + 1];
            velocity_k1.data[index_a*velocity_k1.columns  ] += edge_vector.data[i]
            velocity_k1.data[index_a*velocity_k1.columns+1] += edge_vector.data[i+1]
            velocity_k1.data[index_b*velocity_k1.columns  ] -= edge_vector.data[i]
            velocity_k1.data[index_b*velocity_k1.columns+1] -= edge_vector.data[i+1]
        }

        position.add_self(velocity_k1);
        velocity_k1.magnitude_store(speed_k1)
        drag(speed_k1, drag_k1);
        velocity_k1.mul_column_self(drag_k1);

        if(mouse.down){
            position.data[0] = old_mouse.x + iteration * mouse_vel_x;
            position.data[1] = old_mouse.y + iteration * mouse_vel_y;
            velocity_k1.data[0] = 0;
            velocity_k1.data[1] = 0;
        }
    }
    old_mouse.x=mouse.x;
    old_mouse.y=mouse.y;
}



