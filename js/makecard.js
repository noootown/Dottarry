var choosedColorNum=1; //目前頁面已選顏色數量 每換一次selectPage，就要更新一次
var currentColor=-1; //目前drag over的位置
var dragId; //drag起來的ID
var dragColor; //drag起來的color
var dragNum; //drag起來的號碼、順位
var dragObject;//0 colorList span 1 selected color 2 eraser shape
var dragEraserShape;

var doc=$(document);

//slider的各項設定，可以直接在這裡做修改
var TEXT_SLIDER_VALUE=1;
var TEXT_SLIDER_MAX=2;
var TEXT_SLIDER_MIN=0.1;
var TEXT_SLIDER_STEP=0.05;
var DOT_SLIDER_VALUE=2;
var DOT_SLIDER_MAX=10;
var DOT_SLIDER_MIN=0.1;
var DOT_SLIDER_STEP=0.05;
var ERASER_SLIDER_VALUE=20;
var ERASER_SLIDER_MAX=40;
var ERASER_SLIDER_MIN=0;
var ERASER_SLIDER_STEP=2;
var CANVAS_SLIDER_STEP=20;
var CANVAS_SLIDER_MAX;
var CANVAS_SLIDER_VALUE;
var CANVAS_SLIDER_MIN=2;

//最多支援幾色
var MAX_COLOR_NUM=8;

//shpae名稱
var shapeName=['circle','heart','square','star','triangle','ring'];

//文字的一些設定
var colors=['rgb(0,0,0)'];
var allWords="";
var bubbleShape=1;//1~6
var xymultiple=TEXT_SLIDER_VALUE;
var dotmultiple=DOT_SLIDER_VALUE;
var eraseOrNot=false;
var tmpEraseOrNot=eraseOrNot;//儲存目前的eraseOrNot狀態

//eraser大小和顏色顯示的canvas
var eraserCanvas=$('#eraserCanvas');
var eraserContext;

//比對的正規表示式
var inputRegStr=/[\x20-\x24\x26-\x5F\x61-\x7E]*/;

var setDownloadDialogOrNot=false;//判斷是否已在myDownloadDialog裡加了<a>和一些必要元素
var downloadCanvasWidth;//要下載的圖片的寬，也是裝我們要下載的圖的canvas的寬
var filename;//下載檔名
var downloadImg;//要下載的圖片

var pressOrNot=false;
var shapeClickProcess;//紀錄按壓shapebtn1秒的timer和ID
var colorClickProcess;//紀錄按壓colorbtn1秒的timer和ID
(function($){
    $.fn.showDialog=function(){//現出dialog
        $('div.myDialogModal').css('visibility','visible');
        this.animate({
            top:50
        },{
            duration:400,
            effect:'slide',
            easing:'easeOutBack'
        });
        return this;
    };
    $.fn.hideDialog=function(){//藏起dialog
        $('div.myDialogModal').css('visibility','hidden');
        this.animate({
            top:-200
        },{
            duration:400,
            effect:'slide',
            easing:'easeInBack'
        });
        var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html, body');
        setTimeout(function(){//在dialog滑回去後緊接將scroll拉回canvas的動畫
            $body.animate({
                scrollTop: $('div.navbar').height()+10
            }, 1000, 'easeOutBack');},401);
        return this;
    };
})(jQuery);

