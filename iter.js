"use strict";

const iter = {
    /**
     * stops at end of shortest array
     * @param {Generator} a 
     * @param {Generator} b 
     * @yields {Array[]}
     */
    * zip(a, ...bs){
        for(let item_a of a){
            let result = [item_a];
            let done = false;
            for(let b of bs){
                let iter_b = b.next();
                done = done || iter_b.done
                result.push(iter_b.value)
            }
            yield result;
            if (done)
                break;
        }
    },

    * pairwise(a){
        let iter_a = a.next();
        let old_a = iter_a.value;
        for(let item_a of a){
            yield [old_a, item_a]
            old_a = item_a;
        }
    },

    * apply(iterable, func){
        for(let item of iterable){
            yield func(item)
        }
    },

    * from_arr(arr){
        for(let item of arr){
            yield item;
        }
    },

    * enumerate(gen){
        let counter = 0;
        for(let item of gen){
            yield [counter, item];
            counter++;
        }
    },

    * wrap(gen){
        let counter = 0;
        let iter_first = gen.next();
        if(iter_first.done) return;
        yield iter_first.value
        for(let item of gen){
            yield item;
        }
        yield iter_first.value
    },

    array:{
        /**
         * stops at end of shortest array
         * @param {Array} a 
         * @param {Array} b 
         * @yields {Array[]}
         */
        * zip(a,b){
            let to_i = Math.min(a.length, b.length);
            for(let i=0;i<to_i;i++){
                yield [a[i], b[i]];
            }
        }
    }
}