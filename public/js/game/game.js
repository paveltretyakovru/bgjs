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

Game.prototype.meselement   = '#gamemessage';
Game.prototype.type         = 'long';   // тип игры
Game.prototype.onepos       = true;     // фишки распалагаются всега в одной позиции
Game.prototype.pieces       = [ /* */];
// timers
Game.prototype.timelot      = 5000;

Game.prototype.enemy        = {
    /*
        # int   id      : идентификатор соперника
        # bool  winner  : победитель ли
    */
};

Game.prototype.setMessage = function(message){
    $(this.meselement).html(message);
}

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
                    
                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.enemy.winner){
                            // распологаем белые слева
                            this.startPiecesPositions(this.pieces[i].obj , 13);
                        }else{
                            // располагаем черные справа
                            this.startPiecesPositions(this.pieces[i].obj , 1);
                        }
                    }
                }else{
                    this.pieces[i] = new Piece( 'black' , pieceid , this.board.mainlayer , this.board.stage , 'right') ;
                    
                    // если фишки должны всегда находиться в одном положении
                    if(this.onepos){
                        // если соперник выиграл
                        if(this.enemy.winner){
                            // распологаем черные справа
                            this.startPiecesPositions(this.pieces[i].obj , 1);
                        }else{
                            // распологаяем черные слева
                            this.startPiecesPositions(this.pieces[i].obj , 13);
                        }
                    }
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
    this.setMessage("Ожидание подключения соперника");
};


/* 
    # Получаем стартовые данные об игре
    #
    #
*/
Game.prototype.takeGameData = function(data){
    var self = this;
    
    if(typeof(data) === 'object'){
        if('id' in data && 'pieces' in data && 'winner' in data && 'lots' in data){
            if(data.id !== undefined && data.pieces !== undefined && data.winner !== undefined && data.lots !== undefined){
                
                // Анимируем жеребьевку
                this.animateLot(data.lots);
                
                console.log('Получены данные начала игры с сервера: ' , data);
                // сохраняем победителя
                self.enemy.winner = data.winner;
                
                //Инициализация фишек
                var animateLot = setTimeout(function() {
                    self.initPieces(data.pieces);
                }, 3000);
                
                //clearTimeout(animateLot);
                
            }else{console.error("Один из параметров игры не определен" , data )}
        }else{console.error("Один из параметров игры отсутсвует. " , data );}
    }else{console.error("Данные игры переданы не объектом" , data );}
};


/*
    # Функция анимаирует жеребьевку
    # lots - значение костей -> array(lot1 , lot2)
    #
*/
Game.prototype.animateLot = function(lots){
    var self = this;
    
    this.setMessage('Игрок подключен. Идет жеребьевка');

    // меням сторону расположения кости
    this.bones.changeSide(0 , 'left');
    // взбалтываем и перемешиваем
    this.bones.shake(0 , 1000 , lots[0]);

    // спустя секунды шейкеруем 2 кость
    var shakeBone2 = setTimeout(function() {
        // перемещаем 2 кость вправо
        self.bones.changeSide(1 , 'right');
        // взбалтываем и перемещиваем
        self.bones.shake(1 , 1000 , lots[1]);
        // Отображаем чей ход
        console.info(self.enemy.winner);
        if(self.enemy.winner === true){
            self.setMessage('Жеребьевка окончена. Ход противника');
        }else{
            self.setMessage('Жеребьевка окончена. Ваш ход');
        }
    }, 1000);
    //clearTimeout(shakeBone2);
}