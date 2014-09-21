/* 
    *
    *               *** BOARD.JS ***
    *
    * Для корректной рабоыт объекта необходимо подключить библиотеку Kinetic.js
*/

var Board = function(){}

/* configs values */
Board.prototype.width       = 600;
Board.prototype.height      = 600;
Board.prototype.image       = '../images/tables/2dboard.png';
Board.prototype.htmlid      = 'container';
Board.prototype.imagex      = 0;
Board.prototype.imagey      = 0;
Board.prototype.pieceheight = 30;
Board.prototype.topy        = 30;
Board.prototype.bottomy     = 540;

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
	{x : 26  , pieces : [] }	,	// 1
	{x : 71  , pieces : [] } 	,	// 2
	{x : 114 , pieces : [] } 	,	// 3
	{x : 157 , pieces : [] } 	,	// 4
	{x : 200 , pieces : [] } 	,	// 5
	{x : 243 , pieces : [] } 	,	// 6
	{x : 325 , pieces : [] } 	,	// 7
	{x : 368 , pieces : [] } 	,	// 8
	{x : 413 , pieces : [] } 	,	// 9
	{x : 456 , pieces : [] } 	,	// 10
	{x : 499 , pieces : [] } 	,	// 11
	{x : 542 , pieces : [] } 	,	// 12

	// TOP FIELDS
	{x : 544 , pieces : [] }	,	// 13
	{x : 500 , pieces : [] } 	,	// 14
	{x : 457 , pieces : [] } 	,	// 15
	{x : 414 , pieces : [] } 	,	// 16
	{x : 370 , pieces : [] } 	,	// 17
	{x : 326 , pieces : [] } 	,	// 18
	{x : 244 , pieces : [] } 	,	// 19
	{x : 201 , pieces : [] } 	,	// 20
	{x : 158 , pieces : [] } 	,	// 21
	{x : 115 , pieces : [] } 	,	// 22
	{x : 71  , pieces : [] } 	,	// 23
	{x : 27  , pieces : [] } 		// 24
];