var Bones = function(selector){
    this.selector = $(selector);
    $('#die1 , #die2 , #die3 , #die4').css('z-index' , 1).draggable();
};

Bones.prototype.elements    = ['#die1' , '#die2' , '#die3' , '#die4'];
Bones.prototype.board       = '#container';
Bones.prototype.vals        = [0 , 0];
Bones.prototype.size        = 40;
Bones.prototype.selector    = {};
Bones.prototype.moveanimtime=500; // время перемещения фишек
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
    var rightpart   = startx + part * 3 - 50         ;  // центр правой половины
   
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
    Обновляет позицию костей дубля. Смещая их чуть ниже
*/
Bones.prototype.changeDublePos = function(){
    var bone1pos  = $(this.elements[0]).offset();
    $(this.elements[2] + ',' + this.elements[3]).css('top' , bone1pos.top);
    
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

Bones.prototype.hideDop = function(){
    $(this.elements[2]).css('visibility' , 'hidden');
    $(this.elements[3]).css('visibility' , 'hidden');
};

Bones.prototype.hideBones = function(){
    $(this.elements[0]).css('visibility' , 'hidden');
    $(this.elements[1]).css('visibility' , 'hidden');
    $(this.elements[2]).css('visibility' , 'hidden');
    $(this.elements[3]).css('visibility' , 'hidden');
};

/*
    # Функция анимированно перемещает указнные фишки в 
    # нужную часть
    #
*/
Bones.prototype.moveToSide = function(bone , side){
    var board   = this.getBoardParams();
    var self    = this;
    var bone1pos  = $(this.elements[0]).offset();
    
    // меняем верхнее положение доп. костей
    $(this.elements[2] + ',' + this.elements[3]).css('top' , bone1pos.top);
    
    switch(bone){
        // Перемещаем 2 фишки
        case 2:
            // перемещение в лево
            if(side === 'left'){
                $(this.elements[2]).css('visibility' , 'hidden');
                $(this.elements[3]).css('visibility' , 'hidden');
                
                $(this.elements[0]).animate({left:board.leftpart - 40 , top : board.half} , this.moveanimtime);
                $(this.elements[1]).animate({left:board.leftpart + 40 , top : board.half} , this.moveanimtime);
            // перемещение вправо
            }else if(side === 'right'){
                $(this.elements[0]).animate({left:board.rightpart - 40 , top : board.half} , this.moveanimtime);
                $(this.elements[1]).animate({left:board.rightpart + 40 , top : board.half} , this.moveanimtime);
            }else{console.error('Неверное значение для перемещения фишек');}
        break;
        
        case 4:
            // перемещение в лево
            if(side === 'left'){
                // перемещаем главные кости
                $(this.elements[0]).animate({left:board.leftpart - 40 , top : board.half} , this.moveanimtime);
                $(this.elements[1]).animate({left:board.leftpart + 40 , top : board.half} , this.moveanimtime);
                
                // меняем положение от левого края доп. костей
                $(this.elements[2]).css('left' , board.leftpart - 40);
                $(this.elements[3]).css('left' , board.leftpart + 40);
                
                // после анимации 
                setTimeout(function() {
                    // показываем дополнительные кости
                    $(self.elements[2]).css('visibility' , 'visible');
                    $(self.elements[3]).css('visibility' , 'visible');
                    
                    // и смещаем их вниз
                    $(self.elements[2]).animate({top:bone1pos.top + 80} , 30);
                    $(self.elements[3]).animate({top:bone1pos.top + 80} , 30);
                    
                }, this.moveanimtime);
            // перемещение вправо
            }else if(side === 'right'){
                $(this.elements[0]).animate({left:board.rightpart - 40 , top : board.half} , this.moveanimtime);
                $(this.elements[1]).animate({left:board.rightpart + 40 , top : board.half} , this.moveanimtime);
                
                $(this.elements[2]).css('left' , board.rightpart - 40);
                $(this.elements[3]).css('left' , board.rightpart + 40);
                
                setTimeout(function(){
                     // показываем дополнительные кости
                    $(self.elements[2]).css('visibility' , 'visible');
                    $(self.elements[3]).css('visibility' , 'visible');
                    
                    // и смещаем их вниз
                    $(self.elements[2]).animate({top:bone1pos.top + 80} , 30);
                    $(self.elements[3]).animate({top:bone1pos.top + 80} , 30);
                } , this.moveanimtime);
                
            }else{console.error('Неверное значение для перемещения фишек');}
        break;
    }
};

Bones.prototype.shake = function(bone , timeAnim , boneval){
    var selector;
    var self = this;
    
    if(typeof(bone) === 'object'){
        selector = '';
        for(var i = 0; i < bone.length; i++){
            if(i !== bone.length - 1){
                selector += this.elements[bone[i]] + ',';
            }else{
                selector += this.elements[bone[i]];
            }
        }
        
        console.log('selector: ' , selector);
        
        selector =  $(selector);
    }else{
        selector = $(this.elements[bone]);
    }
    
    ion.sound.play("dice");

    
    selector.css('visibility' , 'visible');
    
    /* Вращение костей */
    selector.effect('shake' , timeAnim);
    
    selector.rotate({
      angle:0, 
      animateTo:self.randomNum(100 , 360) ,
      step : function(){
          selector.addClass("active").attr('data-value' , self.randomNum(1 , 6));
      } ,
      callback : function(){
          selector.addClass("active").attr('data-value' , boneval);
      }
   });;
};

Bones.prototype.randomNum = function (min, max){
    	var rand = min - 0.5 + Math.random()*(max-min+1);
    	rand = Math.round(rand);
    	return rand;
};

Bones.prototype.animateStepBones = function(bones , side){
    console.log('animateStepBones' , bones , side);
    
    var self = this;
    
    if(bones[0] === bones[1]){
        this.moveToSide(4 , side);    
    }else{
        this.moveToSide(2 , side);
    }
    
    
    
    setTimeout(function(){
        if(bones[0] === bones[1]){
            self.shake([0 , 1 , 2 , 3] , self.shaketime , bones[1]);
            /*
            self.shake(0 , self.shaketime , bones[1]);
            self.shake(1 , self.shaketime , bones[1]);
            self.shake(2 , self.shaketime , bones[1]);
            self.shake(3 , self.shaketime , bones[1]);
            */
        }else{
            self.shake(0 , self.shaketime , bones[0]);
            self.shake(1 , self.shaketime , bones[1]);
        }
    } , this.moveanimtime);
};

Bones.prototype.lightControll = function (steps , active){
    if(steps.length === 2){
        if(!active){
        
            var elem1 = $(this.elements[0]).attr('data-value');
            var elem2 = $(this.elements[1]).attr('data-value');
            
            if(steps[0][1] === 0){
                if(steps[0][0] + '' === elem1){
                    $(this.elements[0]).css('opacity' , 1);
                }
                
                if(steps[0][0] + '' === elem2){
                    $(this.elements[1]).css('opacity' , 1);
                }
                
            }else{
                
                if(steps[0][0] + '' === elem1){
                    $(this.elements[0]).css('opacity' , 0.5);
                }
                
                if(steps[0][0] + '' === elem2){
                    $(this.elements[1]).css('opacity' , 0.5);
                }
            }
            
            
            
            if(steps[1][1] === 0){
                if(steps[1][0] + '' === elem1){
                    $(this.elements[0]).css('opacity' , 1);
                }
                
                if(steps[1][0] + '' === elem2){
                    $(this.elements[1]).css('opacity' , 1);
                }
                
            }else{
                
                if(steps[1][0] + '' === elem1){
                    $(this.elements[0]).css('opacity' , 0.5);
                }
                
                if(steps[1][0] + '' === elem2){
                    $(this.elements[1]).css('opacity' , 0.5);
                }
            }
        }else{
            $(this.elements[0]).css('opacity' , 1);
            $(this.elements[1]).css('opacity' , 1);
        }
        
    }else if(steps.length === 4){
        if(active){
            $(this.elements[0]).css('opacity' , 1);
            $(this.elements[1]).css('opacity' , 1);
            $(this.elements[2]).css('opacity' , 1);
            $(this.elements[3]).css('opacity' , 1);
        }else{
            if(steps[0][1] === 0){
                $(this.elements[3]).css('opacity' , 1);
            }else{
                $(this.elements[3]).css('opacity' , 0.5);
            }
            
            if(steps[1][1] === 0){
                $(this.elements[2]).css('opacity' , 1);
            }else{
                $(this.elements[2]).css('opacity' , 0.5);
            }
            
            if(steps[2][1] === 0){
                $(this.elements[1]).css('opacity' , 1);
            }else{
                $(this.elements[1]).css('opacity' , 0.5);
            }
            
            if(steps[3][1] === 0){
                $(this.elements[0]).css('opacity' , 1);
            }else{
                $(this.elements[0]).css('opacity' , 0.5);
            }
        }
    }
};