// numpy defaults to row major ordering in memory layout... i dont know what that means; we have opted for
//  0,  1,  2
//  3,  4,  5
//  6,  7,  8
//  9, 10, 11
// 12, 13, 14
// 15, 16, 17
// ....
// Each vector 


// note: calling mul_column_self(_.invert_self()) is about half as fast

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
        let columns = data.length;
        let rows    = data[0].length;

        return new v32(
            Float32Array.from(
                new Float32Array(rows * columns),
                (item, index) => data[index % columns][Math.floor(index / columns)]
            ),
            rows,
            columns
        )
    }

    /**
     * 
     * @param {Array<Number>} data 
     * @returns {v32} a new v32 array
     */
    static from_column(data){
        return new v32(new Float32Array(data), data.length, 1);
    }

    /**
     * 
     * @param {Array<Array<Number>>} index_pairs
     * @param {v32} store
     * @returns {v32} store
     */
    arg_delta_store(index_pairs, store){
        let result_index = 0;
        for(let i =0; i<index_pairs.length; i++){
            let index_a = index_pairs[i]   * this.columns;
            let index_b = index_pairs[i+1] * this.columns;
            let a = this.data.subarray(index_a, index_a + this.columns)
            let b = this.data.subarray(index_b, index_b + this.columns)
            for(let k=0; k < this.columns; k++){
                store.data[result_index+k] = b[k]-a[k]
            }
            result_index += this.columns;
        }
        return store;
    }

    /**
    * @returns {v32} a copy of this v32 object refering to a new array in memory
    */
    clone(){
        return new v32(Float32Array.from(this.data), this.rows, this.columns);
    }

    /**
    * @param {v32} other Copy values from other into self
    * @returns {v32} self
    */
    copy_values(other){
        for(let i =0;i<this.data.length;i++){
            this.data[i] = other.data[i]
        }
        return this
    }

    // ========================================
    // == opperations on equaly sized arrays ==
    // ========================================
    /**
     * Add other to self
     * @param {v32} other
     * @returns {v32} self
     */
    add_self(other){
        for(let i = 0;i<this.data.length;i++){
            this.data[i]+=other.data[i];
        }
        return this;
    }

    /**
     * sub other from self
     * @param {v32} other 
     * @returns {v32} self
     */
    sub_self(other){
        for(let i = 0;i<this.data.length;i++){
            this.data[i]-=other.data[i];
        }
        return this;
    }

    /**
     * multiply other from self (elementwise)
     * @param {v32} other 
     * @returns {v32} self
     */
     mul_self(other){
        for(let i = 0; i < this.data.length; i++){
            this.data[i] *= other.data[i];
        }
        return this;
    }

    /**
     * divide self by other (elementwise) store in self
     * @param {v32} other 
     * @returns {v32} self
     */
    div_self(other){
        for(let i = 0; i < this.data.length; i++){
            this.data[i] /= other.data[i];
        }
        return this;
    }

    /**
     * divide self by other column (broadcasting over columns) store in self
     * @param {v32} other 
     * @returns {v32} self
     */
     div_column_self(column){ // works best at 5_000_000 rows
        for(let i = 0; i < column.data.length; i++){
            let offset = i*this.columns;
            for(let j=0;j<this.columns;j++){
                this.data[offset + j] /= column.data[i];
            }
        }
        return this;
    }

    mul_column_self(column){
        for(let i = 0; i < column.data.length; i++){
            let offset = i*this.columns;
            for(let j=0;j<this.columns;j++){
                this.data[offset + j] *= column.data[i];
            }
        }
        return this;
    }
    /**
     * @param {Number} scalar
     * @returns {v32} self
     */
     scalar_mul_self(scalar){
        scalar = Math.fround(scalar)
        for(let i = 0;i<this.data.length;i++){
            store.data[i] = this.data[i] * scalar;
        }
        return this;
    }


    invert_self(){ 
        for(let i = 0; i < this.data.length; i++){
            this.data[i] = Math.fround(1) / this.data[i];
        }
        return this;
    }

    replace_nan_self(){ 
        for(let i = 0; i < this.data.length; i++){
            this.data[i] = isNaN(this.data[i]) ? 0 : this.data[i];
        }
        return this;
    }

    /**
     * 
     * @param {v32} other
     * @param {v32} store
     * @returns {v32} store
     */
    add_store(other, store){
        for(let i = 0;i<this.data.length;i++){
            store.data[i] = this.data[i] + other.data[i];
        }
        return store;
    }

    /**
     * 
     * @param {v32} other
     * @param {v32} store
     * @returns {v32} store
     */
    sub_store(other, store){
        for(let i = 0;i<this.data.length;i++){
            store.data[i] = this.data[i] - other.data[i];
        }
        return store;
    }

    /**
     * 
     * @param {Number} scalar
     * @param {v32} store
     * @returns {v32} store
     */
    scalar_mul_store(scalar, store){
        scalar = Math.fround(scalar)
        for(let i = 0;i<this.data.length;i++){
            store.data[i] = this.data[i] * scalar;
        }
        return store;
    }

    /**
     * 
     * @param {Number} scalar
     * @param {v32} store
     * @returns {v32} store
     */
    scalar_div_store(scalar, store){
        scalar = Math.fround(scalar)
        for(let i = 0; i<this.data.length; i++){
            store.data[i] = this.data[i] / scalar;
        }
        return store;
    }

    /**
     * 
     * @param {v32} store
     */
    magnitude_store(store){
        for(let i=0; i<this.rows; i+=1){
            store.data[i] = Math.sqrt(this.data.subarray(i*this.columns, (i + 1)*this.columns).reduce((acc, cur)=>acc+cur**2, 0))
        }
        return store;
    }

    /**
     * 
     * @param {v32} other 
     * @param {Float32Array} store 
     */
    dot_store(other, store){
        for(let i = 0; i<this.data.length; i++){
            store[i % row] += this.data[i] * other.data[i]
        }
        return store;
    }

    // norm_then_store()

    toString(){
        const PAD_WIDTH = 12;
        const MAX_ROWS = 20;
        const HALF_MAX = Math.floor(MAX_ROWS/2);
        let out = [
            `v32 (${this.columns}, ${this.rows})`.padStart((PAD_WIDTH)*this.columns+this.columns-1, " "),
            "".padEnd((PAD_WIDTH)*this.columns+this.columns-1, "-")
        ]
        if(this.rows < HALF_MAX*2 + 1){
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


    * iter_rows(){
        for(let i=0;i<this.data.length;i+=this.columns){
            yield this.data.subarray(i, i+this.columns);
        }
    }
}