function initSetting(){//初始化所有特性和特性的設定器
    var sel=$('#myAlertDialog');
    $('#dotWords').change(function(){
        var str=$('#dotWords').val();
        if(str.match(inputRegStr)[0]==str){//判斷輸入字串是否符合格式
            allWords=$('#dotWords').val();
            updateWord();
        }
        else{
            $('#myAlertDialog').showDialog();
            $('#btnOk').focus();//focus在OK，讓使用者可以一按enter就消除對話框
            $('#myAlertDialog').find('#btnOk').on('click',function(){
                $('#myAlertDialog').hideDialog();
            });
        }
    });
    $('#dotWords').attr('placeholder','Whatever you want!!!');//設定dotword輸入框的hint
    $('#text-slider').slider({//設定text-slider的一些設定
        value:TEXT_SLIDER_VALUE,
        max:TEXT_SLIDER_MAX,
        min:TEXT_SLIDER_MIN,
        step:TEXT_SLIDER_STEP,
        stop:function(event,ui){
            xymultiple=$('#text-slider').slider('value');
            updateWord();
        }
    });
    $('#dot-slider').slider({//設定dot-slider的一些設定
        value:DOT_SLIDER_VALUE,
        max:DOT_SLIDER_MAX,
        min:DOT_SLIDER_MIN,
        step:DOT_SLIDER_STEP,
        stop:function(event,ui){
            dotmultiple=$('#dot-slider').slider('value');
            updateWord();
        }
    });
    $('#canvas-slider').slider({//設定canvas-slider的一些設定
        value:CANVAS_SLIDER_VALUE,
        max:CANVAS_SLIDER_MAX,
        min:CANVAS_SLIDER_MIN,
        step:CANVAS_SLIDER_STEP,
        stop:function(event,ui){
            downloadCanvasWidth=$('#canvas-slider').slider('value');
            if(downloadCanvasWidth>canvasWidth)
                downloadCanvasWidth=canvasWidth+2;//+2是加兩條線的寬
            draw();
        }
    });
    //shapebtn
    $('#shape'+bubbleShape).addClass('active');
    //在按下按鈕的時候，先把之前1秒的timer取消掉，開始一個新的timer，這是為了防止使用者連續點多個按鈕
    $('.shapeBtn').on('mousedown',function(e){
        pressOrNot=false;
        var self=$(this);
        clearTimeout(shapeClickProcess);
        shapeClickProcess=setTimeout(function(){
            if(!pressOrNot)//時間到了，如果使用還沒把手鬆開，那就更改eraser shape
                mobileSelectEraserShape(self);
            else
                pressOrNot=false;
        },1000);
    });
    $('.shapeBtn').on('mouseup',function(e){
        if(!pressOrNot){
            pressOrNot=true;//使用者一放開，就更改這個boolean
            $('#shape'+bubbleShape).removeClass('active');
            bubbleShape=Number($(this).prop('id').substr(5,1));
            $('#shape'+bubbleShape).addClass('active');
            updateWord();//重畫點圖
        }
    });

    $('.shapeBtn').attr('draggable',true);

    //dotWord
    $('#dotWords').val("");
    //choosedColor
    $('#choosedColor')
        .attr('ondrop','dropFunc(event)')
        .attr('ondragover','dragOverFunc(event)');
    $('#choosedColor').children()//設定一開始的為black
        .prop('style','background-color: rgb(0,0,0)')
        .prop('title','black');
    $('span.color')
        .attr('draggable',true)
        .attr('ondragend','dragEndFunc(event)');
    choosedColorNum=1;

    //eraser canvas
    $('#eraserCanvasDiv')
        .attr('ondrop','dropFunc(event)')
        .attr('ondragover','dragOverFunc(event)');
    drawShape(eraserCanvas,myEraser.eraserShape,eraserCanvas.height()/2,eraserCanvas.height()/2,myEraser.radius*2,myEraser.color);

    $('#eraser-slider').slider({
        value:ERASER_SLIDER_VALUE,
        max:ERASER_SLIDER_MAX,
        min:ERASER_SLIDER_MIN,
        step:ERASER_SLIDER_STEP,
        stop:function(event,ui){
            var value=$('#eraser-slider').slider('value');
            myEraser.radius=value;
            eraserContext.clearRect(0,0,eraserCanvas.width(),eraserCanvas.height());
            drawShape(eraserCanvas,myEraser.eraserShape,eraserCanvas.height()/2,eraserCanvas.height()/2,myEraser.radius*2,myEraser.color);
        }
    });

    $('.eraserCheck').on('click',function(e){
        $('#myCanvas').toggleClass('active');
        //$('#subNavBar').toggleClass('cannotSlideDown');//必免navbar把canvas遮住，造成橡皮擦不能滑到最上面
        $(this).toggleClass('active');
        eraseOrNot=!eraseOrNot;
    });

    //edit
    $('#edit1').on('click',function(){
        var dialog=$('#myResetDialog');
        dialog.showDialog();
        dialog.find('#btnCancel').focus().on('click',function(){
            dialog.hideDialog();
        });
        dialog.find('#btnOk').on('click',function(){
            imgData=clearImgData; 
            imgDataStack=[]; 
            redoImgDataStack=[]; 
            $('#dotWords').val('');
            allWords='';
            collection=new pointCollection();
            dialog.hideDialog();
        })
    });

    $('#edit2').on('click',function(){
        if(imgDataStack.length!=0){
            redoImgDataStack.push(imgDataStack.pop());//如果仍可上一步，那就把pop出來的到下一步的stack裡。
            if(imgDataStack.length==0)
                imgData=clearImgData;
            else
                imgData=imgDataStack[imgDataStack.length-1];
        }
        draw();
    });
    $('#edit3').on('click',function(){
        if(redoImgDataStack.length!=0){
            imgDataStack.push(redoImgDataStack.pop());//同復原，但方向相反
            imgData=imgDataStack[imgDataStack.length-1];
        }
        draw();
    });
    $('#edit4').on('click',function(){
        tmpEraseOrNot=eraseOrNot;//儲存目前的eraseOrNot狀態，因為接下來要把它變false，橡皮擦才不會被截圖
        $('#filenameInput').val(allWords);
        $('#filenameInput').attr('placeholder','filename');
        eraseOrNot=false;
        var dialog=$('#myDownloadDialog');
        dialog.showDialog();
        dialog.find('#btnCancel').focus().on('click',function(){
            eraseOrNot=tmpEraseOrNot;
            dialog.hideDialog();
        });

        dialog.find('#btnPng').on('click',function(){
            if(downloadCanvasWidth==2)
            return;
        setDownloadCanvas(0);
        $('#btnPng')
            .attr('download',filename+'.png')
            .attr('href',document.getElementById('downloadCanvas').toDataURL('image/png'));
        eraseOrNot=tmpEraseOrNot;
        dialog.hideDialog();
        });

        dialog.find('#btnJpeg').on('click',function(){
            if(downloadCanvasWidth==2)//如果兩條邊線重疊
            return;
        setDownloadCanvas(1);
        $('#btnJpeg')
            .attr('download',filename+'.jpeg')
            .attr('href',document.getElementById('downloadCanvas').toDataURL('image/jpeg'));
        eraseOrNot=tmpEraseOrNot;
        dialog.hideDialog();
        });

        dialog.find('btnCancel').on('click',function(){
            dialog.hideDialog();
        });
    });

    $('#edit5').on('click',function(){
        location.replace()
    });

    $('.colorList>span.color').on('mousedown',function(e){//和shape那邊的一模一樣
        pressOrNot=false;
        var self=$(this);
        clearTimeout(colorClickProcess);
        colorClickProcess=setTimeout(function(){
            if(!pressOrNot){
                mobileSelectEraserColor(self);
            }
            else
            pressOrNot=false;
        },1000);
    });

    $('.colorList>span.color').on('mouseup',function(e){
        if(!pressOrNot){
            pressOrNot=true;
            selectColor($(this));
        }
    });
}

