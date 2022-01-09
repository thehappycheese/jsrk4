const NUM_NODES = 6000;
const NUM_DIMS = 2;

let undulation = index => 
     Math.cos(index/NUM_NODES*Math.PI*34)*0.5
    +Math.cos(index/NUM_NODES*Math.PI*16)*1.5;

let undulation_speed = index => 
    Math.cos(index/NUM_NODES*Math.PI*34)*0.5
   +Math.cos(index/NUM_NODES*Math.PI*16)*1.5;

let intitial_positions = Array.from(new Array(NUM_NODES), (item, index) => [
    2*850 + 2*(600 + undulation(index)*30) * Math.cos(index / NUM_NODES * Math.PI * 2),
    2*680 + 2*(500 + undulation(index)*30) * Math.sin(index / NUM_NODES * Math.PI * 2)
]);

let intitial_velocities = Array.from(new Array(NUM_NODES), (item, index) => [
    undulation_speed(index)* 0.3 * -Math.sin(index / NUM_NODES * Math.PI * 2),
    undulation_speed(index)* 0.3 *  Math.cos(index / NUM_NODES * Math.PI * 2)
]);

//intitial_positions[0] = [500, 500];

////////////////////////////
// NODE PROPERTIES
////////////////////////////
const position_old         = v32.from.rows    (intitial_positions);
const position             = v32.from.rows    (intitial_positions);
const velocity             = v32.from.rows    (intitial_velocities);//constant(0,     NUM_NODES, NUM_DIMS);


const mass_reciprocal      = v32.from.constant(1,     NUM_NODES, 1);//v32.from.column(Float32Array.from(new Array(NUM_NODES), (element, index)=>(1-(index/NUM_NODES))*0.2+0.8));
const speed                = v32.from.constant(0,     NUM_NODES, 1);
const drag_ratio           = v32.from.constant(0.988, NUM_NODES, 1);
const drag_force           = v32.from.constant(0,     NUM_NODES, NUM_DIMS);

const node_force = v32.from.constant(0, NUM_NODES, NUM_DIMS);

////////////////////////////
// EDGE PROPERTIES
////////////////////////////
const NUM_EDGES = NUM_NODES;
const edges                = new Uint32Array(NUM_EDGES * 2);
for(let i=0;i<edges.length;i+=2){
    edges[i]   = i   - Math.floor(i/2);
    edges[i+1] = i+1 - Math.floor(i/2);
}
edges[edges.length-1]=0;
const edge_rest_length     = v32.from.constant(0.2,     NUM_NODES, 1);
const edge_spring_constant = v32.from.constant(0.2,     NUM_NODES, 1);
const edge_force           = v32.from.constant(0, NUM_EDGES, NUM_DIMS);
const edge_length          = v32.from.constant(0, NUM_EDGES, 1);
const edge_force_magnitude = v32.from.constant(0, NUM_EDGES, 1);


                           

v32.custom.compute_edge_forces(position, edges, edge_spring_constant, edge_length, edge_force_magnitude, edge_force, node_force);


let old_mouse = {x:0, y:0};
function simulate(delta_time, iterations=3){
    let mouse_vel_x = (mouse.x - old_mouse.x) / iterations;
    let mouse_vel_y = (mouse.y - old_mouse.y) / iterations;
    
    position_old.copy_values(position);

    for(let iteration=0; iteration<iterations; iteration++){
        
        v32.custom.compute_edge_forces(position, edges, edge_spring_constant, edge_length, edge_force_magnitude, edge_force, node_force);
        v32.custom.compute_drag_forces(velocity, speed, drag_force);
        
        // combine edge force and drag forces
        v32.add             (node_force, drag_force,      node_force);

        // comupute acceleration
        v32.column.mul      (node_force, mass_reciprocal, node_force);
        
        // apply acceleration to velocity
        v32.add             (velocity,   node_force,      velocity);

        // Apply velocity to node positions
        v32.add             (position,   velocity,        position);


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



