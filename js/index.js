(function($){
    $.fn.setScrollAnim=function(upOrDown,verOffset){//upOrdown true:pageDown false:pageUp inOrOut true:in
        var self=this;
        if(verOffset>2){//代表是以px做scroll位置的判斷
            if(upOrDown){//加入元素動畫
                $(window).scroll(function(){//由上往下滑頁面進入元素
                    if($(window).scrollTop()+$(window).height()-verOffset>self.offset().top &&  $(window).scrollTop()<self.offset().top)
                    self.addClass('animEndOrigin');//由下往上滑頁面進入元素
                    else if($(window).scrollTop()-verOffset<self.offset().top && $(window).scrollTop()+$(window).height()>self.offset().top)
                    self.addClass('animEndOrigin');
                });
            }
            else{//移除元素動畫
                $(window).scroll(function(){
                    if($(window).scrollTop()+$(window).height()-verOffset<self.offset().top &&  $(window).scrollTop()<self.offset().top)
                    self.removeClass('animEndOrigin');
                    else if($(window).scrollTop()+verOffset>self.offset().top && $(window).scrollTop()+$(window).height()>self.offset().top)
                    self.removeClass('animEndOrigin');
                });
            }
        }
        else{//以%數做判斷
            if(upOrDown){
                $(window).scroll(function(){
                    if($(window).scrollTop()+$(window).height()*(1-verOffset)>self.offset().top &&  $(window).scrollTop()<self.offset().top)
                    self.addClass('animEndOrigin');
                    else if($(window).scrollTop()<self.offset().top && $(window).scrollTop()+$(window).height()>self.offset().top)
                    self.addClass('animEndOrigin');
                });
            }
            else{
                $(window).scroll(function(){
                    if($(window).scrollTop()+$(window).height()*(1-verOffset)<self.offset().top &&  $(window).scrollTop()<self.offset().top)
                    self.removeClass('animEndOrigin');
                    else if($(window).scrollTop()>self.offset().top && $(window).scrollTop()+$(window).height()>self.offset().top)
                    self.removeClass('animEndOrigin');
                });
            }
        }
    }
})(jQuery);

$('img.navbar-toggle').on('click',function(){//navbar按鈕按下的反應
    $(this).toggleClass('clicked');
    $('nav.nav-menu').toggleClass('end');
    if($(this).hasClass('clicked'))
    $(this).attr('src','img/close.png');
    else
    $(this).attr('src','img/slidedownicon.png');
});

function setAllAnim(){//設定動畫
    $('.section2-title').setScrollAnim(true,0);
    $('.section2-description').setScrollAnim(true,0);
    $('.section2-col1').setScrollAnim(true,0.2);
    $('.section2-para1').setScrollAnim(true,0.2);
    $('.section2-col2').setScrollAnim(true,0.2);
    $('.section2-para2').setScrollAnim(true,0.2);
    $('.section2-col3').setScrollAnim(true,0.2);
    $('.section2-para3').setScrollAnim(true,0.2);
    for(var i=1;i<7;i++){
        $('#section3-lcol'+i).setScrollAnim(true,0.2);
        $('#section3-lcol'+i).setScrollAnim(false,0.13);
        $('#section3-rcol'+i).setScrollAnim(true,0.2);
        $('#section3-rcol'+i).setScrollAnim(false,0.13);
    }
}

$(document).ready(function(){
    var $body = (window.opera) ? (document.compatMode == "CSS1Compat" ? $('html') : $('body')) : $('html, body');
    $body.scrollTop(0);//先把畫面拉到畫面最上方，再向下滑
    setTimeout(function(){
        $body.animate({
            scrollTop: $('div.navbar').height()+10
        }, 1000, 'easeOutBack');},800);

    //畫面載入時就要出現的動畫
    $('h1.description1').addClass('animEndOrigin');
    $('h1.description2').addClass('animEndOrigin');
    setAllAnim();
});