function selectColor(btn){//選色
    if(choosedColorNum==MAX_COLOR_NUM)
        return ;
    btn.clone()//設定一些event function
        .prop('id','color'+(++choosedColorNum))
        .appendTo($('#choosedColor'));
    updateChoosedColor();
}
//$(document).on('click','div.colorList>span.color',selectColor);

function deleteColor(){//刪除顏色
    if(choosedColorNum==1)
        return ;
    $(this).remove();
    //重設id
    var colorSpan=$('#choosedColor').children();
    --choosedColorNum;
    for(var i=1;i<=choosedColorNum;i++){
        $(colorSpan[i-1]).prop('id','color'+i);
    }
    updateChoosedColor();
}
$(document).on('click','#choosedColor>span.color',deleteColor);

function dragFunc(event){//儲存一些拿起色塊的資訊
    if($(this).parent().hasClass('colorList')){//代表要換橡皮擦背景色
        dragEraserColor=$(this).attr('style').substring(18);
        dragObject=0;
    }
    else if($(this).parent().hasClass('btn-group')){//代表要換橡皮擦形狀
        dragEraserShape=$(this).attr('id').substring(5);
        dragObject=2;
    }
    else{
        dragColor=event.target.style['background-color'];//如果拿起的色塊是colorlist的話，代表要拖曳順序
        dragId=event.target.id;
        dragNum=Number(dragId.substr(5,1));
        currentColor=Number(event.target.id.substr(5,1));
        dragObject=1;
    }
}
$(document).on('dragstart','span.color',dragFunc);
$(document).on('dragstart','.shapeBtn',dragFunc);

