// numpy defaults to row major ordering in memory layout... i dont know what that means; we have opted for
//  0,  1,  2
//  3,  4,  5
//  6,  7,  8
//  9, 10, 11
// 12, 13, 14
// 15, 16, 17
// ....


/**
 * @property {Float32Array} data
 * @property {number} rows
 * @property {number} columns
 */
class v32{

    data;
    rows;
    columns;


    /**
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

    // ========================= STATIC CONSTRUCTORS / FACTORY FUNCTIONS =======

    static from = {   
        /**
         * @param {Number} rows 
         * @param {Number} columns 
         * @returns {v32} a zero filled array of the specified size
         */
        zeros(rows, columns){
            return new v32(new Float32Array(rows * columns), rows, columns);
        },

        /**
         * @param {Array<Array<Number>>} data 
         * @returns {v32} a new v32 array
         */
        rows(data){
            return new v32(new Float32Array(data.flat()), data.length, data[0].length);
        },

        /**
         * @param {Array<Array<Number>>} data 
         * @returns {v32} new v32 array
         */
        columns(data){
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
        },

        /**
         * @param {Array<Number>} data 
         * @returns {v32} a new v32 array
         */
        column(data){
            return new v32(new Float32Array(data), data.length, 1);
        },
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

    
    
    
    // ========================= STATIC OPPERATORS =============================
    // Because javascript does not have opperator overload (:

    /**
     * returns true if `a.rows === b.rows && a.columns === b.columns`
     * @param {v32} a 
     * @param {v32} b 
     */
    static same_shape(a, b){
        return a.rows === b.rows && a.columns === b.columns;
    }


    /**
     * find the difference between pairs of rows in `self` and stores the result in `store`.
     * Pairs to be subtracted are defined by `index_pairs`.
     * 
     * **user to assert**
     * `v32.same_shape(self, store)`
     * `self.rows === index_pairs.length / 2`
     * 
     * @param   {v32}         self
     * @param   {Uint32Array} index_pairs A flat array of pairs of indexes into `other`
     * @param   {v32}         store an array with the same number of columns as `self`, such that `self` can store the result of subtracting elements of `other`
     * @returns {v32}         store
     */
    static arg_delta(self, index_pairs, store){
        let result_index = 0;
        for(let i =0; i<index_pairs.length; i+=2){
            let index_a = index_pairs[i]   * self.columns;
            let index_b = index_pairs[i+1] * self.columns;
            for(let k=0; k < self.columns; k++){
                store.data[result_index+k] = self.data[index_a + k] - self.data[index_b + k]
            }
            result_index += self.columns;
        }
        return store;
    }


    /**
     * `store = self + other`
     * @param {v32} self 
     * @param {v32} other 
     * @param {v32} store 
     * @returns {v32} store
     */
    static add(self, other, store){
        for(let i = 0; i<self.data.length; i++){
            store.data[i] = self.data[i] + other.data[i];
        }
        return store;
    }


    /**
     * `store = self - other`
     * @param {v32} self 
     * @param {v32} other 
     * @param {v32} store 
     * @returns {v32} store
     */
    static sub(self, other, store){
        for(let i = 0; i<self.data.length; i++){
            store.data[i] = self.data[i] - other.data[i];
        }
        return store;
    }


    /**
     * `store[i] = self[i] * other[i]`
     * @param {v32} self 
     * @param {v32} other 
     * @param {v32} store 
     * @returns {v32} store
     */
    static mul(self, other, store){
        for(let i = 0; i<self.data.length; i++){
            store.data[i] = self.data[i] * other.data[i];
        }
        return store;
    }


    /**
     * `store = self / other`
     * @param {v32} self 
     * @param {v32} other 
     * @param {v32} store 
     * @returns {v32} store
     */
    static div(self, other, store){
        for(let i = 0; i<self.data.length; i++){
            store.data[i] = self.data[i] / other.data[i];
        }
        return store;
    }

    

    static replace_nans(self, store){
        for(let i = 0; i < self.data.length; i++){
            store.data[i] = isNaN(self.data[i]) ? 0 : self.data[i];
        }
        return store;
    }


    
    /**
     * Computes the L₂ magnitude of each row of `self` and stores in `store`
     * 
     * **user to assert**
     * 
     * `store.columns === 1`
     * 
     * `self.rows === store.rows`
     * 
     * @param {v32} self 
     * @param {v32} store 
     * @returns {v32} store
     */
    static magnitude(self, store){
        for(let i=0; i<self.rows; i++){
            let sum = 0;
            for(let j=0; j<self.columns; j++){
                sum += self[i*self.columns+j]**2;
            }
            store.data[i] = Math.sqrt(sum);
        }
        return store;
    }

