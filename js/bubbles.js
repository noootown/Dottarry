var canvas=$('#myCanvas');
var canvasHeight=canvas.height();
var canvasWidth=canvas.width();
var context;
var collection;//collection of points, everytime I show a new image or words, new it
var clickOrNot= false; //whether the canvas is click or not
var myEraser;
var TIME_INTERVAL=30;//repeat的時間
var SHIFT_Y=-117;
var reset=false;

var imgData;//存放現在顯示在背景的圖
var imgDataStack=[];//上一步的stack
var redoImgDataStack=[];//下一步的stack
var clearImgData;//空背景圖
var panelWidth;//panel的寬

var mobileOrNot;
$(window).width()<1100 ? mobileOrNot=true:mobileOrNot=false;
$(window).mouseleave(function(){
    reset=true; 
});
$(window).mouseenter(function(){
    reset=false;
});

function Vector(x,y,z){//the x y座標
    this.x=x;
    this.y=y;
    this.z=z;
    this.setVector=function(x,y){
        this.x=x;
        this.y=y;
    };
}

function eraser(){//eraser物件
    this.color='rgb(0,0,0)';
    this.radius=ERASER_SLIDER_VALUE;
    this.eraserShape=1;
    this.mousePos;
    if(!mobileOrNot)
        this.mousePos=new Vector(ERASER_SLIDER_MAX,canvasHeight-ERASER_SLIDER_MAX);
    else
        this.mousePos=new Vector(-100,-100);

    this.draw=function(){
        if($(window).width()<1200){
            if(clickOrNot)
                drawShape(canvas,this.eraserShape,this.mousePos.x,this.mousePos.y,this.radius*2,this.color);
        }
        else if(eraseOrNot){
            drawShape(canvas,this.eraserShape,this.mousePos.x,this.mousePos.y,this.radius*2,this.color);
        }
    };
    this.update=function(){
    };
}

function pointCollection(){//the collection of dots
    this.points=[];
    this.bubbleshape=1;
    this.xyMultiple=1;
    this.dotMultiple=2;
    this.draw=function(){
        for(var i=0;i<this.points.length;i++){
            var tmppoint=this.points[i];
            if(tmppoint===null)
                continue;
            tmppoint.draw(this.bubbleshape);
        }
    };
    this.update=function(){
        for(var i=0;i<this.points.length;i++){
            var tmppoint=this.points[i];
            tmppoint.update();
        }
    };
}

function point(x,y,z,radius,color){//each points of dot
    this.pos=new Vector(x,y,z);
    this.radius=radius;
    this.size=radius;
    this.color=color;
    this.friction=0.85;
    this.springStrength=0.1;
    this.velocity=0;
    this.draw=function(bubbleshape){
        drawShape(canvas,bubbleshape,this.pos.x,this.pos.y,this.radius,this.color);
    }

    this.update=function(){
        var targetz = 1;
        var dz =targetz - this.pos.z;
        var az = dz * this.springStrength;
        this.velocity+= az;
        this.velocity*= this.friction;
        this.pos.z += this.velocity;
        this.radius = this.size * this.pos.z;
        if (this.radius < 1) this.radius = 1;
    }
}
function draw(){//draw the dots
    if(canvas.get(0).getContext===null)
        return ;
    context=canvas.get(0).getContext('2d');
    context.clearRect(0,0,canvasWidth,canvasHeight);
    context.putImageData(imgData,0,0);//放置背景圖

    if(myEraser)
        myEraser.draw();
    if(clickOrNot)//如果滑鼠有按下的話，那就一直截圖，等下一次再call draw()的時候，就可以把目前的圖再放上去，
        imgData=context.getImageData(0,0,canvasWidth,canvasHeight);
    if(collection)
        collection.draw();
    //draw canvas border
    context.beginPath();
    context.strokeStyle='rgba(0,0,0,1)';
    context.lineWidth=1;
    for(var i=0;i<2;i++){
        context.moveTo(panelWidth/2-downloadCanvasWidth/2,0);
        context.lineTo(panelWidth/2-downloadCanvasWidth/2,canvasHeight);
        context.stroke();
    }

    context.beginPath();
    context.strokeStyle='rgba(0,0,0,1)';
    context.lineWidth=1;
    for(var i=0;i<2;i++){
        context.moveTo(panelWidth/2+downloadCanvasWidth/2,0);
        context.lineTo(panelWidth/2+downloadCanvasWidth/2,canvasHeight);
        context.stroke();
    }
}

