(function($){
    $.fn.setScrollAnim=function(upOrDown,verOffset){//upOrdown true:pageDown false:pageUp inOrOut true:in
        var self=this;
        if(verOffset>2){
            if(upOrDown){
                $(window).scroll(function(){
                    if($(window).scrollTop()+$(window).height()-verOffset>self.offset().top &&  $(window).scrollTop()<self.offset().top)
                    self.addClass('animEndOrigin');
                    else if($(window).scrollTop()-verOffset<self.offset().top && $(window).scrollTop()+$(window).height()>self.offset().top)
                    self.addClass('animEndOrigin');
                });
            }
            else{
                $(window).scroll(function(){
                    if($(window).scrollTop()+$(window).height()-verOffset<self.offset().top &&  $(window).scrollTop()<self.offset().top)
                    self.removeClass('animEndOrigin');
                    else if($(window).scrollTop()+verOffset>self.offset().top && $(window).scrollTop()+$(window).height()>self.offset().top)
                    self.removeClass('animEndOrigin');
                });
            }
        }
        else{
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
$('img.navbar-toggle').on('click',function(){
    $(this).toggleClass('clicked');
    $('nav.nav-menu').toggleClass('end');
    if($(this).hasClass('clicked'))
    $(this).attr('src','img/close.png');
    else
    $(this).attr('src','img/slidedownicon.png');
});
function setAllAnim(){
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
    $body.scrollTop(0);
    setTimeout(function(){
        $body.animate({
            scrollTop: $('div.navbar').height()+10
        }, 1000, 'easeOutBack')},800);

    //load anim
    $('h1.description1').addClass('animEndOrigin');
    $('h1.description2').addClass('animEndOrigin');
    setAllAnim();
});
