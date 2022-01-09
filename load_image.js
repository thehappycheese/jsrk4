

async function load_image(url){
    return new Promise((resolve, reject) =>{
        let img = document.createElement("img")
        img.addEventListener("load",(e)=>{
            let canvas = document.createElement("canvas")
            canvas.width = e.target.naturalWidth;
            canvas.height = e.target.naturalHeight;
            let ctx  = canvas.getContext('2d');
            ctx.drawImage(e.target,0.5,0.5);
            resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
        })
        img.src = url;
    })
}