function dropFunc(event){
    event.preventDefault();
    var x=event.pageX;
    var x1,x2;
    var dropOrNot=true;//判斷是否可以drop
    var colorSpan;
    var dragColorSpan;
    if(dragObject==0){
        if(x>$('#eraserCanvasDiv').offset().left){
            myEraser.color=dragEraserColor;
            eraserContext.clearRect(0,0,eraserCanvas.width(),eraserCanvas.height());
            drawShape(eraserCanvas,myEraser.eraserShape,eraserCanvas.height()/2,eraserCanvas.height()/2,myEraser.radius*2,myEraser.color);
        }
    }
    else if(dragObject==2){
        if(x>$('#eraserCanvasDiv').offset().left){
            myEraser.eraserShape=dragEraserShape;
            eraserContext.clearRect(0,0,eraserCanvas.width(),eraserCanvas.height());
            drawShape(eraserCanvas,myEraser.eraserShape,eraserCanvas.height()/2,eraserCanvas.height()/2,myEraser.radius*2,myEraser.color);
        }
    }
    else if(dragObject==1){
        //判斷各種不能drop的狀況
        if(x<$('#choosedColor').offset().left)
            dropOrNot=false;
        else if(dragNum==choosedColorNum && x>$('#color'+choosedColorNum).offset().left)
            dropOrNot=false;
        else if(x>($('#choosedColor').offset().left+$('#choosedColor').width()))
            dropOrNot=false;
        else if(dragNum!=1 && dragNum!=choosedColorNum){
            x1=$('#color'+(dragNum-1)).offset().left;
            x2=$('#color'+(dragNum+1)).offset().left;//如果dragNum是string，+1的話，是字串的相加，不是數字的相加，而減就不會有這個問題。但是經typeof 確認dragNum是number
            if(x1<=x && x<x2)
                dropOrNot=false;
        }
        dragColorSpan=$('#'+dragId); 
        if(dropOrNot){
            dragColorSpan.remove();
            $('#colorBlock').after(dragColorSpan.clone());
        }

        $('#colorBlock').remove();
        //重設id
        colorSpan=$('#choosedColor').children();
        for(var i=1;i<=choosedColorNum;i++){
            colorSpan.prop('id','color'+i);
            if(i!=choosedColorNum)
                colorSpan=colorSpan.next();
        }
        if(dropOrNot)
            updateChoosedColor();
    }
}

function dragOverFunc(event){
    event.preventDefault();
    var x=event.pageX;
    var x1;
    var x2;
    var nextIdNum;
    if(dragObject==0 || dragObject==2){
    }
    else if(dragObject==1){
        if(x<$('#color1').offset().left && currentColor!=1){
            $('#colorBlock').remove();
            $('#color1').before('<span class="color" id="colorBlock" style="background-color: rgb(240,240,240)"></span>');//colorBlock是空出的小隔間
            currentColor=1;
            return;
        }
        for(var i=1;i<=choosedColorNum;i++){
            if(i==dragNum || i==dragNum-1)
                continue;
            x1=$('#color'+i).offset().left;
            if(i<choosedColorNum)    //要確定i不是最後一個色塊，否則('#color'+(i+1))是undefined
                x2=$('#color'+(i+1)).offset().left;
            if( ((i!=choosedColorNum && x1<=x && x<x2) || (i==choosedColorNum && x1<=x) ) && currentColor!=(i+1)){
                $('#colorBlock').remove();
                $('#color'+i).after('<span class="color" id="colorBlock" style="background-color: rgb(240,240,240)"></span>');
                currentColor=i+1;
                break;
            }
        }
    }
}

//移除多的小格子
function dragEndFunc(event){
    if(dragObject==1)
        $('#colorBlock').remove();
}

function mobileSelectEraserColor(btn){
    myEraser.color=btn.attr('style').substring(18);
    eraserContext.clearRect(0,0,eraserCanvas.width(),eraserCanvas.height());
    drawShape(eraserCanvas,myEraser.eraserShape,eraserCanvas.height()/2,eraserCanvas.height()/2,myEraser.radius*2,myEraser.color);
}

function mobileSelectEraserShape(btn){
    myEraser.eraserShape=Number(btn.prop('id').substr(5,1));
    eraserContext.clearRect(0,0,eraserCanvas.width(),eraserCanvas.height());
    drawShape(eraserCanvas,myEraser.eraserShape,eraserCanvas.height()/2,eraserCanvas.height()/2,myEraser.radius*2,myEraser.color);
}

//更新選擇的顏色
function updateChoosedColor(){
    colors.length=0;
    var selectChoosedColor= $('#choosedColor').children();
    for(var i=0;i<selectChoosedColor.length;i++){
        colors.push($(selectChoosedColor[i]).attr('style').substring(18));
    }
    updateWord();
}

//更新字
function updateWord(){
    setWordComponent(allWords,colors,bubbleShape,xymultiple,dotmultiple);
}

//判斷navbar下滑或上滑，用一個subNavBar做感應。
function navbarSlideDown(){
    if(!eraseOrNot)
        setTimeout(function(){
            $('#mainNavBar').animate({
                opacity:1,
            top:'0px'
            },500);},0);
}
$(document).on('mouseover','#subNavBar',navbarSlideDown);

function navbarSlideUp(){
    setTimeout(function(){
        $('#mainNavBar').animate({
            opacity:0,
            top:'-50px'
        },500);},2000);
}
$(document).on('mouseout','#subNavBar',navbarSlideUp);

