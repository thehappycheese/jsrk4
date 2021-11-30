// numpy defaults to row major ordering, so we will go with that
class v32{
    data;
    rows;
    columns;


    /**
     * 
     * @param {Float32Array} data 
     * @param {Number} rows 
     * @param {Number} columns 
     */
    constructor(data, rows, columns){
        if(rows * columns !== data.length) throw new Error("WRONG");
        this.data = data;
        this.rows = rows;
        this.columns = columns;
    }

    /**
     * 
     * @param {Number} rows 
     * @param {Number} columns 
     * @returns {v32} a zero filled array of the specified size
     */
    static from_zeros(rows, columns){
        return new v32(new Float32Array(rows * columns), rows, columns);
    }

    /**
     * 
     * @param {Array<Array<Number>>} data 
     * @returns {v32} a new v32 array
     */
    static from_rows(data){
        return new v32(new Float32Array(data.flat()), data.length, data[0].length);
    }

    /**
     * 
     * @param {Array<Array<Number>>} data 
     * @returns {v32} new v32 array
     */
    static from_columns(data){
        if (!data.every((item, index, arr)=>item.length===arr[0].length)) throw new Error("Columns must all be the same length");
        return v32.from_rows(
            Array.from(new Array(data[0].length),
            (item, index)=>data.map(item=>item[index])).flat()
        );
    }

    /**
     * 
     * @param {Array<Number>} data 
     * @returns {v32} a new v32 array
     */
    static from_column(data){
        return new v32(new Float32Array(data), data.length, 1);
    }

    clone(){
        return new v32(this.data.copy(), this.rows, this.columns)
    }

    // ========================================
    // == opperations on equaly sized arrays ==
    // ========================================
    /**
     * 
     * @param {v32} other
     * @returns {v32} self
     */
    add_to_self(other){
        for(let i = 0;i<this.data.length;i++){
            this.data[i]+=other.data[i];
        }
        return this;
    }
    /**
     * 
     * @param {v32} other 
     * @returns {v32} self
     */
    sub_from_self(other){
        for(let i = 0;i<this.data.length;i++){
            this.data[i]-=other.data[i];
        }
        return this;
    }

    /**
     * 
     * @param {v32} other
     * @param {v32} store
     * @returns {v32} store
     */
    add_then_store(other, store){
        for(let i = 0;i<this.data.length;i++){
            store.data[i] = self.data[i] + other.data[i];
        }
        return store;
    }

    /**
     * 
     * @param {v32} other
     * @param {v32} store
     * @returns {v32} store
     */
    sub_then_store(other, store){
        for(let i = 0;i<this.data.length;i++){
            store.data[i] = self.data[i] - other.data[i];
        }
        return store;
    }

    /**
     * 
     * @param {Number} scalar
     * @param {v32} store
     * @returns {v32} store
     */
    scalar_mul_then_store(scalar, store){
        scalar = Math.fround(scalar)
        for(let i = 0;i<this.data.length;i++){
            store.data[i] = this.data[i] * scalar;
        }
        return store;
    }

    /**
     * 
     * @param {v32} other 
     * @param {Float32Array} store 
     */
    dot_then_store(other, store){
        for(let i = 0; i<this.data.length; i++){
            store[i % row] += this.data[i] * other.data[i]
        }
        return store
    }

    // norm_then_store()

    toString(){
        const PAD_WIDTH = 12;
        const MAX_ROWS = 21; // should be be an uneven number for neatness
        const HALF_MAX = Math.floor(MAX_ROWS/2);
        let out = []
        if(this.rows < MAX_ROWS+1){
            for(let i = 0;i<this.data.length;i+=this.columns){
                out.push([...this.data.subarray(i,i+this.columns)].map(item=>item.toFixed(5).padStart(PAD_WIDTH)).join(" "))
            }
        }else{
            for(let i = 0;i<HALF_MAX*this.columns;i+=this.columns){
                out.push([...this.data.subarray(i,i+this.columns)].map(item=>item.toFixed(5).padStart(PAD_WIDTH)).join(" "))
            }
            out.push(new Array(this.columns).fill("...    ".padStart(PAD_WIDTH)).join(" "))
            for(let i = this.data.length - HALF_MAX*this.columns; i<this.data.length;i+=this.columns){
                out.push([...this.data.subarray(i,i+this.columns)].map(item=>item.toFixed(5).padStart(PAD_WIDTH)).join(" "))
            }
        }
        return out.join("\n")
    }

    log(){
        console.log(this.toString())
    }

}