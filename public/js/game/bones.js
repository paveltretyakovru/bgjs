var Bones = function(selector){
    this.selector = $(selector);
};

Bones.prototype.elements    = ['#die1' , '#die2'];
Bones.prototype.board       = '#container';
Bones.prototype.vals        = [0 , 0];
Bones.prototype.size        = 40;
Bones.prototype.selector    = {};
Bones.prototype.moveanimtime=1000; // время перемещения фишек
Bones.prototype.shaketime   = 500;// время встярски костей

/*
    # Функция возвращает параметры доски
*/
Bones.prototype.getBoardParams = function(){
   var board = $(this.board);
   
    var startx      = board.offset().left       ;   // позиция доски по х
    var starty      = board.offset().top        ;   // позиция доски по у
    var width       = board.width()             ;   // ширина доски
    var height      = board.height()            ;   // высота доски
    var part        = width / 4                 ;   // четверть ширины доски
    var half        = starty + height / 2 - 20  ;   // половина высоты доски
    var leftpart    = startx + part             ;   // центр левой половины
    var rightpart   = startx + part * 3         ;  // центр правой половины
   
   return {
        startx      : startx    ,   // позиция доски по х
        starty      : starty    ,   // позиция доски по у
        width       : width     ,   // ширина доски
        height      : height    ,   // высота доски
        part        : part      ,   // четверть ширины доски
        half        : half      ,   // половина высоты доски
        leftpart    : leftpart  ,   // центр левой половины
        rightpart   : rightpart     // центр правой половины
   } 
};

/*
    # Функция телепортирует кость bone (= 0 | 1)
    # в указанную часть side (= left | right)
    #
*/
Bones.prototype.changeSide = function(bone , side){
    var board = this.getBoardParams();
    if(side === 'left'){$(this.elements[bone]).offset({top : board.half , left : board.leftpart});}
    if(side === 'right'){$(this.elements[bone]).offset({top : board.half , left : board.rightpart});}
};

/*
    # Функция анимированно перемещает указнные фишки в 
    # нужную часть
    #
*/
Bones.prototype.moveToSide = function(bone , side){
    var board = this.getBoardParams();
    
    switch(bone){
        // Перемещаем 2 фишки
        case 2:
            // перемещение в лево
            if(side === 'left'){
                $(this.elements[0]).animate({left:board.leftpart - 40} , this.moveanimtime);
                $(this.elements[1]).animate({left:board.leftpart + 40} , this.moveanimtime);
            // перемещение вправо
            }else if(side === 'right'){
                $(this.elements[0]).animate({left:board.rightpart - 40} , this.moveanimtime);
                $(this.elements[1]).animate({left:board.rightpart + 40} , this.moveanimtime);
            }else{console.error('Неверное значение для перемещения фишек');}
        break;
    }
};

Bones.prototype.shake = function(bone , timeAnim , boneval){
    var selector = $(this.elements[bone]);
    selector.css('visibility' , 'visible');
    
    selector.addClass("active").attr('data-value' , boneval);
    selector.effect('shake' , timeAnim);
};

Bones.prototype.animateStepBones = function(bones , side){
    console.log('animateStepBones' , bones , side);
    
    var self = this;
    this.moveToSide(2 , side);
    
    setTimeout(function(){
        self.shake(0 , self.shaketime , bones[0]);
        self.shake(1 , self.shaketime , bones[1]);
    } , this.moveanimtime);
};