function setDownloadCanvas(type){//0:png 1:jpeg
    var downloadCanvas=$('#downloadCanvas');
    downloadCanvas.attr({
        height:canvasHeight,
        width:downloadCanvasWidth-2//line width
    });
    var downloadContext=downloadCanvas.get(0).getContext('2d');
    downloadContext.clearRect(0,0,downloadCanvasWidth,canvasHeight);//取得裝下載圖的canvas
    downloadImg=context.getImageData(panelWidth/2-downloadCanvasWidth/2+1,0,downloadCanvasWidth-1,canvasHeight);//+1 -1 line width
    if(type==1){//如果影像是jpeg的話，做影像處理
        var tmpImg=downloadImg;
        context.beginPath();
        context.fillStyle='rgb(255,255,255)';
        context.fillRect(0,0,canvasWidth,canvasHeight);
        downloadImg=context.getImageData(panelWidth/2-downloadCanvasWidth/2+1,0,downloadCanvasWidth-1,canvasHeight);//+1 -1 line width
        for(var i=0;i<downloadImg.data.length;i+=4){
            if(tmpImg.data[i+3]==255){
                downloadImg.data[i]=tmpImg.data[i];
                downloadImg.data[i+1]=tmpImg.data[i+1];
                downloadImg.data[i+2]=tmpImg.data[i+2];
                downloadImg.data[i+3]=tmpImg.data[i+3];    
            }
        }
        context.putImageData(imgData,0,0);
        collection.draw();
    }
    downloadContext.putImageData(downloadImg,0,0);
    filename=$('#filenameInput').val()==''?'Dottary':$('#filenameInput').val();
}

$(document).on('click','img.navbar-toggle',function(){
    $(this).toggleClass('clicked');
    $('nav.nav-menu').toggleClass('end');
    if($(this).hasClass('clicked'))
        $(this).attr('src','img/close.png');
    else
        $(this).attr('src','img/slidedownicon.png');
});

function updateCanvasProperty(){
    updateCanvas();
    updateWord();
    $('#canvas-slider').slider({//設定canvas-slider的一些設定
        value:CANVAS_SLIDER_VALUE,
        max:CANVAS_SLIDER_MAX,
        min:CANVAS_SLIDER_MIN,
        step:CANVAS_SLIDER_STEP,
        stop:function(event,ui){
            downloadCanvasWidth=$('#canvas-slider').slider('value');
            if(downloadCanvasWidth>canvasWidth)
                downloadCanvasWidth=canvasWidth+2;//+2是加兩條線的寬
            draw();
        }
    });
}

$(window).on('orientationchange',function(event){//這是專門給mobile和tablet用的，如果轉向的話，那就更新canvas寬和圖片
    setTimeout(updateCanvasProperty,1000);//會延後一秒的原因是等所有html的元素都set好後，再來改canvas的東西，才不會讀到轉向之前的panel寬
});

function initAll(){
    var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html, body');
    $body.scrollTop(0);
    setTimeout(function(){
        $body.animate({
            scrollTop: $('div.navbar').height()+10
        }, 1000, 'easeOutBack');},800);

    $('<span class="color" title="black" style="background-color: rgb(0,0,0)" id="color1"></span>').appendTo('#choosedColor');
    $('#eraserCanvasDiv')
        .css('width',80)
        .css('height',80);

    eraserCanvas.attr({
        height:$('#eraserCanvasDiv').width(),
        width:$('#eraserCanvasDiv').width()
    })
    eraserContext=eraserCanvas.get('0').getContext('2d');
    updateCanvas();
    myEraser=new eraser();//新增我們的eraser
    downloadCanvasWidth=canvasWidth+2;
    CANVAS_SLIDER_MAX=canvasWidth+CANVAS_SLIDER_STEP;//設定canvas slider
    CANVAS_SLIDER_VALUE=CANVAS_SLIDER_MAX;
    initSetting();//初始化設定
    updateWord();
    if(canvas.get(0).getContext!=null)
        context=canvas.get(0).getContext('2d');
    imgData=context.getImageData(0,0,canvasWidth,canvasHeight);
    clearImgData=imgData;//取得空背景
    bubblePop();

}

$(document).ready(function(){
    //to prevent class col-lg-3 being cut by buttom navbar
    $(window).load(function(){

    });
    $(window).resize(function(){
    });
    if('ontouchstart' in document)
    $('body').removeClass('noTouch');//如果是mobile或tablet，就把這個class拿掉，以便取消mobile和tablet的hover state
initAll();
});