function update(){//update the dots
    if(collection)
        collection.update();
    if(myEraser)
        myEraser.update();
}

function bubblePop(){
    draw();
    update();
    setTimeout(bubblePop,TIME_INTERVAL);
}

function updateCanvas(){
    panelWidth=$('.cardDisplay').width();
    var hei=$(window).height();
    hei=hei-$('.dotSetting').height()-20;
    if(hei<250)
        hei=250;
    else if(hei>330)
        hei=330;
    canvas.attr({
        height:hei,
        width:panelWidth
    });
    canvasWidth=canvas.width();
    canvasHeight=canvas.height();
    downloadCanvasWidth=canvasWidth+2;
    CANVAS_SLIDER_MAX=canvasWidth+CANVAS_SLIDER_STEP;//設定canvas slider
    CANVAS_SLIDER_VALUE=CANVAS_SLIDER_MAX;
}

canvas.mousedown(function(e){
    if(eraseOrNot){
        clickOrNot=true;
        TIME_INTERVAL=1;//每1ms call一次bubblePop
        if(redoImgDataStack.length!=0){//如果下一步的stack不是空的，就清除之
            redoImgDataStack=[];
        }
    }
});
canvas.on('touchstart',function(e){
    console.log('haha');
    if(eraseOrNot){
        clickOrNot=true;
        TIME_INTERVAL=0;//每1ms call一次bubblePop
        if(redoImgDataStack.length!=0){//如果下一步的stack不是空的，就清除之
            redoImgDataStack=[];
        }
    }

});
canvas.mouseup(function(e){
    if(eraseOrNot){
        clickOrNot=false;
        TIME_INTERVAL=30;//換回來30ms
        imgDataStack.push(imgData);//把imgdata push到上一步的stack中。
    }
});
canvas.on('touchend',function(){
    if(eraseOrNot){
        clickOrNot=false;
        TIME_INTERVAL=30;//換回來30ms
        imgDataStack.push(imgData);//把imgdata push到上一步的stack中。
    }

});
//防步使用者畫一畫，滑鼠滑到canvas外放開
$(window).mouseup(function(e){
    if(clickOrNot){
        clickOrNot=false;
        TIME_INTERVAL=30;
        imgDataStack.push(imgData);
    }
});
canvas.mousemove(function(e){
    //calculate the mouse position, and store it to pointCollection's mouse
    myEraser.mousePos.setVector(e.pageX-canvas.offset().left,e.pageY-canvas.offset().top);
});

document.getElementById('myCanvas').addEventListener('touchmove',function(event){
    event.preventDefault();
    myEraser.mousePos.setVector(event.targetTouches[0].pageX-canvas.offset().left,event.targetTouches[0].pageY-canvas.offset().top);
},false);

