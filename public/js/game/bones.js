var Bones = function(selector){
    this.selector = $(selector);
};

Bones.prototype.elements    = ['.d1' , '.d2'];
Bones.prototype.board       = '#container';
Bones.prototype.vals        = [0 , 0];
Bones.prototype.size        = 40;
Bones.prototype.selector    = {};
Bones.prototype.number      = 1;

Bones.prototype.changeSide = function(bone , side){
    
    var board = $(this.board);
    
    var startx = board.offset().left;  // позиция доски по х
    var starty = board.offset().top;   // позиция доски по у
    var bwidth = board.width();        // ширина доски
    var bheight= board.height();       // высота доски
    
    var part = bwidth / 4;
    
    if(side === 'left'){
        $(this.elements[bone]).offset({top : starty+bheight/2 , left : startx+part});
    }
    
    if(side === 'right'){
        $(this.elements[bone]).offset({top : starty+bheight/2 , left : startx+part * 3});
    }
    
    
};

Bones.prototype.selectGlyph = function (number){
    var x, y;
    switch (number){
      default:
      case 1: x = 0;            y =  0;          break;
      case 2: x = 2*this.size;  y =  0;          break;
      case 3: x = this.size;    y =  0;          break;
      case 4: x = this.size;    y = this.size;   break;
      case 5: x = 2*this.size;  y = this.size;   break;
      case 6: x = 0;            y = this.size;   break;
    }
    this.selector.css('backgroundPosition', x+'px '+y+'px');
};

Bones.prototype.shake = function(bone , timeAnim , boneval){
    var obj = this;
    
    obj.selector = $(this.elements[bone]);
    obj.selector.css('visibility' , 'visible');
    
    $.when($.Deferred(function(dfd){
        var z = obj.selector.css('z-index');

        obj.selector.css('z-index', 1).animate(
            { 'z-index': 1000 } ,
            {
                step    : function(now, fx){
                    obj.selectGlyph(Math.floor(Math.random() * 6) + 1);
                } ,
                
                duration: timeAnim ,
                
                complete: dfd.resolve
            }).css('z-index', z);

        return dfd.promise();
    })).done(function() {
        // Math.floor(Math.random() * 6) + 1
        // по-моему здесь нужно менять номер
        obj.number = (boneval);
        
        $(this).stop();
        
        obj.selectGlyph(obj.number);

        /*
            if (options.callback
                && typeof(options.callback) === "function")
            options.callback(options.number);
        */
    });
};