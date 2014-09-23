var Game = function(board , rules , bones , socket){
    this.board  = board;
    this.rules  = rules;
    this.bones  = bones;
    this.socket = socket;
};

/* 
    #
    #  Упровляющие объекты системы
    #
*/
Game.prototype.board    = {};
Game.prototype.rules    = {};
Game.prototype.bones    = {};
Game.prototype.socket   = {};
// ### конец управляющих объектов системы

Game.prototype.type     = 'long';
Game.prototype.pieces   = [ /* */];

Game.prototype.enemy    = {
    /*
        # id : идентификатор соперника
    */
};

/*
    # Инициализация фишек
    #
    #
*/
Game.prototype.initPieces = function(pieces){
    switch(this.type){
        /*  
            ########     ########       ########    ########
            ####   Тип создания фишек для длинных нард  ####
            ########    ########        ########    ########
        */
        case 'long':
            for(var i = 0; i < 30; i++){
                var pieceid = pieces[i];
                if (i < 15){
                    // создаем объекты фишек
                    this.pieces[i] = new Piece( 'white' , pieceid , this.board.mainlayer , this.board.stage , 'left') ;
                    this.startPiecesPositions(this.pieces[i].obj , 1);
                }else{
                    this.pieces[i] = new Piece( 'black' , pieceid , this.board.mainlayer , this.board.stage , 'right') ;
                    this.startPiecesPositions(this.pieces[i].obj , 13);
                }
            }
            break;
        default : console.error("Передан неизвестный тип игры");
    }
}


/*
    #
    # procedure startPiecesPositions(obj pieceobj , num fieldnum)
    # функция для стартового перемещения фишек
    #
*/

Game.prototype.startPiecesPositions = function(pieceobj , fieldnum){
    var position = this.board.calcLastFieldPos(fieldnum);
    // перемещаем фишку
     pieceobj.x(position.x);
     pieceobj.y(position.y);
            
    // добавляем фишку на поле
    this.board.addPiece(pieceobj.id() , fieldnum);
}

/*
    # Устанавливаем слушателей серевера :-)
    #
    #
*/
Game.prototype.setListener = function(name , obj , fun){
    var self = this;
    this.socket.connection.on(name , function(data){
        if(obj === 'Game'){
            if(fun in self){
                self[fun](data);
            }else{console.error("В объекте game не найден метод " , fun)}
        }else{
            if(obj in self){
                if(fun in self[obj]){
                    self[obj][fun](data);
                }else{console.error("Обращение к несуществующему методу в объекте " , obj , fun)}
            }else{ console.error("Обращение к несуществующему объекту " , obj); }
        }
    });
}

/*
    # Регестрируемся на сервере
    # 
    #
*/
Game.prototype.registrOnServer = function(data){
    this.socket.connection.emit('registr' , data );
};


/*
    # Получаем данные о сопернике
    #
    #
*/
Game.prototype.takeEnemy = function(data){
    
}

/*
    # Получаем идентификаторы фишек с сервера
    # переданный параметр data обязательно должен иметь свойство piece
    #
*/
Game.prototype.takePieces = function(data){
    if(typeof(data) === 'object'){
        if('pieces' in data){
            if(typeof(data.pieces) === 'object'){
                this.initPieces(data.pieces);
            }
        }else{
            console.error("В переданном объекте отсутствует свойство 'pieces'");
        }
    }else{
        console.error("Переданный параметр data в функцию takePieces, не является объектом");
    }
}