function setWordComponent(words,color,bubbleshape,xymultiple,dotmultiple){//set the color and everyting about the dots
    var tmppoints=[];//array that store all dots
    var xoffset=0;//letter x offset
    var whichLetters=0;// which letter of the word
    function wordsToHex(word){
        var hex='';
        for(var i=0;i<word.length;i++)
            hex+=word.charCodeAt(i).toString(16);
        return hex;
    }
    function addLetters(letterHex,whichLetters,color){
        var charPoints=document.alphabet[letterHex].P;
        var lettercolor=color[whichLetters%color.length];
        for(var i=0;i<charPoints.length;i++){
            var tmpdot =charPoints[i];
            tmppoints.push(new point(tmpdot[0]*xymultiple+xoffset,tmpdot[1]*xymultiple,0,tmpdot[2]*dotmultiple,lettercolor));
        }
        xoffset+=document.alphabet[letterHex].W*xymultiple;//after adding a letter, shift the offset of x
    }

    var hexwords=wordsToHex(words);
    for(var i=0;i<hexwords.length;i+=2){
        var letterHex='A'+hexwords.charAt(i)+hexwords.charAt(i+1);
        addLetters(letterHex,whichLetters,color);
        if(letterHex!='A20')
            whichLetters++;
    }
    for(var i=0;i<tmppoints.length;i++){
        tmppoints[i].pos.x+=(canvasWidth-xoffset)/2;
        tmppoints[i].pos.y+=canvasHeight/2+SHIFT_Y*xymultiple;
    }
    collection=new pointCollection();
    collection.points=tmppoints;
    collection.bubbleshape=bubbleshape;
    collection.xyMultiple=xymultiple;
    collection.dotMultiple=dotmultiple;
}
//畫dot
function drawShape(canvas,shape,x,y,radius,color){
    context=canvas.get(0).getContext('2d');
    context.fillStyle=color;
    context.beginPath();
    if(shape == 1){//circle //theradius here is same as diameter, not actual radius
        context.arc(x,y,radius/2,0,Math.PI*2,true);
        context.fill();
    }
    else if (shape == 2) {//heart
        context.bezierCurveTo(x, y - 0.438 * radius, x - 0.0585 * radius, y - 0.5775 * radius, x - 0.288 * radius, y - 0.5775 * radius);
        context.bezierCurveTo(x - 0.6345 * radius, y - 0.5775 * radius, x - 0.6345 * radius, y - 0.1445 * radius, x - 0.6345 * radius, y - 0.1445 * radius);
        context.bezierCurveTo(x - 0.6345 * radius, y + 0.0575 * radius, x - 0.4035 * radius, y + 0.3115 * radius, x , y + 0.5195 * radius);
        context.bezierCurveTo(x + 0.4035 * radius, y + 0.3115 * radius, x + 0.6345 * radius, y + 0.0575 * radius, x + 0.6345 * radius, y - 0.1445 * radius);
        context.bezierCurveTo(x + 0.6345 * radius, y - 0.1445 * radius, x + 0.6345 * radius, y - 0.5775 * radius, x + 0.2885 * radius, y - 0.5775 * radius);
        context.bezierCurveTo(x + 0.1153 * radius, y - 0.5775 * radius, x , y - 0.438 * radius, x, y - 0.4035 * radius);
        context.fill();

    }
    else if(shape == 3){//square
        context.fillRect(x-radius/2,y-radius/2,radius,radius);
    }
    else if(shape == 4){//star
        context.moveTo(x, y - 0.5256 * radius);
        context.lineTo(x - 0.309 * radius, y + 0.4255 * radius);
        context.lineTo(x + 0.5 * radius, y - 0.1625 * radius);
        context.lineTo(x - 0.5 * radius, y - 0.1625 * radius);
        context.lineTo(x + 0.309 * radius, y + 0.4255 * radius);
        context.closePath();
        context.fill();
    }
    else if(shape == 5){//triangle
        context.moveTo(x, y - 0.5774 * radius);
        context.lineTo(x - 0.5 * radius, y + 0.2887 * radius);
        context.lineTo(x + 0.5* radius, y + 0.2887 * radius);
        context.closePath();
        context.fill();
    }
    else if(shape == 6){//ring
        context.strokeStyle=color;
        context.arc(x,y,radius*3/8,0,Math.PI*2,true);
        context.lineWidth=radius/4;
        context.stroke();
    }
}

