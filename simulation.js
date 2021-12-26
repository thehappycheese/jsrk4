let NUMNODES = 500;

let intitial_positions = Array.from(new Array(NUMNODES), (item, index) => [
    500 + (400 + Math.cos(index/NUMNODES*Math.PI*20)*40) * Math.cos(index / NUMNODES * Math.PI * 2),
    500 + (400 + Math.cos(index/NUMNODES*Math.PI*20)*40) * Math.sin(index / NUMNODES * Math.PI * 2)
]);
//intitial_positions[0] = [500, 500];

////////////////////////////
// NODE PROPERTIES
////////////////////////////
let position             = v32.from.rows    (intitial_positions);
let velocity             = v32.from.constant(0,     NUMNODES, 2);


let mass_reciprocal      = v32.from.constant(1/1,   NUMNODES, 1);
let speed                = v32.from.constant(0,     NUMNODES, 1);
let drag                 = v32.from.constant(0.988, NUMNODES, 1);

////////////////////////////
// EDGE PROPERTIES
////////////////////////////
let edges                = new Uint32Array((NUMNODES-1)*2)
for(let i=0;i<edges.length;i+=2){
    edges[i]   = i   - Math.floor(i/2);
    edges[i+1] = i+1 - Math.floor(i/2);
}
let edge_rest_length     = v32.from.column(new Array(NUMNODES-1).fill(20));
let edge_spring_constant = v32.from.column(new Array(NUMNODES-1).fill(0.3));
let edge_force           = v32.arg_delta   (position,             edges,                v32.from.constant(0, NUMNODES-1, 2));
let edge_length          = v32.magnitude   (edge_force,                                 v32.from.constant(0, NUMNODES-1, 1));
let edge_force_magnitude = v32.sub         (edge_rest_length,     edge_length,          v32.from.constant(0, NUMNODES-1, 1));
                           v32.mul         (edge_force_magnitude, edge_spring_constant, edge_force_magnitude);
                           v32.column.div  (edge_force,           edge_length,          edge_force);
                           v32.replace_nans(edge_force,                                 edge_force);
                           v32.column.mul  (edge_force,           edge_force_magnitude, edge_force);


v32.util = {
    /**
     * $y=\frac{c-d}{1+\exp\left(-\frac{\left(x-b\right)}{a}\right)}+d$
     * @param {v32} speed
     * @param {v32} output 
     */
    drag: (speed, output) => {
        // return 1/(1+np.exp(-(np.abs(mag_vel)/10-10)))*0.93+0.05
        // y=\frac{c-d}{1+\exp\left(-\frac{\left(x-b\right)}{a}\right)}+d
        let a = 2;     // spread
        let b = 10;    // offset
        let c = 0.9998; // max drag
        let d = 0.97;   // min drag
        for(let i = 0; i< speed.data.length; i++){
            output.data[i] = (c-d)/(1+Math.exp((speed.data[i]-b)/a))+d;
        }
        return output;
    }
}


let old_mouse = {x:0, y:0};
function simulate(delta_time, iterations=20){
    let mouse_vel_x = (mouse.x - old_mouse.x) / iterations;
    let mouse_vel_y = (mouse.y - old_mouse.y) / iterations;
    for(let iteration=0; iteration<iterations; iteration++){
        
        v32.arg_delta   (position,             edges,                 edge_force);
        v32.magnitude   (edge_force,                                 edge_length);
        v32.sub         (edge_rest_length,     edge_length,           edge_force_magnitude);
        v32.mul         (edge_force_magnitude, edge_spring_constant,  edge_force_magnitude);
        v32.column.div  (edge_force,          edge_length,           edge_force);
        v32.replace_nans(edge_force,                                 edge_force);
        v32.column.mul  (edge_force,          edge_force_magnitude,  edge_force);

        // Apply edge force to node velocity
        for(let i=0;i<edges.length;i+=2){
            let index_a = edges[i  ] * velocity.columns;
            let index_b = edges[i+1] * velocity.columns;
            for(let j=0; j<velocity.columns;j++){
                velocity.data[index_a + j] += edge_force.data[i + j] * mass_reciprocal.data[edges[i]];
                velocity.data[index_b + j] -= edge_force.data[i + j] * mass_reciprocal.data[edges[i+1]];
            }
        }
        
        // Apply velocity to node positions
        v32.add         (position,             velocity,              position);

        // Apply drag force to velocity
        v32.magnitude   (velocity,                                    speed);
        v32.util.drag   (speed,                                       drag);
        v32.column.mul  (drag,                 mass_reciprocal,       drag);
        v32.column.mul  (velocity,             drag,                  velocity);

        if(mouse.down){
            position.data[0] = old_mouse.x + iteration * mouse_vel_x;
            position.data[1] = old_mouse.y + iteration * mouse_vel_y;
            velocity.data[0] = 0;
            velocity.data[1] = 0;
        }
    }
    old_mouse.x=mouse.x;
    old_mouse.y=mouse.y;
}



