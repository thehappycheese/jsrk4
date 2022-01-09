"use strict";

v32.custom = {
    /**
     * $y=\frac{c-d}{1+\exp\left(-\frac{\left(x-b\right)}{a}\right)}+d$
     * @param {v32} speed
     * @param {v32} drag_magnitude_out 
     */
    drag_magnitude: (speed, drag_magnitude_out) => {
        // return 1/(1+np.exp(-(np.abs(mag_vel)/10-10)))*0.93+0.05
        // y=\frac{c-d}{1+\exp\left(-\frac{\left(x-b\right)}{a}\right)}+d
        let a = 2;     // spread
        let b = 10;    // offset
        let c = 0.9998; // min drag
        let d = 0.97;   // max drag
        for(let i = 0; i< speed.data.length; i++){
            drag_magnitude_out.data[i] = (c-d)/(1+Math.exp((speed.data[i]-b)/a))+d;
        }
        return drag_magnitude_out;
    },

    /**
     * Compute the the sum of forces on each node resulting from stress in connected edges.
     * the stress on individual edges is preserved in `edge_force_out`.
     * @param {v32} position 
     * @param {Uint32Array} edges pairs of indecies into
     * @param {v32} edge_spring_constant 
     * @param {v32} edge_length_out
     * @param {v32} edge_force_magnitude_out 
     * @param {v32} edge_force_out Force on each edge (vector)
     * @param {v32} node_force_out Force vector, same dimentions as `position`.
     */
    compute_edge_forces: (position, edges, edge_spring_constant, edge_length_out, edge_force_magnitude_out, edge_force_out, node_force_out)=>{
        v32.arg_delta       (position,                 edges,                    edge_force_out);
        v32.magnitude       (edge_force_out,                                     edge_length_out);
        v32.column.div      (edge_force_out,           edge_length_out,          edge_force_out);
        v32.sub             (edge_rest_length,         edge_length_out,          edge_force_magnitude_out);
        v32.mul             (edge_force_magnitude_out, edge_spring_constant,     edge_force_magnitude_out);
        v32.replace_infinite(edge_force_out,                                     edge_force_out);
        v32.column.mul      (edge_force_out,           edge_force_magnitude_out, edge_force_out);

        const COLUMNS = position.columns; // == node_force_out.columns

        node_force_out.data.fill(0);

        for(let edge_index=0; edge_index<edges.length; edge_index+=2){
            let node_index_a = edges[edge_index  ] * COLUMNS;
            let node_index_b = edges[edge_index+1] * COLUMNS;
            for(let j=0; j < COLUMNS; j++){
                node_force_out.data[node_index_a + j] += edge_force_out.data[edge_index + j];
                node_force_out.data[node_index_b + j] -= edge_force_out.data[edge_index + j];
            }
        }
    },

    /**
     * `drag_magnitude_out = - ((c - d) / ( 1 + e^((speed - b)/a) ) + d)`
     * where
     * 
     * | var | function | description                                          |good default|
     * | :-: | :------: | ---------------------------------------------------- | ---------: |
     * | `a` | spread   | length of the transition from low drag to high drag  |2           |
     * | `b` | offset   | the speed at which higher drag kicks in              |10          |
     * | `c` | min drag | must satisfy `0 < c < d`                             |1-0.9998    |
     * | `d` | max drag | must satisfy `0 < d < 1`                             |1-0.97      |
     * 
     * drag_force_out = velocity * drag_ratio_out;
     * 
     * @param {v32} velocity 
     * @param {v32} speed_out 
     * @param {v32} drag_force_out
     */

    compute_drag_forces: (velocity, speed_out, drag_force_out)=>{

        v32.magnitude(velocity, speed_out);
        
        const a = 2;     
        const b = 20;
        const c = 1 - 0.9999; 
        const d = 1 - 0.99;
        for(let i = 0; i< speed_out.data.length; i++){
            let ratio = -((c - d)/(1 + Math.exp((speed_out.data[i] - b)/a)) + d);
            let offset = i * velocity.columns;
            for(let j=0; j<velocity.columns; j++){
                drag_force_out.data[offset+j] = velocity.data[offset+j] * ratio;
            }
        }
    },

    // apply_edge_force: (velocity, mass_reciprocal, edges, edge_force, store)=>{
    //     // Apply edge force to node velocity
    //     for(let i=0;i<edges.length;i+=2){
    //         let index_a = edges[i  ] * velocity.columns;
    //         let index_b = edges[i+1] * velocity.columns;
    //         for(let j=0; j<velocity.columns;j++){
    //             store.data[index_a + j] = velocity.data[index_a + j] + edge_force.data[i + j] * mass_reciprocal.data[edges[i]];
    //             store.data[index_b + j] = velocity.data[index_b + j] - edge_force.data[i + j] * mass_reciprocal.data[edges[i+1]];
    //         }
    //     }
    // },

    // compute_edge_force: (velocity, mass_reciprocal, edges, edge_force, store)=>{
    //     // Apply edge force to node velocity
    //     for(let i=0;i<edges.length;i+=2){
    //         let index_a = edges[i  ] * velocity.columns;
    //         let index_b = edges[i+1] * velocity.columns;
    //         for(let j=0; j<velocity.columns;j++){
    //             store.data[index_a + j] = velocity.data[index_a + j] + edge_force.data[i + j] * mass_reciprocal.data[edges[i]];
    //             store.data[index_b + j] = velocity.data[index_b + j] - edge_force.data[i + j] * mass_reciprocal.data[edges[i+1]];
    //         }
    //     }
    // }
}