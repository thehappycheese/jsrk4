function make_fullscreen_canvas(){
    let style = document.createElement("style");
    style.setAttribute("id", "fulscreen_canvas_style")
    document.head.appendChild(style);
    style.sheet.insertRule("body, html{padding: 0; margin: 0; width:100%; height:100%;}");
    style.sheet.insertRule("canvas{width:100%;height:100%;}");


    document.body.innerHTML = "";
    let canvas = document.createElement("canvas")
    document.body.appendChild(canvas);
    let ctx = canvas.getContext('2d');

    
    window.addEventListener("resize", resize_debounced);
    setTimeout(resize, 20);
    let window_resize_demounce_timeout;
    function resize_debounced(e){
        window.clearTimeout(window_resize_demounce_timeout)
        window_resize_demounce_timeout = setTimeout(resize, 200)   
    }
    function resize(){
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
    }


    let mouse = {x:0, y:0, down:false}

    canvas.addEventListener("mousemove", function(e){
        br = canvas.getBoundingClientRect();
        mouse.x = e.clientX - br.left;
        mouse.y = e.clientY - br.top;
    });

    canvas.addEventListener("mousedown", function(e){
        if(e.button===0)
            mouse.down = true;
    });

    canvas.addEventListener("mouseup", function(e){
        if(e.button===0)
            mouse.down = false;
    });


    return [canvas, ctx, mouse]
}