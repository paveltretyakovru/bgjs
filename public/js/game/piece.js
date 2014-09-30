var Piece = function(color , id , layer , stage , type , imageObjects){
    var imagesrc = '';
    var controll = true;
    
    if(imageObjects !== undefined){
        this.whiteObj = imageObjects.white;
        this.blackObj = imageObjects.black;
    }else{
        controll = false;
        console.error("Ошибка при загрузки изображений фишек");
    }
    
    if(layer !== undefined && stage !== undefined && id !== undefined && type !== undefined){
        this.layer  = layer;
        this.stage  = stage;
        this.type   = type;
        this.id     = id;
        this.color  = color;
    }else{
        controll    = false;
        console.error('Один из параметров создания фишки равен undefined: ' , color , id , type);
    }
    
    switch (color) {
        case 'white':
            imagesrc    = '../images/pieces/white.png';
            break;
        case 'black':
            imagesrc    = '../images/pieces/black.png';
            break;
        default:
            console.error('Передан неизвестный цвет фишек');
            controll = false;
    }
    
    if(controll){
        // инициализируем изображение
        var pimage;
        
        if(color === 'white'){
            pimage = this.whiteObj;
        }else if(color === 'black'){
            pimage = this.blackObj;
        }
        
        //pimage = new Image();
        //pimage.src = imagesrc;
        
        // создаем Kineticjs изображение
        var pimageobj = new Kinetic.Image({
            x       : 0 ,
            y       : 0 ,
            id      : this.id ,
            width   : this.width ,
            height  : this.height ,
            image   : pimage ,
            
            //draggable : true
        });
        
        this.obj = pimageobj;
        
        this.layer.add(pimageobj);
        this.stage.batchDraw();
    }else{
        console.error("При создании фишки произошла ошибка. Проверьте переданные аргументы");
    }
};

Piece.prototype.moveTo = function( x , y){
    var self = this;
    
    var tween = new Kinetic.Tween({
		node : self.obj ,
		duration : 0.5 ,
		x : x ,
		y : y
	});

	tween.play();
};

Piece.prototype.x       = 0;
Piece.prototype.y       = 0;
Piece.prototype.field   = 0;
Piece.prototype.width   = 30;
Piece.prototype.height  = 30;

Piece.prototype.id      = '';
Piece.prototype.type    = '';
Piece.prototype.color   = '';
Piece.prototype.last    = false;

Piece.prototype.layer   = {};
Piece.prototype.stage   = {};
Piece.prototype.obj     = {};

Piece.prototype.blackObj;
Piece.prototype.whiteObj;