    /**
     * `store = self ∙ other`
     * @param {v32} self 
     * @param {v32} other
     * @param {v32} store 
     * @returns {v32} store
     */
    static dot(self, store){
        throw new Error("dot() is Not Implemented Yet");
        for(let i=0; i<self.rows; i++){

        }
        return store;
    }

    static column = {
        /**
         * `store[r,c] = self[r,c] + column[r,0]`
         * @param {v32} self 
         * @param {v32} column 
         * @param {v32} store 
         * @returns {v32} store
         */
        add(){
            for(let i = 0; i < column.data.length; i++){
                let offset = i * self.columns;
                for(let j=0; j<self.columns; j++){
                    store.data[offset + j] = self[offset + j] + other.data[i];
                }
            }
            return store;
        },

        /**
         * `store[r,c] = self[r,c] - column[r,0]`
         * @param {v32} self 
         * @param {v32} column 
         * @param {v32} store 
         * @returns {v32} store
         */
        sub(){
            for(let i = 0; i < column.data.length; i++){
                let offset = i * self.columns;
                for(let j=0; j<self.columns; j++){
                    store.data[offset + j] = self[offset + j] - other.data[i];
                }
            }
            return store;
        },

        /**
         * `store[r,c] = self[r,c] * column[r,0]`
         * @param {v32} self 
         * @param {v32} column 
         * @param {v32} store 
         * @returns {v32} store
         */
        mul(self, column, store){
            for(let i = 0; i < column.data.length; i++){
                let offset = i * self.columns;
                for(let j=0; j<self.columns; j++){
                    store.data[offset + j] = self[offset + j] * other.data[i];
                }
            }
            return store;
        },

        /**
         * `store[r,c] = self[r,c] / column[r,0]`
         * @param {v32} self 
         * @param {v32} column 
         * @param {v32} store 
         * @returns {v32} store
         */
        div(self, column, store){
            for(let i = 0; i < column.data.length; i++){
                let offset = i * self.columns;
                for(let j=0; j<self.columns; j++){
                    store.data[offset + j] = self[offset + j] / other.data[i];
                }
            }
            return store;
        },
    }


    static scalar = {
        /** `store = self + scalar`
         * @param {v32} self 
         * @param {v32} scalar 
         * @param {v32} store 
         * @returns {v32} store
         */
        add(self, scalar, store){
            let fround_scalar = Math.fround(scalar);
            for(let i = 0; i<self.data.length; i++){
                store.data[i] = self.data[i] + fround_scalar;
            }
            return store;
        },

        /** `store = self - scalar`
         * @param {v32} self 
         * @param {v32} scalar 
         * @param {v32} store 
         * @returns {v32} store
         */
        sub(self, scalar, store){
            let fround_scalar = Math.fround(scalar);
            for(let i = 0; i<self.data.length; i++){
                store.data[i] = self.data[i] - fround_scalar;
            }
            return store;
        },

        /** `store = self * scalar`
         * @param {v32} self 
         * @param {v32} scalar 
         * @param {v32} store 
         * @returns {v32} store
         */
        mul(self, scalar, store){
            let fround_scalar = Math.fround(scalar);
            for(let i = 0; i<self.data.length; i++){
                store.data[i] = self.data[i] * fround_scalar;
            }
            return store;
        },

        /** `store = self / scalar`
         * @param {v32} self 
         * @param {v32} scalar 
         * @param {v32} store 
         * @returns {v32} store
         */
        div(self, scalar, store){
            let fround_scalar = Math.fround(scalar);
            for(let i = 0; i<self.data.length; i++){
                store.data[i] = self.data[i] / fround_scalar;
            }
            return store;
        },

        /** `store = scalar / self`
         * @param {v32} self 
         * @param {v32} scalar 
         * @param {v32} store 
         * @returns {v32} store
         */
        div_inverted(scalar, self, store){
            let fround_scalar = Math.fround(scalar);
            for(let i = 0; i<self.data.length; i++){
                store.data[i] = fround_scalar / self.data[i];
            }
            return store;
        }

    }


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


    // * iter_rows(){
    //     for(let i=0;i<this.data.length;i+=this.columns){
    //         yield this.data.subarray(i, i+this.columns);
    //     }
    // }
}