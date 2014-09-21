/* 
    *
    *               *** BOARD.JS ***
    *
    * Для корректной рабоыт объекта необходимо подключить библиотеку Kinetic.js
*/

var Board = function(){}

/* configs values */
Board.prototype.width       = 642;
Board.prototype.height      = 600;
Board.prototype.image       = '../images/tables/light_wood_board.jpg';
Board.prototype.htmlid      = 'container';
Board.prototype.imagex      = 0;
Board.prototype.imagey      = 0;
Board.prototype.pieceheight = 30;
Board.prototype.topy        = 32;
Board.prototype.bottomy     = 535;

/* empty values */
Board.prototype.stage       = {};
Board.prototype.mainlayer   = {};

/* functions values */

Board.prototype.addPiece = function(pieceid , fieldnum){
    if(this.checkCorrectFieldNum(fieldnum)){
        this.fields[fieldnum].pieces.push(pieceid);
    }
};

/* 
    #
    # fun calcLastFieldPos(num field) : obj { int x , int y }
    # Вычисляем координаты последней позиции на поле
    # int fieldnum - номер поля
    #
*/
Board.prototype.calcLastFieldPos = function(fieldnum){
    if(this.checkCorrectFieldNum(fieldnum)){
        // номер последней позиции в поле
        var lastnum = this.fields[fieldnum].pieces.length;
            
        // field x
        var fx  = this.fields[fieldnum].x;
        var y   = 0;
        
        // определяем y
        if(fieldnum < 13){
            y = this.bottomy - lastnum * this.pieceheight;
        }else{
            y = this.topy + lastnum * this.pieceheight;
        }
        
        return { x : fx , y : y }
    }
}

/*
    #
    # fun checkCorrectFieldNum(int fieldnum) : bool
    # проверяем корректность переменной обращаемой к полю доски
    #
*/

Board.prototype.checkCorrectFieldNum = function(fieldnum){
    if(fieldnum !== undefined && typeof(fieldnum) === 'number'){
        if(this.fields[fieldnum] !== undefined){
            return true;
        }else{
            console.error('Передан неправильный номер поля');
            return false;
        }
    }else{
        console.error('Не определен параметр fieldnum, либо неправильного типа: ' , fieldnum , typeof(fieldnum));
        return false;
    }
}

/*
    #
    # Вычисляет номер поля по координатам
    #
*/
Board.prototype.calcField = function(){};

/*
    #
    # Создание доски
    #
*/
Board.prototype.init    = function(){
    // создаем главнй объект игрового поля
    this.stage = new Kinetic.Stage({
            container   : this.htmlid ,
            width       : this.width ,
            height      : this.height
        });
    
    // инициализируем изображение
    var bimage = new Image();
    bimage.src = this.image;
    
    // создаем Kineticjs изображение
    var bimageobj = new Kinetic.Image({
        x       : this.imagex ,
        y       : this.imagey ,
        width   : this.width ,
        height  : this.height ,
        image   : bimage
    });
    
    // создаем основной слой
    this.mainlayer = new Kinetic.Layer();
    this.mainlayer.add(bimageobj);
    
    this.stage.add(this.mainlayer);
    this.stage.batchDraw();
}

Board.prototype.fields = [
    0 	,	// Заглушка для нулевого элемента массива
	// BOTTOM FIELDS
	{x : 35  , pieces : [] }	,	// 1
	{x : 80  , pieces : [] } 	,	// 2
	{x : 124 , pieces : [] } 	,	// 3
	{x : 166 , pieces : [] } 	,	// 4
	{x : 210 , pieces : [] } 	,	// 5
	{x : 254 , pieces : [] } 	,	// 6
	{x : 356 , pieces : [] } 	,	// 7
	{x : 400 , pieces : [] } 	,	// 8
	{x : 444 , pieces : [] } 	,	// 9
	{x : 488 , pieces : [] } 	,	// 10
	{x : 532 , pieces : [] } 	,	// 11
	{x : 576 , pieces : [] } 	,	// 12

	// TOP FIELDS
	{x : 576 , pieces : [] }	,	// 13
	{x : 532 , pieces : [] } 	,	// 14
	{x : 488 , pieces : [] } 	,	// 15
	{x : 446 , pieces : [] } 	,	// 16
	{x : 403 , pieces : [] } 	,	// 17
	{x : 358 , pieces : [] } 	,	// 18
	{x : 254 , pieces : [] } 	,	// 19
	{x : 210 , pieces : [] } 	,	// 20
	{x : 166 , pieces : [] } 	,	// 21
	{x : 124 , pieces : [] } 	,	// 22
	{x : 80  , pieces : [] } 	,	// 23
	{x : 36  , pieces : [] } 		// 24
];