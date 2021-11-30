

let NUMNODES = 500;

let intitial_positions = Array.from(new Array(NUMNODES), (item, index) => [
    100 + 50 * Math.cos(index / NUMNODES * Math.PI * 2),
    100 + 50 * Math.sin(index / NUMNODES * Math.PI * 2)
]);

let position = v32.from_rows(intitial_positions);
let position2 = v32.from_rows(intitial_positions);

position2.scalar_mul_then_store(2, position2);

let velocity = v32.from_rows(new Array(NUMNODES).fill([0,0]))

// run(performance.now())
// function run(time){

//     position.

//     requestAnimationFrame(run)
// }
