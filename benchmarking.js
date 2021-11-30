
let times, k;

const NUM = 1_000_000;

let a = new Float32Array(NUM).fill(2)
let b = new Float32Array(NUM).fill(3)

let an = new Array(NUM).fill(2)
let bn = new Array(NUM).fill(3)


console.log("GPU")
gpu = new GPU();
const v_multiply = gpu.createKernel(function(a, b){
    return 0; //a[this.thread.x] * b[this.thread.x]
},{output:[NUM]})

times = []
for(k=0;k<20;k++){
    let s = performance.now()
    let f = v_multiply(a, b)
    let e = performance.now()
    times.push(e-s)
}
console.log(times)
console.log(times.reduce((acc,item)=>acc+item)/times.length)


// console.log(
//     v_multiply(
//         [new Array(100).fill(2),new Array(100).fill(3)],
//         [new Array(100).fill(3),new Array(100).fill(6)]
//     )    
// )

// const NUM = 100;

// const N = [
//     new Array(100).fill(0)
// ]

console.log("js multiply in for loop - 32 bit float")
times = []
for(k=0;k<20;k++){
    let s = performance.now()
    let r = new Float32Array(5000000)
    for(let i = 0;i<a.length;i++){
        r[i] = a[i]*b[i];
    }
    let e = performance.now()
    times.push(e-s)
}
console.log(times)
console.log(times.reduce((acc,item)=>acc+item)/times.length)


function mul_js(a,b){
    return a*b
}

console.log("js multiply function - 32 bit float")
times = []
for(k=0;k<20;k++){
    let s = performance.now()
    let r = new Float32Array(5000000)
    for(let i = 0;i<a.length;i++){
        r[i] = mul_js(a[i], b[i]);
    }
    let e = performance.now()
    times.push(e-s)
}
console.log(times)
console.log(times.reduce((acc,item)=>acc+item)/times.length)


console.log("multiply in for loop - 64 bit js")
times = []
for(k=0;k<20;k++){
    let s = performance.now()
    let r = new Array(5000000)
    for(let i = 0;i<a.length;i++){
        r[i] = a[i]*b[i];
    }
    let e = performance.now()
    times.push(e-s)
}
console.log(times)
console.log(times.reduce((acc,item)=>acc+item)/times.length)

function mul_js2(a,b){
    return a*b
}

console.log("multiply in function - 64 bit js")
times = []
for(k=0;k<20;k++){
    let s = performance.now()
    let r = new Array(5000000)
    for(let i = 0;i<a.length;i++){
        r[i] = mul_js2(a[i],b[i]);
    }
    let e = performance.now()
    times.push(e-s)
}
console.log(times)
console.log(times.reduce((acc,item)=>acc+item)/times.length)

// mul f32: 14.6
// mul f64: 22.5

// mul root f32: 15.23
// mul root f64: 22.94

